import Link from "next/link";
import { Nav } from "@/components/nav";

export default function HomePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top left, rgba(56, 189, 248, 0.2), transparent 28%), radial-gradient(circle at top right, rgba(34, 197, 94, 0.14), transparent 30%), linear-gradient(to bottom, #f7f8fb, #f7f8fb)",
        color: "#0f172a"
      }}
    >
      <div
        style={{
          margin: "0 auto",
          display: "flex",
          minHeight: "100vh",
          width: "100%",
          maxWidth: "1200px",
          flexDirection: "column",
          padding: "24px"
        }}
      >
        <Nav />

        <section
          style={{
            display: "grid",
            flex: 1,
            alignItems: "center",
            gap: "48px",
            padding: "72px 0",
            gridTemplateColumns: "1.2fr 0.8fr"
          }}
        >
          <div style={{ display: "grid", gap: "32px" }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                width: "fit-content",
                borderRadius: "9999px",
                border: "1px solid #e2e8f0",
                background: "rgba(255,255,255,0.85)",
                padding: "8px 16px",
                fontSize: "14px",
                fontWeight: 500,
                color: "#64748b",
                boxShadow: "0 24px 80px rgba(0,0,0,0.14)"
              }}
            >
              Phase 1 foundation is ready
            </span>

            <div style={{ display: "grid", gap: "16px" }}>
              <h1
                style={{
                  maxWidth: "800px",
                  margin: 0,
                  fontSize: "clamp(44px, 6vw, 72px)",
                  fontWeight: 700,
                  lineHeight: 1.03,
                  letterSpacing: "-0.04em"
                }}
              >
                NexusCRM keeps every organization isolated, secure, and ready for AI sales workflows.
              </h1>
              <p
                style={{
                  maxWidth: "800px",
                  margin: 0,
                  fontSize: "18px",
                  lineHeight: 1.8,
                  color: "#64748b"
                }}
              >
                Built with Next.js 14, Express, MongoDB, JWT refresh auth, and Stripe billing scaffolding.
                The app is structured to grow into a production SaaS without rewrites.
              </p>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
              <Link
                href="/register"
                style={{
                  borderRadius: "16px",
                  background: "#0f172a",
                  padding: "12px 24px",
                  fontWeight: 700,
                  color: "#ffffff",
                  textDecoration: "none"
                }}
              >
                Create account
              </Link>
              <Link
                href="/login"
                style={{
                  borderRadius: "16px",
                  border: "1px solid #e2e8f0",
                  background: "#ffffff",
                  padding: "12px 24px",
                  fontWeight: 700,
                  color: "#0f172a",
                  textDecoration: "none"
                }}
              >
                Sign in
              </Link>
            </div>
          </div>

          <div
            style={{
              borderRadius: "24px",
              border: "1px solid rgba(226, 232, 240, 0.9)",
              background: "rgba(255,255,255,0.82)",
              padding: "24px",
              boxShadow: "0 0 0 1px rgba(255,255,255,0.08), 0 24px 80px rgba(0,0,0,0.14)",
              backdropFilter: "blur(18px)"
            }}
          >
            <div style={{ display: "grid", gap: "24px" }}>
              <div>
                <p style={{ margin: 0, fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.3em", color: "#64748b" }}>
                  Foundation
                </p>
                <h2 style={{ margin: "8px 0 0", fontSize: "24px", fontWeight: 700 }}>What Phase 1 includes</h2>
              </div>

              <ul style={{ display: "grid", gap: "16px", fontSize: "14px", lineHeight: 1.7, color: "#64748b", paddingLeft: "20px" }}>
                <li>Authentication with register, login, and refresh token rotation.</li>
                <li>Multi-tenant organization membership checks on protected routes.</li>
                <li>Stripe plan scaffolding for Free, Pro, and Enterprise tiers.</li>
                <li>Responsive UI foundation with dark and light mode support.</li>
                <li>Axios interceptor setup for automatic bearer token handling.</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

