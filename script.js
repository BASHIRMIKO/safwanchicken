document.addEventListener('DOMContentLoaded', () => {
  const page = document.body.dataset.page;

  document.querySelectorAll('.nav-item').forEach((item) => {
    const href = item.getAttribute('href');
    if (page && href && href.includes(page + '.html')) {
      item.classList.add('active');
    }
  });

  document.querySelectorAll('.add-button').forEach((button) => {
    button.addEventListener('click', () => {
      button.classList.add('success');
      const icon = button.querySelector('.material-symbols-outlined');
      if (icon) {
        const prev = icon.textContent;
        icon.textContent = 'done';
        setTimeout(() => {
          icon.textContent = prev;
          button.classList.remove('success');
        }, 1000);
      }
    });
  });

  const toast = document.querySelector('.toast');
  const form = document.querySelector('#contactForm');

  if (form) {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      if (toast) {
        toast.textContent = 'Message sent successfully!';
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 1800);
      }
      form.reset();
    });
  }

  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach((item) => {
    item.addEventListener('click', () => {
      navItems.forEach((nav) => nav.classList.remove('active'));
      item.classList.add('active');
    });
  });

  document.querySelectorAll('.filter-chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.filter-chip').forEach((el) => el.classList.remove('active'));
      chip.classList.add('active');
    });
  });
});
