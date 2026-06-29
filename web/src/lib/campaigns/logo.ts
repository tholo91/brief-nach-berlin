export const CAMPAIGN_LOGO_BUCKET = "campaign-logos";

export function campaignLogoPublicUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) return null;
  const encodedPath = path.split("/").map(encodeURIComponent).join("/");
  return `${supabaseUrl}/storage/v1/object/public/${CAMPAIGN_LOGO_BUCKET}/${encodedPath}`;
}
