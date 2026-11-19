function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfDay(date) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

function parseDate(dateStr) {
  // Date-only strings like "2026-11-17" are parsed as UTC by default in JS;
  // append T00:00:00 so they are treated as local time consistently.
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return new Date(`${dateStr}T00:00:00`);
  }
  return new Date(dateStr);
}

function addToDate(date, amount, unit) {
  const d = new Date(date);
  if (unit === 'days') d.setDate(d.getDate() + amount);
  else if (unit === 'weeks') d.setDate(d.getDate() + amount * 7);
  else if (unit === 'months') d.setMonth(d.getMonth() + amount);
  return d;
}

function inDateRange(dateStr, range) {
  if (!range) return true;
  if (!dateStr) return false;

  const target = parseDate(dateStr);

  // Notice, this would not work for "all day" type creations, but they are
  // not supported as of now.
  // Static is within a non-moving window of time
  if (range.type === 'static') {
    if (range.start && target < startOfDay(parseDate(range.start))) return false;
    if (range.end && target > endOfDay(parseDate(range.end))) return false;
    return true;
  }

  // Relvative is used to determine in relation to the current (i.e. next 7 days)
  if (range.type === 'relative') {
    const today = startOfDay(new Date());
    if (range.direction === 'next') {
      const upper = endOfDay(addToDate(today, range.amount, range.unit));
      return target >= today && target <= upper;
    }
    if (range.direction === 'past') {
      const lower = startOfDay(addToDate(today, -range.amount, range.unit));
      return target >= lower && target <= endOfDay(today);
    }
  }

  return true;
}

// Based on the criteria sub-structure in the filter object
// Found in data.js > appData.filters.criteria
export function matchesFilter(note, criteria) {
  if (!criteria) return true;

  if (criteria.hasTag === true && note.tags.length === 0) return false;
  if (criteria.hasTag === false && note.tags.length > 0) return false;

  if (criteria.tags) {
    const { mode, values } = criteria.tags;
    if (mode === 'include' && !values.some(t => note.tags.includes(t))) return false;
    if (mode === 'exclude' && values.some(t => note.tags.includes(t))) return false;
  }

  if (criteria.hasDeadline === true && !note.dueDate) return false;
  if (criteria.hasDeadline === false && note.dueDate) return false;

  if (criteria.hasReminders === true && note.reminders.length === 0) return false;
  if (criteria.hasReminders === false && note.reminders.length > 0) return false;

  const { dateRanges } = criteria;
  if (dateRanges) {
    if (!inDateRange(note.createdAt, dateRanges.created)) return false;
    if (!inDateRange(note.lastModifiedAt, dateRanges.lastModified)) return false;
    if (!inDateRange(note.dueDate, dateRanges.deadline)) return false;
    if (dateRanges.reminders && !note.reminders.some(r => inDateRange(r.date, dateRanges.reminders))) {
      return false;
    }
  }

  return true;
}