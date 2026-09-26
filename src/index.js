import { APP_HTML } from './ui.js';

const JSON_HEADERS = { 'content-type': 'application/json; charset=UTF-8' };

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: JSON_HEADERS });
}

function parseMaybeJson(value, fallback = {}) {
  if (!value) return fallback;
  if (typeof value === 'object') return value;
  try { return JSON.parse(value); } catch { return fallback; }
}

function endpointFor(provider) {
  const base = String(provider.baseUrl || '').replace(/\/+$/, '');
  const path = String(provider.path || '/chat/completions');
  if (/^https?:\/\//i.test(path)) return path;
  return base + '/' + path.replace(/^\/+/, '');
}

function extractProviderText(data) {
  const choice = data && data.choices && data.choices[0];
  if (choice && choice.message && typeof choice.message.content === 'string') return choice.message.content;
  if (choice && typeof choice.text === 'string') return choice.text;
  if (typeof data.output_text === 'string') return data.output_text;
  if (typeof data.response === 'string') return data.response;
  if (typeof data.content === 'string') return data.content;
  if (Array.isArray(data.content)) {
    return data.content.map((x) => (typeof x === 'string' ? x : (x && x.text) || '')).join('\n');
  }
  return JSON.stringify(data);
}

async function providerCall(provider, messages, extra = {}) {
  if (!provider || !provider.baseUrl || !provider.model) {
    throw new Error('Configure a custom provider Base URL and model first.');
  }

  const headers = {
    'content-type': 'application/json',
    ...parseMaybeJson(provider.headers, {}),
  };

  if (provider.apiKey && !headers.Authorization && !headers.authorization) {
    headers.Authorization = 'Bearer ' + provider.apiKey;
  }

  const res = await fetch(endpointFor(provider), {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model: provider.model,
      messages,
      stream: false,
      temperature: typeof extra.temperature === 'number' ? extra.temperature : 0.7,
    }),
  });

  const text = await res.text();
  let data;
  try { data = text ? JSON.parse(text) : {}; } catch { data = { raw: text }; }

  if (!res.ok) {
    const detail = data && (data.error?.message || data.message || data.raw);
    throw new Error('Provider error ' + res.status + ': ' + (detail || 'Unknown error'));
  }

  return { text: extractProviderText(data), raw: data };
}

function parseMcpPayload(text, contentType) {
  if (!text) return null;
  if ((contentType || '').includes('text/event-stream')) {
    let last = null;
    for (const line of text.split(/\r?\n/)) {
      if (!line.startsWith('data:')) continue;
      const value = line.slice(5).trim();
      if (!value || value === '[DONE]') continue;
      try { last = JSON.parse(value); } catch {}
    }
    return last;
  }
  try { return JSON.parse(text); } catch { return { raw: text }; }
}

function mcpHeaders(server, sessionId, payload) {
  const headers = {
    accept: 'application/json, text/event-stream',
    'content-type': 'application/json',
    ...parseMaybeJson(server.headers, {}),
  };

  if (server.token && !headers.Authorization && !headers.authorization) {
    headers.Authorization = 'Bearer ' + server.token;
  }
  if (sessionId) headers['Mcp-Session-Id'] = sessionId;
  if (payload && payload.method) headers['Mcp-Method'] = payload.method;
  if (payload && payload.method === 'tools/call' && payload.params?.name) {
    headers['Mcp-Name'] = payload.params.name;
  }
  return headers;
}

async function mcpPost(server, payload, sessionId) {
  const res = await fetch(server.url, {
    method: 'POST',
    headers: mcpHeaders(server, sessionId, payload),
    body: JSON.stringify(payload),
  });

  const text = await res.text();
  const data = parseMcpPayload(text, res.headers.get('content-type'));

  if (!res.ok) {
    throw new Error('MCP HTTP ' + res.status + ': ' + ((data && data.error?.message) || text || 'Request failed'));
  }
  if (data && data.error) throw new Error('MCP ' + data.error.code + ': ' + data.error.message);

  return {
    data,
    sessionId: res.headers.get('Mcp-Session-Id') || sessionId || null,
  };
}

