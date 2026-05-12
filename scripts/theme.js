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
  const result = await getStorage('theme');
  applyTheme(result.theme || 'light');

  document.getElementById('theme-toggle').addEventListener('click', async () => {
    const popup = document.getElementById('popup');
    const currentTheme = popup.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(newTheme);
    await setStorage({ theme: newTheme });
  });
}