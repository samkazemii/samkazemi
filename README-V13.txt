SAM KAZEMI PORTFOLIO — V13 CLEAN REBUILD

Owner email everywhere:
  sam.kazmi0090@gmail.com

What changed:
- Replaced the old email in metadata, About, Contact, footer, Gmail links, admin UI, JavaScript and Supabase RLS policies.
- Rebuilt the owner login modal and control bar styling.
- Admin login now uses a one-time Supabase Magic Link.
- The database still decides who can delete; knowing the email is not enough.
- Updated cache-busting versions.

REQUIRED SUPABASE SETUP:
1. Run ADMIN-AUTH-SECURE.sql in SQL Editor.
2. Authentication > Providers > Email: enable Email provider and Allow new users to sign up.
3. Authentication > URL Configuration:
   Site URL: https://samkz.com
   Redirect URL: https://samkz.com/**
4. Press OWNER > SEND MAGIC LINK once and open the link in sam.kazmi0090@gmail.com.
5. You may disable public signups afterward; the owner account will already exist.

Never expose the service_role key. The included anon/publishable key is intended for browser use.
