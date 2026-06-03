function injectStyles() {
  const style = document.createElement("style");
  style.textContent = `
    .yt-bookmarker-tooltip {
      position: absolute;
      background: rgba(28, 28, 28, 0.4);
      color: #ffffff;
      font-family: 'Roboto', 'Arial', sans-serif;
      font-size: 13px;
      font-weight: 500;
      padding: 5px 9px;
      border-radius: 8px;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.1s ease;
      white-space: nowrap;
      z-index: 9999;
      letter-spacing: 0.5px;
    }

    .yt-bookmarker-tooltip.visible {
      opacity: 1;
    }

    .yt-bookmarker-modal {
      position: absolute;
      bottom: 60px;
      right: 8px;
      z-index: 9999;
      background: rgba(15, 15, 15, 0.92);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-radius: 12px;
      padding: 20px;
      width: 280px;
      display: flex;
      flex-direction: column;
      gap: 14px;
      font-family: 'Roboto', sans-serif;
      border: 1px solid rgba(255, 255, 255, 0.08);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
      animation: yt-bookmarker-fade-in 0.15s ease;
    }

    @keyframes yt-bookmarker-fade-in {
      from { opacity: 0; transform: translateY(6px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .yt-bookmarker-label {
      color: rgba(255, 255, 255, 0.5);
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      margin-bottom: -6px;
    }

    .bookmark-custom-name {
      width: 100%;
      padding: 6px 0;
      border: none;
      border-bottom: 1px solid rgba(255, 255, 255, 0.15);
      background: transparent;
      color: #ffffff;
      font-size: 13px;
      outline: none;
      transition: border-color 0.2s;
    }

    .bookmark-custom-name:focus {
      border-bottom-color: #FF0000;
    }

    .bookmark-category-wrapper {
      background: rgba(255, 255, 255, 0.06);
      border-radius: 6px;
      padding: 4px 10px;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .bookmark-category {
      width: 100%;
      padding: 6px 0;
      border: none;
      background: transparent;
      color: #ffffff;
      font-size: 13px;
      outline: none;
      cursor: pointer;
      overflow-y: auto;
    }

    .bookmark-category option {
      background: #1a1a1a;
      color: #ffffff;
    }

    .yt-bookmarker-modal-actions {
      display: flex;
      gap: 8px;
      justify-content: flex-end;
      margin-top: 2px;
    }

    .bookmark-save-btn {
      padding: 7px 18px;
      background: #FF0000;
      color: #ffffff;
      border: none;
      border-radius: 18px;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.2s, transform 0.1s;
    }

    .bookmark-save-btn:hover {
      background: #cc0000;
      transform: scale(1.02);
    }

    .bookmark-cancel-btn {
      padding: 7px 18px;
      background: transparent;
      color: rgba(255, 255, 255, 0.7);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 18px;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }

    .bookmark-cancel-btn:hover {
      border-color: rgba(255, 255, 255, 0.6);
      color: #ffffff;
    }

    .bookmark-dropdown {
      position: relative;
      width: 100%;
    }

    .bookmark-dropdown-trigger {
      width: 100%;
      padding: 6px 0;
      border: none;
      border-bottom: 1px solid rgba(255, 255, 255, 0.15);
      background: transparent;
      color: #ffffff;
      font-size: 13px;
      outline: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: space-between;
      text-align: left;
    }

    .bookmark-dropdown-trigger.placeholder {
      color: rgba(255, 255, 255, 0.4);
    }

    .bookmark-dropdown-list {
      position: absolute;
      bottom: calc(100% + 6px);
      left: 0;
      width: 100%;
      background: rgba(28, 28, 28, 0.98);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      overflow: hidden;
      display: none;
      flex-direction: column;
      z-index: 99999;
    }

    .bookmark-dropdown-list.open {
      display: flex;
    }

    .bookmark-dropdown-option {
      padding: 8px 12px;
      font-size: 13px;
      color: #ffffff;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: space-between;
      transition: background-color 0.15s;
    }

    .bookmark-dropdown-option:hover {
      background: rgba(255, 255, 255, 0.08);
    }

    .bookmark-dropdown-option.selected {
      color: #FF0000;
    }

    .bookmark-dropdown-chevron {
      font-size: 10px;
      opacity: 0.6;
    }
  `;

  document.head.appendChild(style);
}

