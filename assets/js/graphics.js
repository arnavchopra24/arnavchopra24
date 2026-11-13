/* Fairness Opinion: interactive graphics.
   Each <figure data-graphic> holds its settings as JSON (written from a deal's
   front matter by _includes/graphic.html). Types: timeline, stub, leverage, dotplot. */
(function () {
  "use strict";

  var NS = "http://www.w3.org/2000/svg";
  var COLORS = { blue: "#3a6ea5", red: "#b5473f", grey: "#c3c8d1", ink: "#121620", soft: "#697080", lightblue: "#a9c1dc", lightred: "#e0aaa5" };
  var MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  function col(c) { return COLORS[c] || c || COLORS.blue; }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function svg(tag, attrs, parent) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) if (attrs.hasOwnProperty(k)) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  function html(tag, cls, parent, inner) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (inner != null) e.innerHTML = inner;
    if (parent) parent.appendChild(e);
    return e;
  }
  function parseD(s) {
    var m = String(s || "").match(/^(\d{4})-(\d{2})-(\d{2})/);
    return m ? Date.UTC(+m[1], +m[2] - 1, +m[3]) : NaN;
  }
  function fmtD(s) {
    var t = parseD(s); if (isNaN(t)) return String(s || "");
    var d = new Date(t);
    return MON[d.getUTCMonth()] + " " + d.getUTCDate() + ", " + d.getUTCFullYear();
  }
  function fmtN(v, g) {
    var dec = g.decimals == null ? 2 : g.decimals;
    var s = Math.abs(v).toFixed(dec);
    if (g.trim_zeros) s = s.replace(/\.0+$/, "");
    return (v < 0 ? "−" : "") + (g.prefix == null ? "" : g.prefix) + s + (g.suffix || "");
  }
  function debounce(fn, ms) {
    var t; return function () { clearTimeout(t); t = setTimeout(fn, ms); };
  }

  // Tooltip shared by every graphic: positioned inside the figure
  function tipFor(fig) {
    var tip = fig.querySelector(".g-tip");
    if (!tip) { tip = html("div", "g-tip", fig); tip.hidden = true; tip.setAttribute("role", "status"); }
    return {
      show: function (content, clientX, clientY) {
        tip.innerHTML = content; tip.hidden = false;
        var r = fig.getBoundingClientRect();
        var x = clientX - r.left, y = clientY - r.top;
        var w = tip.offsetWidth, h = tip.offsetHeight;
        var left = x + 14; if (left + w > r.width) left = x - w - 14; if (left < 0) left = Math.max(0, Math.min(r.width - w, x - w / 2));
        var top = y - h - 12; if (top < 0) top = y + 16;
        tip.style.left = left + "px"; tip.style.top = top + "px";
      },
      hide: function () { tip.hidden = true; }
    };
  }

  function hookPoint(node, tip, content) {
    function at(e) {
      var r = node.getBoundingClientRect();
      var cx = e && e.clientX != null && e.type.indexOf("mouse") === 0 ? e.clientX : r.left + r.width / 2;
      var cy = e && e.clientY != null && e.type.indexOf("mouse") === 0 ? e.clientY : r.top + r.height / 2;
      tip.show(content, cx, cy);
    }
    node.addEventListener("mouseenter", at);
    node.addEventListener("mousemove", at);
    node.addEventListener("focus", at);
    node.addEventListener("click", at);
    node.addEventListener("mouseleave", tip.hide);
    node.addEventListener("blur", tip.hide);
  }

  function frame(fig, g) {
    // figcaption is already rendered by Liquid; add the rest
    var bar = html("div", "g-bar", fig);
    var controls = html("div", "g-controls", fig);
    var body = html("div", "g-body", fig);
    if (g.note) html("p", "g-note", fig, esc(g.note));
    return { bar: bar, controls: controls, body: body };
  }

  function legend(parent, items) {
    var l = html("div", "g-legend", parent);
    items.forEach(function (it) {
      var s = html("span", "", l);
      var i = html("i", it.kind || "", s);
      if (it.kind !== "dash") i.style.background = it.color;
      s.appendChild(document.createTextNode(it.label));
    });
    return l;
  }

  function segmented(parent, options, current, onChange) {
    var seg = html("div", "seg", parent);
    seg.setAttribute("role", "group");
    options.forEach(function (o) {
      var b = html("button", "", seg, esc(o.label));
      b.type = "button";
      b.setAttribute("aria-pressed", o.value === current ? "true" : "false");
      b.addEventListener("click", function () {
        Array.prototype.forEach.call(seg.children, function (c) { c.setAttribute("aria-pressed", "false"); });
        b.setAttribute("aria-pressed", "true");
        onChange(o.value);
      });
    });
    return seg;
  }

  function slider(parent, cfg, onInput, fmt) {
    var wrap = html("label", "g-slider", parent);
    var top = html("div", "g-slider-top", wrap);
    html("span", "g-slider-label", top, esc(cfg.label));
    var out = html("output", "", top);
    var above = (cfg.marks || []).some(function (m) { return m.above; });
    var rw = html("div", "g-range-wrap" + ((cfg.marks && cfg.marks.length) || cfg.band ? "" : " no-marks") + (above ? " has-above" : ""), wrap);
    var input = html("input", "", rw);
    input.type = "range"; input.min = cfg.min; input.max = cfg.max; input.step = cfg.step || 1; input.value = cfg.default;
    input.setAttribute("aria-label", cfg.label);
    function pos(v) { return (v - cfg.min) / (cfg.max - cfg.min); }
    function place(node, v) { var p = pos(v); node.style.left = "calc(" + (p * 100) + "% + " + (10 - p * 20) + "px)"; }
    if (cfg.band) {
      var band = html("span", "g-band", rw);
      var a = pos(cfg.band.from), b = pos(cfg.band.to);
      band.style.left = "calc(" + (a * 100) + "% + " + (10 - a * 20) + "px)";
      band.style.width = "calc(" + ((b - a) * 100) + "% - " + ((b - a) * 20) + "px)";
      band.title = cfg.band.label || "";
    }
    (cfg.marks || []).forEach(function (m) {
      var mk = html("span", "g-mark" + (m.breakeven ? " be" : "") + (m.above ? " above" : ""), rw, esc(m.label));
      place(mk, m.value);
    });
    function update() {
      var v = parseFloat(input.value);
      input.style.setProperty("--fill", (pos(v) * 100) + "%");
      out.textContent = fmt(v);
      onInput(v);
    }
    input.addEventListener("input", update);
    return { input: input, update: update };
  }

  // ── Timeline: step chart of offers over time ─────────────────

  function timeline(fig, g) {
    var f = frame(fig, g);
    var tip = tipFor(fig);
    var mode = "value";
    var ref = g.reference ? g.reference.value : null;
    var items = g.series.map(function (s) { return { label: s.name, color: col(s.color) }; });
    if (g.reference) items.push({ label: g.reference.label, kind: "dash" });
    legend(f.bar, items);
    if (ref && g.toggle_premium) {
      segmented(f.bar, [{ label: "Offer per share", value: "value" }, { label: "Premium to " + fmtN(ref, g), value: "premium" }], mode, function (m) { mode = m; draw(); });
    }

    function draw() {
      f.body.innerHTML = "";
      var W = Math.max(300, f.body.clientWidth || 700), narrow = W < 600;
      var H = narrow ? 300 : 390;
      var m = { t: 22, r: narrow ? 90 : 118, b: 34, l: narrow ? 40 : 48 };
      var x0 = parseD(g.x_start), x1 = parseD(g.x_end);
      var tf, ymin, ymax, ticks, yfmt;
      if (mode === "value") {
        tf = function (v) { return v; };
        ymin = g.y_min; ymax = g.y_max; ticks = g.y_ticks;
        yfmt = function (v) { return (g.prefix || "") + v; };
      } else {
        tf = function (v) { return (v / ref - 1) * 100; };
        ymin = g.premium_min || 0; ymax = g.premium_max || 160; ticks = g.premium_ticks || [0, 50, 100, 150];
        yfmt = function (v) { return v + "%"; };
      }
      var X = function (t) { return m.l + (t - x0) / (x1 - x0) * (W - m.l - m.r); };
      var Y = function (v) { return m.t + (1 - (v - ymin) / (ymax - ymin)) * (H - m.t - m.b); };
      var root = svg("svg", { viewBox: "0 0 " + W + " " + H, width: W, height: H, role: "img", "aria-label": g.title }, f.body);

      ticks.forEach(function (t) {
        svg("line", { x1: m.l, x2: W - m.r, y1: Y(t), y2: Y(t), stroke: "#e6e8ec", "stroke-width": 1 }, root);
        var tx = svg("text", { x: m.l - 8, y: Y(t) + 4, "text-anchor": "end", "font-size": 11.5, fill: COLORS.soft }, root);
        tx.textContent = yfmt(t);
      });
      // month ticks
      var d0 = new Date(x0), first = true;
      var mt = Date.UTC(d0.getUTCFullYear(), d0.getUTCMonth() + (d0.getUTCDate() > 1 ? 1 : 0), 1);
      while (mt <= x1) {
        var dd = new Date(mt), xx = X(mt);
        svg("line", { x1: xx, x2: xx, y1: H - m.b, y2: H - m.b + 5, stroke: COLORS.soft }, root);
        var lab = MON[dd.getUTCMonth()];
        if (first || dd.getUTCMonth() === 0) lab += narrow ? " '" + String(dd.getUTCFullYear()).slice(2) : " " + dd.getUTCFullYear();
        var tt = svg("text", { x: xx, y: H - m.b + 19, "text-anchor": "middle", "font-size": 11.5, fill: COLORS.soft }, root);
        tt.textContent = lab;
        first = false;
        mt = Date.UTC(dd.getUTCFullYear(), dd.getUTCMonth() + 1, 1);
      }
      svg("line", { x1: m.l, x2: W - m.r, y1: H - m.b, y2: H - m.b, stroke: COLORS.ink, "stroke-width": 1 }, root);

      if (ref && mode === "value") {
        svg("line", { x1: m.l, x2: W - m.r, y1: Y(ref), y2: Y(ref), stroke: COLORS.soft, "stroke-width": 1.5, "stroke-dasharray": "5 4" }, root);
        var rl = svg("text", { x: W - m.r + 6, y: Y(ref) + 4, "font-size": 11.5, fill: COLORS.soft, "font-weight": 600 }, root);
        rl.textContent = fmtN(ref, g);
      }

      var hits = svg("g", {}, null), labels = svg("g", {}, null);
      g.series.forEach(function (s) {
        var c = col(s.color);
        var pts = s.points.map(function (p) { return { t: parseD(p.date), v: tf(p.value), p: p }; });
        var d = "";
        pts.forEach(function (q, i) {
          var x = X(q.t), y = Y(q.v);
          if (i === 0) d += "M" + x + "," + y;
          else d += s.step ? "H" + x + "V" + y : "L" + x + "," + y;
        });
        var endX = s.extend ? X(x1) : X(pts[pts.length - 1].t);
        if (s.extend) d += "H" + endX;
        svg("path", { d: d, fill: "none", stroke: c, "stroke-width": 2.5, "stroke-linejoin": "round", "stroke-linecap": "round" }, root);

        pts.forEach(function (q) {
          var x = X(q.t), y = Y(q.v);
          if (!q.p.quiet) {
            svg("circle", { cx: x, cy: y, r: 5, fill: q.p.hollow ? "#fff" : c, stroke: q.p.hollow ? c : "#fff", "stroke-width": 2 }, root);
          } else {
            svg("circle", { cx: x, cy: y, r: 3, fill: "#fff", stroke: c, "stroke-width": 1.5 }, root);
          }
          if (q.p.show_value && (!narrow || q.p.key)) {
            var vt = svg("text", { x: x + (q.p.dx || 0), y: y - 11, "text-anchor": q.p.anchor || "middle", "font-size": narrow ? 11 : 12, "font-weight": 700, fill: COLORS.ink, stroke: "#fff", "stroke-width": 4, "paint-order": "stroke", "stroke-linejoin": "round" }, labels);
            vt.textContent = mode === "value" ? fmtN(q.p.value, { prefix: g.prefix, decimals: q.p.value % 1 ? 2 : 0 }) : Math.round(q.v) + "%";
          }
          var prem = ref ? Math.round((q.p.value / ref - 1) * 100) + "% premium" : "";
          var content = "<b>" + esc(q.p.when || fmtD(q.p.date)) + " · " + esc(s.short || s.name) + "</b>" +
            '<span class="tv">' + esc(fmtN(q.p.value, g)) + (prem ? "<small>" + esc(prem) + "</small>" : "") + "</span>" +
            esc(q.p.note || "");
          var hit = svg("circle", { cx: x, cy: y, r: narrow ? 12 : 14, fill: "transparent", class: "hit", tabindex: 0, role: "button", "aria-label": (q.p.when || fmtD(q.p.date)) + ", " + (s.short || s.name) + ", " + fmtN(q.p.value, g) + ". " + (q.p.note || "") }, hits);
          hookPoint(hit, tip, content);
        });

        if (s.end_label) {
          var last = pts[pts.length - 1];
          var el = svg("text", { x: endX + 8, y: Y(last.v) + (s.end_dy || 0) + 4, "font-size": narrow ? 11 : 12.5, "font-weight": 700, fill: c }, root);
          el.textContent = mode === "value" ? s.end_label : (s.short || s.name) + " " + Math.round(last.v) + "%";
          if (!narrow && s.end_sub) {
            var es = svg("text", { x: endX + 8, y: Y(last.v) + (s.end_dy || 0) + 19, "font-size": 11.5, fill: COLORS.soft }, root);
            es.textContent = s.end_sub;
          }
        }
      });
      root.appendChild(labels);
      root.appendChild(hits);
    }
    draw();
    window.addEventListener("resize", debounce(draw, 120));
    if (g.hint) html("p", "g-hint", f.controls, esc(g.hint));
  }

  // ── Stub: compare a cash bid with a cash-plus-spin-off bid ───

  function stub(fig, g) {
    var f = frame(fig, g);
    var p = g.prefix == null ? "$" : g.prefix;
    var money = function (v) { return p + v.toFixed(2); };
    var be = g.rival.value - g.base.value;
    var marks = (g.stub.marks || []).slice();
    marks.push({ value: be, label: "Break-even " + money(be), breakeven: true });
    legend(f.bar, [{ label: g.base.legend || "Netflix cash", color: col(g.base.color || "red") }, { label: g.stub.legend || "Spin-off shares", color: col(g.stub.color || "lightred") }, { label: g.rival.legend || "Paramount cash", color: col(g.rival.color || "blue") }]);

    var rows = html("div", "", f.body);
    var max = g.max || 36;
    function row(name, sub) {
      var r = html("div", "cmp-row", rows);
      html("div", "cmp-name", r, esc(name) + (sub ? "<small>" + esc(sub) + "</small>" : ""));
      var tr = html("div", "cmp-track", r);
      return tr;
    }
    var t1 = row(g.base.label, g.base.sub);
    var s1 = html("span", "cmp-seg first", t1); s1.style.left = "0"; s1.style.background = col(g.base.color || "red");
    var s2 = html("span", "cmp-seg last", t1); s2.style.background = col(g.stub.color || "lightred");
    var v1 = html("span", "cmp-val", t1);
    var t2 = row(g.rival.label, g.rival.sub);
    var s3 = html("span", "cmp-seg last", t2); s3.style.left = "0"; s3.style.background = col(g.rival.color || "blue");
    var v2 = html("span", "cmp-val", t2);
    s3.style.width = (g.rival.value / max * 100) + "%";
    v2.style.left = (g.rival.value / max * 100) + "%";
    v2.textContent = money(g.rival.value);
    var out = html("div", "readout", f.body);

    var cfg = { label: g.stub.label, min: g.stub.min, max: g.stub.max, step: g.stub.step, default: g.stub.default, marks: marks, band: g.stub.band };
    var sl = slider(f.controls, cfg, function (v) {
      var total = g.base.value + v;
      var w1 = g.base.value / max * 100, w2 = v / max * 100;
      s1.style.width = w1 + "%";
      s2.style.left = "calc(" + w1 + "% + 2px)";
      s2.style.width = "calc(" + w2 + "% - 2px)";
      s2.style.display = v > 0.04 ? "" : "none";
      v1.style.left = (total / max * 100) + "%";
      v1.textContent = money(total);
      var diff = g.rival.value - total;
      var lead = Math.abs(diff) < 0.005 ? "<span class=\"big\">Dead even.</span> " :
        diff > 0 ? '<span class="big">' + esc(g.rival.name || "Paramount") + " ahead by " + money(diff) + "</span> a share. " :
          '<span class="big">' + esc(g.base.name || "Netflix") + " ahead by " + money(-diff) + "</span> a share. ";
      out.innerHTML = lead + esc(g.readout || "") + " <b>Break-even: " + money(be) + "</b>.";
    }, money);
    sl.update();
  }

  // ── Leverage: net debt / EBITDA calculator ───────────────────

  function leverage(fig, g) {
    var f = frame(fig, g);
    var st = { e: g.ebitda.default, s: g.synergies.default, r: g.paydown.default };
    var bn = function (v) { return "$" + v.toFixed(1) + "B"; };
    var outWrap = html("div", "lev-out", f.body);
    var num = html("div", "lev-num", outWrap);
    var gauge = html("div", "gauge", outWrap);
    html("div", "gauge-track", gauge);
    var fill = html("div", "gauge-fill", gauge);
    var max = g.max || 8;
    (g.markers || []).forEach(function (mk) {
      var n = html("div", "gauge-mark" + (mk.dashed ? " dash" : ""), gauge, "<span>" + esc(mk.label) + "</span>");
      n.style.left = (mk.value / max * 100) + "%";
    });
    var ticks = html("div", "gauge-ticks", gauge);
    for (var t = 0; t <= max; t += 2) { var s = html("span", "", ticks, t + "x"); s.style.left = (t / max * 100) + "%"; }
    var formula = html("div", "formula", f.body);
    var out = html("div", "readout", f.body);

    function calc() {
      var debt = g.net_debt - st.r, eb = st.e + st.s;
      var lev = debt / eb;
      num.innerHTML = lev.toFixed(1) + "x<small>net debt ÷ EBITDA</small>";
      fill.style.width = Math.min(100, lev / max * 100) + "%";
      fill.className = "gauge-fill" + (lev > g.target + 0.005 ? " over" : "");
      formula.textContent = "(" + bn(g.net_debt) + " net debt − " + bn(st.r) + " repaid) ÷ (" + bn(st.e) + " EBITDA + " + bn(st.s) + " savings)";
      var need = g.net_debt - g.target * eb;
      if (lev <= g.target + 0.005) out.innerHTML = '<span class="big">Target met.</span> ' + esc(g.met_text || "");
      else out.innerHTML = '<span class="big">' + bn(need - st.r) + " more to repay</span> to reach " + g.target.toFixed(1) + "x at these settings. " + esc(g.gap_text || "");
    }
    slider(f.controls, g.ebitda, function (v) { st.e = v; calc(); }, bn).update();
    slider(f.controls, g.synergies, function (v) { st.s = v; calc(); }, bn).update();
    slider(f.controls, g.paydown, function (v) { st.r = v; calc(); }, bn).update();
  }

  // ── Dot plot: values on one axis with reference lines ────────

  function dotplot(fig, g) {
    var f = frame(fig, g);
    var tip = tipFor(fig);
    legend(f.bar, (g.legend || []).map(function (l) { return { label: l.label, color: col(l.color), kind: l.kind }; }));
    function draw() {
      f.body.innerHTML = "";
      var W = Math.max(300, f.body.clientWidth || 700), narrow = W < 600;
      var rowH = 36, labW = narrow ? 112 : 190;
      var m = { t: 46, r: 30, b: 28, l: labW };
      var H = m.t + g.rows.length * rowH + m.b;
      var X = function (v) { return m.l + (v - g.min) / (g.max - g.min) * (W - m.l - m.r); };
      var root = svg("svg", { viewBox: "0 0 " + W + " " + H, width: W, height: H, role: "img", "aria-label": g.title }, f.body);
      var step = (g.tick || 2) * (narrow ? 2 : 1);
      for (var t = g.min; t <= g.max; t += step) {
        svg("line", { x1: X(t), x2: X(t), y1: m.t - 6, y2: H - m.b, stroke: "#eceef2" }, root);
        var tx = svg("text", { x: X(t), y: H - m.b + 17, "text-anchor": "middle", "font-size": 11.5, fill: COLORS.soft }, root);
        tx.textContent = fmtN(t, { prefix: g.prefix, decimals: 0 });
      }
      (g.markers || []).forEach(function (mk, i) {
        var x = X(mk.value);
        svg("line", { x1: x, x2: x, y1: m.t - 8, y2: H - m.b, stroke: col(mk.color || "ink"), "stroke-width": 2, "stroke-dasharray": mk.dashed ? "5 4" : "" }, root);
        var lt = svg("text", { x: x, y: m.t - 30 + (i % 2) * 14, "text-anchor": mk.anchor || "middle", "font-size": 11.5, "font-weight": 700, fill: col(mk.color || "ink") }, root);
        lt.textContent = mk.label + " " + fmtN(mk.value, g);
        var hit = svg("rect", { x: x - 8, y: m.t - 10, width: 16, height: H - m.b - m.t + 10, fill: "transparent", class: "hit", tabindex: 0, "aria-label": mk.label + " " + fmtN(mk.value, g) + ". " + (mk.note || "") }, root);
        hookPoint(hit, tip, "<b>" + esc(mk.label) + '</b><span class="tv">' + esc(fmtN(mk.value, g)) + "</span>" + esc(mk.note || ""));
      });
      g.rows.forEach(function (r, i) {
        var y = m.t + i * rowH + rowH / 2;
        svg("line", { x1: m.l, x2: W - m.r, y1: y, y2: y, stroke: "#e3e6eb", "stroke-width": 1 }, root);
        var lab = svg("text", { x: 0, y: y + 4, "font-size": narrow ? 12 : 13, "font-weight": 700, fill: COLORS.ink }, root);
        lab.textContent = r.label;
        if (r.sub && !narrow) {
          var sb = svg("tspan", { "font-weight": 500, fill: COLORS.soft }, lab); sb.textContent = "  " + r.sub;
        }
        var x = X(r.value);
        svg("circle", { cx: x, cy: y, r: 7, fill: col(r.color || "blue"), stroke: "#fff", "stroke-width": 2 }, root);
        var clash = (g.markers || []).some(function (mk) { var mx = X(mk.value); return mx > x + 4 && mx < x + 56; });
        var vt = svg("text", { x: clash ? x - 12 : x + 12, y: y + 4, "text-anchor": clash ? "end" : "start", "font-size": 12, "font-weight": 700, fill: COLORS.ink, stroke: "#fff", "stroke-width": 4, "paint-order": "stroke" }, root);
        vt.textContent = fmtN(r.value, g);
        var hit = svg("circle", { cx: x, cy: y, r: 15, fill: "transparent", class: "hit", tabindex: 0, "aria-label": r.label + " " + fmtN(r.value, g) + ". " + (r.note || "") }, root);
        hookPoint(hit, tip, "<b>" + esc(r.label) + '</b><span class="tv">' + esc(fmtN(r.value, g)) + "</span>" + esc(r.note || ""));
      });
    }
    draw();
    window.addEventListener("resize", debounce(draw, 120));
  }

  // ── Mini column chart (home page teasers) ────────────────────

  function mini(node, t) {
    var vals = t.values || [];
    if (!vals.length) return;
    var W = Math.max(260, node.clientWidth || 600), H = 150, m = { t: 22, b: 22 };
    var max = t.max || Math.max.apply(null, vals.map(function (v) { return v.value; })) * 1.05;
    var gap = 6, bw = (W - gap * (vals.length - 1)) / vals.length;
    if (t.title) html("p", "mini-title", node, esc(t.title));
    if (t.subtitle) html("p", "mini-sub", node, esc(t.subtitle));
    var holder = html("div", "", node);
    var root = svg("svg", { viewBox: "0 0 " + W + " " + H, width: W, height: H, role: "img", "aria-label": t.title || "" }, holder);
    vals.forEach(function (v, i) {
      var h = (v.value / max) * (H - m.t - m.b), x = i * (bw + gap), y = H - m.b - h;
      var r = Math.min(4, bw / 4);
      svg("path", { d: "M" + x + "," + (H - m.b) + "V" + (y + r) + "Q" + x + "," + y + " " + (x + r) + "," + y + "H" + (x + bw - r) + "Q" + (x + bw) + "," + y + " " + (x + bw) + "," + (y + r) + "V" + (H - m.b) + "Z", fill: v.highlight ? COLORS.blue : COLORS.grey }, root);
      var tv = svg("text", { x: x + bw / 2, y: y - 6, "text-anchor": "middle", "font-size": 12, "font-weight": 700, fill: COLORS.ink }, root);
      tv.textContent = v.display || ((t.prefix || "") + v.value + (t.suffix || ""));
      var tl = svg("text", { x: x + bw / 2, y: H - 6, "text-anchor": "middle", "font-size": 11, fill: COLORS.soft }, root);
      tl.textContent = v.label;
    });
    svg("line", { x1: 0, x2: W, y1: H - m.b, y2: H - m.b, stroke: COLORS.ink }, root);
  }
  window.FOGraphics = { mini: mini };

  var TYPES = { timeline: timeline, stub: stub, leverage: leverage, dotplot: dotplot };

  function init() {
    Array.prototype.forEach.call(document.querySelectorAll("figure[data-graphic]"), function (fig) {
      var node = fig.querySelector('script[type="application/json"]');
      if (!node) return;
      var g;
      try { g = JSON.parse(node.textContent); } catch (e) { return; }
      var fn = TYPES[g && g.type];
      if (!fn) return;
      try { fn(fig, g); } catch (e) { if (window.console) console.error("Graphic failed:", g.title, e); }
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
