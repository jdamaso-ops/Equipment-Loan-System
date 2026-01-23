const SUPABASE_URL = 'https://zlfiwplfwzukyczvmlvv.supabase.co';
const SUPABASE_KEY = 'sb_publishable_54ZSuDcBHMTiUwqIuYPHgg_92qQoj2W';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Track equipment maintenance history
async function recordMaintenance(equipmentId, maintenanceType, notes) {
    try {
        await supabase. from('maintenance_log').insert([{
            equipment_id: equipmentId,
            maintenance_type: maintenanceType,
            notes: notes,
            date: new Date().toISOString().split('T')[0],
            technician: 'IT Staff'
        }]);

        await supabase
            .from('equipment')
            .update({
                last_maintenance: new Date().toISOString().split('T')[0],
                status: 'Available'
            })
            .eq('id', equipmentId);

        return true;
    } catch (error) {
        console.error('Maintenance error:', error);
        return false;
    }
}

// Get maintenance history for equipment
async function getMaintenanceHistory(equipmentId) {
    try {
        const { data:  history } = await supabase
            .from('maintenance_log')
            .select('*')
            .eq('equipment_id', equipmentId)
            .order('date', { ascending: false });

        return history || [];
    } catch (error) {
        console.error('Error fetching history:', error);
        return [];
    }
}

// Equipment health check
async function checkEquipmentHealth() {
    try {
        const { data: equipment } = await supabase
            .from('equipment')
            .select('*');

        const maintenanceNeeded = equipment.filter(item => {
            const lastMaintenance = new Date(item.last_maintenance);
            const daysSinceMaintenance = Math.floor((Date.now() - lastMaintenance) / (1000 * 60 * 60 * 24));
            return daysSinceMaintenance > 90 || item.status === 'Maintenance';
        });

        return maintenanceNeeded;
    } catch (error) {
        console.error('Error checking health:', error);
        return [];
    }
}