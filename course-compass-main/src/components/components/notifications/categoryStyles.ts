import {
  BookOpen,
  ClipboardList,
  HelpCircle,
  Megaphone,
  Settings,
  CreditCard,
  MessageSquare,
  type LucideIcon,
} from "lucide-react";
import type { NotificationCategory } from "@/api/notification.api";

interface CategoryStyle {
  icon: LucideIcon;
  color: string;
  bg: string;
  label: string;
}

export const CATEGORY_STYLES: Record<NotificationCategory, CategoryStyle> = {
  COURSE: { icon: BookOpen, color: "#3B82F6", bg: "rgba(59,130,246,0.12)", label: "Course" },
  ASSIGNMENT: { icon: ClipboardList, color: "#8B5CF6", bg: "rgba(139,92,246,0.12)", label: "Assignment" },
  QUIZ: { icon: HelpCircle, color: "#F59E0B", bg: "rgba(245,158,11,0.12)", label: "Quiz" },
  ANNOUNCEMENT: { icon: Megaphone, color: "#EC4899", bg: "rgba(236,72,153,0.12)", label: "Announcement" },
  SYSTEM: { icon: Settings, color: "#6B7280", bg: "rgba(107,114,128,0.12)", label: "System" },
  PAYMENT: { icon: CreditCard, color: "#10B981", bg: "rgba(16,185,129,0.12)", label: "Payment" },
  MESSAGE: { icon: MessageSquare, color: "#06B6D4", bg: "rgba(6,182,212,0.12)", label: "Message" },
};

export const getCategoryStyle = (category: NotificationCategory): CategoryStyle =>
  CATEGORY_STYLES[category] || CATEGORY_STYLES.SYSTEM;
