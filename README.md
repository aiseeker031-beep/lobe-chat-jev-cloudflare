# Lobe Jev Lite — Cloudflare fork

A deliberately stripped fork of `AIDotNet/lobe-chat` for a small agent runtime on Cloudflare Workers.

## What remains

- Lobe-style chat UX
- One custom OpenAI-compatible AI provider, configured in the frontend
- Custom HTTP / Streamable HTTP MCP servers, configured in the frontend
- Jev (`typesafe/jev`) as the routing/decision brain
- Automatic MCP tool discovery, Jev tool selection, model-generated tool arguments, tool execution, then final answer
- Local browser persistence for settings/chat
- Cloudflare Workers deployment

## Removed

- Built-in provider zoo
- Image generation
- Video generation
- TTS/STT
- Agent/plugin marketplace
- Database/auth stack
- Vector/database integrations
- Analytics/telemetry packages
- Docker/Vercel-specific deployment code
- Large monorepo build/test/release tooling

## Architecture

1. User sends a message.
2. Worker discovers configured MCP tools.
3. Cloudflare Workers AI calls `typesafe/jev` to decide whether an external tool is needed and which single tool to select.
4. The custom chat provider compiles JSON arguments for the selected MCP tool.
5. The Worker calls that MCP tool.
6. The custom chat provider produces the final response with Jev routing metadata and MCP result.

Jev is a structured decision model, not a replacement chat generator.

## Custom provider

The frontend accepts Base URL, chat path, model, API key, and custom headers JSON. The backend expects an OpenAI-compatible chat-completions response shape, with fallbacks for several common text fields.

## Custom MCP

This lite build supports remote HTTP / Streamable HTTP MCP endpoints. It does not support stdio MCP servers because Cloudflare Workers cannot spawn local processes.

MCP credentials are stored in the user's browser localStorage and sent only to this Worker when needed.

## Deploy

```bash
npm install
npx wrangler login
npm run deploy
```

The required Workers AI binding is already declared as `AI`.

## Licensing note

This repository is a derivative of the upstream Lobe Chat fork and therefore retains the upstream `LICENSE` file and its additional commercial-use conditions.
