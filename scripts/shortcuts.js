export function initShortcuts() {
  const input = document.getElementById('search-input');

  window.addEventListener('keydown', (e) => {
    if (
      document.activeElement.tagName === 'INPUT' ||
      document.activeElement.tagName === 'TEXTAREA'
    ) {
      return;
    }

    if (e.key === '/') {
      e.preventDefault();
      input.focus();
    }
  });
}