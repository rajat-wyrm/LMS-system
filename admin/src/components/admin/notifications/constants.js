import {
  MdLibraryBooks,
  MdPayment,
  MdVideoCall,
  MdUpdate,
  MdPersonAdd,
} from 'react-icons/md';

export const PRIORITIES = ['critical', 'high', 'medium', 'low'];

export const PRIORITY_META = {
  critical: {
    label: 'Critical',
    iconBg: '#EF4444',
    badgeBg: 'rgba(239, 68, 68, 0.15)',
    badgeBorder: 'rgba(239, 68, 68, 0.35)',
    badgeText: '#FCA5A5',
  },
  high: {
    label: 'High',
    iconBg: '#F97316',
    badgeBg: 'rgba(249, 115, 22, 0.15)',
    badgeBorder: 'rgba(249, 115, 22, 0.35)',
    badgeText: '#FDBA74',
  },
  medium: {
    label: 'Medium',
    iconBg: '#3B82F6',
    badgeBg: 'rgba(59, 130, 246, 0.15)',
    badgeBorder: 'rgba(59, 130, 246, 0.35)',
    badgeText: '#93C5FD',
  },
  low: {
    label: 'Low',
    iconBg: '#10B981',
    badgeBg: 'rgba(16, 185, 129, 0.15)',
    badgeBorder: 'rgba(16, 185, 129, 0.35)',
    badgeText: '#6EE7B7',
  },
};

export const CATEGORY_META = {
  course: {
    label: 'Course',
    filter: 'Course',
    icon: MdLibraryBooks,
    iconBg: '#3B82F6',
  },
  payment: {
    label: 'Payment',
    filter: 'Payment',
    icon: MdPayment,
    iconBg: '#10B981',
  },
  student: {
    label: 'Student',
    filter: 'Student',
    icon: MdPersonAdd,
    iconBg: '#06B6D4',
  },
  system: {
    label: 'System',
    filter: 'System',
    icon: MdUpdate,
    iconBg: '#F97316',
  },
  live: {
    label: 'Live Sessions',
    filter: 'Live Sessions',
    icon: MdVideoCall,
    iconBg: '#8B5CF6',
  },
};

export const PRIMARY_FILTERS = [
  'All',
  'Course',
  'Payment',
  'Student',
  'System',
  'Live Sessions',
  'Priority',
  'Read/Unread',
];

export const TIMELINE_ORDER = ['Today', 'Yesterday', 'This Week', 'Earlier'];

const buildNotif = (overrides) => ({
  read: false,
  pinned: false,
  archived: false,
  responseMinutes: 12,
  timelineGroup: 'Today',
  ...overrides,
});

export const initialNotifications = [];
