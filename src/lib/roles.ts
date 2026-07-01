export const FEATURES = {
  announcement_post: ["admin", "teacher"],
  leave_view: ["admin", "teacher"],
  leave_approve: ["admin"],
  attendance_all: ["admin"],
  schedule_view: ["admin", "teacher"],
  directory_full: ["admin", "teacher"],
  document_upload: ["admin"],
} as const;

export type Feature = keyof typeof FEATURES;

export function can(feature: Feature, role: string): boolean {
  return (FEATURES[feature] as readonly string[]).includes(role);
}

export const SIDEBAR_ITEMS: {
  href: string;
  label: string;
  icon: string;
  roles: string[];
}[] = [
  { href: "/dashboard", label: "Dashboard", icon: "LayoutDashboard", roles: ["admin", "teacher", "parent"] },
  { href: "/dashboard/announcements", label: "Announcements", icon: "Megaphone", roles: ["admin", "teacher", "parent"] },
  { href: "/dashboard/calendar", label: "Calendar", icon: "CalendarRange", roles: ["admin", "teacher", "parent"] },
  { href: "/dashboard/directory", label: "Directory", icon: "Users", roles: ["admin", "teacher", "parent"] },
  { href: "/dashboard/schedule", label: "Schedule", icon: "Clock", roles: ["admin", "teacher"] },
  { href: "/dashboard/leave", label: "Leave", icon: "Calendar", roles: ["admin", "teacher"] },
  { href: "/dashboard/attendance", label: "Attendance", icon: "ClipboardCheck", roles: ["admin", "teacher"] },
  { href: "/dashboard/documents", label: "Documents", icon: "FileText", roles: ["admin", "teacher", "parent"] },
  { href: "/dashboard/fees", label: "Fees", icon: "DollarSign", roles: ["parent"] },
  { href: "/dashboard/results", label: "Results", icon: "Award", roles: ["parent"] },
  { href: "/dashboard/students", label: "Students", icon: "GraduationCap", roles: ["admin"] },
  { href: "/dashboard/users", label: "Users", icon: "UserPlus", roles: ["admin"] },
];