function setupTooltip(addBookmarkButton) {
  const tooltip = document.createElement('div');
  tooltip.className = 'yt-bookmarker-tooltip';
  tooltip.textContent = 'Add Bookmark';
  document.querySelector('.html5-video-player').appendChild(tooltip);

  addBookmarkButton.addEventListener('mouseenter', () => {
    const btnRect = addBookmarkButton.getBoundingClientRect();
    const playerRect = document.querySelector('.html5-video-player').getBoundingClientRect();
    tooltip.style.left = `${btnRect.left - playerRect.left + (btnRect.width / 2)}px`;
    tooltip.style.top = `${btnRect.top - playerRect.top - 48}px`;
    tooltip.style.transform = 'translateX(-50%)';
    tooltip.classList.add('visible');
  });

  addBookmarkButton.addEventListener('mouseleave', () => {
    tooltip.classList.remove('visible');
  });
}

function init() {
  const getStorage = (key) => new Promise((resolve) => chrome.storage.local.get(key, resolve));
  const setStorage = (data) => new Promise((resolve) => chrome.storage.local.set(data, resolve));

  // --- Inject styles ---
  injectStyles();


  // --- Inject bookmark button ---
  function injectButton() {
    if (document.querySelector(".add-bookmark-button")) return;

    const rightControls = document.querySelector(".ytp-right-controls");
    if (!rightControls) return;

    const addBookmarkButton = document.createElement("button");
    addBookmarkButton.className = "ytp-button add-bookmark-button";
    addBookmarkButton.style.backgroundImage = `url(${chrome.runtime.getURL("icons/bookmark-icon.png")})`;
    addBookmarkButton.style.backgroundSize = "24px";
    addBookmarkButton.style.backgroundPosition = "center";
    addBookmarkButton.style.backgroundRepeat = "no-repeat";

    rightControls.prepend(addBookmarkButton);
    return addBookmarkButton;
  }
  
  const addBookmarkButton = injectButton();


  // --- Setup tooltip and button interactions ---
  if(addBookmarkButton) {
    setupTooltip(addBookmarkButton);
    addBookmarkButton.addEventListener("click", () => {
      if (document.querySelector(".yt-bookmarker-modal")) {
        document.querySelector(".yt-bookmarker-modal").remove();
        return;
      }

      const channelLinks = document.querySelectorAll('#attributed-channel-name a.ytAttributedStringLink');
      const channelName = document.querySelector('#attributed-channel-name')?.textContent?.trim() || 
      document.querySelector("#channel-name a")?.textContent?.trim() || 
      "Unknown Channel";
      
      const videoData = {
        videoTitle: document.querySelector("h1.ytd-watch-metadata yt-formatted-string")?.textContent || "Untitled Video",
        channelName,
        videoUrl: window.location.href.split("&")[0],
        timestamp: Math.floor(document.querySelector("video")?.currentTime || 0),
      };
      createSaveModal(videoData);
  });
  }

  function createSaveModal(videoData) {
      
      // --- Build modal UI ---
      const bookmarkModal = document.createElement("div");
      bookmarkModal.className = "yt-bookmarker-modal";

      const nameLabel = document.createElement("p");
      nameLabel.className = "yt-bookmarker-label";
      nameLabel.textContent = "Custom name";

      const bookmarkCustomName = document.createElement("input");
      bookmarkCustomName.className = "bookmark-custom-name";
      bookmarkCustomName.value = videoData.videoTitle;
      ["keydown", "keyup"].forEach((eventType) => {
      bookmarkCustomName.addEventListener(eventType, (e) => {
        e.stopPropagation();
      });
    });

    const categoryLabel = document.createElement("p");
    categoryLabel.className = "yt-bookmarker-label";
    categoryLabel.textContent = "Category";

    let selectedCategory = '';

    const bookmarkDropdown = document.createElement('div');
    bookmarkDropdown.className = 'bookmark-dropdown';

    const bookmarkDropdownTrigger = document.createElement('button');
    bookmarkDropdownTrigger.className = 'bookmark-dropdown-trigger placeholder';
    bookmarkDropdownTrigger.textContent = 'Select a category';

    const bookmarkDropdownChevron = document.createElement('span');
    bookmarkDropdownChevron.className = 'bookmark-dropdown-chevron';
    bookmarkDropdownChevron.textContent = '▲';

    const bookmarkDropdownList = document.createElement('div');
    bookmarkDropdownList.className = 'bookmark-dropdown-list';

    bookmarkDropdownTrigger.appendChild(bookmarkDropdownChevron);
    bookmarkDropdown.appendChild(bookmarkDropdownTrigger);
    bookmarkDropdown.appendChild(bookmarkDropdownList);

    const bookmarkSaveButton = document.createElement("button");
    bookmarkSaveButton.className = "bookmark-save-btn";
    bookmarkSaveButton.textContent = "Save";

    const bookmarkCancelButton = document.createElement("button");
    bookmarkCancelButton.className = "bookmark-cancel-btn";
    bookmarkCancelButton.textContent = "Cancel";

    const bookmarkActions = document.createElement("div");
    bookmarkActions.className = "yt-bookmarker-modal-actions";
    bookmarkActions.appendChild(bookmarkSaveButton);
    bookmarkActions.appendChild(bookmarkCancelButton);

    bookmarkModal.appendChild(nameLabel);
    bookmarkModal.appendChild(bookmarkCustomName);
    bookmarkModal.appendChild(categoryLabel);
    bookmarkModal.appendChild(bookmarkDropdown);

    bookmarkModal.appendChild(bookmarkActions);
    document.querySelector(".html5-video-player").appendChild(bookmarkModal);


    // --- Category population ---
    function populateCategories() {
  if (!chrome.runtime?.id) return;
  chrome.storage.local.get("categories", (result) => {
    bookmarkDropdownList.innerHTML = '';

    const categories = result.categories || [];
    categories.forEach((category) => {
      if (category === "All") return;

      const option = document.createElement('div');
      option.className = 'bookmark-dropdown-option';
      if (category === selectedCategory) option.classList.add('selected');

      const optionText = document.createElement('span');
      optionText.textContent = category;

      const optionCheck = document.createElement('span');
      optionCheck.textContent = '✓';
      optionCheck.style.opacity = category === selectedCategory ? '1' : '0';

      option.appendChild(optionText);
      option.appendChild(optionCheck);

      option.addEventListener('click', () => {
        selectedCategory = category;
        bookmarkDropdownTrigger.textContent = category;
        bookmarkDropdownTrigger.classList.remove('placeholder');
        bookmarkDropdownTrigger.appendChild(bookmarkDropdownChevron);
        bookmarkDropdownList.classList.remove('open');
        populateCategories();
      });

      bookmarkDropdownList.appendChild(option);
    });
  });
}

bookmarkDropdownTrigger.addEventListener('click', (e) => {
  e.stopPropagation();
  bookmarkDropdownList.classList.toggle('open');
});
    
  
    // --- Storage change listener ---
    if (chrome.runtime?.id) {
      chrome.storage.onChanged.addListener(onStorageChanged); 
    }
    populateCategories();

    function onStorageChanged(changes) {
      if (changes.categories) populateCategories();
    }
    
    function removeCloseModal() {
      document.removeEventListener("click", closeModal, true);
      chrome.storage.onChanged.removeListener(onStorageChanged);
    }


    // --- Save flow ---
    bookmarkSaveButton.addEventListener("click", async () => {
      removeCloseModal();
      const result = await getStorage("bookmarks");
      const bookmarks = result.bookmarks || [];

      const newBookmark = {
          id: Date.now().toString(),
          customName: bookmarkCustomName.value.trim() || videoData.videoTitle,
          youtubeTitle: videoData.videoTitle,
          channel: videoData.channelName,
          url: videoData.videoUrl,
          timestamp: videoData.timestamp,
          category: selectedCategory,
          savedAt: new Date().toLocaleString('en-GB', { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric',
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
          }).replace(/am|pm/i, (match) => match.toUpperCase()),
        };

      bookmarks.push(newBookmark);
      await setStorage({ bookmarks });
      bookmarkModal.remove();
    });


    // --- Cancel flow ---
    bookmarkCancelButton.addEventListener("click", () => {
      removeCloseModal();
      bookmarkModal.remove();
    });
    

    // --- Outside click handler ---
    function closeModal(e) {
      if (
        !bookmarkModal.contains(e.target) &&
        !addBookmarkButton.contains(e.target)
        ) {
        bookmarkModal.remove();
        removeCloseModal();

        const controls = document.querySelector('.ytp-chrome-bottom');
        if (!controls || !controls.contains(e.target)) {
            e.stopPropagation();
        }
        }

        bookmarkDropdownList.classList.remove('open');

      }
      
      setTimeout(() => {
        document.addEventListener("click", closeModal, true);
      }, 0);
  }
  
 document.addEventListener('keydown', (e) => {
    if (
      document.activeElement.tagName === 'INPUT' ||
      document.activeElement.tagName === 'TEXTAREA'
    ) return;

    if (e.key === 'a' || e.key === 'A') {
      addBookmarkButton.click();
    }

    if (e.key === 'Enter') {
      const saveBtn = document.querySelector('.bookmark-save-btn');
      if (saveBtn) saveBtn.click();
    }
}, true);

}

if (!window.__ytBookmarkerLoaded) {
  window.__ytBookmarkerLoaded = true;
  init();
}