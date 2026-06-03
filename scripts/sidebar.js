import { getStorage, setStorage } from "./storage.js";

const SIDEBAR_MAX_WIDTH = 190;
const SIDEBAR_DEFAULT_WIDTH = 140;
const SIDEBAR_SNAP_THRESHOLD = 80;

let isResizing = false;
let startX = 0;
let startWidth = 0;

async function snapSidebarClosed(sidebar, handle, pointerId) {
  isResizing = false;
  sidebar.style.width = '0';
  sidebar.style.transition = '';
  sidebar.classList.add('collapsed');
  updateToggleIcon(true);
  handle.classList.remove('is-resizing');
  document.body.classList.remove('is-resizing');
  handle.releasePointerCapture(pointerId);
  await setStorage({ sidebarWidth: 0 });
}

function updateToggleIcon(isCollapsed) {
  document.getElementById('sidebar-icon-open').style.display = isCollapsed ? 'none' : 'block';
  document.getElementById('sidebar-icon-closed').style.display = isCollapsed ? 'block' : 'none';
}

function initSidebarResize(sidebar, handle) {
  handle.addEventListener('pointerdown', (e) => {

    isResizing = true;
    startX = e.clientX;

    startWidth = parseInt(sidebar.style.width || sidebar.offsetWidth, 10);

    handle.setPointerCapture(e.pointerId);
    sidebar.style.transition = 'none';

    handle.classList.add('is-resizing');
    document.body.classList.add('is-resizing');
  });

  handle.addEventListener('pointermove', async (e) => {
    if (!isResizing) return;

    const newWidth = startWidth + (e.clientX - startX);

    if (newWidth >= SIDEBAR_SNAP_THRESHOLD) {
      sidebar.style.width = `${Math.min(newWidth, SIDEBAR_MAX_WIDTH)}px`;
    } else {
      await snapSidebarClosed(sidebar, handle, e.pointerId);
    }
  });

  handle.addEventListener('pointerup', async (e) => {
    if (!isResizing) return;
    isResizing = false;

    const currentWidth = parseInt(sidebar.style.width, 10);

    sidebar.style.transition = '';
    handle.classList.remove('is-resizing');
    document.body.classList.remove('is-resizing');

    if (currentWidth < SIDEBAR_SNAP_THRESHOLD) {
      sidebar.style.width = '0';
      sidebar.classList.add('collapsed');
      updateToggleIcon(true);
      await setStorage({ sidebarWidth: 0});
    } else {
      const clampedWidth = Math.min(currentWidth, SIDEBAR_MAX_WIDTH);
      sidebar.style.width = `${clampedWidth}px`;
      sidebar.classList.remove('collapsed');
      updateToggleIcon(false);
      await setStorage({ sidebarWidth: clampedWidth });
    }
  });
}

function initSidebarToggle(sidebar, toggleBtn) {
  toggleBtn.addEventListener('click', async () => {
    const isCollapsed = sidebar.classList.contains('collapsed');

    if (isCollapsed) {
      sidebar.style.width = `${SIDEBAR_DEFAULT_WIDTH}px`;
      sidebar.classList.remove('collapsed');
      updateToggleIcon(false);
      await setStorage({ sidebarWidth: SIDEBAR_DEFAULT_WIDTH });
    } else {
      sidebar.style.width = '0';
      sidebar.classList.add('collapsed');
      await setStorage({ sidebarWidth: 0 });
      updateToggleIcon(true);
    }
  });
}

export async function initSidebar() {
  const sidebar = document.getElementById('sidebar');
  const handle = document.getElementById('sidebar-resize-handle');
  const toggleBtn = document.getElementById('sidebar-toggle-btn');

  const result = await getStorage('sidebarWidth');
  const savedWidth = result.sidebarWidth ?? SIDEBAR_MAX_WIDTH;

  if (savedWidth === 0) {
  sidebar.classList.add('collapsed');
  } else {
    sidebar.style.width = `${savedWidth}px`;
  }
  updateToggleIcon(savedWidth === 0);

  initSidebarResize(sidebar, handle);
  initSidebarToggle(sidebar, toggleBtn);
}