import type { Metadata } from "next";
import { VariantSuccessClient } from "./VariantSuccessClient";

export const metadata: Metadata = {
  title: "Angepasster Brief verschickt | Brief-nach-Berlin",
  robots: {
    index: false,
    follow: false,
  },
};

export default function BriefAnpassenErfolgPage() {
  return <VariantSuccessClient />;
}
