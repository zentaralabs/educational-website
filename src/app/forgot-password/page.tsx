import { Suspense } from "react";
import { ForgotPasswordForm } from "./ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-paper px-6">
      <Suspense fallback={null}>
        <ForgotPasswordForm />
      </Suspense>
    </main>
  );
}
