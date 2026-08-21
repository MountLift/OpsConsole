import Link from "next/link";
import { UserButton } from "@clerk/nextjs";

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/creators", label: "Creators" },
  { href: "/brands", label: "Brands" },
  { href: "/campaigns", label: "Campaigns" },
  { href: "/finance", label: "Finance" },
];

export default function Sidebar() {
  return (
    <aside className="w-56 shrink-0 border-r border-line bg-panel h-screen sticky top-0 flex flex-col">
      <div className="px-5 py-6 border-b border-line">
        <div className="font-mono text-sm tracking-widest text-lift">MT/LFT</div>
        <div className="text-xs text-muted mt-1">Ops console</div>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="block px-3 py-2 rounded-md text-sm text-gray-300 hover:bg-ink hover:text-lift transition-colors"
          >
            {link.label}
          </Link>
        ))}
      </nav>
      <div className="px-5 py-4 border-t border-line flex items-center gap-3">
        <UserButton afterSignOutUrl="/sign-in" />
        <span className="text-xs text-muted font-mono">signed in</span>
      </div>
    </aside>
  );
}