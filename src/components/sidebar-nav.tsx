"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  BriefcaseBusiness,
  LayoutDashboard,
  Megaphone,
  MessageCircle,
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
    Messages: MessageCircle,
  Finance: WalletCards,
  Insights: BarChart3,
  "Team & Access": ShieldCheck,
};

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

export default function SidebarNav({ links, mobile = false, unreadMessageCount = 0 }: { links: LinkItem[]; mobile?: boolean; unreadMessageCount?: number }) {
  const pathname = usePathname();
  return (
    <nav className={mobile ? "space-y-1" : "flex-1 px-3 py-8 space-y-1 relative"}>
      {links.map((link) => {
        const active = isActive(pathname, link.href);
        const Icon = icons[link.label] ?? LayoutDashboard;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-300 ease-out ${
              active
                ? "bg-white/15 text-white shadow-sm font-semibold"
                : "text-[#d6afc5] hover:bg-white/10 hover:text-white"
            }`}
          >
            <Icon size={17} strokeWidth={active ? 2.25 : 1.8} className="transition-transform duration-300 group-hover:scale-105" />
            <span className="flex min-w-0 flex-1 items-center justify-between gap-2"><span>{link.label}</span>{link.label === "Messages" && unreadMessageCount > 0 && <span aria-label={`${unreadMessageCount} unread messages`} className="min-w-5 rounded-full bg-[#ed4d80] px-1.5 py-0.5 text-center text-[10px] font-bold leading-none text-white">{unreadMessageCount > 99 ? "99+" : unreadMessageCount}</span>}</span>
          </Link>
        );
      })}
    </nav>
  );
}
