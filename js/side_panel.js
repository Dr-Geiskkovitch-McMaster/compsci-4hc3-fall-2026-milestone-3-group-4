

const menuButton = document.querySelector('.nav-button');
const panel = document.querySelector('#side-panel');
const panelScrim = document.querySelector('#panel-scrim');

function openPanel() {
  panel.hidden = false;
  panelScrim.hidden = false;
}

function closePanel() {
  panel.hidden = true;
  panelScrim.hidden = true;
}

menuButton.addEventListener('click', openPanel);
panelScrim.addEventListener('click', closePanel);

panel.querySelectorAll('.panel-item').forEach(button => {
  button.addEventListener('click', () => {
    panel.querySelectorAll('.panel-item').forEach(item =>
      item.classList.remove('active')
    );
    button.classList.add('active');
    closepanel();
  });
});

document.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    closepanel();
    closeSearch();
  }
});
