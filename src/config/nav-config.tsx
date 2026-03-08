import { LayoutDashboard, BookOpen, User, FileText, ClipboardCheck, Bell, Activity, MessageCircleQuestion } from 'lucide-react';

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
    title: 'Quizzes',
    href: '/quiz',
    icon: MessageCircleQuestion,
  },
  {
    title: 'Report Card',
    href: '/assessments',
    icon: ClipboardCheck,
  },
  {
    title: 'Bookmarks',
    href: '/bookmarks',
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
