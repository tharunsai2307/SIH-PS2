/**
 * ISense Content Script (Manifest V3)
 * Injects a floating overlay on top of any procurement portal (GeM / CPPP)
 * when text is selected or analysis is triggered.
 */

(() => {
  if (window.__isense_injected) return;
  window.__isense_injected = true;

  let overlayContainer = null;
  let actionButton = null;

  // 1. Floating "Analyze with ISense" button on text selection
  document.addEventListener("mouseup", (e) => {
    // If click inside overlay, ignore
    if (overlayContainer && overlayContainer.contains(e.target)) return;

    const selection = window.getSelection();
    const text = selection ? selection.toString().trim() : "";

    if (text.length >= 10) {
      showFloatingActionButton(e.pageX, e.pageY, text);
    } else {
      hideFloatingActionButton();
    }
  });

  function showFloatingActionButton(x, y, text) {
    if (!actionButton) {
      actionButton = document.createElement("button");
      actionButton.id = "isense-floating-action-btn";
      actionButton.innerHTML = `
        <span class="isense-icon">🔍</span>
        <span>Analyze with ISense</span>
      `;
      actionButton.addEventListener("click", () => {
        hideFloatingActionButton();
        triggerAnalysis(text);
      });
      document.body.appendChild(actionButton);
    }
    actionButton.style.left = `${Math.min(x + 10, window.innerWidth - 180)}px`;
    actionButton.style.top = `${Math.max(y - 45, 10)}px`;
    actionButton.style.display = "flex";
  }

  function hideFloatingActionButton() {
    if (actionButton) {
      actionButton.style.display = "none";
    }
  }

  // 2. Trigger analysis via ISense API
  async function triggerAnalysis(text) {
    createOrShowOverlay();
    renderLoading(text);

    try {
      const resp = await fetch("http://localhost:8000/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text })
      });

      if (!resp.ok) {
        throw new Error(`ISense server returned status ${resp.status}`);
      }

      const data = await resp.json();
      renderResults(text, data);
    } catch (err) {
      renderError(err.message || "Cannot connect to ISense engine on http://localhost:8000");
    }
  }

  // 3. Listen for messages from background script
  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.action === "ISENSE_ANALYSIS_START") {
      createOrShowOverlay();
      renderLoading(msg.query);
    } else if (msg.action === "ISENSE_ANALYSIS_SUCCESS") {
      createOrShowOverlay();
      renderResults(msg.query, msg.data);
    } else if (msg.action === "ISENSE_ANALYSIS_ERROR") {
      createOrShowOverlay();
      renderError(msg.error);
    }
  });

  // 4. Modal Overlay Container
  function createOrShowOverlay() {
    if (!overlayContainer) {
      overlayContainer = document.createElement("div");
      overlayContainer.id = "isense-overlay-modal";
      document.body.appendChild(overlayContainer);
    }
    overlayContainer.style.display = "block";
  }

  function closeOverlay() {
    if (overlayContainer) {
      overlayContainer.style.display = "none";
    }
  }

  function renderLoading(query) {
    overlayContainer.innerHTML = `
      <div class="isense-card">
        <div class="isense-header">
          <div class="isense-brand">
            <span class="isense-badge">BIS ISense</span>
            <strong>ISense — BIS Standards Assistant</strong>
          </div>
          <button class="isense-close" id="isense-close-btn">&times;</button>
        </div>
        <div class="isense-body isense-loading">
          <div class="isense-spinner"></div>
          <p>Analyzing specification against BIS Indian Standards knowledge graph...</p>
          <span class="isense-query-preview">"${escapeHtml(query.substring(0, 100))}..."</span>
        </div>
      </div>
    `;
    document.getElementById("isense-close-btn").addEventListener("click", closeOverlay);
  }

  function renderError(errorMessage) {
    overlayContainer.innerHTML = `
      <div class="isense-card">
        <div class="isense-header">
          <div class="isense-brand">
            <span class="isense-badge">BIS ISense</span>
            <strong>ISense — Connection Notice</strong>
          </div>
          <button class="isense-close" id="isense-close-btn">&times;</button>
        </div>
        <div class="isense-body isense-error">
          <div class="isense-error-icon">⚠️</div>
          <p><strong>Failed to retrieve standards:</strong></p>
          <p class="isense-error-text">${escapeHtml(errorMessage)}</p>
          <p class="isense-hint">Ensure backend server is running on <code>http://localhost:8000</code>.</p>
        </div>
      </div>
    `;
    document.getElementById("isense-close-btn").addEventListener("click", closeOverlay);
  }

  function renderResults(query, data) {
    const primary = data.standards && data.standards.length > 0 ? data.standards[0] : null;
    const related = data.related_standards || [];
    const coverage = data.coverage || [];
    const gaps = data.gaps || [];

    let coverageRows = "";
    coverage.forEach((c) => {
      let icon = "✅";
      let statusClass = "isense-status-found";
      if (c.status === "PARTIAL" || c.status === "REVIEW") {
        icon = "⚠️";
        statusClass = "isense-status-partial";
      } else if (c.status === "MISSING") {
        icon = "❌";
        statusClass = "isense-status-missing";
      }

      coverageRows += `
        <tr>
          <td><strong>${escapeHtml(c.category)}</strong></td>
          <td><span class="${statusClass}">${icon} ${escapeHtml(c.status)}</span></td>
          <td>${c.standard ? `<code>${escapeHtml(c.standard)}</code>` : "—"}</td>
          <td>${escapeHtml(c.note || "")}</td>
        </tr>
      `;
    });

    let gapsHtml = "";
    if (gaps.length > 0) {
      gapsHtml = `
        <div class="isense-section">
          <h4>⚠️ Missing Requirements & Coverage Gaps (${gaps.length})</h4>
          <ul class="isense-gaps-list">
            ${gaps.map((g) => `
              <li>
                <strong>[${escapeHtml(g.category)}]</strong> ${escapeHtml(g.description)}
                ${g.suggestion ? `<div class="isense-suggestion">💡 Amendment: ${escapeHtml(g.suggestion)}</div>` : ""}
              </li>
            `).join("")}
          </ul>
        </div>
      `;
    }

    overlayContainer.innerHTML = `
      <div class="isense-card">
        <div class="isense-header">
          <div class="isense-brand">
            <span class="isense-badge">GeM/CPPP Assistant</span>
            <strong>ISense Decision Support</strong>
          </div>
          <button class="isense-close" id="isense-close-btn">&times;</button>
        </div>

        <div class="isense-body">
          <!-- Primary Match -->
          ${primary ? `
            <div class="isense-primary-box">
              <div class="isense-primary-title">
                <span class="isense-is-chip">${escapeHtml(primary.is_number)}</span>
                <span class="isense-score-badge">Relevance: ${Math.round((primary.relevance_score || 0.95) * 100)}%</span>
              </div>
              <h3>${escapeHtml(primary.title || "Indian Standard")}</h3>
              <p>${escapeHtml(primary.reason || "Recommended primary standard for specified product.")}</p>
            </div>
          ` : `
            <div class="isense-no-match">
              <p>⚠️ No direct standard identified in demonstration dataset. Manual review required.</p>
            </div>
          `}

          <!-- Coverage Matrix -->
          <div class="isense-section">
            <h4>📋 Coverage Matrix</h4>
            <table class="isense-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Standard</th>
                  <th>Finding</th>
                </tr>
              </thead>
              <tbody>
                ${coverageRows}
              </tbody>
            </table>
          </div>

          <!-- Gaps -->
          ${gapsHtml}

          <!-- Companion Standards -->
          ${related.length > 0 ? `
            <div class="isense-section">
              <h4>🔗 Companion & Normative Standards (${related.length})</h4>
              <div class="isense-tags">
                ${related.map((r) => `
                  <span class="isense-tag" title="${escapeHtml(r.title || '')}">
                    ${escapeHtml(r.is_number)}
                  </span>
                `).join("")}
              </div>
            </div>
          ` : ""}

          <div class="isense-footer">
            <a href="http://localhost:5173" target="_blank" class="isense-full-btn">
              Open Full ISense Portal ↗
            </a>
          </div>
        </div>
      </div>
    `;

    document.getElementById("isense-close-btn").addEventListener("click", closeOverlay);
  }

  function escapeHtml(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
})();
