"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  BriefcaseBusiness,
  LayoutDashboard,
  Megaphone,
  ShieldCheck,
  Users,
  WalletCards,
  type LucideIcon,
} from "lucide-react";

type LinkItem = { href: string; label: string };
const icons: Record<string, LucideIcon> = {
  Dashboard: LayoutDashboard,
  Creators: Users,
  Brands: BriefcaseBusiness,
  Campaigns: Megaphone,
  Finance: WalletCards,
  Insights: BarChart3,
  "Team & Access": ShieldCheck,
};

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

export default function SidebarNav({ links, mobile = false }: { links: LinkItem[]; mobile?: boolean }) {
  const pathname = usePathname();
  return (
    <nav className={mobile ? "space-y-1" : "flex-1 px-3 py-5 space-y-1 relative"}>
      {links.map((link) => {
        const active = isActive(pathname, link.href);
        const Icon = icons[link.label] ?? LayoutDashboard;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-300 ease-out ${
              active
                ? "bg-lift/15 text-lift shadow-sm ring-1 ring-lift/30 font-semibold"
                : "text-muted hover:bg-lift/10 hover:text-paper hover:shadow-sm"
            }`}
          >
            <Icon size={17} strokeWidth={active ? 2.25 : 1.8} className="transition-transform duration-300 group-hover:scale-105" />
            <span>{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
