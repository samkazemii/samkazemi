# Community Hub Realtime setup

The website code is ready, but a static GitHub Pages site cannot share messages between devices by itself. Complete these steps once:

1. Create a free Supabase project.
2. Open **SQL Editor**, paste the full contents of `supabase-schema.sql`, and click **Run**.
3. Open **Project Settings → API** (or **Connect**) and copy:
   - Project URL
   - Publishable key (or legacy anon key)
4. Open `supabase-config.js` and replace both placeholder strings.
5. Upload every file in this folder to GitHub Pages and hard-refresh the site.
6. Open the site on two devices. Both should display `REALTIME CONNECTED`; messages and online presence should appear on both.

Security note: use only a publishable/anon key in the website. Never expose a `service_role` or secret key.
