const SUPABASE_URL = 'https://zlfiwplfwzukyczvmlvv.supabase.co';
const SUPABASE_KEY = 'sb_publishable_54ZSuDcBHMTiUwqIuYPHgg_92qQoj2W';

let supabase;
let currentUser = null;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Initialize Supabase with session persistence
    if (window.supabase) {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
            auth: {
                persistSession: true,
                storageKey: 'equipment-loan-auth',
                storage: window.localStorage
            }
        });
    }
    
    // Check if user is logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
        if (!session) {
            // Not logged in, redirect to login page
            window.location.href = 'login.html';
            return;
        }
        
        // User is logged in
        currentUser = session.user;
        loadStudentLoans();
        loadLoanHistory();
    });
    
    // DOM Elements
    const logoutBtn = document.getElementById('logoutBtn');
    const logoutBtnMobile = document.getElementById('logoutBtnMobile');

    // Logout
    logoutBtn.addEventListener('click', async () => {
        await supabase.auth.signOut();
        window.location.href = 'login.html';
    });

    // Mobile logout button
    if (logoutBtnMobile) {
        logoutBtnMobile.addEventListener('click', async () => {
            await supabase.auth.signOut();
            window.location.href = 'login.html';
        });
    }
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