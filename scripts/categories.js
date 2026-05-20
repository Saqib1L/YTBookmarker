import { getStorage, setStorage } from "./storage.js";
import { renderBookmarks } from "./bookmark.js";
import { getActiveCategory, setActiveCategory } from "./state.js";

function createCategoryDetailMenu(wrapper, categories) {
  const categoryDetailMenu = document.createElement("div");
  categoryDetailMenu.className = "category-detail-menu";

  const categoryRenameButton = document.createElement("button");
  const categoryDeleteButton = document.createElement("button");

  categoryRenameButton.textContent = "Rename";
  categoryDeleteButton.textContent = "Delete";
  categoryRenameButton.className = "category-menu-rename-button";
  categoryDeleteButton.className = "category-menu-delete-button";

  categoryDetailMenu.appendChild(categoryRenameButton);
  categoryDetailMenu.appendChild(categoryDeleteButton);

  document.addEventListener("click", (e) => {
    if (!wrapper.contains(e.target)) {
      categoryDetailMenu.remove();
    }
  });

  //handle renaming
  const categoryButton = wrapper.querySelector(".category-item");
  categoryRenameButton.addEventListener("click", () => {

    const renameSpace = document.createElement("input");
    renameSpace.value = categoryButton.textContent;
    renameSpace.className = "category-input";

    const oldName = categoryButton.getAttribute("data-category");
    categoryButton.replaceWith(renameSpace);
    renameSpace.select();

  async function saveRename() {
    const safeName = renameSpace.value.trim().slice(0, 50) || oldName;
    const index = categories.indexOf(oldName);
    categories[index] = safeName;
    await setStorage({ categories });
    renderCategories(categories);
  }

    categoryDetailMenu.remove();

    renameSpace.addEventListener("keydown", async (e) => {
      if (e.key === "Enter") {
        await saveRename();
      }
    });

    renameSpace.addEventListener("blur", async () => {
      await saveRename();
    });
  });


  //handle deleting
  categoryDeleteButton.addEventListener('click', async () => {
    const nameToDelete = categoryButton.getAttribute('data-category');
    document.getElementById('delete-confirmation-message').textContent = `Are you sure you want to delete the category "${nameToDelete}"?`;

    document.getElementById('delete-confirmation-overlay').classList.add('visible');

    document.getElementById('delete-confirmation-confirm').addEventListener('click', async () => {
      const updatedCategories = categories.filter((cat) => cat !== nameToDelete);
      await setStorage({ categories: updatedCategories });
      renderCategories(updatedCategories);

      document.getElementById('delete-confirmation-overlay').classList.remove('visible');
    }, {once: true});

    document.getElementById('delete-confirmation-cancel').addEventListener('click', () => {
       document.getElementById('delete-confirmation-overlay').classList.remove('visible');
    }, {once: true});
  });
  return categoryDetailMenu;
}


async function renderAndFilterBookmarks(category) {
  const result = await getStorage('bookmarks');
  const bookmarks = result.bookmarks || [];

  if(category === 'All') {
    renderBookmarks(bookmarks);
  } else {
    const filtered = bookmarks.filter((b) => b.category === category);
    renderBookmarks(filtered);
  }
}


function createCategoryWrapper(category, categories) {
  const wrapper = document.createElement("div");
  wrapper.className = "category-item-wrapper";

  const button = document.createElement("button");
  button.className = "category-item";
  button.textContent = category;
  button.setAttribute("data-category", category);

  if (category === "All") {
    button.classList.add("active");
  }

  wrapper.appendChild(button);

  if (category !== "All") {
    const dotsBtn = document.createElement("button");
    dotsBtn.className = "dots-btn";
    dotsBtn.textContent = "⋮";

    dotsBtn.addEventListener("click", () => {
      const menu = createCategoryDetailMenu(wrapper, categories);
      wrapper.appendChild(menu);
    });

    wrapper.appendChild(dotsBtn);
  }

  button.addEventListener('click', () => {
  document.querySelectorAll('.category-item').forEach((btn) => {
    btn.classList.remove('active');
  });
    button.classList.add('active');
    setActiveCategory(category);
    renderAndFilterBookmarks(category);
  });

  return wrapper;
}

function renderCategories(categories) {
  const list = document.getElementById("categories-list");
  list.innerHTML = "";

  categories.forEach((category) => {
    const wrapper = createCategoryWrapper(category, categories);
    list.appendChild(wrapper);
  });
}

export async function initCategories() {
  const result = await getStorage("categories");
  renderCategories(result.categories || ["All"]);

  document
    .getElementById("new-category-btn")
    .addEventListener("click", async () => {
      const result = await getStorage("categories");
      const categories = result.categories || ["All"];
      const nonAllCategories = categories.filter(
        (category) => category !== "All",
      );
      const count = nonAllCategories.length;
      const newName = "Category " + (count + 1);

      categories.push(newName);
      await setStorage({ categories: categories });

      const inputElement = document.createElement("input");
      inputElement.className = "category-input";
      inputElement.value = newName;
      document.getElementById("categories-list").appendChild(inputElement);
      inputElement.select();

      async function saveNewCategory() {
        const safeName = inputElement.value.trim().slice(0, 50) || newName;
        categories[categories.length - 1] = safeName;
        await setStorage({ categories });
        renderCategories(categories);
      }

      inputElement.addEventListener("keydown", async (e) => {
        if (e.key === "Enter") {
          await saveNewCategory();
        }
      });

      inputElement.addEventListener("blur", async () => {
        await saveNewCategory();
      });
    });
}
