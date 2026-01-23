const SUPABASE_URL = 'https://zlfiwplfwzukyczvmlvv.supabase.co';
const SUPABASE_KEY = 'sb_publishable_54ZSuDcBHMTiUwqIuYPHgg_92qQoj2W';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let currentAdmin = null;

// DOM Elements
const navButtons = document.querySelectorAll('.nav-btn');
const tabContents = document.querySelectorAll('.tab-content');

// Tab switching
navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        navButtons.forEach(b => b.classList.remove('active'));
        tabContents.forEach(t => t.classList.remove('active'));

        btn.classList.add('active');
        document.getElementById(btn.getAttribute('data-tab') + 'Tab').classList.add('active');

        if (btn.getAttribute('data-tab') === 'overview') loadOverview();
        if (btn.getAttribute('data-tab') === 'loans') loadActiveLoans();
        if (btn.getAttribute('data-tab') === 'equipment') loadEquipment();
        if (btn.getAttribute('data-tab') === 'students') loadStudents();
    });
});

// Load overview stats
async function loadOverview() {
    try {
        // Total equipment
        const { data: allEquip } = await supabase. from('equipment').select('*');
        document.getElementById('totalEquipment').textContent = allEquip?. length || 0;

        // Equipment on loan
        const { data: onLoan } = await supabase
            .from('equipment')
            .select('*')
            .eq('status', 'On Loan');
        document.getElementById('equipmentOnLoan').textContent = onLoan?.length || 0;

        // Overdue items
        const today = new Date().toISOString().split('T')[0];
        const { data: overdue } = await supabase
            .from('loans')
            .select('*')
            .lt('due_date', today);
        document.getElementById('overdueItems').textContent = overdue?.length || 0;

        // Active students
        const { data: students } = await supabase
            .from('loans')
            .select('student_email')
            .eq('status', 'On Loan');
        const uniqueStudents = new Set(students?.map(s => s.student_email) || []);
        document.getElementById('activeStudents').textContent = uniqueStudents.size;

        // Recent activity
        const { data: activity } = await supabase
            .from('loans')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(5);

        const activityHtml = activity?. map(item => `
            <tr>
                <td>${item. student_name}</td>
                <td>${item.equipment_type}</td>
                <td>Checked Out</td>
                <td>${item.created_at. split('T')[0]}</td>
            </tr>
        `).join('') || '<tr><td colspan="4">No recent activity</td></tr>';

        document.getElementById('recentActivityBody').innerHTML = activityHtml;

    } catch (error) {
        console.error('Error loading overview:', error);
    }
}

// Load active loans
async function loadActiveLoans() {
    try {
        const { data: loans } = await supabase
            . from('loans')
            .select('*')
            .eq('status', 'On Loan')
            .order('due_date', { ascending: true });

        const tbody = document.getElementById('loansTableBody');
        if (!loans || loans.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5">No active loans</td></tr>';
            return;
        }

        tbody.innerHTML = loans.map(loan => {
            const today = new Date().toISOString().split('T')[0];
            const isOverdue = loan.due_date < today;
            const statusClass = isOverdue ? 'overdue' : 'on-loan';

            return `
                <tr>
                    <td>${loan.student_name}</td>
                    <td>${loan.equipment_type}</td>
                    <td>${loan.due_date}</td>
                    <td><span class="status ${statusClass}">${isOverdue ? 'Overdue' : 'On Loan'}</span></td>
                    <td>
                        <button class="btn-small" onclick="returnEquipment(${loan.id})">Return</button>
                        <button class="btn-small" onclick="sendReminder(${loan.id})">Remind</button>
                    </td>
                </tr>
            `;
        }).join('');

    } catch (error) {
        console.error('Error:', error);
    }
}

// Load equipment
async function loadEquipment() {
    try {
        const { data: equipment } = await supabase
            . from('equipment')
            .select('*')
            .order('equipment_type');

        const tbody = document.getElementById('equipmentTableBody');
        if (!equipment || equipment.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5">No equipment</td></tr>';
            return;
        }

        tbody.innerHTML = equipment.map(item => `
            <tr>
                <td>${item.equipment_type}</td>
                <td>${item.equipment_id}</td>
                <td><span class="status ${item.status === 'Available' ? 'available' : 'on-loan'}">${item.status}</span></td>
                <td>${item.last_maintenance || 'Never'}</td>
                <td>
                    <button class="btn-small" onclick="editEquipment(${item.id})">Edit</button>
                    <button class="btn-small" onclick="markMaintenance(${item.id})">Maintenance</button>
                </td>
            </tr>
        `).join('');

    } catch (error) {
        console.error('Error:', error);
    }
}