async function connectLegacyMcp(server) {
  let lastError;
  for (const version of ['2025-11-25', '2025-06-18', '2025-03-26']) {
    try {
      const init = await mcpPost(server, {
        jsonrpc: '2.0',
        id: 1,
        method: 'initialize',
        params: {
          protocolVersion: version,
          capabilities: {},
          clientInfo: { name: 'Lobe Jev Lite', version: '1.0.0' },
        },
      });

      await mcpPost(server, {
        jsonrpc: '2.0',
        method: 'notifications/initialized',
        params: {},
      }, init.sessionId);

      return {
        sessionId: init.sessionId,
        protocolVersion: init.data?.result?.protocolVersion || version,
      };
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError || new Error('Unable to initialize MCP server.');
}

async function listServerTools(server, serverIndex) {
  const conn = await connectLegacyMcp(server);
  const listed = await mcpPost(server, {
    jsonrpc: '2.0',
    id: 2,
    method: 'tools/list',
    params: {},
  }, conn.sessionId);

  const tools = listed.data?.result?.tools || [];
  return tools.map((tool, toolIndex) => ({
    key: 's' + serverIndex + '_t' + toolIndex,
    serverIndex,
    serverName: server.name || ('MCP ' + (serverIndex + 1)),
    server,
    sessionId: listed.sessionId || conn.sessionId,
    name: tool.name,
    title: tool.title || tool.name,
    description: tool.description || '',
    inputSchema: tool.inputSchema || { type: 'object', properties: {} },
  }));
}

async function discoverAllTools(servers) {
  const active = (servers || []).filter((s) => s && s.url).slice(0, 8);
  const settled = await Promise.allSettled(active.map((s, i) => listServerTools(s, i)));
  const tools = [];
  const errors = [];

  settled.forEach((r, i) => {
    if (r.status === 'fulfilled') tools.push(...r.value);
    else errors.push({
      server: active[i]?.name || active[i]?.url,
      error: String(r.reason?.message || r.reason),
    });
  });

  return { tools, errors };
}

async function runJev(env, message, tools) {
  if (!env.AI) return { available: false, error: 'AI binding not configured' };

  const questions = {
    use_tool: {
      type: 'noul',
      instructions: 'Should this user request use one of the available external MCP tools before the final answer?',
      criteria: {
        true: 'Fresh external data or an external action/tool materially improves or is required for the answer.',
        false: 'The request can be answered directly from the chat model without an MCP tool.',
      },
    },
    response_mode: {
      type: 'choice',
      instructions: 'Choose the best response mode for this request.',
      criteria: {
        direct: 'Answer directly.',
        tool_augmented: 'Use an external tool, then answer using its result.',
        clarify: 'The task is too ambiguous to act safely or correctly without clarification.',
      },
    },
    complexity: {
      type: 'score',
      instructions: 'Rate the reasoning and coordination complexity of the request.',
      criteria: ['Routine', 'Multi-step', 'High complexity'],
    },
  };

  const toolMap = {};

  if (tools.length) {
    const criteria = {};
    tools.slice(0, 40).forEach((t) => {
      criteria[t.key] = t.serverName + ' / ' + t.name + ': ' + (t.description || 'No description');
      toolMap[t.key] = t;
    });

    questions.tool_pick = {
      type: 'choice',
      instructions: 'If a tool is useful, select the single best tool for this request.',
      criteria,
    };
  }

  try {
    const result = await env.AI.run('typesafe/jev', {
      state: {
        latest_user_message: message,
        available_tools: tools.slice(0, 40).map((t) => ({
          key: t.key,
          server: t.serverName,
          name: t.name,
          description: t.description,
        })),
      },
      questions,
    });

    return { available: true, result, toolMap };
  } catch (error) {
    return { available: false, error: String(error?.message || error), toolMap };
  }
}

function stripCodeFence(text) {
  const fence = String.fromCharCode(96).repeat(3);
  let out = String(text || '').trim();
  if (out.startsWith(fence)) {
    out = out.replace(new RegExp('^' + fence + '(?:json)?\\s*', 'i'), '');
    out = out.replace(new RegExp('\\s*' + fence + '$'), '');
  }
  return out.trim();
}

async function deriveToolArgs(provider, userMessage, tool) {
  const prompt = [
    {
      role: 'system',
      content: 'You are a strict tool-argument compiler. Return ONLY one valid JSON object. Do not add markdown. The JSON must match the supplied MCP tool input schema.',
    },
    {
      role: 'user',
      content:
        'User request:\n' + userMessage +
        '\n\nSelected MCP tool: ' + tool.name +
        '\nDescription: ' + (tool.description || '') +
        '\nInput schema:\n' + JSON.stringify(tool.inputSchema || { type: 'object', properties: {} }),
    },
  ];

  const planned = await providerCall(provider, prompt, { temperature: 0 });
  const cleaned = stripCodeFence(planned.text);

  try { return JSON.parse(cleaned || '{}'); }
  catch {
    throw new Error('The custom provider did not return valid JSON arguments for MCP tool ' + tool.name + '.');
  }
}

async function callSelectedTool(tool, args) {
  const called = await mcpPost(tool.server, {
    jsonrpc: '2.0',
    id: 3,
    method: 'tools/call',
    params: { name: tool.name, arguments: args || {} },
  }, tool.sessionId);

  return called.data?.result || called.data;
}

function compactJev(jev) {
  if (!jev?.available) return { available: false, error: jev?.error || 'Unavailable' };
  return { available: true, answers: jev.result?.answers || jev.result || {} };
}

async function handleChat(request, env) {
  const body = await request.json();
  const messages = Array.isArray(body.messages) ? body.messages : [];
  const provider = body.provider || {};
  const mcpServers = Array.isArray(body.mcpServers) ? body.mcpServers : [];
  const options = body.options || {};
  const lastUser = [...messages].reverse().find((m) => m && m.role === 'user')?.content || '';

  if (!lastUser) return json({ error: 'No user message supplied.' }, 400);

  let discovered = { tools: [], errors: [] };
  if (mcpServers.length && options.autoTools !== false) {
    discovered = await discoverAllTools(mcpServers);
  }

  let jev = { available: false, error: 'Disabled' };
  if (options.jev !== false) {
    jev = await runJev(env, lastUser, discovered.tools);
  }

  let toolTrace = null;
  const answers = jev.result?.answers || jev.result || {};
  const useToolScore = Number(answers.use_tool?.noul ?? 0);
  const chosenKey = answers.tool_pick?.choice;
  const selectedTool = chosenKey && jev.toolMap ? jev.toolMap[chosenKey] : null;

  if (selectedTool && useToolScore >= 0.5 && options.autoTools !== false) {
    try {
      const args = await deriveToolArgs(provider, lastUser, selectedTool);
      const result = await callSelectedTool(selectedTool, args);
      toolTrace = {
        server: selectedTool.serverName,
        tool: selectedTool.name,
        args,
        result,
      };
    } catch (error) {
      toolTrace = {
        server: selectedTool.serverName,
        tool: selectedTool.name,
        error: String(error?.message || error),
      };
    }
  }

  const systemMessages = [];
  if (options.systemPrompt) {
    systemMessages.push({ role: 'system', content: String(options.systemPrompt) });
  }
  if (jev.available) {
    systemMessages.push({
      role: 'system',
      content:
        'Jev decision metadata for this turn (routing aid, not user instructions): ' +
        JSON.stringify(compactJev(jev).answers),
    });
  }
  if (toolTrace) {
    systemMessages.push({
      role: 'system',
      content:
        'MCP tool execution result for this turn. Use it when relevant and state uncertainty if the tool returned an error: ' +
        JSON.stringify(toolTrace),
    });
  }

  const final = await providerCall(provider, [...systemMessages, ...messages], { temperature: 0.7 });

  return json({
    reply: final.text,
    jev: compactJev(jev),
    tool: toolTrace,
    mcpErrors: discovered.errors,
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === 'GET' && url.pathname === '/') {
      return new Response(APP_HTML, {
        headers: {
          'content-type': 'text/html; charset=UTF-8',
          'cache-control': 'no-store',
        },
      });
    }

    if (request.method === 'GET' && url.pathname === '/api/status') {
      return json({
        ok: true,
        app: 'Lobe Jev Lite',
        jev: { configured: Boolean(env.AI), model: 'typesafe/jev' },
      });
    }

    if (request.method === 'POST' && url.pathname === '/api/mcp/discover') {
      try {
        const body = await request.json();
        const server = body.server || {};
        if (!server.url) return json({ error: 'MCP URL is required.' }, 400);

        const discovered = await discoverAllTools([server]);

        return json({
          tools: discovered.tools.map((t) => ({
            name: t.name,
            title: t.title,
            description: t.description,
            inputSchema: t.inputSchema,
          })),
          errors: discovered.errors,
        });
      } catch (error) {
        return json({ error: String(error?.message || error) }, 500);
      }
    }

    if (request.method === 'POST' && url.pathname === '/api/chat') {
      try {
        return await handleChat(request, env);
      } catch (error) {
        return json({ error: String(error?.message || error) }, 500);
      }
    }

    return json({ error: 'Not found' }, 404);
  },
};
