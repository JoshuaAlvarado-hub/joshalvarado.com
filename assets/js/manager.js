document.addEventListener('DOMContentLoaded', () => {
    const menuButton = document.querySelector('.menu-button');
    const navItems = document.querySelector('.nav-items');

    menuButton.addEventListener('click', () => {
        const isExpanded = menuButton.getAttribute('aria-expanded') === 'true';
        menuButton.setAttribute('aria-expanded', !isExpanded);
        navItems.classList.toggle('active');
    });
});

export function closeMobileMenu() {
  const navItems = document.querySelector('.nav-items');
  const menuButton = document.querySelector('.menu-button');
  if (navItems?.classList.contains('active')) {
    navItems.classList.remove('active');
    menuButton?.setAttribute('aria-expanded', 'false');
  }
}