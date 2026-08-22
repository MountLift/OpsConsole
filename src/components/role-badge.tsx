import { Gauge, Briefcase, Sparkles } from "lucide-react";
import { Role, ROLE_LABELS } from "@/lib/roles";

const ROLE_ICONS: Record<Role, typeof Gauge> = {
  ADMIN: Gauge,
  ACCOUNT_MANAGER: Briefcase,
  CREATOR_MANAGER: Sparkles,
};

export default function RoleBadge({ role }: { role: Role | null }) {
  if (!role) return null;
  const Icon = ROLE_ICONS[role];
  return (
    <div className="flex items-center gap-1.5 text-xs text-muted font-mono mt-0.5">
      <Icon size={12} strokeWidth={2} className="text-lift" />
      {ROLE_LABELS[role]}
    </div>
  );
}