import { getStorage, setStorage } from './storage.js';

export function applyTheme(theme) {
  const popup = document.getElementById('popup');
  popup.setAttribute('data-theme', theme);

  if (theme === 'dark') {
    document.getElementById('icon-sun').style.display = 'block';
    document.getElementById('icon-moon').style.display = 'none';
  } else {
    document.getElementById('icon-sun').style.display = 'none';
    document.getElementById('icon-moon').style.display = 'block';
  }
}

export async function initTheme() {
  try {
    const result = await getStorage('theme');
  applyTheme(result.theme || 'light');
  } catch (error) {
    console.error('Failed to load theme:', error);
    applyTheme('light');
  }

  document.getElementById('theme-toggle').addEventListener('click', async () => {
    const popup = document.getElementById('popup');
    const currentTheme = popup.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(newTheme);
    try {
     await setStorage({ theme: newTheme });
    } catch (error) {
      console.error("Failed to save theme: ", error);
    }
  });
}