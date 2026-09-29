document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("analyze-btn");
  const textarea = document.getElementById("quick-spec");

  // Check server health
  fetch("http://localhost:8000/api/v1/health")
    .then((r) => r.json())
    .then(() => {
      const dot = document.querySelector(".status-dot");
      if (dot) dot.style.background = "#22c55e";
    })
    .catch(() => {
      const dot = document.querySelector(".status-dot");
      if (dot) {
        dot.style.background = "#ef4444";
        dot.title = "Backend server not responding on http://localhost:8000";
      }
    });

  btn.addEventListener("click", async () => {
    const text = textarea.value.trim();
    if (!text) return;

    btn.textContent = "Analyzing...";
    btn.disabled = true;

    // Send command to active tab's content script to trigger overlay
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: "ISENSE_ANALYSIS_START",
          query: text
        });

        fetch("http://localhost:8000/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: text })
        })
          .then((r) => r.json())
          .then((data) => {
            chrome.tabs.sendMessage(tabs[0].id, {
              action: "ISENSE_ANALYSIS_SUCCESS",
              query: text,
              data: data
            });
            window.close();
          })
          .catch((err) => {
            chrome.tabs.sendMessage(tabs[0].id, {
              action: "ISENSE_ANALYSIS_ERROR",
              query: text,
              error: err.message
            });
            window.close();
          });
      }
    });
  });
});
