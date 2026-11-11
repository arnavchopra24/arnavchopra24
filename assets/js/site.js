/* Deal Journal: renders the archive, deal figures and scorecard from deal data. */
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
            var hay = [d.acquirer, d.target, d.title, d.subtitle, d.sector, d.deal_type, d.sponsor]
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
    var meta = [d.sector, d.deal_type].filter(function (x) { return !blank(x); }).map(esc).join('<span class="sep">/</span>');
    return '<article class="card">' +
      '<div class="card-top"><span class="caps num">' + esc(fmtDate(d.announced)) + "</span>" + verdictTag(d.verdict) + "</div>" +
      (meta ? '<div class="caps card-meta">' + meta + "</div>" : "") +
      '<h2 class="card-title"><a href="' + esc(d.url) + '">' + esc(dealTitle(d)) + "</a></h2>" +
      (blank(d.subtitle) ? "" : '<p class="card-sub">' + esc(d.subtitle) + "</p>") +
      '<div class="card-foot"><div><span class="caps metric-label">' + esc(h.label) + '</span><span class="metric-value num">' + esc(h.value) + "</span></div>" +
      '<span class="card-read">Read analysis →</span></div>' +
      "</article>";
  }

  // ── Deal page: header tags, figures, review, updates, sources ──

  function initDeal() {
    var node = document.getElementById("deal-data");
    if (!node) return;
    var d;
    try { d = JSON.parse(node.textContent); } catch (e) { return; }
    var k = typeKey(d.deal_type);

    // Meta line
    var meta = [fmtDate(d.announced) ? "Announced " + fmtDate(d.announced) : "", d.sector, d.deal_type, d.status]
      .filter(function (x) { return !blank(x); }).map(esc).join('<span class="sep">/</span>');
    document.getElementById("deal-meta").innerHTML = meta;

    // Tags
    var h = headline(d);
    var tags = verdictTag(d.verdict);
    if (h.value !== "Undisclosed") tags += '<span class="headline num">' + esc(h.label) + " " + esc(h.value) + "</span>";
    if (!blank(d.written)) tags += '<span class="written">Written ' + esc(fmtDate(d.written)) + "</span>";
    document.getElementById("deal-tags").innerHTML = tags;

    // The numbers
    var rows = [];
    function row(label, value) { if (!blank(value)) rows.push('<div class="row"><dt>' + esc(label) + '</dt><dd class="num">' + esc(value) + "</dd></div>"); }
    function group(label) { rows.push('<span class="group">' + esc(label) + "</span>"); }
    function stack(label, items) {
      if (!items.length) return;
      rows.push('<div class="stack"><dt>' + esc(label) + "</dt><dd>" + items.map(function (x) { return "<span>" + esc(x) + "</span>"; }).join("") + "</dd></div>");
    }

    row("Announced", fmtDate(d.announced));
    row("Status", txt(d.status));
    row("Deal type", txt(d.deal_type));
    row("Sector", txt(d.sector));

    if (k === "rx") {
      row("Process", txt(d.transaction_type));
      var rxStart = rows.length;
      row("Debt before", bn(d.debt_before));
      row("Debt equitized", bn(d.debt_equitized));
      row("DIP financing", mn(d.dip));
      row("New money", mn(d.new_money));
      row("Plan value", bn(d.plan_ev));
      if (rows.length > rxStart) rows.splice(rxStart, 0, '<span class="group">Capital structure</span>');
    } else {
      var valStart = rows.length;
      if (k === "bank") {
        row("Deal value", bn(!blank(d.equity_value) ? d.equity_value : d.enterprise_value));
      } else {
        row("Enterprise value", bn(d.enterprise_value));
        row("Equity value", bn(d.equity_value));
      }
      row("Consideration", txt(d.consideration));
      if (k === "bank") {
        row("Price / TBV", mult(d.p_tbv));
        row("Price / LTM EPS", mult(d.p_eps_ltm));
        row("Price / fwd EPS", mult(d.p_eps_fwd));
        row("Core deposit premium", pct(d.core_deposit_premium));
        row("Premium to unaffected", spct(d.premium));
      } else {
        row("EV / EBITDA", mult(d.ev_ebitda));
        row("EV / Revenue", mult(d.ev_revenue));
        row("Premium to unaffected", spct(d.premium));
      }
      if (rows.length > valStart) rows.splice(valStart, 0, '<span class="group">Valuation</span>');

      var impStart = rows.length;
      if (k === "bank") {
        row("TBV dilution", pct(d.tbv_dilution));
        row("TBV earnback", yrs(d.tbv_earnback));
        row("EPS accretion", spct(d.eps_accretion));
        row("Pro forma CET1", pct(d.pro_forma_cet1));
        row("Cost synergies", mn(d.synergies));
      } else if (k === "lbo") {
        row("Sponsor", txt(d.sponsor));
        row("Total leverage", mult(d.leverage));
        row("Equity contribution", pct(d.equity_contribution));
        row("Synergies", mn(d.synergies));
      } else {
        row("Synergies", mn(d.synergies));
        row("Synergies / target costs", pct(d.synergies_pct));
        row("EPS accretion", spct(d.eps_accretion));
        row("Pro forma net leverage", mult(d.pro_forma_leverage));
      }
      if (rows.length > impStart) rows.splice(impStart, 0, '<span class="group">' + (k === "lbo" ? "Financing" : "Deal impact") + "</span>");
    }

    var advA = list(d.acquirer_advisors), advT = list(d.target_advisors);
    var advC = list(d.company_advisors), advK = list(d.creditor_advisors);
    if (advA.length || advT.length || advC.length || advK.length) group("Advisors");
    stack("Acquirer advisors", advA);
    stack("Target advisors", advT);
    stack("Company advisors", advC);
    stack("Creditor advisors", advK);

    document.getElementById("numbers-list").innerHTML = rows.join("");

    var body = document.getElementById("deal-body");
    var extras = document.getElementById("deal-extras");
    var headings = body.querySelectorAll("h2");

    // Recoveries table (restructurings): placed under the Capital Structure / Recoveries section
    var rec = Array.isArray(d.recoveries) ? d.recoveries.filter(function (r) { return r && typeof r === "object"; }) : [];
    if (rec.length) {
      var t = '<div class="table-wrap"><table class="rec-table"><thead><tr><th>Creditor class</th><th class="r">Claim</th><th>Treatment</th><th class="r">Recovery</th></tr></thead><tbody>' +
        rec.map(function (r) {
          return "<tr><td>" + esc(txt(r["class"])) + '</td><td class="r num">' + esc(mn(r.claim)) + "</td><td>" + esc(txt(r.treatment)) + '</td><td class="r num">' + esc(pct(r.recovery)) + "</td></tr>";
        }).join("") + "</tbody></table></div>";
      var anchor = findSectionEnd(headings, /recover|capital structure/i);
      insertHtml(body, anchor, t);
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

    // Updates and sources become numbered sections at the end
    var updates = (d.updates || []).filter(function (u) { return u && !blank(u.note); })
      .sort(function (a, b) { return String(b.date || "").localeCompare(String(a.date || "")); });
    var srcs = Array.isArray(d.sources) ? d.sources.filter(function (x) { return !blank(x); }) : (blank(d.sources) ? [] : [d.sources]);
    var html = "";
    if (srcs.length) {
      html += section("Sources", '<ol class="sources">' + srcs.map(function (s) {
        var m = String(s).match(/^(.*?)\s*(https?:\/\/\S+)\s*$/);
        if (m) return '<li><span>' + (m[1] ? esc(m[1].replace(/[\s:–-]+$/, "")) + " · " : "") + '<a href="' + esc(m[2]) + '" target="_blank" rel="noopener">link ↗</a></span></li>';
        return "<li><span>" + esc(s) + "</span></li>";
      }).join("") + "</ol>");
    }
    if (updates.length) {
      html += section("Updates", '<ul class="updates">' + updates.map(function (u) {
        return '<li><time class="num">' + esc(fmtDate(u.date)) + "</time><span>" + esc(u.note) + "</span></li>";
      }).join("") + "</ul>");
    }
    extras.innerHTML = html;
  }

  function section(title, inner) {
    return '<section class="deal-section"><h2>' + esc(title) + "</h2>" + inner + "</section>";
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

  document.addEventListener("DOMContentLoaded", function () {
    initHome();
    initDeal();
    initScorecard();
  });
})();
