import { LayoutDashboard, BookOpen, User, FileText } from 'lucide-react';

export const studentNavItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "My Courses",
    href: "/courses", // We will build this later
    icon: BookOpen,
  },
  {
    title: "Resources",
    href: "/resources", // Library view
    icon: FileText,
  },
  {
    title: "Profile",
    href: "/profile",
    icon: User,
  },
];
                   