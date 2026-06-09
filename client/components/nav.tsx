import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";

export function Nav() {
  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "16px",
        padding: "12px 0"
      }}
    >
      <Link href="/" style={{ fontSize: "18px", fontWeight: 700, letterSpacing: "-0.02em", color: "#0f172a" }}>
        NexusCRM
      </Link>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <Link href="/login" style={{ fontSize: "14px", color: "#64748b" }}>
          Login
        </Link>
        <Link href="/register" style={{ fontSize: "14px", color: "#64748b" }}>
          Register
        </Link>
        <ThemeToggle />
      </div>
    </header>
  );
}
