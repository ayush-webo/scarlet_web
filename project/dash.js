const SUPABASE_URL = 'https://zhsfxjpoppayrboheqmv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpoc2Z4anBvcHBheXJib2hlcW12Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4OTY1NTAsImV4cCI6MjA3NzQ3MjU1MH0.792xVQeISbnljaKTeloLsU0eASdv_5n1C--0u3r-uc0';

const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Theme toggle functionality
function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  
  // Update theme icon
  const themeIcon = document.querySelector('.theme-icon');
  themeIcon.textContent = newTheme === 'light' ? '☀️' : '🌙';
}

// Load saved theme
function loadTheme() {
  const savedTheme = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  
  const themeIcon = document.querySelector('.theme-icon');
  if (themeIcon) {
    themeIcon.textContent = savedTheme === 'light' ? '☀️' : '🌙';
  }
}

async function checkAuth() {
  const { data: { user } } = await supabaseClient.auth.getUser();
  
  if (!user) {
    window.location.href = 'login.html';
    return;
  }
  
  // Get profile data
  const { data: profile } = await supabaseClient
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();
  
  // Display user info
  const username = profile?.username || user.user_metadata?.username || 'Player';
  const firstLetter = username.charAt(0).toUpperCase();
  
  document.getElementById('username').textContent = username;
  document.getElementById('userDisplay').textContent = username;
  document.getElementById('navUsername').textContent = username;
  document.getElementById('userAvatar').textContent = firstLetter;
  document.getElementById('emailDisplay').textContent = user.email;
  document.getElementById('createdDisplay').textContent = new Date(user.created_at).toLocaleDateString();
  document.getElementById('verifiedDisplay').textContent = user.email_confirmed_at ? 'Verified ✓' : 'Pending';
  
  // Show content
  document.getElementById('loading').style.display = 'none';
  document.getElementById('content').style.display = 'block';
}

async function logout() {
  await supabaseClient.auth.signOut();
  window.location.href = 'login.html';
}

// Initialize on page load
window.addEventListener('DOMContentLoaded', () => {
  loadTheme();
  checkAuth();
});