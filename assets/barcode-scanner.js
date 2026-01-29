const SUPABASE_URL = 'https://zlfiwplfwzukyczvmlvv.supabase.co'
const SUPABASE_KEY = 'sb_publishable_54ZSuDcBHMTiUwqIuYPHgg_92qQoj2W'

let supabase;

// Initialize Supabase client with session persistence
document.addEventListener('DOMContentLoaded', () => {
    if (window.supabase) {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
            auth: {
                persistSession: true,
                storageKey: 'equipment-loan-auth',
                storage: window.localStorage
            }
        });
    }
});

let codeReader;
let scannedEquipmentId = null;
let scanHistory = [];

// Initialize barcode scanner
async function initScanner() {
    const video = document.getElementById('video');
    codeReader = new ZXing.BrowserMultiFormatReader();

    try {
        // List available video input devices (cameras)
        const videoInputDevices = await codeReader.listVideoInputDevices();
        
        if (videoInputDevices.length === 0) {
            throw new Error('No camera found on this device');
        }

        // Use the first available camera (or back camera on mobile if available)
        const selectedDeviceId = videoInputDevices[0].deviceId;

        const result = await codeReader.decodeFromVideoDevice(
            selectedDeviceId,
            'video',
            (result, err) => {
                if (result) {
                    handleBarcodeScan(result.getText());
                }
            }
        );
    } catch (err) {
        console.error('Error accessing camera:', err);
        alert('Unable to access camera. Please check permissions and ensure you are using HTTPS or localhost.');
    }
}

// Handle barcode scan
async function handleBarcodeScan(barcode) {
    scannedEquipmentId = barcode;

    try {
        // Look up equipment in database
        const { data: equipment } = await supabase
            .from('equipment')
            .select('*')
            .eq('equipment_id', barcode)
            .single();

        if (equipment) {
            document.getElementById('scannedId').textContent = equipment.equipment_id;
            document.getElementById('scannedType').textContent = equipment.equipment_type;
            document.getElementById('scannedInfo').style.display = 'block';
            document.getElementById('completeCheckout').style.display = 'block';

            // Log Scan
            scanHistory.unshift({
                id: barcode,
                time: new Date().toLocaleTimeString(),
                status: 'Scanned'
            });
            updateScanHistory();
        } else {
            alert('Equipment not found in database');
        }
    } catch (error) {
        console.error('Error looking up equipment:', error);
        alert('Error: Equipment not found');
    }
}

// Complete checkout after scan
document.getElementById('completeCheckout')?.addEventListener('click', async () => {
    const studentName = document.getElementById('scanStudentName').value;
    const studentEmail = document.getElementById('scanStudentEmail').value;
    const dueDate = document.getElementById('scanDueDate').value;

    if (!studentName || !studentEmail || !dueDate || !scannedEquipmentId) {
        alert('Please fill in all fields');
        return;
    }

    try {
        // Get equipment details
        const { data: equipment } = await supabase
            .from('equipment')
            .select('*')
            .eq('equipment_id', scannedEquipmentId)
            .single();

        // Create loan record
        await supabase.from('loans').insert([{
            student_name: studentName,
            student_email: studentEmail,
            equipment_type: equipment.equipment_type,
            equipment_id: equipment.equipment_id,
            due_date: dueDate,
            checkout_date: new Date().toISOString().split('T')[0],
            status: 'On Loan'
        }]);

        // Update equipment status
        await supabase
            .from('equipment')
            .update({ status: 'On Loan' })
            .eq('equipment_id', scannedEquipmentId);

        alert('Equipment checked out successfully!');
        resetForm();

    } catch (error) {
        alert('Error: ' + error.message);
    }
});

function updateScanHistory() {
    const tbody = document.getElementById('scanHistoryBody');
    tbody.innerHTML = scanHistory.map(item => `
        <tr>
            <td>${item.id}</td>
            <td>${item.time}</td>
            <td>${item.status}</td>
        </tr>
    `).join('');
}

function resetForm() {
    document.getElementById('scanStudentName').value = '';
    document.getElementById('scanStudentEmail').value = '';
    document.getElementById('scanDueDate').value = '';
    document.getElementById('scannedInfo').style.display = 'none';
    document.getElementById('completeCheckout').style.display = 'none';
    scannedEquipmentId = null;
}

// Initialize on page load
window.addEventListener('load', () => {
    setTimeout(initScanner, 500);
});