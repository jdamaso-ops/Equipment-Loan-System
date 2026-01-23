const SUPABASE_URL = 'https://zlfiwplfwzukyczvmlvv.supabase.co';
const SUPABASE_KEY = 'sb_publishable_54ZSuDcBHMTiUwqIuYPHgg_92qQoj2W';

const supabase = window. supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Generate reports based on type
async function generateReport() {
    const reportType = document.getElementById('reportType').value;

    if (reportType === 'by-date') {
        document.getElementById('dateRangeGroup').style.display = 'block';
    } else {
        document.getElementById('dateRangeGroup').style.display = 'none';
    }

    let data, title;

    try {
        switch (reportType) {
            case 'all-loans':
                data = await getAllLoans();
                title = 'All Loans Report';
                break;
            case 'overdue':
                data = await getOverdueLoans();
                title = 'Overdue Loans Report';
                break;
            case 'by-equipment': 
                data = await getLoansByEquipment();
                title = 'Loans by Equipment Report';
                break;
            case 'by-student':
                data = await getLoansByStudent();
                title = 'Loans by Student Report';
                break;
            case 'by-date': 
                data = await getLoansByDateRange();
                title = 'Loans by Date Range Report';
                break;
        }

        document.getElementById('reportTitle').textContent = title;
        displayReport(data);

    } catch (error) {
        console.error('Error generating report:', error);
        alert('Error generating report: ' + error.message);
    }
}

async function getAllLoans() {
    const { data } = await supabase
        . from('loan_history')
        .select('*')
        .order('checkout_date', { ascending: false });
    return data || [];
}

async function getOverdueLoans() {
    const today = new Date().toISOString().split('T')[0];
    const { data } = await supabase
        . from('loans')
        .select('*')
        .lt('due_date', today);
    return data || [];
}

async function getLoansByEquipment() {
    const { data } = await supabase
        . from('loan_history')
        .select('*')
        .order('equipment_type');
    return data || [];
}

async function getLoansByStudent() {
    const { data } = await supabase
        .from('loan_history')
        .select('*')
        .order('student_name');
    return data || [];
}

async function getLoansByDateRange() {
    const start = document.getElementById('startDate').value;
    const end = document. getElementById('endDate').value;

    if (!start || !end) {
        alert('Please select date range');
        return [];
    }

    const { data } = await supabase
        .from('loan_history')
        .select('*')
        .gte('checkout_date', start)
        .lte('checkout_date', end);

    return data || [];
}

function displayReport(data) {
    const tbody = document.getElementById('reportBody');

    if (! data || data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5">No data available</td></tr>';
        return;
    }

    tbody.innerHTML = data.map(item => {
        const checkout = new Date(item.checkout_date);
        const returnDate = item.return_date ? new Date(item.return_date) : new Date();
        const days = Math.floor((returnDate - checkout) / (1000 * 60 * 60 * 24));

        return `
            <tr>
                <td>${item.student_name}</td>
                <td>${item. equipment_type}</td>
                <td>${item.checkout_date}</td>
                <td>${item.return_date || 'Still On Loan'}</td>
                <td>${days} days</td>
            </tr>
        `;
    }).join('');
}

function exportReport() {
    const table = document.getElementById('reportTable');
    let csv = 'Student,Equipment,Checkout,Return,Duration\n';

    const rows = table.querySelectorAll('tbody tr');
    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length > 1) {
            csv += Array.from(cells).map(cell => `"${cell.textContent}"`).join(',') + '\n';
        }
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document. createElement('a');
    a.href = url;
    a. download = `equipment-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
}

// Load report on page load
generateReport();