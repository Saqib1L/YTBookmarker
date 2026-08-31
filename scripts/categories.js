import { getStorage, setStorage } from "./storage.js";
import { renderFilteredBookmarks } from "./bookmark.js";
import { getActiveCategoryId, setActiveCategoryId } from "./state.js";

const ALL_CATEGORY = {id: 'all', name: 'All'};

function createCategoryContextMenu(wrapper, categories, category) {

  // --- Build menu UI ---
  const contextMenu = document.createElement("div");
  contextMenu.className = "category-detail-menu";

  const categoryRenameButton = document.createElement("button");
  const categoryDeleteButton = document.createElement("button");

  categoryRenameButton.textContent = "Rename";
  categoryDeleteButton.textContent = "Delete";
  categoryRenameButton.className = "category-menu-rename-button";
  categoryDeleteButton.className = "category-menu-delete-button";

  contextMenu.appendChild(categoryRenameButton);
  contextMenu.appendChild(categoryDeleteButton);


  // --- Outside click handler ---
  function onOutsideClick(e) {
    if (!wrapper.contains(e.target)) {
      contextMenu.remove();
      wrapper.classList.remove('menu-open')
      document.removeEventListener('click', onOutsideClick);
    }
  }
  document.removeEventListener('click', onOutsideClick);
  document.addEventListener('click', onOutsideClick);


   // --- Rename flow ---
  const categoryButton = wrapper.querySelector(".category-item");
  categoryRenameButton.addEventListener("click", () => {
    document.removeEventListener('click', onOutsideClick)

    const renameInput = document.createElement("input");
    renameInput.value = categoryButton.textContent;
    renameInput.className = "category-input";

    categoryButton.replaceWith(renameInput);
    renameInput.select();

    async function saveRename() {
      try {
       const safeName = renameInput.value.trim().slice(0, 50) || category.name;
       const target = categories.find((c) => c.id === category.id);
       if (!target) return;
       target.name = safeName; 

        await setStorage({ categories });
        renderCategories(categories);
      } catch(error) {
        console.error('Failed to rename category:', error);
      }
    }

    contextMenu.remove();
    wrapper.classList.remove('menu-open');

    let isSaved = false;

    renameInput.addEventListener("keydown", async (e) => {
      if (e.key === "Enter") {
        isSaved = true;
        await saveRename();
      }
    });

    renameInput.addEventListener("blur", async () => {
      if (!isSaved) { await saveRename() };
    });
  });


  // --- Delete flow ---
  categoryDeleteButton.addEventListener('click', async () => {
    document.removeEventListener('click', onOutsideClick)

    contextMenu.remove();
    wrapper.classList.remove('menu-open');
    
    document.getElementById('delete-confirmation-message').textContent = `Are you sure you want to delete the category "${category.name}"?`;
    document.getElementById('delete-confirmation-overlay').classList.add('visible');

    async function onConfirm() {
      try {
        const updatedCategories = categories.filter((c) => c.id !== category.id);

        const result = await getStorage('bookmarks');
        const bookmarks = result.bookmarks || [];
        const updatedBookmarks = bookmarks.map((b) =>
          b.categoryId === category.id ? { ...b, categoryId: 'all' } : b
        );

        await setStorage({ categories: updatedCategories, bookmarks: updatedBookmarks });
        setActiveCategoryId('all');

        renderCategories(updatedCategories);
        document.getElementById('delete-confirmation-overlay').classList.remove('visible');
        renderFilteredBookmarks('all');
      } catch(error) {
        console.error('Failed to delete category:', error);
      }
    }

    function onCancel() {
      document.getElementById('delete-confirmation-overlay').classList.remove('visible');
    }

    const confirmBtn = document.getElementById('delete-confirmation-confirm');
    const cancelBtn =  document.getElementById('delete-confirmation-cancel');

    confirmBtn.removeEventListener('click', onConfirm);
    confirmBtn.addEventListener('click', onConfirm, {once: true});

    cancelBtn.removeEventListener('click', onCancel);
    cancelBtn.addEventListener('click', onCancel, {once: true});
  });
  return contextMenu;
}


function createCategoryWrapper(category, categories) {
  const wrapper = document.createElement("div");
  wrapper.className = "category-item-wrapper";

  const button = document.createElement("button");
  button.className = "category-item";
  button.textContent = category.name;
  button.setAttribute("data-category-id", category.id);

  if (category.id === getActiveCategoryId()) {
    button.classList.add("active");
  }

  wrapper.appendChild(button);

  if (category.id !== "all") {
    const dotsBtn = document.createElement("button");
    dotsBtn.className = "dots-btn";
    dotsBtn.textContent = "⋮";

    dotsBtn.addEventListener("click", () => {
      const existingMenu = document.querySelector('.category-detail-menu');
      if (existingMenu) existingMenu.remove();

      wrapper.classList.add('menu-open');

      const menu = createCategoryContextMenu(wrapper, categories, category);
      wrapper.appendChild(menu);

      requestAnimationFrame(() => {
        menu.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      });
    });

    wrapper.appendChild(dotsBtn);
  }

  button.addEventListener('click', () => {
  document.querySelectorAll('.category-item').forEach((btn) => {
    btn.classList.remove('active');
  });
    button.classList.add('active');
    setActiveCategoryId(category.id);
    renderFilteredBookmarks(category.id);
  });

  return wrapper;
}


function renderCategories(categories) {
  const list = document.getElementById("categories-list");
  list.innerHTML = "";

  [ALL_CATEGORY, ...categories].forEach((category) => {
    const wrapper = createCategoryWrapper(category, categories);
    list.appendChild(wrapper);
  });
}

async function saveNewCategory(inputElement, newCategory, categories) {
  try {
    newCategory.name = inputElement.value.trim().slice(0, 50) || newCategory.name;
    await setStorage({ categories });
    renderCategories(categories);
  } catch(error) {
    console.error('Failed to save new category:', error);
  }
}

export async function initCategories() {
  let categories = [];
  try {
    const result = await getStorage("categories");
    categories = result.categories || []
    renderCategories(categories);
  } catch(error) {
    console.error('Failed to load categories:', error);
    renderCategories([]);
  }

  document.getElementById("new-category-btn").addEventListener("click", async () => {
    try {
      const result = await getStorage("categories");
      const categories = result.categories || [];

      const newCategory = {
        id: crypto.randomUUID(),
        name: "Category " + (categories.length + 1),
      };
      categories.push(newCategory);
      await setStorage({ categories });


      const inputElement = document.createElement("input");
      inputElement.className = "category-input";
      inputElement.value = newCategory.name;
      document.getElementById("categories-list").appendChild(inputElement);
      inputElement.select();

      let isSaved = false;

      inputElement.addEventListener("keydown", async (e) => {
        if (e.key === "Enter") {
          isSaved = true;
          await saveNewCategory(inputElement, newCategory, categories);
        }
      });

      inputElement.addEventListener("blur", async () => {
        if (!isSaved) await saveNewCategory(inputElement, newCategory, categories);
      });
      } catch(error) {
        console.error('Failed to create new category:', error);
      }
    });   
}
