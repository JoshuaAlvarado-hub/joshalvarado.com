// Mobile
document.addEventListener('DOMContentLoaded', () => {
  const menuButton = document.querySelector('.menu-button');
  const navItems = document.querySelector('.nav-items');

  if (menuButton && navItems) {
    menuButton.addEventListener('click', () => {
      const isExpanded = menuButton.getAttribute('aria-expanded') === 'true';
      menuButton.setAttribute('aria-expanded', !isExpanded);
      navItems.classList.toggle('active');
    });
  }

  // Cookie Banner
  const banner = document.getElementById('cookie-banner');
  const acceptBtn = document.getElementById('accept-cookies');

  if (banner && acceptBtn) {
    if (!hasConsentedToCookies()) {
      banner.style.display = 'block';
    }

    acceptBtn.addEventListener('click', () => {
      localStorage.setItem('cookieConsent', 'true');
      banner.style.display = 'none';
    });
  }
});

export function closeMobileMenu() {
  const navItems = document.querySelector('.nav-items');
  const menuButton = document.querySelector('.menu-button');
  if (navItems?.classList.contains('active')) {
    navItems.classList.remove('active');
    menuButton?.setAttribute('aria-expanded', 'false');
  }
}

// Helpers
function hasConsentedToCookies() {
  return localStorage.getItem('cookieConsent') === 'true';
}