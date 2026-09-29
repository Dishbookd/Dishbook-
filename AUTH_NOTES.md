# Authentication

The app now uses Supabase email/password authentication.

The existing `recipes.user_id` column and RLS policies created by `schema.sql` are sufficient.

In Supabase Dashboard:
Authentication > Providers > Email

Keep email/password enabled. For easier testing you may configure email confirmation according to your preferred launch setup. For production, use an appropriate verified email flow.
