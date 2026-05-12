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


chrome.storage.local.get('theme', function(result) {
  if(result.theme) {
    applyTheme(result.theme);
  } else {
    applyTheme('light');
  }
})



