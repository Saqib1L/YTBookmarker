function injectButton() {
  if (document.querySelector('.add-bookmark-button')) return;
  
  const rightControls = document.querySelector('.ytp-right-controls');
  if (!rightControls) return;

  const addBookmarkButton = document.createElement('button');
  addBookmarkButton.className = 'ytp-button add-bookmark-button';
  addBookmarkButton.title = 'Add Bookmark';
  addBookmarkButton.style.backgroundImage = `url(${chrome.runtime.getURL('icons/bookmark-icon.png')})`;
  addBookmarkButton.style.backgroundSize = '24px';
  addBookmarkButton.style.backgroundPosition = 'center';
  addBookmarkButton.style.backgroundRepeat = 'no-repeat';

  rightControls.prepend(addBookmarkButton);
}

injectButton();