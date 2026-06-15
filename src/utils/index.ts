import dayjs from 'dayjs';

export const formatDate = (date: string | Date, format = 'YYYY-MM-DD'): string => {
  return dayjs(date).format(format);
};

export const formatDateTime = (date: string | Date): string => {
  return dayjs(date).format('YYYY-MM-DD HH:mm');
};

export const formatRelativeTime = (date: string | Date): string => {
  const d = dayjs(date);
  const now = dayjs();
  const diff = now.diff(d, 'hour');

  if (diff < 1) return '刚刚';
  if (diff < 24) return `${diff}小时前`;
  if (diff < 48) return '昨天';
  if (diff < 72) return `${Math.floor(diff / 24)}天前`;
  return d.format('MM-DD');
};

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const debounce = <T extends (...args: any[]) => any>(
  fn: T, delay: number) => {
  let timer: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

export const validatePhone = (phone: string): boolean => {
  return /^1[3-9]\d{9}$/.test(phone);
};

export const getQueryString = (name: string): string => {
  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1];
  // @ts-ignore
  return currentPage?.options?.[name] || '';
};
