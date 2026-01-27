const SUPABASE_URL = 'https://zlfiwplfwzukyczvmlvv.supabase.co';
const SUPABASE_KEY = 'sb_publishable_54ZSuDcBHMTiUwqIuYPHgg_92qQoj2W';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let currentUser = null;

// DOM Elements
const loginSection = document.getElementById('loginSection');
const registerSection = document.getElementById('registerSection');
const dashboardSection = document.getElementById('dashboardSection');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const logoutBtn = document.getElementById('logoutBtn');

// Toggle between login and register
document.getElementById('switchToRegister').addEventListener('click', (e) => {
    e.preventDefault();
    loginSection.style.display = 'none';
    registerSection.style.display = 'block';
});

document.getElementById('switchToLogin').addEventListener('click', (e) => {
    e.preventDefault();
    loginSection.style.display = 'block';
    registerSection.style.display = 'none';
});

// Register
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirm = document.getElementById('registerConfirm').value;

    if (password !== confirm) {
        showError('Passwords do not match');
        return;
    }

    try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { full_name: name }
            }
        });

        if (error) throw error;

        // Create student profile
        await supabase.from('students').insert([{
            user_id: data.user.id,
            name,
            email
        }]);

        showSuccess('Account created! Please check your email to verify.');
        loginSection.style.display = 'block';
        registerSection.style.display = 'none';
        registerForm.reset();
    } catch (error) {
        showError(error.message);
    }
});

// Login
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) throw error;

        currentUser = data.user;
        loginSection.style.display = 'none';
        dashboardSection.style.display = 'block';
        logoutBtn.style.display = 'inline-block';

        loadStudentLoans();
        loadLoanHistory();

    } catch (error) {
        showError(error.message);
    }
});

// Logout
logoutBtn.addEventListener('click', async () => {
    await supabase.auth.signOut();
    currentUser = null;
    loginSection.style.display = 'block';
    dashboardSection.style.display = 'none';
    logoutBtn.style.display = 'none';
    loginForm.reset();
});

// Load student's active loans
async function loadStudentLoans() {
    try {
        const { data: loans, error } = await supabase
            .from('loans')
            .select('*')
            .eq('student_email', currentUser.email)
            .eq('status', 'On Loan');

        if (error) throw error;

        const tbody = document.getElementById('studentLoansBody');
        if (!loans || loans.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5">No active loans</td></tr>';;
            return;
        }

        tbody.innerHTML = loans.map(loan => {
            const today = new Date().toISOString().split('T')[0];
            const isOverdue = loan.due_date < today;
            const statusClass = isOverdue ? 'overdue' : 'on-loan';
            const statusText = isOverdue ? 'Overdue' : 'On Loan';

            return `
                <tr>
                    <td>${loan.equipment_type}</td>
                    <td>${loan.equipment_id}</td>
                    <td>${loan.checkout_date}</td>
                    <td>${loan.due_date}</td>
                    <td><span class="status ${statusClass}">${statusText}</span></td>
                </tr>
            `;
        }).join('');

    } catch (error) {
        console.error('Error:', error);
        document.getElementById('studentLoansBody').innerHTML = '<tr><td colspan="5">Error loading loans</td></tr>';
    }
}

// Load loan history
async function loadLoanHistory() {
    try {
        const { data: history, error } = await supabase
            .from('loan_history')
            .select('*')
            .eq('student_email', currentUser.email)
            .order('return_date', { ascending: false });

        if (error) throw error;

        const tbody = document.getElementById('historyBody');
        if (!history || history.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4">No history yet</td></tr>';
            return;
        }

        tbody. innerHTML = history.map(item => {
            const checkout = new Date(item.checkout_date);
            const returnDate = new Date(item.return_date);
            const days = Math.floor((returnDate - checkout) / (1000 * 60 * 60 * 24));

            return `
                <tr>
                    <td>${item. equipment_type}</td>
                    <td>${item.checkout_date}</td>
                    <td>${item.return_date}</td>
                    <td>${days} days</td>
                </tr>
            `;
        }).join('');

    } catch (error) {
        console.error('Error:', error);
    }
}

function showError(message) {
    document.getElementById('errorText').textContent = message;
    document.getElementById('errorMessage').style.display = 'block';
    document.getElementById('successMessage').style.display = 'none';
    setTimeout(() => {
        document.getElementById('errorMessage').style.display = 'none';
    }, 5000);
}

function showSuccess(message) {
    document.getElementById('successText').textContent = message;
    document.getElementById('successMessage').style.display = 'block';
    document. getElementById('errorMessage').style.display = 'none';
    setTimeout(() => {
        document.getElementById('successMessage').style.display = 'none';
    }, 5000);
}

// Check if user is already logged in
supabase.auth.onAuthStateChange((event, session) => {
    if (session) {
        currentUser = session.user;
        loginSection.style.display = 'none';
        dashboardSection.style.display = 'block';
        logoutBtn.style.display = 'inline-block';
        loadStudentLoans();
        loadLoanHistory();
    }
});