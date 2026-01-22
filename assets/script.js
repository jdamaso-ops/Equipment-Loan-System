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
    const studentEmail = document.getElementById('studentEmail').value;
    const equipmentType = document.getElementById('equipmentType').value;
    const equipmentId = document.getElementById('equipmentId').value;
    const dueDate = document.getElementById('dueDate').value;
    const notes = document.getElementById('notes').value;

    try {
        // Insert into loans table
        const { data: loanData, error: loanError } = await supabase
            .from('loans')
            .insert([
                {
                    student_name: studentName,
                    student_email: studentEmail,
                    equipment_type: equipmentType,
                    equipment_id: equipmentId,
                    due_date: dueDate,
                    notes: notes,
                    status: 'On Loan',
                    checkout_date: new Date().toISOString().split('T')[0]
                }
            ]);
        
        if (loanError) throw loanError;

        // Update equipment status
        const { error: equipmentError } = await supabase
            .from('equipment')
            .update({ status: 'On Loan' })
            .eq('equipment_id', equipmentId);
        
        if (equipmentError) throw equipmentError;

        // Show success message
        successMessage.style.display = 'block';
        errorMessage.style.display = 'none';
        checkoutForm.reset();

        // Reload loans
        setTimeout(() => {
            loadActiveLoans();
            successMessage.style.display = 'none';
        }, 2000);

    } catch (error) {
        console.error('Error:', error);
        errorText.textContent = error.message;
        errorMessage.style.display = 'block';
        successMessage.style.display = 'none';
    }
});

// Load and display active loans
async function loadActiveLoans() {
    try {
        const { data: loans, error } = await supabase
            .from('loans')
            .select('*')
            .order('due_date', { ascending: true });
        
        if (error) throw error;

        if (! loans || loans.length === 0) {
            loansBody.innerHTML = `<tr><td colspan="6">No active loans</td></tr>`;
            return;
        }

        loansBody.innerHTML = loans.map(loan => {
            const today = new Date().toISOString().split('T')[0];
            const isOverdue = loan.due_date < today;
            const statusClass = isOverdue ? 'overdue' : 'on-loan';
            const statusText = isOverdue ? 'Overdue' : 'On Loan';

            return `
                <tr>
                    <td>${loan.student_name}</td>
                    <td>${loan.equipment_type}</td>
                    <td>${loan.equipment_id}</td>
                    <td>${loan.due_date}</td>
                    <td><span class="status ${statusClass}">${statusText}</span></td>
                    <td><button class="btn-small" onclick="returnEquipment(${loan.id})">Return</button></td>
                </tr>
            `;
        }).join('');

    } catch (error) {
        console.error('Error loading loans:', error);
        loansBody.innerHTML = `<tr><td colspan="6">Error loading loans</td></tr>`;
    }
}

// Return equipment
async function returnEquipment(loanId) {
    try {
        // Get loan details
        const { data: loan, error: fetchError } = await supabase
            .from('loans')
            .select('equipment_id')
            .eq('id', loanId)
            .single();

        if (fetchError) throw fetchError;

        // Delete loan
        const { error: deleteError } = await supabase
            .from('loans')
            .delete()
            .eq('id', loanId);

        if (deleteError) throw deleteError;

        // Update equipment status back to Available
        const { error: equipmentError } = await supabase
            .from('equipment')
            .update({ status: 'Available' })
            .eq('equipment_id', loan.equipment_id);
        
        if (equipmentError) throw equipmentError;

        // Reload loans
        loadActiveLoans();

    } catch (error) {
        console.error('Error returning equipment', error);
        alert('Error returning equipment: ' + error.message);
    }
}

// Refresh loans every 30 seconds
setInterval(loadActiveLoans, 30000);