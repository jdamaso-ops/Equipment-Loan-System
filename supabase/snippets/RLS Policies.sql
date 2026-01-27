-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Equipment Loan System - Supabase PostgreSQL
-- =============================================

-- First, create a helper function to check if a user is an admin
-- You'll need an admin table or use Supabase's custom claims

-- Option 1: Create an admins table to track admin users
CREATE TABLE IF NOT EXISTS admins (
    id SERIAL PRIMARY KEY,
    user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Helper function to check if current user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM admins 
        WHERE user_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to get current user's email
CREATE OR REPLACE FUNCTION get_user_email()
RETURNS TEXT AS $$
BEGIN
    RETURN (
        SELECT email FROM auth.users 
        WHERE id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- STUDENTS TABLE RLS
-- =============================================
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

-- Admins can do everything
CREATE POLICY "Admins have full access to students"
ON students
FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- Students can view their own record
CREATE POLICY "Students can view own record"
ON students
FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR email = get_user_email());

-- Students can update their own record (phone number, etc.)
CREATE POLICY "Students can update own record"
ON students
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- =============================================
-- EQUIPMENT TABLE RLS
-- =============================================
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;

-- Admins have full access
CREATE POLICY "Admins have full access to equipment"
ON equipment
FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- All authenticated users can view equipment
CREATE POLICY "Authenticated users can view equipment"
ON equipment
FOR SELECT
TO authenticated
USING (true);

-- Allow anonymous users to view available equipment (for student portal)
CREATE POLICY "Anonymous users can view available equipment"
ON equipment
FOR SELECT
TO anon
USING (status = 'Available');

-- =============================================
-- LOANS TABLE RLS
-- =============================================
ALTER TABLE loans ENABLE ROW LEVEL SECURITY;

-- Admins have full access
CREATE POLICY "Admins have full access to loans"
ON loans
FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- Students can view their own loans
CREATE POLICY "Students can view own loans"
ON loans
FOR SELECT
TO authenticated
USING (student_email = get_user_email());

-- Students can create loan requests (checkout)
CREATE POLICY "Students can create loan requests"
ON loans
FOR INSERT
TO authenticated
WITH CHECK (student_email = get_user_email());

-- =============================================
-- LOAN_HISTORY TABLE RLS
-- =============================================
ALTER TABLE loan_history ENABLE ROW LEVEL SECURITY;

-- Admins have full access
CREATE POLICY "Admins have full access to loan_history"
ON loan_history
FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- Students can view their own loan history
CREATE POLICY "Students can view own loan history"
ON loan_history
FOR SELECT
TO authenticated
USING (student_email = get_user_email());

-- =============================================
-- MAINTENANCE_LOG TABLE RLS
-- =============================================
ALTER TABLE maintenance_log ENABLE ROW LEVEL SECURITY;

-- Only admins can access maintenance logs
CREATE POLICY "Admins have full access to maintenance_log"
ON maintenance_log
FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- =============================================
-- EMAIL_LOG TABLE RLS
-- =============================================
ALTER TABLE email_log ENABLE ROW LEVEL SECURITY;

-- Only admins can manage email logs
CREATE POLICY "Admins have full access to email_log"
ON email_log
FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- Students can view their own email logs
CREATE POLICY "Students can view own email logs"
ON email_log
FOR SELECT
TO authenticated
USING (recipient_email = get_user_email());

-- =============================================
-- SMS_LOG TABLE RLS
-- =============================================
ALTER TABLE sms_log ENABLE ROW LEVEL SECURITY;

-- Only admins can manage SMS logs
CREATE POLICY "Admins have full access to sms_log"
ON sms_log
FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- Students can view their own SMS logs (via loan association)
CREATE POLICY "Students can view own sms logs"
ON sms_log
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM loans 
        WHERE loans.id = sms_log.loan_id 
        AND loans.student_email = get_user_email()
    )
);

-- =============================================
-- ADMINS TABLE RLS
-- =============================================
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Only existing admins can view/manage admins
CREATE POLICY "Admins can view admin list"
ON admins
FOR SELECT
TO authenticated
USING (is_admin());

-- Only admins can add new admins
CREATE POLICY "Admins can manage admin list"
ON admins
FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- =============================================
-- SERVICE ROLE BYPASS
-- =============================================
-- Note: The service_role key bypasses RLS by default in Supabase
-- Use it for Edge Functions and backend operations

-- =============================================
-- GRANT PERMISSIONS
-- =============================================
-- Grant usage on sequences for inserts
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;

-- Grant table permissions
GRANT SELECT ON equipment TO anon;
GRANT ALL ON equipment TO authenticated;
GRANT ALL ON students TO authenticated;
GRANT ALL ON loans TO authenticated;
GRANT ALL ON loan_history TO authenticated;
GRANT ALL ON maintenance_log TO authenticated;
GRANT ALL ON email_log TO authenticated;
GRANT ALL ON sms_log TO authenticated;
GRANT ALL ON admins TO authenticated;
