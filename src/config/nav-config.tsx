import { LayoutDashboard, BookOpen, User, FileText, ClipboardCheck, Bell, Activity } from 'lucide-react';

export const studentNavItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'My Courses',
    href: '/courses',
    icon: BookOpen,
  },
  {
    title: 'Assessments',
    href: '/assessments',
    icon: ClipboardCheck,
  },
  {
    title: 'Resources',
    href: '/resources',
    icon: FileText,
  },
  {
    title: 'Tracking',
    href: '/tracking',
    icon: Activity,
  },
  {
    title: 'Notifications',
    href: '/notifications',
    icon: Bell,
  },
  {
    title: 'Profile',
    href: '/profile',
    icon: User,
  },
];
