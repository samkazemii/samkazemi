/*
  COMMUNITY HUB CONFIGURATION
  ---------------------------
  The site works immediately in local preview mode.
  To enable real multi-user chat, create a Supabase project and paste ONLY the
  public Project URL and anon key below. Never place a service-role key here.
*/
window.SAM_COMMUNITY_CONFIG = {
  supabaseUrl: "",
  supabaseAnonKey: "",
  room: "control-room-01",
  maxUploadMB: 15,
  aiEndpoint: "" // Optional secure server/Edge Function URL. Never place an AI API key in this file.
};
