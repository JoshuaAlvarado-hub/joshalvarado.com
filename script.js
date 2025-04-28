document.addEventListener('DOMContentLoaded', () => {
    const menuButton = document.querySelector('.menu-button');
    const navItems = document.querySelector('.nav-items');

    menuButton.addEventListener('click', () => {
        navItems.classList.toggle('active');
    });
});