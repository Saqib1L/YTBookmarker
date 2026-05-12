import { getStorage, setStorage } from './storage.js';

function renderCategories(categories) {
  const list = document.getElementById('categories-list');
  list.innerHTML = '';

  categories.forEach((category) => {
    const button = document.createElement('button');
    const wrapper = document.createElement('div');

    button.className = 'category-item';
    button.textContent = category;
    button.setAttribute('data-category', category);

    wrapper.className = 'category-item-wrapper';

    const dotsBtn = document.createElement('button');
    dotsBtn.className = 'dots-btn';
    dotsBtn.textContent = '⋮';

    dotsBtn.addEventListener('click', () => {
      const categoryDetailMenu = document.createElement('div');
      categoryDetailMenu.className = 'category-detail-menu';

      const categoryDeleteButton = document.createElement('button');
      const categoryRenameButton = document.createElement('button');

      categoryDeleteButton.textContent = 'Delete';
      categoryRenameButton.textContent = 'Rename';
      categoryDeleteButton.className = 'category-menu-delete-button';
      categoryRenameButton.className = 'category-menu-rename-button';

      categoryDetailMenu.appendChild(categoryRenameButton);
      categoryDetailMenu.appendChild(categoryDeleteButton);

      document.addEventListener('click', (e) => {
        if (!wrapper.contains(e.target)) {
          categoryDetailMenu.remove();
        }
      });

      wrapper.appendChild(categoryDetailMenu);
    });

    wrapper.appendChild(button);

    if (category !== 'All') {
      wrapper.appendChild(dotsBtn);
    }

    if (category === 'All') {
      button.classList.add('active');
    }

    list.appendChild(wrapper);
  });
}

export async function initCategories() {
  const result = await getStorage('categories');
  renderCategories(result.categories || ['All']);

  document.getElementById('new-category-btn').addEventListener('click', async () => {
    const result = await getStorage('categories');
    const categories = result.categories || ['All'];
    const nonAllCategories = categories.filter((category) => category !== 'All');
    const count = nonAllCategories.length;
    const newName = 'Category ' + (count + 1);

    categories.push(newName);
    await setStorage({ categories: categories });

    const inputElement = document.createElement('input');
    inputElement.className = 'category-input';
    inputElement.value = newName;
    document.getElementById('categories-list').appendChild(inputElement);
    inputElement.select();

    async function saveCategory() {
      categories[categories.length - 1] = inputElement.value || newName;
      await setStorage({ categories: categories });
      renderCategories(categories);
    }

    inputElement.addEventListener('keydown', async (e) => {
      if (e.key === 'Enter') {
        await saveCategory();
      }
    });

    inputElement.addEventListener('blur', async () => {
      await saveCategory();
    });
  });
}