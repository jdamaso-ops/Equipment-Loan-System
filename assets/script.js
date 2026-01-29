// Supabase Configuration
const SUPABASE_URL = 'https://zlfiwplfwzukyczvmlvv.supabase.co';
const SUPABASE_KEY = 'sb_publishable_54ZSuDcBHMTiUwqIuYPHgg_92qQoj2W';

// Supabase client will be initialized after library loads
let supabaseClient;

// DOM Elements - these will be populated in DOMContentLoaded
let checkoutForm;
let successMessage;
let errorMessage;
let errorText;
let loansBody;
let equipmentTypeInput;
let equipmentIdInput;
let generateIdBtn;
let mobileMenuBtn;
let mobileMenu;

// Add Supabase library to page and initialize client
function loadSupabase() {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js';
        script.onload = () => {
            try {
                if (!window.supabase || !window.supabase.createClient) {
                    throw new Error('Supabase library failed to attach to window');
                }
                // Initialize Supabase Client with session persistence
                supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
                    auth: {
                        persistSession: true,
                        storageKey: 'equipment-loan-auth',
                        storage: window.localStorage
                    }
                });
                resolve();
            } catch (err) {
                reject(err);
            }
        };
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

// Generate a formatted equipment ID based on type prefix
function generateEquipmentId() {
    if (!equipmentTypeInput) return 'EQX-' + Math.floor(100000 + Math.random() * 900000);
    const type = (equipmentTypeInput.value || 'EQ').replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    const prefix = (type.slice(0, 3) || 'EQ').padEnd(3, 'X');
    const suffix = Math.floor(100000 + Math.random() * 900000); // 6-digit random
    return `${prefix}-${suffix}`;
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Initialize all DOM elements
        checkoutForm = document.getElementById('checkoutForm');
        successMessage = document.getElementById('successMessage');
        errorMessage = document.getElementById('errorMessage');
        errorText = document.getElementById('errorText');
        loansBody = document.getElementById('loansBody');
        equipmentTypeInput = document.getElementById('equipmentType');
        equipmentIdInput = document.getElementById('equipmentId');
        generateIdBtn = document.getElementById('generateIdBtn');
        mobileMenuBtn = document.getElementById('mobileMenuBtn');
        mobileMenu = document.getElementById('mobileMenu');

        // Setup mobile menu toggle
        if (mobileMenuBtn && mobileMenu) {
            mobileMenuBtn.addEventListener('click', () => {
                mobileMenu.classList.toggle('hidden');
            });

            // Close menu when a link is clicked
            mobileMenu.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', () => {
                    mobileMenu.classList.add('hidden');
                });
            });
        }

        await loadSupabase();
        
        // Load active loans if the element exists
        if (loansBody) {
            loadActiveLoans();
        }

        // Wire up the ID generator button
        if (generateIdBtn && equipmentIdInput) {
            generateIdBtn.addEventListener('click', () => {
                equipmentIdInput.value = generateEquipmentId();
                equipmentIdInput.focus();
            });
        }

        // Handle form submission - only after Supabase is loaded
        if (checkoutForm) {
            checkoutForm.addEventListener('submit', async (e) => {
                e.preventDefault();

                if (!supabaseClient) {
                    if (errorText) errorText.textContent = 'Database not initialized';
                    if (errorMessage) errorMessage.style.display = 'block';
                    return;
                }

                const studentName = document.getElementById('studentName').value;
                const studentEmail = document.getElementById('studentEmail').value;
                const equipmentType = equipmentTypeInput.value;
                const equipmentId = equipmentIdInput.value;
                const dueDate = document.getElementById('dueDate').value;
                const notes = document.getElementById('notes').value;

                try {
                    // Insert into loans table
                    const { data: loanData, error: loanError } = await supabaseClient
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
                    const { error: equipmentError } = await supabaseClient
                        .from('equipment')
                        .update({ status: 'On Loan' })
                        .eq('equipment_id', equipmentId);
                    
                    if (equipmentError) throw equipmentError;

                    // Show success message
                    if (successMessage) successMessage.style.display = 'block';
                    if (errorMessage) errorMessage.style.display = 'none';
                    checkoutForm.reset();

                    // Reload loans
                    setTimeout(() => {
                        if (loansBody) loadActiveLoans();
                        if (successMessage) successMessage.style.display = 'none';
                    }, 2000);

                } catch (error) {
                    console.error('Error:', error);
                    if (errorText) errorText.textContent = error.message;
                    if (errorMessage) errorMessage.style.display = 'block';
                    if (successMessage) successMessage.style.display = 'none';
                }
            });
        }

    } catch (error) {
        console.error('Failed to load Supabase:', error);
        if (loansBody) {
            loansBody.innerHTML = `<tr><td colspan="6" class="px-4 py-6 text-center text-red-500">Error loading database connection: ${error.message}</td></tr>`;
        }
    }
});

