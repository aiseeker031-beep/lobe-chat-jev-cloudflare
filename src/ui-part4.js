export const UI_PART_4 = String.raw`"+(state.provider.model||"not set");el("mcpPill").textContent="MCP: "+state.mcpServers.length;}
  function fillSettings(){
    el("providerName").value=state.provider.name||"";el("baseUrl").value=state.provider.baseUrl||"";el("chatPath").value=state.provider.path||"";el("model").value=state.provider.model||"";el("apiKey").value=state.provider.apiKey||"";
    el("providerHeaders").value=typeof state.provider.headers==="string"?state.provider.headers:JSON.stringify(state.provider.headers||{},null,2);
    el("jevToggle").checked=state.options.jev!==false;el("autoTools").checked=state.options.autoTools!==false;el("systemPrompt").value=state.options.systemPrompt||"";renderMcp();
  }
  function syncSettings(){
    state.provider={name:el("providerName").value.trim()||"Custom",baseUrl:el("baseUrl").value.trim(),path:el("chatPath").value.trim()||"/chat/completions",model:el("model").value.trim(),apiKey:el("apiKey").value,headers:el("providerHeaders").value.trim()||"{}"};
    state.options.jev=el("jevToggle").checked;state.options.autoTools=el("autoTools").checked;state.options.systemPrompt=el("systemPrompt").value;save();
  }
  ["providerName","baseUrl","chatPath","model","apiKey","providerHeaders","systemPrompt"].forEach(function(id){el(id).addEventListener("input",syncSettings);});
  ["jevToggle","autoTools"].forEach(function(id){el(id).addEventListener("change",syncSettings);});
  function renderMcp(){
    var host=el("mcpList");
    if(!state.mcpServers.length){host.innerHTML='<div class="statusline" style="margin-top:10px">No MCP servers added yet.</div>';return;}
    host.innerHTML=state.mcpServers.map(function(s,i){
      var tools=s.lastTools&&s.lastTools.length?'<div class="tool-list">'+esc(s.lastTools.slice(0,5).join(" • "))+(s.lastTools.length>5?" • …":"")+'</div>':"";
      return '<div class="mcp-card"><div class="mcp-top"><div style="min-width:0"><div class="mcp-name">'+esc(s.name||("MCP "+(i+1)))+'</div><div class="mcp-url">'+esc(s.url)+'</div></div><div><button class="smallbtn" data-test="'+i+'">Test</button> <button class="smallbtn danger" data-del="'+i+'">×</button></div></div>'+tools+'</div>';
    }).join("");
    host.querySelectorAll("[data-del]").forEach(function(b){b.onclick=function(){state.mcpServers.splice(Number(b.getAttribute("data-del")),1);save();renderMcp();};});
    host.querySelectorAll("[data-test]").forEach(function(b){b.onclick=function(){testMcp(Number(b.getAttribute("data-test")));};});
  }
  el("addMcp").onclick=function(){
    var name=prompt("MCP name","My MCP");if(name===null)return;var url=prompt("Streamable HTTP MCP URL","https://example.com/mcp");if(!url)return;var token=prompt("Bearer token (optional)","");var headers=prompt("Extra headers JSON (optional)","{}");
    state.mcpServers.push({name:name||"MCP",url:url.trim(),token:token||"",headers:headers||"{}",lastTools:[]});save();renderMcp();
  };
  async function testMcp(i){
    var s=state.mcpServers[i];toast("Testing "+(s.name||"MCP")+"…");
    try{var r=await fetch("/api/mcp/discover",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({server:s})});var data=await r.json();if(!r.ok||data.error)throw new Error(data.error||"MCP test failed");s.lastTools=(data.tools||[]).map(function(t){return t.name;});save();renderMcp();toast("Found "+s.lastTools.length+" tools");}catch(e){toast(e.message||String(e));}
  }
  async function send(){
    syncSettings();var input=el("prompt"),text=input.value.trim();if(!text)return;
    if(!state.provider.baseUrl||!state.provider.model){toast("Set custom provider Base URL and model first.");el("settings").classList.add("open");return;}
    state.messages.push({role:"user",content:text});input.value="";renderMessages();save();el("send").disabled=true;state.messages.push({role:"assistant",content:"Thinking…",pending:true});renderMessages();
    try{
      var payloadMessages=state.messages.filter(function(m){return !m.pending;}).map(function(m){return{role:m.role,content:m.content};});
      var r=await fetch("/api/chat",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({messages:payloadMessages,provider:state.provider,mcpServers:state.mcpServers,options:state.options})});
      var data=await r.json();if(!r.ok||data.error)throw new Error(data.error||"Request failed");state.messages[state.messages.length-1]={role:"assistant",content:data.reply||"(empty response)",trace:{jev:data.jev,tool:data.tool}};
    }catch(e){state.messages[state.messages.`;
