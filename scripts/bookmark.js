import { getStorage, setStorage } from "./storage.js";
import { getActiveCategory } from "./state.js";

function filterBookmarksByCategory(bookmarks, category) {
  return category === 'All' ? bookmarks : bookmarks.filter((b) => b.category === category);
}

export async function searchBookmarks(query) {
  try {
    const result = await getStorage('bookmarks');
    const category = getActiveCategory();
    const bookmarks = result.bookmarks || [];
    const categoryFiltered = filterBookmarksByCategory(bookmarks, category);
    const filteredFromSearch = categoryFiltered.filter((b) => b.customName.toLowerCase().includes(query.toLowerCase()));
    renderBookmarks(filteredFromSearch);
  } catch(error) {
    console.error('Failed to search bookmarks:', error);
  }
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

function formatTimestamp(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function createBookmarkCard(bookmark) {
  // --- Build card UI ---
  const card = document.createElement('div');
  card.className = 'bookmark-card';

  const header = document.createElement('div');
  const bookmarkName = document.createElement('span');
  const bookmarkPlayVideoBtn = document.createElement('button');
  const bookmarkDetailsToggleBtn = document.createElement('button');

  header.className = 'bookmark-header';
  bookmarkName.className = 'bookmark-name';
  bookmarkPlayVideoBtn.className = 'bookmark-play-video-btn';
  bookmarkDetailsToggleBtn.className = 'bookmark-detail-menu-btn';

  bookmarkName.textContent = bookmark.customName;
  bookmarkPlayVideoBtn.textContent = '▶';
  bookmarkDetailsToggleBtn.textContent = '⋮';

  header.appendChild(bookmarkName);
  header.appendChild(bookmarkPlayVideoBtn);
  header.appendChild(bookmarkDetailsToggleBtn);

  card.appendChild(header);

  bookmarkPlayVideoBtn.addEventListener('click', () => {
    chrome.tabs.create({ url: `${bookmark.url}&t=${bookmark.timestamp}` });
  });


  // --- Details section ---
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
  detailsDiv.appendChild(createDetailRow('Timestamp: ', formatTimestamp(bookmark.timestamp)));
  detailsDiv.appendChild(createDetailRow('Saved: ', bookmark.savedAt));
  detailsDiv.appendChild(createDetailRow('Category: ', bookmark.category));
  detailsDiv.appendChild(bookmarkActions);

  card.appendChild(detailsDiv);


  // --- Details toggle ---
  bookmarkDetailsToggleBtn.addEventListener('click', () => {
    detailsDiv.classList.toggle('expanded');
    bookmarkDetailsToggleBtn.classList.toggle('expanded');
  });


  // --- Delete flow ---
 bookmarkDeleteButton.addEventListener('click', async () => {
    document.getElementById('delete-confirmation-message').textContent = 
      `Are you sure you want to delete "${bookmark.customName}"?`;

    try {    
      const result = await getStorage('bookmarks');
      const bookmarks = result.bookmarks || [];
      document.getElementById('delete-confirmation-overlay').classList.add('visible');

      async function onConfirm() {
        try {
          const updatedBookmarks = bookmarks.filter((b) => b.id !== bookmark.id);
        
          await setStorage({ bookmarks: updatedBookmarks });

          const category = getActiveCategory();
          const filtered = filterBookmarksByCategory(updatedBookmarks, category);
          renderBookmarks(filtered);

          document.getElementById('delete-confirmation-overlay').classList.remove('visible');
        } catch(error) {
          console.error('Failed to delete bookmark:', error);
        }
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
    } catch (error) {
      console.error('Failed to load bookmarks for deletion:', error);
    }
  });


  // --- Rename flow ---
  async function saveBookmarkRename(input, bookmarkId, oldName) {
    try {
      const result = await getStorage('bookmarks');
      const bookmarks = result.bookmarks || [];

      const bookmarkSafeName = input.value.trim().slice(0, 150) || oldName;
      const index = bookmarks.findIndex((b) => b.id === bookmarkId);
      if (index === -1) return;
      
      bookmarks[index].customName = bookmarkSafeName;
      
      await setStorage({ bookmarks });

      const category = getActiveCategory();
      const filtered = filterBookmarksByCategory(bookmarks, category);
      
      renderBookmarks(filtered);
    } catch(error) {
      console.error('Failed to rename bookmark:', error);
    }
  }

  //Renaming Bookmarks
  bookmarkRenameButton.addEventListener('click', () => {
    const bookmarkRenameInput = document.createElement('input');
    bookmarkRenameInput.value = bookmark.customName;
    bookmarkRenameInput.className = 'bookmark-rename-input';

    const oldBookmarkName = bookmark.customName;
    bookmarkName.replaceWith(bookmarkRenameInput);
    bookmarkRenameInput.select();
    
    let isSaved = false;

    bookmarkRenameInput.addEventListener('keydown', async (e) => {
      if (e.key === 'Enter') {
        isSaved = true;
        await saveBookmarkRename(bookmarkRenameInput, bookmark.id, oldBookmarkName);
      }
    });

    bookmarkRenameInput.addEventListener('blur', async () => {
      if (!isSaved) await saveBookmarkRename(bookmarkRenameInput, bookmark.id, oldBookmarkName);
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
  try {
    const result = await getStorage('bookmarks');
    const bookmarks = result.bookmarks || [];
    const filtered = category === 'All' ? bookmarks : bookmarks.filter((b) => b.category === category);
    renderBookmarks(filtered);
   } catch(error) {
    console.error('Failed to render filtered bookmarks:', error);
  }
}

export async function initBookmarks() {
  try {
    const result = await getStorage('bookmarks');
    renderBookmarks(result.bookmarks || []);
  } catch(error) {
    console.error('Failed to load bookmarks:', error);
    renderBookmarks([]);
  }

  document.getElementById('search-input').addEventListener('input', (e) => {
    searchBookmarks(e.target.value);
  });

  chrome.storage.onChanged.addListener((changes) => {
    if (changes.bookmarks) {
      const bookmarks = changes.bookmarks.newValue || [];
      const category = getActiveCategory();
      const filtered = filterBookmarksByCategory(bookmarks, category);
      renderBookmarks(filtered);
    }
  });
}