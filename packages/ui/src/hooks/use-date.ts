import dayjs from 'dayjs';
export function useFormatDateString(
  date: string,
  options?: {
    format?: string;
  },
) {
  const format = options?.format ?? 'MMMM D, YYYY';
  return dayjs(date).format(format);
}
