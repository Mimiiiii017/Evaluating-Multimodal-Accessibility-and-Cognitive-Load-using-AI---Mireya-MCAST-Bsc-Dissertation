// panel.js — client-side logic for the Accessibility Assistant sidebar webview

(function () {
  const vscode = acquireVsCodeApi();
  const output       = document.getElementById("output");
  const spinner      = document.getElementById("spinner");
  const status       = document.getElementById("statusText");
  const modelName    = document.getElementById("modelName");
  const btnAnalyse   = document.getElementById("btnAnalyse");
  const btnTlx       = document.getElementById("btnTlx");
  const btnClear     = document.getElementById("btnClear");

  let currentStreamBlock = null;
  let currentRawText = "";

  // Delegated click handler — line-badge buttons inside fix/issue cards
  output.addEventListener("click", function (e) {
    const btn = e.target.closest("[data-reveal-line]");
    if (!btn) { return; }
    const line = parseInt(btn.dataset.revealLine, 10);
    if (line > 0) {
      vscode.postMessage({ type: "revealLine", line });
    }
  });

  // Button / dropdown handlers
  btnAnalyse.addEventListener("click", () => {
    vscode.postMessage({ type: "analyseFile" });
  });
  btnTlx.addEventListener("click", () => {
    vscode.postMessage({ type: "tlxFile" });
  });
  btnClear.addEventListener("click", () => {
    output.innerHTML = "";
    currentStreamBlock = null;
    currentRawText = "";
    vscode.postMessage({ type: "clear" });
  });

  // Helpers
  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  // Parse comma/space-separated line numbers and render each as a clickable badge
  function renderLineLinks(lineStr) {
    const nums = String(lineStr).split(/[,\s]+/).map(s => parseInt(s, 10)).filter(n => n > 0);
    if (nums.length === 0) { return escapeHtml(lineStr); }
    return nums.map(n =>
      `<button class="line-badge" data-reveal-line="${n}" title="Go to line ${n} in editor">L${n}</button>`
    ).join(" ");
  }

  function appendLog(text) {
    currentStreamBlock = null;
    currentRawText = "";
    const el = document.createElement("div");
    el.className = "log-line";
    el.innerHTML = escapeHtml(text);
    output.appendChild(el);
    output.scrollTop = output.scrollHeight;
  }

  let _liveRenderTimer = null;

  function appendStream(text) {
    if (!currentStreamBlock) {
      currentStreamBlock = document.createElement("div");
      currentStreamBlock.className = "stream-block streaming";
      output.appendChild(currentStreamBlock);
      currentRawText = "";
    }
    currentRawText += text;

    // Live structured render (debounced 40 ms so we don't thrash the DOM)
    const isIssues = /Issue\s+\d+\s*:/i.test(currentRawText);
    const isTlx    = /^\s*Dimension\s*:/im.test(currentRawText);
    if (isIssues || isTlx) {
      if (!_liveRenderTimer) {
        _liveRenderTimer = setTimeout(() => {
          _liveRenderTimer = null;
          if (currentStreamBlock && currentRawText) {
            renderStructuredOutput(currentStreamBlock, currentRawText, true);
            output.scrollTop = output.scrollHeight;
          }
        }, 40);
      }
    } else {
      currentStreamBlock.textContent = currentRawText;
      output.scrollTop = output.scrollHeight;
    }
  }

  function finaliseStream() {
    if (!currentStreamBlock || !currentRawText.trim()) {
      currentStreamBlock = null;
      currentRawText = "";
      return;
    }
    const raw = currentRawText;
    currentStreamBlock.classList.remove("streaming");
    renderStructuredOutput(currentStreamBlock, raw);
    currentStreamBlock = null;
    currentRawText = "";
    output.scrollTop = output.scrollHeight;
  }

  // ── Structured output renderers ───────────────────────────────────────────

  function renderStructuredOutput(container, rawText, isLive) {
    const trimmed = rawText.trim();
    if (/Issue\s+\d+\s*:/i.test(trimmed)) {
      container.innerHTML = renderIssuesHtml(trimmed, isLive);
      container.className = "stream-block issues-output" + (isLive ? " live" : "");
    } else if (/^\s*Dimension\s*:/im.test(trimmed)) {
      container.innerHTML = renderTlxHtml(trimmed);
      container.className = "stream-block tlx-output" + (isLive ? " live" : "");
    } else {
      container.className = "stream-block plain-output";
    }
  }

  function severityClass(sev) {
    const s = (sev || "").toUpperCase();
    return s === "HIGH" ? "sev-high" : s === "MEDIUM" ? "sev-medium" : "sev-low";
  }

  function renderIssuesHtml(text) {
    // Split on "Issue N:" boundaries
    const parts = text.split(/(?=\bIssue\s+\d+\s*:)/i).filter(p => p.trim());
    let html = `<h3 class="section-title">Issues</h3>`;

    parts.forEach(function (part) {
      const titleLine = part.match(/^Issue\s+(\d+)\s*:\s*(.+?)(?:\n|$)/i);
      if (!titleLine) { return; }

      const num   = titleLine[1];
      const title = titleLine[2].trim();
      const isPossible = false;

      const severityM  = part.match(/Severity\s*:\s*(.+?)(?:\n|$)/i);
      const lineM      = part.match(/Line\s*:\s*(.+?)(?:\n|$)/i);
      const problemM   = part.match(/Problem\s*:\s*([\s\S]+?)(?=\n[ \t]*Fix\s*:|$)/i);
      const fixM       = part.match(/Fix\s*:\s*([\s\S]+?)(?=\n[ \t]*Issue\s+\d+\s*:|$)/i);

      const sev     = severityM  ? severityM[1].trim()  : "";
      const line    = lineM      ? lineM[1].trim()       : "";
      const problem = problemM   ? problemM[1].trim()    : "";
      const fix     = fixM       ? fixM[1].trim()        : "";

      html += `
      <div class="issue-card">
        <div class="issue-card-header">
          <span class="issue-number">Issue ${escapeHtml(num)}</span>
          ${sev ? `<span class="severity-badge ${severityClass(sev)}">${escapeHtml(sev)}</span>` : ""}
        </div>
        <div class="issue-title">${escapeHtml(title)}</div>
        ${line ? `
        <div class="issue-field">
          <div class="field-label">Line</div>
          <div class="field-value">${renderLineLinks(line)}</div>
        </div>` : ""}
        ${problem ? `
        <div class="issue-field">
          <div class="field-label">Problem</div>
          <div class="field-value">${escapeHtml(problem)}</div>
        </div>` : ""}
        ${fix ? `
        <div class="issue-field">
          <div class="field-label">Fix</div>
          <div class="field-value fix-code">${renderFixLines(fix)}</div>
        </div>` : ""}
      </div>`;
    });

    return html;
  }

  // Render the fix block — lines like "Line 47: <code>" get a line-number badge
  function renderFixLines(fix) {
    // Unescape literal \n sequences that some models output as escape sequences
    const normalised = fix.replace(/\\n/g, "\n").replace(/\\t/g, "  ");
    return normalised.split("\n").map(function (line) {
      const m = line.match(/^(\s*)[Ll]ine\s+(\d[\d,\s]*)\s*:\s*(.*)/);
      if (m) {
        const indent = m[1] ? "&nbsp;&nbsp;" : "";
        const rawNums = m[2].trim();
        const code    = escapeHtml(m[3]);
        const badges  = rawNums.split(/[,\s]+/)
          .map(s => parseInt(s, 10)).filter(n => n > 0)
          .map(n => `<button class="line-badge" data-reveal-line="${n}" title="Go to line ${n} in editor">L${n}</button>`)
          .join(" ");
        return `${indent}${badges} <span class="fix-line-code">${code}</span>`;
      }
      return escapeHtml(line);
    }).join("\n");
  }

  function renderTlxHtml(text) {
    const parts = text.split(/(?=\bDimension\s*:)/i).filter(p => p.trim());
    let html = `<h3 class="section-title">TLX Work\u00adload Analysis</h3>`;

    parts.forEach(function (part) {
      const dimM       = part.match(/^Dimension\s*:\s*(.+?)(?:\n|$)/i);
      if (!dimM) { return; }

      const dim        = dimM[1].trim();
      const ratingM    = part.match(/Rating\s*:\s*(\d+)/i);
      const confM      = part.match(/Confidence\s*:\s*(\d+)/i);
      const reasoningM = part.match(/Reasoning\s*:\s*([\s\S]+?)(?=\n[ \t]*Dimension\s*:|$)/i);

      const rating    = ratingM    ? parseInt(ratingM[1], 10)    : 0;
      const conf      = confM      ? parseInt(confM[1], 10)      : null;
      const reasoning = reasoningM ? reasoningM[1].trim()        : "";

      const rCls = rating >= 70 ? "tlx-high" : rating >= 40 ? "tlx-medium" : "tlx-low";

      html += `
      <div class="tlx-card">
        <div class="tlx-card-header">
          <span class="tlx-dimension">${escapeHtml(dim)}</span>
          <span class="tlx-rating ${rCls}">${rating}<span class="tlx-max">/100</span></span>
        </div>
        ${conf !== null ? `<div class="tlx-confidence">Confidence: ${conf}%</div>` : ""}
        ${reasoning ? `<div class="tlx-reasoning">${escapeHtml(reasoning)}</div>` : ""}
      </div>`;
    });

    return html;
  }

  // ─────────────────────────────────────────────────────────────────────────

  function setButtons(enabled) {
    btnAnalyse.disabled = !enabled;
    btnTlx.disabled = !enabled;
  }

  // ── Analysis status cycling ───────────────────────────────────────────────
  // Phases auto-advance on a timer; backend log messages can snap to specific ones.
  const STATUS_PHASES = [
    { after: 0,   text: "Reading the code…" },
    { after: 30,  text: "Mapping elements…" },
    { after: 60,  text: "Running accessibility sweeps…" },
    { after: 120, text: "Cross-checking violations…" },
    { after: 180, text: "Verifying findings…" },
    { after: 240, text: "Almost there…" },
    { after: 360, text: "Still working — large file…" },
  ];

  let _statusStart = 0;
  let _statusPhaseTimer = null;

  function startAnalysisStatus() {
    _statusStart = Date.now();
    status.textContent = STATUS_PHASES[0].text;
    _scheduleNextPhase();
  }

  function _scheduleNextPhase() {
    clearTimeout(_statusPhaseTimer);
    const elapsed = (Date.now() - _statusStart) / 1000;
    const next = STATUS_PHASES.find(p => p.after > elapsed);
    if (!next) { return; }
    _statusPhaseTimer = setTimeout(() => {
      status.textContent = next.text;
      _scheduleNextPhase();
    }, (next.after - elapsed) * 1000);
  }

  function snapAnalysisStatus(logText) {
    if (!spinner.classList.contains("active")) { return; }
    const t = logText || "";
    if (/RAG:.*chunk|chunk.*in.*ms/i.test(t))        { status.textContent = "Retrieving knowledge base…"; }
    else if (/RAG:.*cache hit/i.test(t))              { status.textContent = "Knowledge base ready…"; }
    else if (/Stage 1.*running/i.test(t))             { status.textContent = "Models reading the code…"; }
    else if (/chunk\s+(\d+)\s*\/\s*(\d+)/i.test(t)) {
      const m = t.match(/chunk\s+(\d+)\s*\/\s*(\d+)/i);
      if (m) { status.textContent = `Analysing chunk ${m[1]} of ${m[2]}…`; }
    }
    else if (/first token/i.test(t))                  { status.textContent = "Writing the answer…"; }
    else if (/Verified.*both agree/i.test(t))         { status.textContent = "Cross-checking findings…"; }
    else if (/No consensus/i.test(t))                 { status.textContent = "Done — no issues found"; }
  }

  function stopAnalysisStatus() {
    clearTimeout(_statusPhaseTimer);
    status.textContent = "Idle";
  }

  // Message handler
  window.addEventListener("message", (event) => {
    const msg = event.data;
    switch (msg.type) {
      case "log":
        appendLog(msg.text);
        snapAnalysisStatus(msg.text);
        break;

      case "stream":
        appendStream(msg.text);
        break;

      case "streamStart":
        currentStreamBlock = null;
        currentRawText = "";
        break;

      case "streamEnd":
        if (_liveRenderTimer) { clearTimeout(_liveRenderTimer); _liveRenderTimer = null; }
        finaliseStream();
        break;

      case "analysisStart":
        setButtons(false);
        spinner.classList.add("active");
        startAnalysisStatus();
        if (output.children.length > 0) {
          const sep = document.createElement("div");
          sep.className = "separator";
          output.appendChild(sep);
        }
        break;

      case "analysisEnd":
        setButtons(true);
        spinner.classList.remove("active");
        stopAnalysisStatus();
        break;

      case "tlxStart":
        setButtons(false);
        spinner.classList.add("active");
        status.textContent = "Analyzing workload…";
        if (output.children.length > 0) {
          const sep = document.createElement("div");
          sep.className = "separator";
          output.appendChild(sep);
        }
        break;

      case "tlxEnd":
        setButtons(true);
        spinner.classList.remove("active");
        status.textContent = "Idle";
        break;

      case "tlxSummary": {
        const el = document.createElement("div");
        el.className = "tlx-summary-card";
        const rCls = (r) => r >= 70 ? "tlx-high" : r >= 40 ? "tlx-medium" : "tlx-low";
        const rows = (msg.dimensions || []).map(function (d) {
          return `<tr>
            <td class="tlx-tbl-name">${escapeHtml(d.name)}</td>
            <td class="tlx-tbl-rating ${rCls(d.rating)}">${d.rating}<span class="tlx-max">/100</span></td>
            <td class="tlx-tbl-conf">${d.confidence}%</td>
          </tr>`;
        }).join("");
        el.innerHTML = `
          <div class="summary-header">
            <span class="summary-label">NASA-TLX Assessment</span>
          </div>
          <table class="tlx-table">
            <thead>
              <tr>
                <th>Dimension</th>
                <th>Rating</th>
                <th>Confidence</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
          <div class="tlx-overall-line">Overall Cognitive Load: ${escapeHtml(String(msg.overall))}<span class="tlx-max">/100</span></div>
        `;
        output.appendChild(el);
        output.scrollTop = output.scrollHeight;
        break;
      }

      case "summary": {
        const el = document.createElement("div");
        el.className = "summary-card";
        const sevBadge = (s) => {
          const cls = (s || "").toUpperCase() === "HIGH"   ? "sev-high"
                    : (s || "").toUpperCase() === "MEDIUM" ? "sev-medium"
                    : "sev-low";
          return `<span class="severity-badge ${cls}">${escapeHtml((s || "LOW").toUpperCase())}</span>`;
        };
        const rows = (msg.issues || []).map(function (issue, i) {
          return `<div class="summary-row">
            <span class="summary-idx">${i + 1}</span>
            ${sevBadge(issue.severity)}
            <span class="summary-title">${escapeHtml(issue.title)}</span>
          </div>`;
        }).join("");
        el.innerHTML = `
          <div class="summary-header">
            <span class="summary-label">Summary</span>
            <span class="summary-count-badge">AI issues</span>
          </div>
          ${rows}
          ${msg.totalCount > 0 ? `<div class="summary-total">Total diagnostics &mdash; see Problems tab</div>` : ""}
        `;
        output.appendChild(el);
        output.scrollTop = output.scrollHeight;
        break;
      }
    }
  });
})();
