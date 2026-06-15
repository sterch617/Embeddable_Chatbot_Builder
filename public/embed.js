/* Docent embeddable chat widget.
 * Usage:
 *   <script src="https://YOUR_APP/embed.js" data-docent="PUBLIC_ID" data-color="#4f46e5" async></script>
 */
(function () {
  var script =
    document.currentScript ||
    (function () {
      var s = document.getElementsByTagName("script");
      return s[s.length - 1];
    })();
  if (!script) return;

  var botId = script.getAttribute("data-docent");
  if (!botId) {
    console.error("[Docent] Missing data-docent attribute on the embed script.");
    return;
  }
  var origin = new URL(script.src, window.location.href).origin;
  var color = script.getAttribute("data-color") || "#4f46e5";
  var side = script.getAttribute("data-position") === "left" ? "left" : "right";

  var BUBBLE = 56;
  var css =
    ".docent-bubble{position:fixed;bottom:20px;" +
    side +
    ":20px;width:" +
    BUBBLE +
    "px;height:" +
    BUBBLE +
    "px;border-radius:50%;border:none;cursor:pointer;color:#fff;display:flex;align-items:center;justify-content:center;box-shadow:0 8px 24px rgba(0,0,0,.18);z-index:2147483646;transition:transform .15s ease}" +
    ".docent-bubble:hover{transform:scale(1.05)}" +
    ".docent-frame{position:fixed;bottom:" +
    (BUBBLE + 32) +
    "px;" +
    side +
    ":20px;width:380px;max-width:calc(100vw - 40px);height:560px;max-height:calc(100vh - 120px);border:none;border-radius:16px;overflow:hidden;box-shadow:0 16px 48px rgba(0,0,0,.24);z-index:2147483646;background:#fff;display:none;opacity:0;transform:translateY(8px);transition:opacity .18s ease,transform .18s ease}" +
    ".docent-frame.docent-open{display:block;opacity:1;transform:translateY(0)}" +
    ".docent-frame iframe{width:100%;height:100%;border:none}" +
    "@media (max-width:480px){.docent-frame{width:calc(100vw - 24px);height:calc(100vh - 100px);" +
    side +
    ":12px;bottom:84px}}";

  var style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);

  var chatIcon =
    '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22z"/></svg>';
  var closeIcon =
    '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>';

  var frame = document.createElement("div");
  frame.className = "docent-frame";
  var iframe = document.createElement("iframe");
  iframe.title = "Chat";
  iframe.setAttribute("loading", "lazy");
  frame.appendChild(iframe);

  var button = document.createElement("button");
  button.className = "docent-bubble";
  button.setAttribute("aria-label", "Open chat");
  button.style.background = color;
  button.innerHTML = chatIcon;

  var open = false;
  var loaded = false;
  function toggle() {
    open = !open;
    if (open && !loaded) {
      iframe.src = origin + "/widget/" + encodeURIComponent(botId);
      loaded = true;
    }
    frame.classList.toggle("docent-open", open);
    button.innerHTML = open ? closeIcon : chatIcon;
    button.setAttribute("aria-label", open ? "Close chat" : "Open chat");
  }
  button.addEventListener("click", toggle);

  function mount() {
    document.body.appendChild(frame);
    document.body.appendChild(button);
  }
  if (document.body) mount();
  else window.addEventListener("DOMContentLoaded", mount);
})();
