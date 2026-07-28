V18.1 REALTIME FIX

- Realtime channel now uses a unique channel name per browser.
- Automatically reconnects after CHANNEL_ERROR, TIMED_OUT, CLOSED, network return, or tab activation.
- Added INSERT, UPDATE, and DELETE live listeners for public.messages.
- Added a lightweight 2.5-second fallback sync, so other visitors receive new messages without manually refreshing even if WebSocket delivery is interrupted.
- No database table or column names were changed.
- All V18 admin, Instagram, AI, and voice features were preserved.

Deploy all files to GitHub Pages and hard-refresh once after deployment.
