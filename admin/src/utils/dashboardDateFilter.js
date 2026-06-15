import { rangeScaleFactor } from '../context/DateRangeContext';

function parseTrendPercent(trend) {
  const m = String(trend).match(/([+-]?\d+(?:\.\d+)?)/);
  return m ? parseFloat(m[1]) : 0;
}

function formatScaledNumber(value, scale) {
  const num = parseInt(String(value).replace(/[^\d]/g, ''), 10);
  if (Number.isNaN(num)) return value;
  const scaled = Math.round(num * scale);
  return scaled.toLocaleString('en-IN');
}

function formatRevenue(value, scale) {
  const str = String(value);
  if (str.includes('₹') && str.includes('L')) {
    const num = parseFloat(str.replace(/[^\d.]/g, '')) * scale;
    return `₹${num.toFixed(1)}L`;
  }
  return value;
}

export function scaleKpiMetrics(metrics, start, end) {
  const scale = rangeScaleFactor(start, end);
  return metrics.map((card) => {
    let value = card.value;
    if (card.iconKey === 'revenue') {
      value = formatRevenue(card.value, scale);
    } else if (card.title.includes('Students') || card.title.includes('Teachers') || card.title.includes('Courses')) {
      value = formatScaledNumber(card.value, Math.min(1, 0.4 + scale * 0.6));
    }
    const trendVal = parseTrendPercent(card.trend);
    const scaledTrend = (trendVal * scale).toFixed(1);
    const trend =
      card.trend.includes('%') ? `${scaledTrend >= 0 ? '+' : ''}${scaledTrend}%` : card.trend;
    return { ...card, value, trend };
  });
}

export function scaleTodaySummary(summary, start, end) {
  const scale = rangeScaleFactor(start, end);
  return {
    newEnrollments: Math.max(1, Math.round(summary.newEnrollments * scale)),
    coursesPublished: Math.max(0, Math.round(summary.coursesPublished * scale)),
    certificatesIssued: Math.max(0, Math.round(summary.certificatesIssued * scale)),
    liveSessions: Math.max(1, Math.round(summary.liveSessions * scale)),
  };
}

export function scalePlatformSummary(items, start, end) {
  const scale = rangeScaleFactor(start, end);
  return items.map((item) => {
    const num = parseInt(String(item.value).replace(/[^\d]/g, ''), 10);
    if (Number.isNaN(num)) return item;
    return {
      ...item,
      value: String(Math.max(0, Math.round(num * scale))),
    };
  });
}

const ACTIVITY_OFFSET_HOURS = [0.03, 0.2, 0.47, 1, 2, 3];

export function filterRecentActivity(activities, start, end) {
  const now = end.getTime();
  const startMs = start.getTime();
  return activities.filter((_, i) => {
    const hoursAgo = ACTIVITY_OFFSET_HOURS[i] ?? i;
    const ts = now - hoursAgo * 60 * 60 * 1000;
    return ts >= startMs && ts <= now;
  });
}
