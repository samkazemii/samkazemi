# V15 — Gemini AI + fixed piano keyboard

This build replaces the OpenAI backend with Gemini and fixes the Sound Pad keyboard controls.

## Supabase Secret

In Supabase Dashboard → Edge Functions → Secrets, keep:

```text
GEMINI_API_KEY=your_new_private_key
```

Do not put the Gemini key in GitHub, `supabase-config.js`, or browser JavaScript.

Optional secrets:

```text
GEMINI_CHAT_MODEL=gemini-2.5-flash
GEMINI_TTS_MODEL=gemini-2.5-flash-preview-tts
GEMINI_TTS_VOICE=Kore
```

## Deploy the functions

From the project folder, after installing and signing into the Supabase CLI:

```bash
supabase link --project-ref kmckpbtowbfqgstbegck
supabase functions deploy sk-ai-chat --no-verify-jwt
supabase functions deploy sk-ai-tts --no-verify-jwt
```

The static website files can then be uploaded to the GitHub Pages repository.

## Piano fix

1. Open the Sound Pad section.
2. Turn on **KEYBOARD MODE**.
3. Use the physical keys `A S D F G H J`.

The new handler uses physical key codes, so it works with both English and Persian keyboard layouts. It also runs in capture mode so unrelated page shortcuts cannot block the notes.

## Security

The Gemini key previously pasted into chat should remain revoked. Use only the newly generated key stored in Supabase Secrets.
