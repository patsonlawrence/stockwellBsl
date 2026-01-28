// components/ResetPasswordButtonWrapper.tsx
"use client";

import ResetPasswordButton from "@/components/ResetPasswordButton";

type Props = { email: string };

export default function ResetPasswordButtonWrapper({ email }: Props) {
  return <ResetPasswordButton email={email} />;
}
