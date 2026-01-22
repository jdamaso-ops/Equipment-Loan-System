// Supabase Configuration
const SUPABASE_URL = 'https://zlfiwplfwzukyczvmlvv.supabase.co';
const SUPABASE_KEY = 'sb_publishable_54ZSuDcBHMTiUwqIuYPHgg_92qQoj2W';

// Initialize Supabase Client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// DOM Elements
const checkoutForm = document.getElementById('checkoutForm');
const successMessage = document.getElementById('successMessage');
const errorMessage = document.getElementById('errorMessage');
const errorText = document.getElementById('errorText');
const loansBody = document.getElementById('loansBody');

// Add Supabase library to page
function loadSupabase() {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js';
    document.head.appendChild(script);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    loadSupabase();
    setTimeout(() => {
        loadActiveLoans();
     }, 1000); // Wait for Supabase to load
});

// Handle form submission
checkoutForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const studentName = document.getElementById('studentName').value;

})