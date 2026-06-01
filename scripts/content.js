function init() {

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
  `;

  document.head.appendChild(style);

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

  const tooltip = document.createElement('div');
  tooltip.className = 'yt-bookmarker-tooltip';
  tooltip.textContent = 'Add Bookmark';
  document.querySelector('.html5-video-player').appendChild(tooltip);

  if(addBookmarkButton) {

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

    addBookmarkButton.addEventListener("click", () => {
      if (document.querySelector(".yt-bookmarker-modal")) {
        document.querySelector(".yt-bookmarker-modal").remove();
        return;
      }

      const videoData = {
        videoTitle: document.querySelector(
          "h1.ytd-watch-metadata yt-formatted-string",
        )?.textContent,
        channelName: document.querySelector("#channel-name a")?.textContent,
        videoUrl: window.location.href.split("&")[0],
        timestamp: Math.floor(document.querySelector("video")?.currentTime || 0),
      };
      createSaveModal(videoData);
    });
  }

  function createSaveModal(videoData) {
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

    const bookmarkCategory = document.createElement("select");
    bookmarkCategory.className = "bookmark-category";

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

    const categoryWrapper = document.createElement("div");
    categoryWrapper.className = "bookmark-category-wrapper";
    categoryWrapper.appendChild(bookmarkCategory);

    bookmarkModal.appendChild(nameLabel);
    bookmarkModal.appendChild(bookmarkCustomName);
    bookmarkModal.appendChild(categoryLabel);
    bookmarkModal.appendChild(categoryWrapper);
    bookmarkModal.appendChild(bookmarkActions);
    document.querySelector(".html5-video-player").appendChild(bookmarkModal);

    function populateCategories() {
      if (!chrome.runtime?.id) return;
      chrome.storage.local.get("categories", (result) => {
        const selected = bookmarkCategory.value;
        bookmarkCategory.innerHTML = '';

        const placeholder = document.createElement("option");
        placeholder.value = "";
        placeholder.textContent = "Select a category";
        placeholder.disabled = true;
        placeholder.selected = !selected;
        bookmarkCategory.appendChild(placeholder);

        const categories = result.categories || [];
        categories.forEach((category) => {
          if (category === "All") return;
          const option = document.createElement("option");
          option.value = category;
          option.textContent = category;
          if (category === selected) option.selected = true;
          bookmarkCategory.appendChild(option);
        });
      });
    }
    
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

    bookmarkSaveButton.addEventListener("click", () => {
      removeCloseModal();
      chrome.storage.local.get("bookmarks", (result) => {
        const bookmarks = result.bookmarks || [];

        const newBookmark = {
          id: Date.now().toString(),
          customName: bookmarkCustomName.value.trim() || videoData.videoTitle,
          youtubeTitle: videoData.videoTitle,
          channel: videoData.channelName,
          url: videoData.videoUrl,
          timestamp: videoData.timestamp,
          category: bookmarkCategory.value,
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
        chrome.storage.local.set({ bookmarks }, () => {
          bookmarkModal.remove();
        });
      });
    });

    bookmarkCancelButton.addEventListener("click", () => {
      removeCloseModal();
      bookmarkModal.remove();
    });
    
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
      }
      
      setTimeout(() => {
        document.addEventListener("click", closeModal, true);
      }, 0);
  } 
}

if (!window.__ytBookmarkerLoaded) {
  window.__ytBookmarkerLoaded = true;
  init();
}