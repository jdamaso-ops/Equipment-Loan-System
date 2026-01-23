import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const supabaseUrl = 'https://YOUR_SUPABASE_URL'; // Replace with your Supabase URL
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY'; // Replace with your Supabase Anon Key
const resendApiKey = 'YOUR_RESEND_API_KEY'; // Replace with your Resend API Key

const supabase = createClient(supabaseUrl, supabaseAnonKey);
const resend = new Resend(resendApiKey);

export default async function sendOverdueEmails() {
    try {
        // Fetch overdue loans from the database
        const { data: overdueLoans, error } = await supabase
            .from('loans')
            .select('id, email, due_date')
            .gt('due_date', new Date().toISOString());

        if (error) throw error;

        // Send email notifications to users with overdue loans
        for (const loan of overdueLoans) {
            await resend.sendEmail({
                from: 'noreply@yourdomain.com', // Replace with your sender email
                to: loan.email,
                subject: 'Overdue Loan Notification',
                text: `Hello,\n\nYour loan for item ID ${loan.id} is overdue as of ${loan.due_date}. Please return it as soon as possible.\n\nThank you!`
            });
        }

        console.log('Overdue emails sent successfully.');
    } catch (error) {
        console.error('Error sending overdue emails:', error);
    }
}