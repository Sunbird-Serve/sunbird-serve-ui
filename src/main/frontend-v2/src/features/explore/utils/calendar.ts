// Build a Google Calendar "add event" link for a session.
// Times are floating (no timezone), so they land at the same wall-clock time in the user's calendar.

function stamp(date: string, time: string): string {
  const [h, m] = time.split(':');
  return `${date.replace(/-/g, '')}T${h.padStart(2, '0')}${(m || '00').padStart(2, '0')}00`;
}

export function googleCalendarUrl(args: {
  title: string;
  date: string; // YYYY-MM-DD
  startTime?: string; // HH:MM
  endTime?: string; // HH:MM
  details?: string;
  location?: string;
}): string {
  const { title, date, startTime, endTime, details, location } = args;
  const start = startTime?.match(/(\d{2}):(\d{2})/);
  const end = endTime?.match(/(\d{2}):(\d{2})/);

  let dates: string;
  if (start) {
    const startStamp = stamp(date, `${start[1]}:${start[2]}`);
    const endStamp = end ? stamp(date, `${end[1]}:${end[2]}`) : stamp(date, `${String((parseInt(start[1]) + 1) % 24).padStart(2, '0')}:${start[2]}`);
    dates = `${startStamp}/${endStamp}`;
  } else {
    // All-day event: end date is exclusive, so use the same day + 1
    const d = new Date(date + 'T00:00:00');
    d.setDate(d.getDate() + 1);
    const next = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
    dates = `${date.replace(/-/g, '')}/${next}`;
  }

  const params = new URLSearchParams({ action: 'TEMPLATE', text: title, dates });
  if (details) params.set('details', details);
  if (location) params.set('location', location);
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
