"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type LinkItem = { href: string; label: string };

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

export default function SidebarNav({ links, mobile = false }: { links: LinkItem[]; mobile?: boolean }) {
  const pathname = usePathname();
  return <nav className={mobile ? "space-y-1" : "flex-1 px-3 py-4 space-y-1 relative"}>
    {links.map(link => {
      const active = isActive(pathname, link.href);
      return <Link key={link.href} href={link.href} className={`block rounded-md px-3 py-2 text-sm transition-colors border-l-2 ${active ? "border-lift bg-lift/10 text-lift font-medium" : "border-transparent text-gray-300 hover:bg-ink hover:text-lift"}`}>{link.label}</Link>;
    })}
  </nav>;
}
