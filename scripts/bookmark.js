import { getStorage, setStorage } from "./storage.js";


export async function searchBookmarks(query) {
  const result = await getStorage('bookmarks');
  const bookmarks = result.bookmarks || [];
  const filtered = bookmarks.filter((b) =>
    b.customName.toLowerCase().includes(query.toLowerCase())
  );
  renderBookmarks(filtered);
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
    document.getElementById('delete-confirmation-confirm').addEventListener('click', async () => {
      const updatedBookmarks = bookmarks.filter((b) => b.id !== bookmark.id);
     
      await setStorage({ bookmarks: updatedBookmarks });
      renderBookmarks(updatedBookmarks);
      document.getElementById('delete-confirmation-overlay').classList.remove('visible');
    
    }, { once: true });

    document.getElementById('delete-confirmation-cancel').addEventListener('click', () => {
      document.getElementById('delete-confirmation-overlay').classList.remove('visible');
    }, { once: true });
  });


  //Renaming Bookmarks
  bookmarkRenameButton.addEventListener('click', () => {
    const bookmarkRenameSpace = document.createElement('input');
    bookmarkRenameSpace.value = bookmark.customName;
    bookmarkRenameSpace.className = 'bookmark-rename-input';

    const oldBookmarkName = bookmark.customName;
    bookmarkName.replaceWith(bookmarkRenameSpace);
    bookmarkRenameSpace.select();

    async function saveBookmarkRename() {
      const result = await getStorage('bookmarks');
      const bookmarks = result.bookmarks || [];

      const bookmarkSafeName = bookmarkRenameSpace.value.trim().slice(0, 150) || oldBookmarkName;
      const index = bookmarks.findIndex((b) => b.id === bookmark.id);
      
      bookmarks[index].customName = bookmarkSafeName;
      
      await setStorage({bookmarks});
      renderBookmarks(bookmarks)
    }

    bookmarkRenameSpace.addEventListener('keydown', async (e) => {
      if (e.key === 'Enter') await saveBookmarkRename();
    });

    bookmarkRenameSpace.addEventListener('blur', async () => {
      await saveBookmarkRename();
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

export async function initBookmarks() {
  const result = await getStorage('bookmarks');
  renderBookmarks(result.bookmarks || []);

  document.getElementById('search-input').addEventListener('input', (e) => {
    searchBookmarks(e.target.value);
  });

  chrome.storage.onChanged.addListener((changes) => {
    if (changes.bookmarks) {
      renderBookmarks(changes.bookmarks.newValue || []);
    }
  });
}