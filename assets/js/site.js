/* Fairness Opinion: renders the front page, archive, article extras and scorecard from deal data. */
(function () {
  "use strict";

  var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  // ── Small helpers ───────────────────────────────────────────

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function blank(v) {
    return v === null || v === undefined || (typeof v === "string" && v.trim() === "") ||
      (Array.isArray(v) && v.length === 0);
  }

  function list(v) {
    if (blank(v)) return [];
    if (Array.isArray(v)) return v.filter(function (x) { return !blank(x); }).map(String);
    return String(v).split(/\s*;\s*|\s*,\s*(?=[A-Z])/).filter(Boolean);
  }

  function parseDate(s) {
    if (blank(s)) return null;
    var m = String(s).match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!m) return null;
    return new Date(+m[1], +m[2] - 1, +m[3]);
  }

  function fmtDate(s) {
    var d = parseDate(s);
    if (!d) return blank(s) ? "" : String(s);
    return d.getDate() + " " + MONTHS[d.getMonth()] + " " + d.getFullYear();
  }

  function isNum(v) { return typeof v === "number" && isFinite(v); }

  function trimNum(n) {
    // Show the number as entered, without float noise (e.g. 35.300000001 -> 35.3)
    var r = Math.round(n * 1000) / 1000;
    return String(r);
  }

  // $ in billions -> "$35.3B" (or "$795M" under $1B)
  function bn(v) {
    if (blank(v)) return "";
    if (!isNum(v)) return String(v);
    if (Math.abs(v) < 1) return "$" + trimNum(v * 1000) + "M";
    return "$" + trimNum(v) + "B";
  }
  // $ in millions -> "$300M" (or "$1.5B" from $1,000M)
  function mn(v) {
    if (blank(v)) return "";
    if (!isNum(v)) return String(v);
    if (Math.abs(v) >= 1000) return "$" + trimNum(v / 1000) + "B";
    return "$" + trimNum(v) + "M";
  }
  function mult(v) { return blank(v) ? "" : isNum(v) ? trimNum(v) + "x" : String(v); }
  function pct(v) { return blank(v) ? "" : isNum(v) ? trimNum(v) + "%" : String(v); }
  function spct(v) { return blank(v) ? "" : isNum(v) ? (v > 0 ? "+" : "") + trimNum(v) + "%" : String(v); }
  function yrs(v) { return blank(v) ? "" : isNum(v) ? trimNum(v) + (v === 1 ? " year" : " years") : String(v); }
  function txt(v) { return blank(v) ? "" : String(v); }

  function typeKey(t) {
    var s = String(t || "").toLowerCase();
    if (s.indexOf("bank") > -1) return "bank";
    if (s.indexOf("restruct") > -1 || s.indexOf("lme") > -1 || s.indexOf("chapter") > -1) return "rx";
    if (s.indexOf("sponsor") > -1 || s.indexOf("lbo") > -1 || s.indexOf("take-private") > -1) return "lbo";
    return "strategic";
  }

  function verdictKey(v) {
    var s = String(v || "").toLowerCase();
    if (s.indexOf("good") > -1) return "good";
    if (s.indexOf("over") > -1 || s.indexOf("bad") > -1) return "bad";
    return "early";
  }

  function verdictTag(v) {
    if (blank(v)) return "";
    return '<span class="tag ' + verdictKey(v) + '">' + esc(v) + "</span>";
  }

  function dealTitle(d) {
    if (!blank(d.acquirer) && !blank(d.target)) return d.acquirer + " → " + d.target;
    return d.title || d.target || d.acquirer || "Untitled deal";
  }

  function storyTitle(d) { return blank(d.headline) ? dealTitle(d) : d.headline; }

  function keyStats(d) {
    var k = typeKey(d.deal_type), out = [];
    function add(v, l) { if (!blank(v) && out.length < 4) out.push({ v: v, l: l }); }
    if (k === "bank") {
      add(bn(!blank(d.equity_value) ? d.equity_value : d.enterprise_value), "Deal value");
      add(mult(d.p_tbv), "Price / tangible book");
      add(spct(d.premium), "Premium to market");
      add(spct(d.eps_accretion), "EPS accretion");
    } else if (k === "rx") {
      add(bn(d.debt_before), "Debt before");
      add(bn(d.debt_equitized), "Debt equitized");
      add(mn(d.dip), "DIP financing");
      add(bn(d.plan_ev), "Plan value");
    } else {
      add(bn(d.enterprise_value), "Enterprise value");
      add(bn(d.equity_value), "Equity value");
      add(spct(d.premium), "Premium to undisturbed");
      add(mn(d.synergies), "Promised synergies");
    }
    return out;
  }

  function headline(d) {
    var k = typeKey(d.deal_type);
    if (k === "bank") {
      if (!blank(d.p_tbv)) return { label: "Price / TBV", value: mult(d.p_tbv) };
      if (!blank(d.equity_value)) return { label: "Deal value", value: bn(d.equity_value) };
    }
    if (k === "rx") {
      if (!blank(d.debt_equitized)) return { label: "Debt equitized", value: bn(d.debt_equitized) };
      if (!blank(d.debt_before)) return { label: "Debt before", value: bn(d.debt_before) };
      if (!blank(d.plan_ev)) return { label: "Plan value", value: bn(d.plan_ev) };
    }
    if (!blank(d.enterprise_value)) return { label: "Deal value", value: bn(d.enterprise_value) };
    if (!blank(d.equity_value)) return { label: "Equity value", value: bn(d.equity_value) };
    return { label: "Deal value", value: "Undisclosed" };
  }

  function sortKey(d) { return d.written || d.announced || ""; }

  function loadDeals(url) {
    return fetch(url, { cache: "no-cache" }).then(function (r) {
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.json();
    }).then(function (rows) {
      return (rows || []).slice().sort(function (a, b) {
        return sortKey(b).localeCompare(sortKey(a));
      });
    });
  }

  // ── Home page: stats, filters, cards ───────────────────────

  function initHome() {
    var root = document.getElementById("archive");
    if (!root) return;
    var grid = document.getElementById("card-grid");
    var empty = document.getElementById("empty-state");
    var countEl = document.getElementById("archive-count");
    var f = {
      search: document.getElementById("f-search"),
      sector: document.getElementById("f-sector"),
      type: document.getElementById("f-type"),
      advisor: document.getElementById("f-advisor"),
      verdict: document.getElementById("f-verdict")
    };

    loadDeals(root.getAttribute("data-src")).then(function (deals) {
      // Stats
      document.getElementById("stat-count").textContent = deals.length;
      var sectors = uniq(deals.map(function (d) { return d.sector; }));
      document.getElementById("stat-sectors").textContent = sectors.length;
      document.getElementById("stat-latest").textContent = deals.length ? fmtDate(deals[0].written || deals[0].announced) : "Coming soon";
      renderFront(deals);

      // Filter options
      fill(f.sector, sectors);
      fill(f.type, uniq(deals.map(function (d) { return d.deal_type; })));
      fill(f.advisor, uniq([].concat.apply([], deals.map(advisors))));
      fill(f.verdict, uniq(deals.map(function (d) { return d.verdict; })));

      // Read filters from the URL (e.g. /?advisor=Evercore) so filtered views can be shared
      var q = new URLSearchParams(window.location.search);
      if (q.get("q")) f.search.value = q.get("q");
      setSelect(f.sector, q.get("sector"));
      setSelect(f.type, q.get("type"));
      setSelect(f.advisor, q.get("advisor"));
      setSelect(f.verdict, q.get("verdict"));

      function render() {
        var term = f.search.value.trim().toLowerCase();
        var shown = deals.filter(function (d) {
          if (f.sector.value && d.sector !== f.sector.value) return false;
          if (f.type.value && d.deal_type !== f.type.value) return false;
          if (f.verdict.value && d.verdict !== f.verdict.value) return false;
          if (f.advisor.value && advisors(d).indexOf(f.advisor.value) === -1) return false;
          if (term) {
            var hay = [d.acquirer, d.target, d.title, d.headline, d.subtitle, d.sector, d.deal_type, d.sponsor]
              .concat(advisors(d)).join(" ").toLowerCase();
            if (hay.indexOf(term) === -1) return false;
          }
          return true;
        });

        grid.innerHTML = shown.map(card).join("");
        countEl.textContent = shown.length === deals.length
          ? deals.length + (deals.length === 1 ? " analysis" : " analyses")
          : shown.length + " of " + deals.length + " analyses";

        if (!deals.length) {
          empty.hidden = false;
          empty.innerHTML = "<p>The first analysis is being written. New deals are published every week.</p>";
        } else if (!shown.length) {
          empty.hidden = false;
          empty.innerHTML = '<p>No deals match those filters.</p><button type="button" id="clear-filters">Clear filters</button>';
          document.getElementById("clear-filters").addEventListener("click", function () {
            f.search.value = ""; f.sector.value = ""; f.type.value = ""; f.advisor.value = ""; f.verdict.value = "";
            render(); syncUrl();
          });
        } else {
          empty.hidden = true;
          empty.innerHTML = "";
        }
      }

      function syncUrl() {
        var p = new URLSearchParams();
        if (f.search.value.trim()) p.set("q", f.search.value.trim());
        if (f.sector.value) p.set("sector", f.sector.value);
        if (f.type.value) p.set("type", f.type.value);
        if (f.advisor.value) p.set("advisor", f.advisor.value);
        if (f.verdict.value) p.set("verdict", f.verdict.value);
        var s = p.toString();
        history.replaceState(null, "", window.location.pathname + (s ? "?" + s : ""));
      }

      ["sector", "type", "advisor", "verdict"].forEach(function (k) {
        f[k].addEventListener("change", function () { render(); syncUrl(); });
      });
      f.search.addEventListener("input", function () { render(); syncUrl(); });
      render();
    }).catch(function () {
      empty.hidden = false;
      empty.innerHTML = "<p>The archive could not be loaded. Please refresh the page.</p>";
    });
  }

  function advisors(d) {
    return list(d.acquirer_advisors).concat(list(d.target_advisors), list(d.company_advisors), list(d.creditor_advisors));
  }

  function uniq(arr) {
    var seen = {}, out = [];
    arr.forEach(function (x) {
      if (blank(x)) return;
      var k = String(x);
      if (!seen[k]) { seen[k] = 1; out.push(k); }
    });
    return out.sort(function (a, b) { return a.localeCompare(b); });
  }

  function fill(select, values) {
    values.forEach(function (v) {
      var o = document.createElement("option");
      o.value = v; o.textContent = v;
      select.appendChild(o);
    });
  }

  function setSelect(select, value) {
    if (!value) return;
    for (var i = 0; i < select.options.length; i++) {
      if (select.options[i].value.toLowerCase() === value.toLowerCase()) { select.selectedIndex = i; return; }
    }
  }

  function card(d) {
    var h = headline(d);
    var meta = [d.kicker || d.sector, blank(d.headline) ? d.deal_type : dealTitle(d)].filter(function (x) { return !blank(x); }).map(esc).join('<span class="sep">|</span>');
    return '<article class="card">' +
      '<div class="card-top"><span class="caps num">' + esc(fmtDate(d.written || d.announced)) + "</span>" + verdictTag(d.verdict) + "</div>" +
      (meta ? '<div class="card-meta">' + meta + "</div>" : "") +
      '<h2 class="card-title"><a href="' + esc(d.url) + '">' + esc(storyTitle(d)) + "</a></h2>" +
      (blank(d.subtitle) ? "" : '<p class="card-sub">' + esc(d.subtitle) + "</p>") +
      '<div class="card-foot"><div><span class="metric-label">' + esc(h.label) + '</span><span class="metric-value num">' + esc(h.value) + "</span></div>" +
      '<span class="card-read">Read →</span></div>' +
      "</article>";
  }

  // Front page: ticker strip, lead story, side list
  function renderFront(deals) {
    var ticker = document.getElementById("ticker");
    if (ticker) {
      ticker.innerHTML = '<span class="tick tick-label">In the journal</span>' + deals.map(function (d) {
        var h = headline(d);
        var prem = blank(d.premium) ? "" : '<span class="tick-up">▲ ' + esc(pct(d.premium)) + "</span>";
        return '<a class="tick" href="' + esc(d.url) + '"><span class="tick-name">' + esc(d.short || dealTitle(d)) + '</span><span class="tick-val num">' + esc(h.value) + "</span>" + prem + "</a>";
      }).join("");
    }
    var lead = document.getElementById("lead");
    if (!lead || !deals.length) return;
    var d = deals.filter(function (x) { return x.featured; })[0] || deals[0];
    var stats = keyStats(d);
    lead.innerHTML =
      '<a class="lead-kicker" href="' + esc(d.url) + '">' + esc(d.kicker || d.sector || "Analysis") + "</a>" +
      '<h2 class="lead-title"><a href="' + esc(d.url) + '">' + esc(storyTitle(d)) + "</a></h2>" +
      (blank(d.subtitle) ? "" : '<p class="lead-dek">' + esc(d.subtitle) + "</p>") +
      '<div class="lead-by">By <b>' + esc(document.body.getAttribute("data-author") || "") + "</b> · " + esc(fmtDate(d.written)) + " " + verdictTag(d.verdict) + "</div>" +
      (d.teaser ? '<a class="lead-graphic mini" id="lead-mini" href="' + esc(d.url) + '" style="display:block;color:inherit;text-decoration:none"></a>' : "") +
      (stats.length ? '<div class="lead-stats">' + stats.map(function (x) { return '<div><span class="v num">' + esc(x.v) + '</span><span class="l">' + esc(x.l) + "</span></div>"; }).join("") + "</div>" : "");
    if (d.teaser && window.FOGraphics) window.FOGraphics.mini(document.getElementById("lead-mini"), d.teaser);
    var more = document.getElementById("more");
    if (more) {
      var rest = deals.filter(function (x) { return x !== d; }).slice(0, 4);
      more.innerHTML = rest.length ? rest.map(function (x) {
        return '<article class="story"><a class="story-kicker" href="' + esc(x.url) + '">' + esc(x.kicker || x.sector || "Analysis") + "</a>" +
          '<h3 class="story-title"><a href="' + esc(x.url) + '">' + esc(storyTitle(x)) + "</a></h3>" +
          (blank(x.subtitle) ? "" : '<p class="story-dek">' + esc(x.subtitle) + "</p>") +
          '<div class="story-by">' + esc(fmtDate(x.written)) + " " + verdictTag(x.verdict) + "</div></article>";
      }).join("") : '<p class="story-dek" style="padding-top:12px">More analysis is on the way.</p>';
    }
  }

  // ── Deal page: header tags, figures, review, updates, sources ──

  function initDeal() {
    var node = document.getElementById("deal-data");
    if (!node) return;
    var d;
    try { d = JSON.parse(node.textContent); } catch (e) { return; }
    var k = typeKey(d.deal_type);

    // Deal line under the dek: who bought whom, when, status
    var line = [];
    if (!blank(d.acquirer) && !blank(d.target)) line.push("<b>" + esc(d.acquirer) + "</b> → <b>" + esc(d.target) + "</b>");
    if (fmtDate(d.announced)) line.push("Announced " + esc(fmtDate(d.announced)));
    if (!blank(d.status)) line.push(esc(d.status));
    var h = headline(d);
    if (h.value !== "Undisclosed") line.push(esc(h.label) + " " + esc(h.value));
    document.getElementById("deal-meta").innerHTML = line.join('<span class="sep">|</span>');

    var verdictEl = document.getElementById("deal-verdict");
    if (verdictEl && !blank(d.verdict)) verdictEl.innerHTML = '<span class="dot">·</span><span>Verdict</span>' + verdictTag(d.verdict);

    var body = document.getElementById("deal-body");
    var extras = document.getElementById("deal-extras");

    // Read time: words plus a little for each graphic
    var words = (body.textContent || "").trim().split(/\s+/).length;
    var graphics = body.querySelectorAll(".chart, .graphic").length + document.querySelectorAll(".art-hero .graphic").length;
    var rt = document.getElementById("read-time");
    if (rt) rt.textContent = Math.max(2, Math.round(words / 230 + graphics * 0.25)) + " min read";

    // Copy-link button
    var copy = document.getElementById("share-copy");
    if (copy) copy.addEventListener("click", function () {
      var url = window.location.href.split("#")[0].split("?")[0];
      var done = function () { copy.textContent = "Link copied"; setTimeout(function () { copy.textContent = "Copy link"; }, 1800); };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(done, function () { window.prompt("Copy this link:", url); });
      else window.prompt("Copy this link:", url);
    });

    // Reading progress bar
    var bar = document.getElementById("progress-bar");
    if (bar) {
      var onScroll = function () {
        var r = body.getBoundingClientRect();
        var total = r.height - window.innerHeight * 0.6;
        var p = total > 0 ? Math.min(1, Math.max(0, -r.top / total)) : 0;
        bar.style.width = (p * 100) + "%";
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
    }

    // Deal terms
    var rows = [];
    function row(label, value) { if (!blank(value)) rows.push("<div><dt>" + esc(label) + '</dt><dd class="num">' + esc(value) + "</dd></div>"); }
    row("Announced", fmtDate(d.announced));
    row("Status", txt(d.status));
    row("Deal type", txt(d.deal_type));
    row("Sector", txt(d.sector));
    if (k === "rx") {
      row("Process", txt(d.transaction_type));
      row("Debt before", bn(d.debt_before));
      row("Debt equitized", bn(d.debt_equitized));
      row("DIP financing", mn(d.dip));
      row("New money", mn(d.new_money));
      row("Plan value", bn(d.plan_ev));
    } else {
      if (k === "bank") row("Deal value", bn(!blank(d.equity_value) ? d.equity_value : d.enterprise_value));
      else { row("Enterprise value", bn(d.enterprise_value)); row("Equity value", bn(d.equity_value)); }
      row("Consideration", txt(d.consideration));
      if (k === "bank") {
        row("Price / TBV", mult(d.p_tbv));
        row("Price / LTM EPS", mult(d.p_eps_ltm));
        row("Price / fwd EPS", mult(d.p_eps_fwd));
        row("Core deposit premium", pct(d.core_deposit_premium));
        row("Premium to market", spct(d.premium));
        row("TBV dilution", pct(d.tbv_dilution));
        row("TBV earnback", yrs(d.tbv_earnback));
        row("EPS accretion", spct(d.eps_accretion));
        row("Pro forma CET1", pct(d.pro_forma_cet1));
        row("Cost synergies", mn(d.synergies));
      } else {
        row("EV / EBITDA", mult(d.ev_ebitda));
        row("EV / Revenue", mult(d.ev_revenue));
        row("Premium to undisturbed", spct(d.premium));
        if (k === "lbo") { row("Sponsor", txt(d.sponsor)); row("Total leverage", mult(d.leverage)); row("Equity contribution", pct(d.equity_contribution)); }
        row("Synergies", mn(d.synergies));
        row("Synergies / target costs", pct(d.synergies_pct));
        row("EPS accretion", spct(d.eps_accretion));
        row("Pro forma leverage", mult(d.pro_forma_leverage));
      }
    }

    // Advisers, each name links to the archive filtered by that bank
    var groups = [["Acquirer", list(d.acquirer_advisors)], ["Target", list(d.target_advisors)], ["Company", list(d.company_advisors)], ["Creditors", list(d.creditor_advisors)], ["Also advising", list(d.other_advisors)]]
      .filter(function (g) { return g[1].length; });
    var home = (document.querySelector(".masthead-link") || {}).getAttribute ? document.querySelector(".masthead-link").getAttribute("href") : "/";
    var adv = groups.map(function (g) {
      var role = g[0] === "Acquirer" && !blank(d.acquirer) ? d.acquirer : g[0] === "Target" && !blank(d.target) ? d.target : g[0];
      return '<div class="adviser"><span class="adviser-role">' + esc(role) + "</span><ul>" + g[1].map(function (n) {
        return g[0] === "Also advising" ? "<li>" + esc(n) + "</li>" : '<li><a href="' + esc(home) + "?advisor=" + encodeURIComponent(n) + '#archive" title="More deals with ' + esc(n) + '">' + esc(n) + "</a></li>";
      }).join("") + "</ul></div>";
    }).join("");

    // Recoveries table (restructurings): placed under the Capital Structure / Recoveries section
    var headings = body.querySelectorAll("h2");
    var rec = Array.isArray(d.recoveries) ? d.recoveries.filter(function (r) { return r && typeof r === "object"; }) : [];
    if (rec.length) {
      var t = '<div class="table-wrap"><table class="rec-table"><thead><tr><th>Creditor class</th><th class="r">Claim</th><th>Treatment</th><th class="r">Recovery</th></tr></thead><tbody>' +
        rec.map(function (r) {
          return "<tr><td>" + esc(txt(r["class"])) + '</td><td class="r num">' + esc(mn(r.claim)) + "</td><td>" + esc(txt(r.treatment)) + '</td><td class="r num">' + esc(pct(r.recovery)) + "</td></tr>";
        }).join("") + "</tbody></table></div>";
      insertHtml(body, findSectionEnd(headings, /recover|capital structure/i), t);
    }

    // Verdict review: placed at the end of the My Take section
    if (!blank(d.verdict_today)) {
      var changed = verdictKey(d.verdict_today) !== verdictKey(d.verdict) || String(d.verdict_today) !== String(d.verdict);
      var box = '<div class="review-box"><span class="caps">How this verdict has aged</span>' +
        '<div class="review-line">' + (blank(d.verdict) ? "" : "Original " + verdictTag(d.verdict) + " → ") + "Today " + verdictTag(d.verdict_today) +
        (blank(d.reviewed_on) ? "" : "<span>Reviewed " + esc(fmtDate(d.reviewed_on)) + "</span>") +
        (changed ? '<span class="changed">Verdict revised</span>' : "") + "</div>" +
        (blank(d.review_note) ? "" : "<p>" + esc(d.review_note) + "</p>") + "</div>";
      insertHtml(body, findSectionEnd(headings, /my take/i), box);
    }

    var updates = (d.updates || []).filter(function (u) { return u && !blank(u.note); })
      .sort(function (a, b) { return String(b.date || "").localeCompare(String(a.date || "")); });
    var srcs = Array.isArray(d.sources) ? d.sources.filter(function (x) { return !blank(x); }) : (blank(d.sources) ? [] : [d.sources]);

    var out = "";
    if (rows.length) out += section("Deal terms", '<dl class="terms">' + rows.join("") + "</dl>");
    if (adv) out += section("Who advised", '<div class="advisers">' + adv + "</div>");
    if (updates.length) {
      out += section("Updates", '<ul class="updates">' + updates.map(function (u) {
        return '<li><time class="num">' + esc(fmtDate(u.date)) + "</time><span>" + esc(u.note) + "</span></li>";
      }).join("") + "</ul>");
    }
    if (srcs.length) {
      out += '<section class="x-section"><details class="sources-box"><summary>Sources (' + srcs.length + ")</summary>" +
        '<ol class="sources">' + srcs.map(function (s) {
          var m = String(s).match(/^(.*?)\s*(https?:\/\/\S+)\s*$/);
          if (m) return '<li><span>' + (m[1] ? esc(m[1].replace(/[\s:–-]+$/, "")) + " · " : "") + '<a href="' + esc(m[2]) + '" target="_blank" rel="noopener">link ↗</a></span></li>';
          return "<li><span>" + esc(s) + "</span></li>";
        }).join("") + "</ol></details></section>";
    }
    extras.innerHTML = out;
  }

  function section(title, inner) {
    return '<section class="x-section"><h2>' + esc(title) + "</h2>" + inner + "</section>";
  }

  // Returns the node before which content should be inserted to land at the end of a matching section
  function findSectionEnd(headings, re) {
    for (var i = 0; i < headings.length; i++) {
      if (re.test(headings[i].textContent)) return { next: headings[i + 1] || null, found: true };
    }
    return { next: null, found: false };
  }

  function insertHtml(body, anchor, html) {
    var wrap = document.createElement("div");
    wrap.innerHTML = html;
    var nodes = Array.prototype.slice.call(wrap.childNodes);
    nodes.forEach(function (node) {
      if (anchor.next) body.insertBefore(node, anchor.next);
      else body.appendChild(node);
    });
  }

  // ── Scorecard ───────────────────────────────────────────────

  function initScorecard() {
    var root = document.getElementById("scorecard");
    if (!root) return;
    loadDeals(root.getAttribute("data-src")).then(function (deals) {
      var reviewed = deals.filter(function (d) { return !blank(d.verdict_today); });
      var table = document.getElementById("score-table");
      var empty = document.getElementById("score-empty");
      var summary = document.getElementById("score-summary");
      if (!reviewed.length) {
        empty.hidden = false;
        summary.textContent = deals.length ? deals.length + (deals.length === 1 ? " verdict" : " verdicts") + " published, none reviewed yet." : "";
        return;
      }
      var revised = reviewed.filter(function (d) { return String(d.verdict_today) !== String(d.verdict); }).length;
      summary.textContent = reviewed.length + " of " + deals.length + " verdicts reviewed · " + revised + " revised";
      reviewed.sort(function (a, b) { return String(b.reviewed_on || "").localeCompare(String(a.reviewed_on || "")); });
      document.getElementById("score-body").innerHTML = reviewed.map(function (d) {
        var changed = String(d.verdict_today) !== String(d.verdict);
        return "<tr>" +
          '<td><a href="' + esc(d.url) + '">' + esc(dealTitle(d)) + "</a>" + (blank(d.review_note) ? "" : '<span class="note">' + esc(d.review_note) + "</span>") + "</td>" +
          '<td class="num">' + esc(fmtDate(d.written)) + "</td>" +
          "<td>" + verdictTag(d.verdict) + "</td>" +
          "<td>" + verdictTag(d.verdict_today) + (changed ? '<span class="changed">Revised</span>' : "") + "</td>" +
          '<td class="num">' + esc(fmtDate(d.reviewed_on)) + "</td>" +
          "</tr>";
      }).join("");
      table.hidden = false;
    }).catch(function () {
      document.getElementById("score-summary").textContent = "The scorecard could not be loaded. Please refresh the page.";
    });
  }

  function initToday() {
    var el = document.getElementById("today");
    if (!el) return;
    var d = new Date();
    var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    el.textContent = days[d.getDay()] + ", " + months[d.getMonth()] + " " + d.getDate() + ", " + d.getFullYear();
  }

  document.addEventListener("DOMContentLoaded", function () {
    initToday();
    initHome();
    initDeal();
    initScorecard();
  });
})();
