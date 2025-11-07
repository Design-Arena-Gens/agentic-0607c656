"use client";
import "./globals.css";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppStore } from "../lib/store";
import { useEffect } from "react";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { stores, selectedStoreId, selectStore, ensureInitialStore, addStore } = useAppStore();

  useEffect(() => {
    ensureInitialStore();
  }, [ensureInitialStore]);

  const nav = [
    { href: "/", label: "Dashboard" },
    { href: "/products", label: "Products" },
    { href: "/stores", label: "Stores" },
  ];

  return (
    <html lang="en">
      <body>
        <header className="header">
          <div className="header-inner">
            <div className="brand">Personal Store Tracker</div>
            <nav className="nav">
              {nav.map((n) => (
                <Link key={n.href} href={n.href} className={pathname === n.href ? "active" : undefined}>
                  {n.label}
                </Link>
              ))}
            </nav>
            <div className="grow" />
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <select
                className="select"
                value={selectedStoreId ?? ""}
                onChange={(e) => selectStore(e.target.value)}
                style={{ minWidth: 220 }}
              >
                {stores.length === 0 ? <option value="">No stores</option> : null}
                {stores.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              <button
                className="button"
                onClick={() => {
                  const name = prompt("Store name?")?.trim();
                  if (name) addStore(name);
                }}
              >
                + New Store
              </button>
            </div>
          </div>
        </header>
        <main className="container">{children}</main>
        <footer className="footer small">? {new Date().getFullYear()} Personal Store Tracker</footer>
      </body>
    </html>
  );
}
