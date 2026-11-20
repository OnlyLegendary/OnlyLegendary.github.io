(() => {
  const toggle = document.querySelector('.menu-btn');
  const nav = document.querySelector('.nav-links');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const opened = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(opened));
      toggle.textContent = opened ? '×' : '☰';
    });
    nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.textContent = '☰';
    }));
  }
  const dialog = document.querySelector('.modal');
  const dialogImage = dialog?.querySelector('img');
  const dialogLabel = dialog?.querySelector('.modal-label');
  if (dialog && dialogImage) {
    document.querySelectorAll('button.zoom').forEach(button => {
      button.addEventListener('click', () => {
        const image = button.querySelector('img');
        if (!image) return;
        dialogImage.src = image.src;
        dialogImage.alt = image.alt;
        dialogLabel.textContent = image.alt;
        dialog.showModal();
      });
    });
    dialog.querySelector('.modal-close')?.addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => {if(event.target === dialog) dialog.close()});
  }
})();
