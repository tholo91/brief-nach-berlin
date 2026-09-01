import { permanentRedirect } from "next/navigation";
import { DONATION_PATH } from "@/lib/config";

export default function DonationAliasPage() {
  permanentRedirect(DONATION_PATH);
}
