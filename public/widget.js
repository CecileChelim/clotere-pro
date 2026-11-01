/* Clotere Pro — bouton de prise de rendez-vous à intégrer sur le site d'un cabinet.
   <script src="https://avocat.clotere.fr/widget.js" data-pro="<slug>" data-color="#7c3aed" data-label="Prendre RDV" [data-target="clotere-rdv"]></script> */
(function () {
  var s = document.currentScript;
  if (!s) return;
  var d = s.dataset, slug = d.pro;
  if (!slug) return;
  var base = new URL(s.src).origin;
  var color = d.color || "#7c3aed", label = d.label || "Prendre RDV", source = d.source || "site";
  var url = base + "/rdv/" + encodeURIComponent(slug) + "?source=" + encodeURIComponent(source) + "&embed=1";

  function open() {
    var o = document.createElement("div");
    o.style.cssText = "position:fixed;inset:0;z-index:2147483646;background:rgba(17,24,39,.55);display:flex;align-items:center;justify-content:center;padding:16px";
    var box = document.createElement("div");
    box.style.cssText = "position:relative;width:100%;max-width:1100px;height:100%;max-height:860px;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 25px 50px -12px rgba(0,0,0,.35)";
    var f = document.createElement("iframe");
    f.src = url; f.title = "Prise de rendez-vous";
    f.style.cssText = "width:100%;height:100%;border:0";
    var x = document.createElement("button");
    x.type = "button"; x.setAttribute("aria-label", "Fermer"); x.innerHTML = "&times;";
    x.style.cssText = "position:absolute;top:10px;right:10px;width:36px;height:36px;border-radius:999px;border:0;background:#fff;box-shadow:0 1px 4px rgba(0,0,0,.2);font-size:22px;line-height:1;cursor:pointer;color:#111";
    function close() { o.remove(); document.removeEventListener("keydown", esc); }
    function esc(e) { if (e.key === "Escape") close(); }
    x.onclick = close; o.onclick = function (e) { if (e.target === o) close(); };
    document.addEventListener("keydown", esc);
    box.appendChild(f); box.appendChild(x); o.appendChild(box); document.body.appendChild(o);
  }

  var b = document.createElement("button");
  b.type = "button"; b.textContent = label; b.onclick = open;
  var css = "background:" + color + ";color:#fff;border:0;border-radius:999px;padding:14px 22px;font:600 15px/1 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;cursor:pointer;box-shadow:0 10px 25px -5px rgba(0,0,0,.3)";
  var target = d.target && document.getElementById(d.target);
  if (target) { b.style.cssText = css; target.appendChild(b); }
  else {
    b.style.cssText = css + ";position:fixed;right:20px;bottom:20px;z-index:2147483645";
    (document.body ? document.body.appendChild(b) : document.addEventListener("DOMContentLoaded", function () { document.body.appendChild(b); }));
  }
})();
