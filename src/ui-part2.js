export const UI_PART_2 = String.raw`or:white;font-weight:900}.send:disabled{opacity:.45;cursor:not-allowed}
.settings h2{font-size:16px;margin:4px 0 16px}.section{border:1px solid var(--line);background:#131317;border-radius:16px;padding:13px;margin-bottom:12px}.section-head{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:11px}.section-head b{font-size:13px}label{display:block;color:#a9a9b3;font-size:11px;margin:10px 0 6px}.field{width:100%;border:1px solid #2a2a32;background:#0f0f12;color:#eee;border-radius:11px;padding:9px 10px;outline:none}.field:focus{border-color:#6f57da;box-shadow:0 0 0 3px rgba(124,92,255,.10)}textarea.field{min-height:72px;resize:vertical}.row2{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.smallbtn{border:1px solid #2d2d36;background:#17171c;color:#d6d6dd;border-radius:10px;padding:7px 9px;font-size:11px}.smallbtn.primary{border-color:#5941bc;background:#211a3e;color:#e8e1ff}.smallbtn.danger{color:#fda4af}.toggle{appearance:none;width:38px;height:22px;border-radius:999px;background:#33333b;position:relative;transition:.2s}.toggle:checked{background:#7255f5}.toggle:after{content:"";width:16px;height:16px;top:3px;left:3px;border-radius:50%;background:white;position:absolute;transition:.2s}.toggle:checked:after{left:19px}
.mcp-card{border:1px solid #27272f;background:#101013;border-radius:12px;padding:10px;margin-top:9px}.mcp-top{display:flex;justify-content:space-between;align-items:center;gap:8px}.mcp-name{font-size:12px;font-weight:650}.mcp-url{font-size:10px;color:#747480;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:210px}.tool-list{font-size:10px;color:#9b9ba6;margin-top:7px;line-height:1.6}.statusline{font-size:11px;color:#8e8e99;margin-top:7px}.mobile-settings{display:none}.toast{position:fixed;left:50%;bottom:104px;transform:translateX(-50%) translateY(20px);background:#1c1c22;border:1px solid #34343e;color:#eee;padding:9px 13px;border-radius:12px;font-size:12px;opacity:0;pointer-events:none;transition:.2s;z-index:20}.toast.show{opacity:1;transform:translateX(-50%) translateY(0)}
@media(max-width:1100px){.app{grid-template-columns:220px minmax(0,1fr)}.settings{position:fixed;right:0;top:0;bottom:0;width:min(390px,92vw);z-index:15;transform:translateX(102%);transition:.2s;box-shadow:-20px 0 60px rgba(0,0,0,.4)}.settings.open{transform:translateX(0)}.mobile-settings{display:inline-flex}}
@media(max-width:760px){.app{grid-template-columns:1fr}.sidebar{display:none}.topbar{padding:0 14px}.messages{padding:22px 15px}.empty h1{font-size:28px}.composer-wrap{padding:12px}.pill:nth-child(3){display:none}}
</style>
</head>
<body>
<div class="app">
<aside class="sidebar">
  <div class="brand"><div class="logo">J</div><div>Lobe Jev Lite</div></div>
  <button class="newchat" id="newChat">＋ New conversation</button>
  <div class="navtitle">Workspace</div>
  <div class="navitem active">Chat</div>
  <div class="navitem" id="openProvider">Custom provider</div>
  <div class="navitem" id="openMcp">MCP servers</div>
  <div class="sidecard">
    <div class="kv"><span>Architecture</span><strong>Cloudflare</strong></div>
    <div class="kv" style="margin-top:7px"><span>Providers</span><strong>Custom only</strong></div>
    <div class="kv" style="margin-top:7px"><span>Multimodal</span><strong>Removed</strong></div>
  </div>
</aside>
<main class="main">
  <header class="topbar">
    <div class="title">Agent Chat</div>
    <div class="pills">
      <span class="pill" id="providerPill">Provider: not set</span>
      <span class="pill warn" id="jevPill">Jev: checking</span>
      <span class="pill" id="mcpPill">MCP: 0</span>
      <button class="smallbtn mobile-settings" id="mobileSettings">Settings</button>
    </div>
  </header>
  <section class="messages" id="messages"></section>
  <div class="composer-wrap">
    <div class="composer">
      <textarea id="prompt" placeholder="Message your agent..." rows="2"></textarea>
      <div class="composer-row">
        <div class="hint">Jev routes • MCP acts • your custom model answers</div>
        <button class="send" id="send">↑</button>
      </div>
    </div>
  </div>
</main>
<aside class="settings" id="settings">
  <h2>Agent settings</h2>
  <div class="section" id="providerSection">
    <div class="section-head"><b>Custom AI provider</b><span class="pill">OpenAI-compatible</span></div>
    <label>Provider name</label><input class="field" id="providerName" placeholder="My provider">
    <label>Base URL</label><input class="field" id="bas`;
