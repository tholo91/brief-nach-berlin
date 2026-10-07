import { campaignLogoPublicUrl } from "@/lib/campaigns/logo";

type CampaignLogoProps = {
  logoPath: string | null;
  name: string;
  size?: "xs" | "chip" | "sm" | "md";
};

const roundImage = "rounded-full border border-warmgrau/15 shadow-sm";
const roundFallback = "rounded-full border border-waldgruen/15";

// "chip" fills the left cap of the landing hero pills: at this size a border
// only reads as a grey ring and eats into the logo.
const sizeClasses = {
  xs: {
    container: "h-6 w-6",
    fallback: "text-[10px]",
    image: roundImage,
    fallbackShape: roundFallback,
    backgroundSize: "105%",
  },
  chip: {
    container: "h-8 w-8",
    fallback: "text-xs",
    image: "rounded-full",
    fallbackShape: "rounded-full",
    backgroundSize: "cover",
  },
  sm: {
    container: "h-12 w-12",
    fallback: "text-lg",
    image: roundImage,
    fallbackShape: roundFallback,
    backgroundSize: "105%",
  },
  md: {
    container: "h-14 w-14",
    fallback: "text-xl",
    image: roundImage,
    fallbackShape: roundFallback,
    backgroundSize: "105%",
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
        className={`${classes.container} shrink-0 bg-white ${classes.image}`}
        style={{
          backgroundImage: `url(${logoUrl})`,
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundSize: classes.backgroundSize,
        }}
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      className={`flex ${classes.container} shrink-0 items-center justify-center ${classes.fallbackShape} bg-waldgruen/10 font-typewriter font-bold text-waldgruen-dark ${classes.fallback}`}
    >
      {displayName.charAt(0).toUpperCase()}
    </span>
  );
}