// Load and display active loans
async function loadActiveLoans() {
    if (!supabaseClient) {
        console.error('Supabase not initialized');
        if (loansBody) {
            loansBody.innerHTML = `<tr><td colspan="6" class="px-4 py-6 text-center text-red-500">Database not initialized</td></tr>`;
        }
        return;
    }

    try {
        const { data: loans, error } = await supabaseClient
            .from('loans')
            .select('*')
            .order('due_date', { ascending: true });
        
        if (error) throw error;

        if (! loans || loans.length === 0) {
            loansBody.innerHTML = `<tr><td colspan="6" class="px-4 py-6 text-center text-gray-500">No active loans</td></tr>`;
            return;
        }

        loansBody.innerHTML = loans.map(loan => {
            const today = new Date().toISOString().split('T')[0];
            const isOverdue = loan.due_date < today;
            const statusClass = isOverdue ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800';
            const statusText = isOverdue ? 'Overdue' : 'On Loan';

            return `
                <tr class="border-b border-gray-300 hover:bg-gray-50">
                    <td class="px-4 py-3 text-gray-700">${loan.student_name}</td>
                    <td class="px-4 py-3 text-gray-700">${loan.equipment_type}</td>
                    <td class="px-4 py-3 text-gray-700">${loan.equipment_id}</td>
                    <td class="px-4 py-3 text-gray-700">${loan.due_date}</td>
                    <td class="px-4 py-3"><span class="inline-block px-2 py-1 rounded text-xs font-semibold ${statusClass}">${statusText}</span></td>
                    <td class="px-4 py-3"><button class="bg-indigo-600 text-white px-3 py-1 rounded text-sm hover:bg-indigo-700" onclick="returnEquipment(${loan.id})">Return</button></td>
                </tr>
            `;
        }).join('');

    } catch (error) {
        console.error('Error loading loans:', error);
        if (loansBody) {
            loansBody.innerHTML = `<tr><td colspan="6" class="px-4 py-6 text-center text-red-500">Error loading loans: ${error.message}</td></tr>`;
        }
    }
}

// Return equipment
async function returnEquipment(loanId) {
    try {
        // Get loan details
        const { data: loan, error: fetchError } = await supabaseClient
            .from('loans')
            .select('*')
            .eq('id', loanId)
            .single();

        if (fetchError) throw fetchError;

        // Move to loan history
        const { error: historyError } = await supabaseClient
            .from('loan_history')
            .insert([{
                student_name: loan.student_name,
                student_email: loan.student_email,
                equipment_type: loan.equipment_type,
                equipment_id: loan.equipment_id,
                checkout_date: loan.checkout_date,
                return_date: new Date().toISOString().split('T')[0]
            }]);

        if (historyError) throw historyError;

        // Delete loan after successful history insert
        const { error: deleteError } = await supabaseClient
            .from('loans')
            .delete()
            .eq('id', loanId);

        if (deleteError) throw deleteError;

        // Update equipment status back to Available
        const { error: equipmentError } = await supabaseClient
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