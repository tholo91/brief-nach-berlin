import { campaignLogoPublicUrl } from "@/lib/campaigns/logo";

type CampaignLogoProps = {
  logoPath: string | null;
  name: string;
  size?: "sm" | "md";
};

const sizeClasses = {
  sm: {
    container: "h-12 w-12",
    fallback: "text-lg",
  },
  md: {
    container: "h-14 w-14",
    fallback: "text-xl",
  },
} as const;

export function CampaignLogo({
  logoPath,
  name,
  size = "sm",
}: CampaignLogoProps) {
  const logoUrl = campaignLogoPublicUrl(logoPath);
  const classes = sizeClasses[size];
  const displayName = name.trim() || "Kampagne";

  if (logoUrl) {
    return (
      <span
        role="img"
        aria-label={`Logo oder Bild von ${displayName}`}
        className={`${classes.container} shrink-0 rounded-full border border-warmgrau/15 bg-white shadow-sm`}
        style={{
          backgroundImage: `url(${logoUrl})`,
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundSize: "103%",
        }}
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      className={`flex ${classes.container} shrink-0 items-center justify-center rounded-full border border-waldgruen/15 bg-waldgruen/10 font-typewriter font-bold text-waldgruen-dark ${classes.fallback}`}
    >
      {displayName.charAt(0).toUpperCase()}
    </span>
  );
}
