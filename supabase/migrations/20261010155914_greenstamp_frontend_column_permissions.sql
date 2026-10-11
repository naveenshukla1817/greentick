-- Allows users to update only their own profile display name (RLS: profiles_update_self).
GRANT UPDATE (display_name, updated_at) ON TABLE public.profiles TO authenticated;

-- Allows users to update only their own notification read state (RLS: notifications_update_own_read_state).
GRANT UPDATE (read_at) ON TABLE public.notifications TO authenticated;
