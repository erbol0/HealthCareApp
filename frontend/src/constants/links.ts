import {
  BotIcon,
  SettingsIcon,
  HeartPulseIcon,
  LayoutGridIcon,
  NotepadTextIcon,
  StethoscopeIcon,
  FileIcon,
} from "lucide-react";

export const LINKS = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutGridIcon,
  },
  {
    label: "Health Status",
    href: "/dashboard/health-status",
    icon: HeartPulseIcon,
  },
  {
    label: "Health Tips",
    href: "/dashboard/health-tips",
    icon: NotepadTextIcon,
  },
  {
    label: "Summary",
    href: "/dashboard/summary",
    icon: StethoscopeIcon,
  },
  {
    label: "AI Chat",
    href: "/dashboard/ai",
    icon: FileIcon,
  },
  { label: "Topics", href: "/topics", icon: LayoutGridIcon },
  {
    label: "Settings",
    href: "/dashboard/account/settings",
    icon: SettingsIcon,
  },
] as const;
