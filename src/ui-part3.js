export const UI_PART_3 = String.raw`eUrl" placeholder="https://api.example.com/v1">
    <div class="row2">
      <div><label>Chat path</label><input class="field" id="chatPath" placeholder="/chat/completions"></div>
      <div><label>Model</label><input class="field" id="model" placeholder="model-name"></div>
    </div>
    <label>API key</label><input class="field" id="apiKey" type="password" placeholder="Stored only in this browser">
    <label>Custom headers JSON</label><textarea class="field" id="providerHeaders" placeholder='{"X-Custom":"value"}'></textarea>
    <div class="statusline">Settings stay in localStorage and are sent only to your own Worker when you chat.</div>
  </div>
  <div class="section">
    <div class="section-head"><b>Jev decision brain</b><input class="toggle" id="jevToggle" type="checkbox"></div>
    <div class="statusline">Cloudflare model: <strong>typesafe/jev</strong>. Jev chooses direct vs tool-assisted flow and selects one MCP tool when needed.</div>
  </div>
  <div class="section" id="mcpSection">
    <div class="section-head"><b>Custom MCP</b><button class="smallbtn primary" id="addMcp">＋ Add</button></div>
    <div class="statusline">Remote HTTP / Streamable HTTP MCP endpoints. Stdio cannot run inside Cloudflare Workers.</div>
    <div id="mcpList"></div>
  </div>
  <div class="section">
    <div class="section-head"><b>Agent behavior</b></div>
    <label>System prompt</label><textarea class="field" id="systemPrompt" placeholder="Optional persistent instruction"></textarea>
    <div class="section-head" style="margin-top:12px;margin-bottom:0"><span class="statusline">Automatic MCP tool use</span><input class="toggle" id="autoTools" type="checkbox"></div>
  </div>
  <div class="section"><button class="smallbtn danger" id="clearLocal">Clear local settings & chat</button></div>
</aside>
</div>
<div class="toast" id="toast"></div>
<script>
(function(){
  var DEFAULTS={provider:{name:"Custom",baseUrl:"",path:"/chat/completions",model:"",apiKey:"",headers:"{}"},mcpServers:[],options:{jev:true,autoTools:true,systemPrompt:""},messages:[]};
  var state=load();
  function load(){try{var s=JSON.parse(localStorage.getItem("lobe-jev-lite")||"null");return Object.assign({},DEFAULTS,s||{},{provider:Object.assign({},DEFAULTS.provider,(s&&s.provider)||{}),options:Object.assign({},DEFAULTS.options,(s&&s.options)||{})});}catch(e){return JSON.parse(JSON.stringify(DEFAULTS));}}
  function save(){localStorage.setItem("lobe-jev-lite",JSON.stringify(state));refreshPills();}
  function el(id){return document.getElementById(id);}
  function esc(s){return String(s||"").replace(/[&<>"']/g,function(c){return({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"})[c];});}
  function toast(msg){var t=el("toast");t.textContent=msg;t.classList.add("show");clearTimeout(window.__toast);window.__toast=setTimeout(function(){t.classList.remove("show");},2200);}
  function scrollEnd(){requestAnimationFrame(function(){el("messages").scrollTop=el("messages").scrollHeight;});}
  function renderMessages(){
    var box=el("messages");
    if(!state.messages.length){
      box.innerHTML='<div class="empty"><div class="emptybox"><div class="orb">J</div><h1>Jev decides. Your model responds.</h1><p>A stripped Lobe-style agent shell with one custom provider, custom MCP servers, and Cloudflare Jev routing. No image generation, video generation, provider zoo, marketplace, or database baggage.</p><div class="chips"><button class="chip" data-q="Explain what tools you can use.">Inspect tools</button><button class="chip" data-q="Help me plan a small SaaS feature.">Plan a feature</button><button class="chip" data-q="Summarize how this agent routes a request.">Explain routing</button></div></div></div>';
      box.querySelectorAll("[data-q]").forEach(function(b){b.onclick=function(){el("prompt").value=b.getAttribute("data-q");el("prompt").focus();};});
      return;
    }
    box.innerHTML=state.messages.map(function(m){
      var who=m.role==="user"?"U":"J",trace="";
      if(m.trace){var bits=[];if(m.trace.jev&&m.trace.jev.available)bits.push("Jev routed this turn");if(m.trace.tool&&m.trace.tool.tool)bits.push("MCP: "+m.trace.tool.tool);if(bits.length)trace='<div class="trace">'+esc(bits.join(" • "))+'</div>';}
      return '<div class="msg '+esc(m.role)+'"><div class="avatar">'+who+'</div><div><div class="bubble">'+esc(m.content)+'</div>'+trace+'</div></div>';
    }).join("");
    scrollEnd();
  }
  function refreshPills(){el("providerPill").textContent="Provider: `;
