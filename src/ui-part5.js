export const UI_PART_5 = String.raw`length-1]={role:"assistant",content:"Error: "+(e.message||String(e))};}
    finally{el("send").disabled=false;save();renderMessages();input.focus();}
  }
  el("send").onclick=send;el("prompt").addEventListener("keydown",function(e){if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();}});
  el("newChat").onclick=function(){state.messages=[];save();renderMessages();};
  el("clearLocal").onclick=function(){if(confirm("Clear saved provider, MCP settings and chat history?")){localStorage.removeItem("lobe-jev-lite");location.reload();}};
  el("mobileSettings").onclick=function(){el("settings").classList.toggle("open");};
  el("openProvider").onclick=function(){el("settings").classList.add("open");el("providerSection").scrollIntoView({behavior:"smooth"});};
  el("openMcp").onclick=function(){el("settings").classList.add("open");el("mcpSection").scrollIntoView({behavior:"smooth"});};
  fetch("/api/status").then(function(r){return r.json();}).then(function(s){var p=el("jevPill");if(s.jev&&s.jev.configured){p.textContent="Jev: online";p.className="pill ok";}else{p.textContent="Jev: no binding";p.className="pill warn";}}).catch(function(){el("jevPill").textContent="Jev: unknown";});
  fillSettings();refreshPills();renderMessages();
})();
</script>
</body>
</html>`;
