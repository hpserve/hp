// Admin Panel App
window.addEventListener('DOMContentLoaded', () => {
  setupNavigation();
});

function setupNavigation() {
  const navButtons = document.querySelectorAll('.nav-btn');
  const sections = document.querySelectorAll('.section');

  navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      // Remove active class from all buttons and sections
      navButtons.forEach(b => b.classList.remove('active'));
      sections.forEach(s => s.classList.remove('active'));

      // Add active class to clicked button and corresponding section
      btn.classList.add('active');
      const sectionId = btn.getAttribute('data-section');
      document.getElementById(sectionId).classList.add('active');
    });
  });
}
