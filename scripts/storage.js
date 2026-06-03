export function getStorage(key) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(key, (result) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
      resolve(result);
    }
    });
  });
}

export function setStorage(data) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set(data, () => {
      if(chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
      resolve();
    }
    });
  });
}