import { getStorage, setStorage } from "./storage.js";

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
  return addBookmarkButton;
}

const addBookmarkButton = injectButton();

addBookmarkButton.addEventListener('click', () => {
  const videoData = {
     videoTitle: document.querySelector('h1.ytd-watch-metadata yt-formatted-string')?.textContent,
     channelName: document.querySelector('#channel-name a')?.textContent,
     videoUrl: window.location.href.split('&')[0],
     timestamp: Math.floor(document.querySelector('video')?.currentTime || 0),
    }
});

function createSaveModal(videoData) {
  const bookmarkModal = document.createElement('div');
  bookmarkModal.className = 'yt-bookmarker-overlay';

  const bookmarkCustomName = document.createElement('input');
  bookmarkCustomName.className = 'bookmark-custom-name';
  bookmarkCustomName.value = videoData.videoTitle;

  const bookmarkCategory = document.createElement('select');
  bookmarkCategory.className = 'bookmark-category';

  const bookmarkSaveButton = document.createElement('button');
  bookmarkSaveButton.className = 'bookmark-save-button';
  bookmarkSaveButton.textContent = 'Save';
  
  const bookmarkCancelButton = document.createElement('button');
  bookmarkCancelButton.className = 'bookmark-cancel-button';
  bookmarkSaveButton.textContent = 'Cancel';

  bookmarkModal.appendChild(bookmarkCustomName);
  bookmarkModal.appendChild(bookmarkCategory);
  bookmarkModal.appendChild(bookmarkSaveButton);
  bookmarkModal.appendChild(bookmarkCancelButton);

  document.querySelector('.html5-video-player').appendChild(bookmarkModal);

}

