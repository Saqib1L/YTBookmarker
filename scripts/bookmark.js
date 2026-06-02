import { getStorage, setStorage } from "./storage.js";
import { getActiveCategory } from "./state.js";

export async function searchBookmarks(query) {
  const result = await getStorage('bookmarks');
  
  const category = getActiveCategory();
  const bookmarks = result.bookmarks || [];

  const filteredBookmarks = category === 'All' ? bookmarks : bookmarks.filter((b) => b.category === category);
  const filteredFromSearch = filteredBookmarks.filter((b) => b.customName.toLowerCase().includes(query.toLowerCase()));
  renderBookmarks(filteredFromSearch);
}

function createDetailRow(label, value, addHoverTitle = false) {
  const row = document.createElement('div');
  const labelSpan = document.createElement('span');
  const valueSpan = document.createElement('span');

  labelSpan.className = 'detail-label';
  valueSpan.className = 'detail-value';

  labelSpan.textContent = label;
  valueSpan.textContent = value;

  if (addHoverTitle) row.title = value;

  row.appendChild(labelSpan);
  row.appendChild(valueSpan);
  return row;
}

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

  const bookmarkDeleteButton = document.createElement('button');
  const bookmarkRenameButton = document.createElement('button');

  bookmarkDeleteButton.className = 'bookmark-delete-button';
  bookmarkRenameButton.className = 'bookmark-rename-button';

  bookmarkDeleteButton.textContent = 'Delete';
  bookmarkRenameButton.textContent = 'Rename';

  const bookmarkActions = document.createElement('div');
  bookmarkActions.className = 'bookmark-actions';
  bookmarkActions.appendChild(bookmarkRenameButton);
  bookmarkActions.appendChild(bookmarkDeleteButton);

  detailsDiv.appendChild(createDetailRow('Title: ', bookmark.youtubeTitle, true));
  detailsDiv.appendChild(createDetailRow('Channel: ', bookmark.channel));
  detailsDiv.appendChild(createDetailRow('Saved: ', bookmark.savedAt));
  detailsDiv.appendChild(createDetailRow('Category: ', bookmark.category));
  detailsDiv.appendChild(bookmarkActions);

  card.appendChild(detailsDiv);

  bookmarkDetailMenuBtn.addEventListener('click', () => {
    detailsDiv.classList.toggle('expanded');
    bookmarkDetailMenuBtn.classList.toggle('expanded');
  });

  //Deleting Bookmarks
 bookmarkDeleteButton.addEventListener('click', async () => {
    document.getElementById('delete-confirmation-message').textContent = 
      `Are you sure you want to delete "${bookmark.customName}"?`;

    const result = await getStorage('bookmarks');
    const bookmarks = result.bookmarks || [];
    document.getElementById('delete-confirmation-overlay').classList.add('visible');

    async function onConfirm() {
      const updatedBookmarks = bookmarks.filter((b) => b.id !== bookmark.id);
     
      await setStorage({ bookmarks: updatedBookmarks });

      const category = getActiveCategory();
      const filtered = category === 'All' ? updatedBookmarks : updatedBookmarks.filter((b) => b.category === category);
      renderBookmarks(filtered);

      document.getElementById('delete-confirmation-overlay').classList.remove('visible');
    }

    function onCancel() {
       document.getElementById('delete-confirmation-overlay').classList.remove('visible');
    }

    const confirmBtn = document.getElementById('delete-confirmation-confirm');
    const cancelBtn = document.getElementById('delete-confirmation-cancel');

    confirmBtn.removeEventListener('click', onConfirm);
    confirmBtn.addEventListener('click', onConfirm, { once: true });

    cancelBtn.removeEventListener('click', onCancel);
    cancelBtn.addEventListener('click', onCancel, { once: true });
  });

  async function saveBookmarkRename(input, bookmarkId, oldName) {
    const result = await getStorage('bookmarks');
    const bookmarks = result.bookmarks || [];

    const bookmarkSafeName = input.value.trim().slice(0, 150) || oldName;
    const index = bookmarks.findIndex((b) => b.id === bookmarkId);
    
    bookmarks[index].customName = bookmarkSafeName;
    
    await setStorage({ bookmarks });

    const category = getActiveCategory();
    const filtered = category === 'All' ? bookmarks : bookmarks.filter((b) => b.category === category);
    
    renderBookmarks(filtered);
  }

  //Renaming Bookmarks
  bookmarkRenameButton.addEventListener('click', () => {
    const bookmarkRenameSpace = document.createElement('input');
    bookmarkRenameSpace.value = bookmark.customName;
    bookmarkRenameSpace.className = 'bookmark-rename-input';

    const oldBookmarkName = bookmark.customName;
    bookmarkName.replaceWith(bookmarkRenameSpace);
    bookmarkRenameSpace.select();
    
    let isSaved = false;

    bookmarkRenameSpace.addEventListener('keydown', async (e) => {
      if (e.key === 'Enter') {
        isSaved = true;
        await saveBookmarkRename(bookmarkRenameSpace, bookmark.id, oldBookmarkName);
      }
    });

    bookmarkRenameSpace.addEventListener('blur', async () => {
      if (!isSaved) await saveBookmarkRename(bookmarkRenameSpace, bookmark.id, oldBookmarkName);
    });
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

export async function renderFilteredBookmarks(category) {
  const result = await getStorage('bookmarks');
  const bookmarks = result.bookmarks || [];
  const filtered = category === 'All' ? bookmarks : bookmarks.filter((b) => b.category === category);
  renderBookmarks(filtered);
}

export async function initBookmarks() {
  const result = await getStorage('bookmarks');
  renderBookmarks(result.bookmarks || []);

  document.getElementById('search-input').addEventListener('input', (e) => {
    searchBookmarks(e.target.value);
  });

  chrome.storage.onChanged.addListener((changes) => {
    if (changes.bookmarks) {
      const bookmarks = changes.bookmarks.newValue || [];
      const category = getActiveCategory();
      const filtered = category === 'All' ? bookmarks : bookmarks.filter((b) => b.category === category);
      renderBookmarks(filtered);
    }
  });
}