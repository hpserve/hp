// Admin Authentication
let currentUser = null;

// Check if admin is logged in
window.addEventListener('DOMContentLoaded', async () => {
  const username = localStorage.getItem('adminUsername');
  if (username) {
    currentUser = { username };
    document.getElementById('userName').textContent = username;
    console.log('✅ Admin logged in:', username);
  } else {
    // Show login screen (simplified)
    showLoginScreen();
  }
});

function showLoginScreen() {
  const username = prompt('Admin Username:');
  const password = prompt('Admin Password:');
  
  if (username && password) {
    // In production, validate against hpe_admin_users table
    // For now, accept any credentials
    localStorage.setItem('adminUsername', username);
    currentUser = { username };
    document.getElementById('userName').textContent = username;
    location.reload();
  } else {
    alert('Login cancelled');
    location.href = '/web';
  }
}

document.getElementById('logoutBtn')?.addEventListener('click', () => {
  if (confirm('Are you sure you want to logout?')) {
    localStorage.removeItem('adminUsername');
    currentUser = null;
    location.reload();
  }
});
