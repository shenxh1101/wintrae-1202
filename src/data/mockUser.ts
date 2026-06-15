import type { UserInfo, Subscription } from '@/types';

export const currentUser: UserInfo = {
  id: 'current',
  name: '同学',
  avatar: 'https://picsum.photos/id/1027/200/200',
  role: 'student',
  phone: '138****8888',
};

export const mockSubscriptions: Subscription[] = [
  {
    id: 'sub1',
    keyword: '身份证',
    enabled: true,
    createdAt: '2026-06-10T10:00:00Z',
  },
  {
    id: 'sub2',
    keyword: '手机',
    enabled: true,
    createdAt: '2026-06-12T14:30:00Z',
  },
  {
    id: 'sub3',
    keyword: '笔记本',
    enabled: false,
    createdAt: '2026-06-14T09:00:00Z',
  },
];

export const mockMyPosts = ['1', '5', '7'];
export const mockMyClaims = ['6', '10'];
export const mockMyFavorites = ['2', '4', '8'];
