/* Pharmacy chain dashboard: reads window.PHARMA_DASH (exported Gold aggregates, simulated data). */
(function () {
  "use strict";
  var D = window.PHARMA_DASH;
  if (!D) return;
  var AR = document.documentElement.lang === "ar";
  var GREEN = "#176b52", GREEN_SOFT = "#9cc9b6", LOSS = "#b4532a", INK = "#10231e";

  var T = AR ? {
    all: "الكل", allYears: "كل السنوات (من 2020 إلى 2025)", allRegions: "كل المناطق",
    revenue: "المبيعات", margin: "هامش الربح", receipts: "عدد الفواتير", basket: "متوسط الفاتورة",
    vsPrev: "مقارنة بـ", growth: "نمو من 2020 إلى 2025", ofRevenue: "من المبيعات",
    perReceipt: "ريال للفاتورة", scope: "النطاق", network: "الشبكة كلها",
    m: "M", k: "K", sar: "ريال", month: "الشهر",
    marginPct: "هامش", shareOf: "من مبيعات النطاق",
    lossPerSar: "خسارة لكل 1 ريال مبيعات", loss: "خسارة تحت التكلفة",
    noScore: "مفيش تقييم للسنة دي", peerAvg: "متوسط الفئة",
    showAll: "اعرض الكل", showLess: "اعرض أقل",
    flagged: "نسبة تكلفة مشبوهة", notFlagged: "عادي",
    branchesFound: function (n, y, peer) { return n + " فرع في أضعف 10% داخل فئتهم في " + y + (peer ? "" : ""); },
    yearNote2020: "تقييم 2020 ناقص لـ 307 فروع، فالقائمة بتستخدم الفروع اللي ليها تقييم بس.",
    allYearsBranches: "لما تختار \"كل السنوات\" القائمة بتعرض 2025.",
    prodCount: function (n) { return n + " منتج"; },
    verdict: { "No signal": "لا توجد إشارة", "No signal beyond chance": "لا إشارة أكثر من الصدفة", "Data artifact": "أثر من البيانات", "Not measurable": "غير قابل للقياس" },
    group: { "Integrity signal": "إشارات نزاهة", "Data gap": "فجوات بيانات", "Data fingerprint": "بصمات بيانات مُصطنعة" },
    regionNames: { "Al Bahah": "الباحة", "Al Jawf": "الجوف", "Asir": "عسير", "Eastern Province": "الشرقية", "Hail": "حائل", "Jazan": "جازان", "Madinah": "المدينة المنورة", "Makkah": "مكة المكرمة", "Najran": "نجران", "Northern Borders": "الحدود الشمالية", "Qassim": "القصيم", "Riyadh": "الرياض", "Tabuk": "تبوك" },
    catNames: { "Cardiovascular": "القلب والأوعية", "Pain Relief": "المسكنات", "Diabetes": "السكري", "Allergy": "الحساسية", "Gastrointestinal": "الجهاز الهضمي", "Respiratory": "الجهاز التنفسي", "Ophthalmology": "العيون", "Anticoagulants": "مضادات التجلط", "Antibiotics": "المضادات الحيوية" }
  } : {
    all: "All", allYears: "All years (2020–2025)", allRegions: "All regions",
    revenue: "Revenue", margin: "Margin", receipts: "Receipts", basket: "Average receipt",
    vsPrev: "vs", growth: "growth 2020 → 2025", ofRevenue: "of revenue",
    perReceipt: "SAR per receipt", scope: "Scope", network: "Whole network",
    m: "M", k: "K", sar: "SAR", month: "Month",
    marginPct: "Margin", shareOf: "of scope revenue",
    lossPerSar: "loss per 1 SAR sold", loss: "Loss below cost",
    noScore: "no score this year", peerAvg: "Peer avg",
    showAll: "Show all", showLess: "Show less",
    flagged: "Suspicious cost ratio", notFlagged: "Normal",
    branchesFound: function (n, y) { return n + " branches in the weakest 10% of their peer group in " + y; },
    yearNote2020: "2020 scores are missing for 307 branches; the list uses branches with a score only.",
    allYearsBranches: "With “All years” selected, the list shows 2025.",
    prodCount: function (n) { return n + " products"; },
    verdict: {}, group: {}, regionNames: {}, catNames: {}
  };
  var rn = function (r) { return T.regionNames[r] || r; };
  var cn = function (c) { return T.catNames[c] || c; };

  var state = { year: "all", region: "all" };
  var $ = function (id) { return document.getElementById(id); };
  var fmtInt = function (v) { return Math.round(v).toLocaleString("en-US"); };
  var fmtM = function (v, d) { return (v / 1e6).toLocaleString("en-US", { minimumFractionDigits: d == null ? 1 : d, maximumFractionDigits: d == null ? 1 : d }) + T.m; };
  var fmtPct = function (v, d) { return (v * 100).toFixed(d == null ? 1 : d) + "%"; };
  var signPct = function (v) { return (v >= 0 ? "▲ +" : "▼ −") + Math.abs(v * 100).toFixed(1) + "%"; };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  var NS = "http://www.w3.org/2000/svg";
  function el(tag, attrs, parent) { var e = document.createElementNS(NS, tag); for (var k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; }

  /* ---------- tooltip ---------- */
  var tip = document.createElement("div"); tip.className = "dash-tip"; tip.setAttribute("role", "status"); document.body.appendChild(tip);
  function showTip(html, x, y) {
    tip.innerHTML = html; tip.style.opacity = 1;
    var w = tip.offsetWidth, h = tip.offsetHeight, px = x + 14, py = y - h - 12;
    if (px + w > window.innerWidth - 8) px = x - w - 14;
    if (py < 8) py = y + 16;
    tip.style.left = px + "px"; tip.style.top = py + "px";
  }
  function hideTip() { tip.style.opacity = 0; }

  /* ---------- data helpers ---------- */
  function series() { return state.region === "all" ? D.network : D.regions[state.region]; }
  function idxForYear(y) { var out = []; D.months.forEach(function (m, i) { if (y === "all" || m.slice(0, 4) === String(y)) out.push(i); }); return out; }
  function sumIdx(arr, idx) { var s = 0; idx.forEach(function (i) { s += arr[i]; }); return s; }
  function totals(y, s) { s = s || series(); var idx = idxForYear(y); return { rev: sumIdx(s.rev, idx), mar: sumIdx(s.mar, idx), tx: sumIdx(s.tx, idx) }; }

  /* ---------- filters ---------- */
  function initFilters() {
    var ys = $("f-year"), rs = $("f-region");
    ys.innerHTML = '<option value="all">' + T.allYears + "</option>" + D.years.slice().reverse().map(function (y) { return '<option value="' + y + '">' + y + "</option>"; }).join("");
    rs.innerHTML = '<option value="all">' + T.allRegions + "</option>" + Object.keys(D.regions).sort(function (a, b) { return rn(a).localeCompare(rn(b), AR ? "ar" : "en"); }).map(function (r) { return '<option value="' + esc(r) + '">' + esc(rn(r)) + "</option>"; }).join("");
    ys.addEventListener("change", function () { state.year = ys.value === "all" ? "all" : +ys.value; renderAll(); });
    rs.addEventListener("change", function () { state.region = rs.value; renderAll(); });
    $("f-reset").addEventListener("click", function () { state.year = "all"; state.region = "all"; ys.value = "all"; rs.value = "all"; renderAll(); });
  }
  function syncFilters() { $("f-year").value = String(state.year); $("f-region").value = state.region; }

  /* ---------- KPIs ---------- */
  function renderKpis() {
    var t = totals(state.year), sub = {};
    if (state.year === "all") {
      var a = totals(2020), b = totals(2025);
      sub.rev = signPct(b.rev / a.rev - 1) + " " + T.growth;
      sub.tx = signPct(b.tx / a.tx - 1) + " " + T.growth;
    } else if (state.year > D.years[0]) {
      var p = totals(state.year - 1);
      sub.rev = signPct(t.rev / p.rev - 1) + " " + T.vsPrev + " " + (state.year - 1);
      sub.tx = signPct(t.tx / p.tx - 1) + " " + T.vsPrev + " " + (state.year - 1);
    } else { sub.rev = sub.tx = "—"; }
    $("k-rev").textContent = fmtM(t.rev); $("k-rev-s").textContent = sub.rev;
    $("k-mar").textContent = fmtPct(t.mar / t.rev); $("k-mar-s").textContent = fmtM(t.mar) + " " + T.sar;
    $("k-tx").textContent = fmtInt(t.tx); $("k-tx-s").textContent = sub.tx;
    $("k-bas").textContent = fmtInt(t.rev / t.tx); $("k-bas-s").textContent = T.perReceipt;
    $("dash-scope").textContent = T.scope + ": " + (state.region === "all" ? T.network : rn(state.region)) + " · " + (state.year === "all" ? (AR ? "من 2020 إلى 2025" : "2020–2025") : state.year);
  }

  /* ---------- line chart: monthly revenue ---------- */
  function niceMax(v) { var p = Math.pow(10, Math.floor(Math.log10(v))), n = v / p; return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * p; }
  function renderLine() {
    var host = $("c-trend"); host.innerHTML = "";
    var W = Math.max(320, host.clientWidth), H = W < 560 ? 240 : 290, m = { t: 12, r: 14, b: 28, l: 46 };
    var s = series(), vals = s.rev, n = vals.length, max = niceMax(Math.max.apply(null, vals) * 1.05);
    var x = function (i) { return m.l + (W - m.l - m.r) * i / (n - 1); };
    var y = function (v) { return H - m.b - (H - m.t - m.b) * v / max; };
    var svg = el("svg", { viewBox: "0 0 " + W + " " + H, role: "img", "aria-label": $("t-trend").textContent }, host);
    var g = el("g", { "class": "grid" }, svg);
    for (var k = 0; k <= 4; k++) { var v = max * k / 4; el("line", { x1: m.l, x2: W - m.r, y1: y(v), y2: y(v) }, g); var tx = el("text", { x: m.l - 6, y: y(v) + 4, "text-anchor": "end" }, svg); tx.textContent = (v / 1e6).toFixed(0) + T.m; }
    if (state.year !== "all") { var idx = idxForYear(state.year); el("rect", { x: x(idx[0]) - 3, y: m.t, width: x(idx[idx.length - 1]) - x(idx[0]) + 6, height: H - m.t - m.b, fill: "#dff3e9", opacity: .8 }, svg); }
    D.years.forEach(function (yy) { var i = D.months.indexOf(yy + "-01"); var t = el("text", { x: x(i), y: H - 8, "text-anchor": i === 0 ? "start" : "middle" }, svg); t.textContent = yy; });
    var d = vals.map(function (v, i) { return (i ? "L" : "M") + x(i).toFixed(1) + "," + y(v).toFixed(1); }).join("");
    el("path", { d: d, fill: "none", stroke: GREEN, "stroke-width": 2, "stroke-linejoin": "round" }, svg);
    var cross = el("line", { y1: m.t, y2: H - m.b, stroke: "#9aa7a1", "stroke-width": 1, opacity: 0 }, svg);
    var dot = el("circle", { r: 4.5, fill: GREEN, stroke: "#fffdf7", "stroke-width": 2, opacity: 0 }, svg);
    var hit = el("rect", { x: m.l, y: m.t, width: W - m.l - m.r, height: H - m.t - m.b, fill: "transparent" }, svg);
    function move(ev) {
      var r = svg.getBoundingClientRect(), px = (ev.clientX - r.left) * W / r.width;
      var i = Math.max(0, Math.min(n - 1, Math.round((px - m.l) / (W - m.l - m.r) * (n - 1))));
      cross.setAttribute("x1", x(i)); cross.setAttribute("x2", x(i)); cross.setAttribute("opacity", 1);
      dot.setAttribute("cx", x(i)); dot.setAttribute("cy", y(vals[i])); dot.setAttribute("opacity", 1);
      showTip("<div>" + D.months[i] + "</div>" + T.revenue + ": <b>" + fmtM(vals[i], 2) + " " + T.sar + "</b><br>" + T.marginPct + ": <b>" + fmtPct(s.mar[i] / vals[i]) + "</b><br>" + T.receipts + ": <b>" + fmtInt(s.tx[i]) + "</b>", ev.clientX, ev.clientY);
    }
    hit.addEventListener("pointermove", move);
    hit.addEventListener("pointerleave", function () { cross.setAttribute("opacity", 0); dot.setAttribute("opacity", 0); hideTip(); });
  }

  /* ---------- horizontal bars ---------- */
  function hbars(host, rows, opt) {
    host.innerHTML = "";
    var W = Math.max(300, host.clientWidth), rowH = 28, labW = Math.min(W * 0.38, opt.labW || 150), valW = 64;
    var H = rows.length * rowH + 4, max = Math.max.apply(null, rows.map(function (r) { return r.v; }));
    var svg = el("svg", { viewBox: "0 0 " + W + " " + H, role: "img", "aria-label": opt.label }, host);
    var bw = W - labW - valW - 8;
    rows.forEach(function (r, i) {
      var y0 = i * rowH + 3, w = Math.max(2, bw * r.v / max);
      var gx = AR ? W - labW : labW;
      var g = el("g", { "class": "bar" + (opt.click ? "" : " static"), tabindex: opt.click ? 0 : -1 }, svg);
      if (opt.click) { g.setAttribute("role", "button"); g.setAttribute("aria-label", r.name + ": " + r.valText); }
      el("rect", { x: 0, y: y0, width: W, height: rowH - 2, fill: "transparent" }, g);
      var t = el("text", { x: AR ? W - 2 : labW - 8, y: y0 + rowH / 2 + 3, "text-anchor": AR ? "start" : "end", "font-weight": r.sel ? 700 : 400 }, g); t.textContent = r.name;
      if (AR) t.setAttribute("x", W - 4), t.setAttribute("text-anchor", "end");
      var rx = AR ? gx - 8 - w : labW;
      el("rect", { "class": "mark", x: rx, y: y0 + 5, width: w, height: rowH - 12, rx: 3, fill: r.color }, g);
      var vt = el("text", { x: AR ? rx - 6 : rx + w + 6, y: y0 + rowH / 2 + 3, "text-anchor": AR ? "end" : "start", fill: INK }, g); vt.textContent = r.valText;
      g.addEventListener("pointermove", function (ev) { showTip(r.tip, ev.clientX, ev.clientY); });
      g.addEventListener("pointerleave", hideTip);
      if (opt.click) {
        g.addEventListener("click", function () { hideTip(); opt.click(r); });
        g.addEventListener("keydown", function (ev) { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); opt.click(r); } });
      }
    });
  }
  function renderRegions() {
    var tot = 0, rows = Object.keys(D.regions).map(function (r) { var t = totals(state.year, D.regions[r]); tot += t.rev; return { key: r, name: rn(r), v: t.rev, mar: t.mar }; });
    rows.sort(function (a, b) { return b.v - a.v; });
    rows.forEach(function (r) {
      r.sel = state.region === r.key;
      r.color = state.region === "all" || r.sel ? GREEN : GREEN_SOFT;
      r.valText = fmtM(r.v);
      r.tip = "<b>" + esc(r.name) + "</b><br>" + T.revenue + ": <b>" + fmtM(r.v, 2) + " " + T.sar + "</b><br>" + fmtPct(r.v / tot) + " " + T.ofRevenue + "<br>" + T.marginPct + ": <b>" + fmtPct(r.mar / r.v) + "</b>";
    });
    hbars($("c-regions"), rows, { label: $("t-regions").textContent, labW: 150, click: function (r) { state.region = state.region === r.key ? "all" : r.key; syncFilters(); renderAll(); } });
  }
  function renderCategories() {
    var rows = D.categories.map(function (c) { return { name: cn(c[0]), v: c[2], color: LOSS, valText: fmtM(c[2]), tip: "<b>" + esc(cn(c[0])) + "</b><br>" + T.loss + ": <b>" + fmtM(c[2], 2) + " " + T.sar + "</b><br>" + T.revenue + ": <b>" + fmtM(c[1], 2) + " " + T.sar + "</b><br><b>" + (c[2] / c[1]).toFixed(2) + " " + T.sar + "</b> " + T.lossPerSar }; });
    rows.sort(function (a, b) { return b.v - a.v; });
    hbars($("c-cats"), rows, { label: $("t-cats").textContent, labW: 150 });
  }

  /* ---------- branches to review ---------- */
  var branchesOpen = false;
  function renderBranches() {
    var y = state.year === "all" ? 2025 : state.year, yi = D.years.indexOf(y);
    var groups = {};
    D.branches.forEach(function (b) { var v = b[6 + yi]; if (v && v[3] != null) (groups[b[5]] = groups[b[5]] || []).push({ b: b, v: v }); });
    var flagged = [];
    Object.keys(groups).forEach(function (pg) {
      var arr = groups[pg].sort(function (a, c) { return a.v[3] - c.v[3]; }), cut = Math.floor(arr.length * 0.10);
      var avg = arr.reduce(function (s, a) { return s + a.v[3]; }, 0) / arr.length;
      arr.slice(0, cut).forEach(function (a) { a.peerAvg = avg; flagged.push(a); });
    });
    if (state.region !== "all") flagged = flagged.filter(function (a) { return a.b[2] === state.region; });
    flagged.sort(function (a, c) { return (a.v[3] - a.peerAvg) - (c.v[3] - c.peerAvg); });
    var notes = [];
    if (state.year === "all") notes.push(T.allYearsBranches);
    if (y === 2020) notes.push(T.yearNote2020);
    $("b-count").textContent = T.branchesFound(flagged.length, y) + (state.region === "all" ? "" : " · " + rn(state.region));
    $("b-note").textContent = notes.join(" ");
    var shown = branchesOpen ? flagged : flagged.slice(0, 10);
    $("b-body").innerHTML = shown.map(function (a) {
      var b = a.b, v = a.v;
      return "<tr><td><strong>" + esc(b[1]) + "</strong><span class='muted'>" + esc(b[0]) + " · " + esc(b[3]) + ", " + esc(rn(b[2])) + "</span></td><td>" + esc(b[4]) + "<span class='muted'>" + esc(b[5]) + "</span></td><td class='num'>" + fmtInt(v[0]) + "</td><td class='num'>" + fmtPct(v[1] / v[0]) + "</td><td class='num'><strong>" + v[3].toFixed(2) + "</strong></td><td class='num'>" + a.peerAvg.toFixed(2) + "</td></tr>";
    }).join("");
    var btn = $("b-more"); btn.hidden = flagged.length <= 10; btn.textContent = branchesOpen ? T.showLess : T.showAll + " (" + flagged.length + ")";
  }

  /* ---------- products ---------- */
  var prodOpen = false;
  function renderProducts() {
    var q = $("p-search").value.trim().toLowerCase(), cat = $("p-cat").value;
    var rows = D.products.filter(function (p) { return (!q || (p[0] + " " + p[1]).toLowerCase().indexOf(q) >= 0) && (cat === "all" || p[2] === cat); });
    rows.sort(function (a, b) { return b[5] - a[5]; });
    var loss = rows.reduce(function (s, p) { return s + p[5]; }, 0);
    $("p-count").textContent = T.prodCount(rows.length) + " · " + fmtM(loss) + " " + T.sar;
    var shown = prodOpen ? rows : rows.slice(0, 12);
    $("p-body").innerHTML = shown.map(function (p) {
      return "<tr><td><strong>" + esc(p[1]) + "</strong><span class='muted'>" + esc(p[0]) + "</span></td><td>" + esc(cn(p[2])) + "</td><td class='num'>" + fmtInt(p[4]) + "</td><td class='num'><strong>" + fmtInt(p[5]) + "</strong></td><td class='num'>" + (p[5] / p[4]).toFixed(2) + "</td><td>" + (p[3] ? "<span class='chip chip-flag'>" + T.flagged + "</span>" : "<span class='chip chip-ok'>" + T.notFlagged + "</span>") + "</td></tr>";
    }).join("");
    var btn = $("p-more"); btn.hidden = rows.length <= 12; btn.textContent = prodOpen ? T.showLess : T.showAll + " (" + rows.length + ")";
  }
  function initProducts() {
    var cats = D.categories.map(function (c) { return c[0]; }).sort();
    $("p-cat").innerHTML = '<option value="all">' + T.all + "</option>" + cats.map(function (c) { return '<option value="' + esc(c) + '">' + esc(cn(c)) + "</option>"; }).join("");
    $("p-search").addEventListener("input", renderProducts);
    $("p-cat").addEventListener("change", renderProducts);
    $("p-more").addEventListener("click", function () { prodOpen = !prodOpen; renderProducts(); });
    $("b-more").addEventListener("click", function () { branchesOpen = !branchesOpen; renderBranches(); });
  }

  /* ---------- checks ---------- */
  function renderChecks() {
    var by = {}; D.checks.forEach(function (c) { (by[c[1]] = by[c[1]] || []).push(c); });
    var chip = function (v) { var cls = /No signal/.test(v) ? "chip-ok" : v === "Not measurable" ? "chip-gap" : "chip-art"; return "<span class='chip " + cls + "'>" + esc(T.verdict[v] || v) + "</span>"; };
    $("ch-body").innerHTML = D.checks.map(function (c) {
      return "<tr><td class='num' dir='ltr'>" + esc(c[0]) + "</td><td><strong>" + esc(c[2]) + "</strong><span class='muted'>" + esc(T.group[c[1]] || c[1]) + "</span></td><td>" + esc(c[4]) + "</td><td>" + chip(c[5]) + "</td></tr>";
    }).join("");
    ["Integrity signal", "Data gap", "Data fingerprint"].forEach(function (g, i) { $("ch-n" + i).textContent = (by[g] || []).length; });
  }

  function renderAll() { renderKpis(); renderLine(); renderRegions(); renderBranches(); }
  initFilters(); initProducts(); renderAll(); renderCategories(); renderProducts(); renderChecks();
  var rt; window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(function () { renderLine(); renderRegions(); renderCategories(); }, 150); });
})();
