import { redirect } from "next/navigation";

// Ancien onboarding Moneago : remplacé par /inscription.
export default function OnboardingPage() {
  redirect("/inscription");
}
