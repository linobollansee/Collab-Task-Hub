import { useMemo } from 'react';

export const useFormattedDate = (
  dateValue: string | Date | number | undefined | null,
  options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' },
  locale: string = 'de-DE',
): string => {
  return useMemo(() => {
    if (!dateValue) return '';

    try {
      const dateObj =
        typeof dateValue === 'string' || typeof dateValue === 'number'
          ? new Date(dateValue)
          : dateValue;

      if (isNaN(dateObj.getTime())) {
        return '';
      }

      return new Intl.DateTimeFormat(locale, options).format(dateObj);
    } catch (error) {
      console.error('useFormattedDate Error:', error);
      return '';
    }
  }, [dateValue, options, locale]);
};
