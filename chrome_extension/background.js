/**
 * ISense Background Service Worker (Manifest V3)
 * Sets up Context Menus & Relays Selected Text to ISense API
 */

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "isense-analyze-selection",
    title: "🔍 Analyze with ISense (BIS Standards & Gaps)",
    contexts: ["selection"]
  });
  console.log("[ISense] Extension installed & context menu registered.");
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "isense-analyze-selection" && info.selectionText && tab?.id) {
    const selectedText = info.selectionText.trim();
    if (selectedText.length < 5) return;

    try {
      // Notify content script that analysis has started
      chrome.tabs.sendMessage(tab.id, {
        action: "ISENSE_ANALYSIS_START",
        query: selectedText
      });

      // Call ISense API
      const response = await fetch("http://localhost:8000/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: selectedText })
      });

      if (!response.ok) {
        throw new Error(`API responded with status ${response.status}`);
      }

      const data = await response.json();

      // Send result back to content script to display overlay
      chrome.tabs.sendMessage(tab.id, {
        action: "ISENSE_ANALYSIS_SUCCESS",
        query: selectedText,
        data: data
      });
    } catch (err) {
      console.error("[ISense] Analysis failed:", err);
      chrome.tabs.sendMessage(tab.id, {
        action: "ISENSE_ANALYSIS_ERROR",
        query: selectedText,
        error: err.message || "Failed to connect to ISense server on http://localhost:8000"
      });
    }
  }
});