// Load students
async function loadStudents() {
    try {
        const { data: students } = await supabase
            .from('students')
            .select('*')
            .order('name');

        const tbody = document. getElementById('studentsTableBody');
        if (!students || students.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4">No students</td></tr>';
            return;
        }

        tbody.innerHTML = await Promise.all(students.map(async (student) => {
            const { data: loans } = await supabase
                .from('loans')
                .select('*')
                .eq('student_email', student.email)
                .eq('status', 'On Loan');

            return `
                <tr>
                    <td>${student.name}</td>
                    <td>${student.email}</td>
                    <td>${loans?.length || 0}</td>
                    <td>${student.created_at.split('T')[0]}</td>
                </tr>
            `;
        })).then(rows => rows.join(''));

    } catch (error) {
        console.error('Error:', error);
    }
}

// Return equipment
async function returnEquipment(loanId) {
    try {
        const { data: loan } = await supabase
            .from('loans')
            .select('*')
            .eq('id', loanId)
            .single();

        await supabase
            .from('loans')
            .delete()
            .eq('id', loanId);

        // Move to history
        await supabase. from('loan_history').insert([{
            student_email: loan.student_email,
            student_name: loan.student_name,
            equipment_type: loan.equipment_type,
            equipment_id: loan.equipment_id,
            checkout_date: loan.checkout_date,
            return_date: new Date().toISOString().split('T')[0]
        }]);

        // Update equipment status
        await supabase
            .from('equipment')
            .update({ status: 'Available' })
            .eq('equipment_id', loan.equipment_id);

        loadActiveLoans();
        alert('Equipment returned successfully');

    } catch (error) {
        alert('Error:  ' + error.message);
    }
}

// Send reminder email
async function sendReminder(loanId) {
    try {
        const { data: loan } = await supabase
            . from('loans')
            .select('*')
            .eq('id', loanId)
            .single();

        // Call edge function
        await fetch('YOUR_SUPABASE_URL/functions/v1/send-reminder-email', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer YOUR_SUPABASE_KEY`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ loanId })
        });

        alert('Reminder sent to ' + loan.student_name);

    } catch (error) {
        alert('Error: ' + error.message);
    }
}

// Add equipment modal
function openAddEquipmentModal() {
    document.getElementById('equipmentModal').style.display = 'block';
}

function closeAddEquipmentModal() {
    document.getElementById('equipmentModal').style.display = 'none';
}

document.getElementById('addEquipmentForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    try {
        await supabase.from('equipment').insert([{
            equipment_type: document.getElementById('newEquipType').value,
            equipment_id: document.getElementById('newEquipId').value,
            status: document.getElementById('newEquipStatus').value
        }]);

        alert('Equipment added successfully');
        closeAddEquipmentModal();
        loadEquipment();
        document.getElementById('addEquipmentForm').reset();

    } catch (error) {
        alert('Error: ' + error.message);
    }
});

// Mark equipment for maintenance
async function markMaintenance(equipmentId) {
    try {
        await supabase
            .from('equipment')
            .update({ 
                status: 'Maintenance',
                last_maintenance: new Date().toISOString().split('T')[0]
            })
            .eq('id', equipmentId);

        loadEquipment();
        alert('Equipment marked for maintenance');

    } catch (error) {
        alert('Error: ' + error.message);
    }
}

// Generate loan report
async function generateLoanReport() {
    try {
        const { data: loans } = await supabase
            .from('loans')
            .select('*')
            .order('created_at', { ascending: false });

        const reportHtml = `
            <table>
                <thead>
                    <tr>
                        <th scope="col">Student</th>
                        <th scope="col">Equipment</th>
                        <th scope="col">Checkout</th>
                        <th scope="col">Due Date</th>
                        <th scope="col">Status</th>
                    </tr>
                </thead>
                <tbody>
                    ${loans?. map(loan => `
                        <tr>
                            <td>${loan.student_name}</td>
                            <td>${loan.equipment_type}</td>
                            <td>${loan.checkout_date}</td>
                            <td>${loan.due_date}</td>
                            <td>${loan.status}</td>
                        </tr>
                    `).join('') || ''}
                </tbody>
            </table>
        `;

        document.getElementById('loanReportContainer').innerHTML = reportHtml;

    } catch (error) {
        console.error('Error:', error);
    }
}

// Load overview on page load
loadOverview();