// Date formatting utility that respects user preferences
export function formatDate(date: string | Date, format?: string, locale?: string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const savedFormat = localStorage.getItem('safetycheck_dateFormat') || format || 'MM/DD/YYYY';
  const savedLocale = localStorage.getItem('safetycheck_language') || locale || 'en';
  
  // Handle different date formats
  const day = dateObj.getDate().toString().padStart(2, '0');
  const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
  const year = dateObj.getFullYear();
  
  switch (savedFormat) {
    case 'DD/MM/YYYY':
      return `${day}/${month}/${year}`;
    case 'DD-MM-YYYY':
      return `${day}-${month}-${year}`;
    case 'MM-DD-YYYY':
      return `${month}-${day}-${year}`;
    case 'YYYY-MM-DD':
      return `${year}-${month}-${day}`;
    case 'MM/DD/YYYY':
    default:
      return `${month}/${day}/${year}`;
  }
}

export function formatDateTime(date: string | Date, includeTime: boolean = true): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const savedLocale = localStorage.getItem('safetycheck_language') || 'en';
  const savedTimezone = localStorage.getItem('safetycheck_timezone') || 'America/New_York';
  
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: savedTimezone,
  };
  
  if (includeTime) {
    options.hour = '2-digit';
    options.minute = '2-digit';
  }
  
  // Handle RTL languages
  if (savedLocale === 'ar') {
    return dateObj.toLocaleDateString('ar-SA', options);
  }
  
  return dateObj.toLocaleDateString(savedLocale, options);
}