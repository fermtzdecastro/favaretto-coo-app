import { LoginForm } from "@/components/forms/LoginForm";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-cream px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="font-heading text-3xl font-semibold">Favaretto</h1>
          <p className="mt-2 text-sm text-text-main/60">
            COO App — Gestión operativa y financiera
          </p>
        </div>

        <div className="rounded-2xl bg-surface p-6 shadow-sm border border-black/5">
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
