import { AuthForm } from "@/components/auth-form";
import { Nav } from "@/components/nav";

export default function LoginPage() {
  return (
    <main className="grid-bg min-h-screen">
      <div className="mx-auto flex min-h-screen w-full max-w-4xl flex-col px-6 py-6">
        <Nav />
        <section className="flex flex-1 items-center justify-center py-16">
          <div className="glass-card w-full max-w-md rounded-3xl p-8 shadow-glow">
            <h1 className="text-3xl font-semibold">Welcome back</h1>
            <p className="mt-2 text-sm text-slate-500">Sign in to your NexusCRM workspace.</p>
            <div className="mt-8">
              <AuthForm mode="login" />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
