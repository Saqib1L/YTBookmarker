//Theme Toggle
function applyTheme(theme) {
  popup =  document.getElementById('popup');
  popup.setAttribute('data-theme', theme);

  if(theme === 'dark') {
    document.getElementById('icon-sun').style.display = 'block';
    document.getElementById('icon-moon').style.display = 'none';
  } else {
    document.getElementById('icon-sun').style.display = 'none';
    document.getElementById('icon-moon').style.display = 'block';
  }
}

document.getElementById('theme-toggle').addEventListener('click', () => {
  let currentTheme = popup.getAttribute('data-theme');
  let newTheme;

  if(currentTheme === 'dark') {
    newTheme = 'light';
  } else {
    newTheme = 'dark';
  }

  applyTheme(newTheme);
   chrome.storage.local.set({theme: newTheme})
});

chrome.storage.local.get('theme', (result) => {
  if(result.theme) {
    applyTheme(result.theme);
  } else {
    applyTheme('light');
  }
})

//Generate Categoires Dynamically
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


    dotsBtn.addEventListener('click', (event) => {
      const categoryDetailMenu = document.createElement('div');
      categoryDetailMenu.className = 'category-detail-menu';

      const categoryDeleteButton = document.createElement('button');
      const categoryRenameButton = document.createElement('button');
    
      categoryDeleteButton.textContent = 'Delete';
      categoryRenameButton.textContent = 'Rename';
      categoryDeleteButton.className = 'category-menu-delete-button';
      categoryRenameButton.className = 'category-menu-rename-button';

      categoryDetailMenu.appendChild(categoryDeleteButton);
      categoryDetailMenu.appendChild(categoryRenameButton);

      document.addEventListener('click', (e) => {
        if(!wrapper.contains(e.target)) {
          categoryDetailMenu.remove();
        }
      });

         wrapper.appendChild(categoryDetailMenu);
    });

     wrapper.appendChild(button);

    if(category !== 'All') {
      wrapper.appendChild(dotsBtn);
    }

    if(category === 'All') {
      button.classList.add('active');
    }

    list.appendChild(wrapper);
  }); 
}

chrome.storage.local.get('categories', (result) => {
  if (result.categories) {
    renderCategories(result.categories);
  } else {
    renderCategories(['All']);
  }
})

document.getElementById('new-category-btn').addEventListener('click', () => {
  chrome.storage.local.get('categories', (result) => {  
    
    const categories = result.categories || ['All'];
    const nonAllCategories = categories.filter((category) => category !== 'All');
    const count = nonAllCategories.length;
    const newName = 'Category ' + (count + 1);
  
    categories.push(newName);
    chrome.storage.local.set({categories: categories});

    const inputElement = document.createElement('input');
    inputElement.className = 'category-input';
    inputElement.value = newName;
    document.getElementById('categories-list').appendChild(inputElement);
    inputElement.select();

    inputElement.addEventListener('keydown', logKey);
    function logKey(e) {
     if(e.key === 'Enter') {
        categories[categories.length - 1] = inputElement.value || newName;
        chrome.storage.local.set({categories: categories});
        renderCategories(categories);
     }
    }

    inputElement.addEventListener('blur', () => {
      categories[categories.length - 1] = inputElement.value || newName;
      chrome.storage.local.set({categories: categories});
      renderCategories(categories);
    });
  });
});



