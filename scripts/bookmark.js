import { getStorage } from "./storage.js";

function createBookmarkCard(bookmark) {
  const card = document.createElement('div');
  card.className = 'bookmark-card';

  const header = document.createElement('div');
  const bookmarkName = document.createElement('span');
  const bookmarkPlayVideoBtn = document.createElement('button');
  const bookmarkDetailMenuBtn = document.createElement('button');

  header.className = 'bookmark-header';
  bookmarkName.className = 'bookmark-name';
  bookmarkPlayVideoBtn.className = 'bookmark-play-video-btn';
  bookmarkDetailMenuBtn.className = 'bookmark-detail-menu-btn';

  bookmarkName.textContent = bookmark.customName;
  bookmarkPlayVideoBtn.textContent = '▶';
  bookmarkDetailMenuBtn.textContent = '⋮';

  header.appendChild(bookmarkName);
  header.appendChild(bookmarkPlayVideoBtn);
  header.appendChild(bookmarkDetailMenuBtn);

  card.appendChild(header);

  bookmarkPlayVideoBtn.addEventListener('click', () => {
    chrome.tabs.create({ url: `${bookmark.url}&t=${bookmark.timestamp}` });
  });
  
  const detailsDiv = document.createElement('div');
  detailsDiv.className = 'bookmark-details';

  const youtubeVideoTitle = document.createElement('div');
  const youtubeChannel = document.createElement('div');
  const savedDate = document.createElement('div');
  const category = document.createElement('div');
  const bookmarkDeleteButton = document.createElement('button');
  const bookmarkRenameButton = document.createElement('button');

  youtubeVideoTitle.className = 'youtube-video-title';
  youtubeChannel.className = 'youtube-channel';
  savedDate.className = 'saved-Date';
  category.className = 'category';
  bookmarkDeleteButton.className = 'bookmark-delete-button';
  bookmarkRenameButton.className = 'bookmark-rename-button';

  youtubeVideoTitle.textContent = 'Title: ' + bookmark.youtubeTitle;
  youtubeChannel.textContent = 'Channel: ' + bookmark.channel;
  savedDate.textContent = 'Date Saved: ' + bookmark.savedAt;
  category.textContent = 'Category: ' + bookmark.category;
  bookmarkDeleteButton.textContent = 'Delete';
  bookmarkRenameButton.textContent = 'Rename';

  detailsDiv.appendChild(youtubeVideoTitle);
  detailsDiv.appendChild(youtubeChannel);
  detailsDiv.appendChild(savedDate);
  detailsDiv.appendChild(category);
  detailsDiv.appendChild(bookmarkDeleteButton);
  detailsDiv.appendChild(bookmarkRenameButton);
 
  card.appendChild(detailsDiv);

  bookmarkDetailMenuBtn.addEventListener('click', () => {
    detailsDiv.classList.toggle('expanded');
    bookmarkDetailMenuBtn.classList.toggle('expanded');
  });
  return card;
}

export function renderBookmarks(bookmarks) {
  const bookmarkList = document.getElementById('bookmarks-list');
  bookmarkList.innerHTML = '';

   bookmarks.forEach((bookmark) => {
    const card = createBookmarkCard(bookmark);
    bookmarkList.appendChild(card);
  });
}

export async function initBookmarks() {
  const result = await getStorage('bookmarks');
  renderBookmarks(result.bookmarks || []);
}
