import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: 'Hefesto — Administración de arriendos',
  description: 'CRM de administración de arriendos (v0.1)',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <div className="layout">
          <aside className="sidebar">
            <div className="brand">Hefesto</div>
            <nav>
              <Link href="/">Panel</Link>
              <Link href="/properties">Inmuebles</Link>
              <Link href="/leases">Contratos</Link>
              <Link href="/owners">Propietarios</Link>
              <Link href="/tenants">Arrendatarios</Link>
            </nav>
          </aside>
          <main className="content">{children}</main>
        </div>
      </body>
    </html>
  );
}
