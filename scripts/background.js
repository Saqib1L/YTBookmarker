chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url?.includes('youtube.com/watch')) {
    chrome.scripting.executeScript({
      target: { tabId },
      files: ['scripts/content.js']
    });
  }
});