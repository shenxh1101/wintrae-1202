export type PostType = 'lost' | 'found';

export type PostCategory = 'certificate' | 'electronic' | 'daily' | 'other';

export type PostStatus = 'active' | 'closed' | 'claimed';

export type Campus = 'east' | 'west' | 'south' | 'north' | 'main';

export interface Location {
  campus: Campus;
  place: string;
  latitude?: number;
  longitude?: number;
}

export interface Post {
  id: string;
  type: PostType;
  category: PostCategory;
  title: string;
  description: string;
  images: string[];
  location: Location;
  dateRange: {
    start: string;
    end: string;
  };
  tags: string[];
  author: UserInfo;
  status: PostStatus;
  createdAt: string;
  updatedAt: string;
  viewCount: number;
  favoriteCount: number;
}

export interface UserInfo {
  id: string;
  name: string;
  avatar: string;
  role: 'student' | 'staff';
  phone?: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  type: 'text' | 'image' | 'system';
  createdAt: string;
  isRead: boolean;
}

export interface Conversation {
  id: string;
  postId: string;
  postTitle: string;
  otherUser: UserInfo;
  lastMessage: Message;
  unreadCount: number;
  updatedAt: string;
}

export interface SystemNotice {
  id: string;
  type: 'subscription' | 'claim' | 'system';
  title: string;
  content: string;
  relatedPostId?: string;
  createdAt: string;
  isRead: boolean;
}

export interface Subscription {
  id: string;
  keyword: string;
  enabled: boolean;
  createdAt: string;
}

export interface Report {
  id: string;
  postId: string;
  reason: string;
  description: string;
  images: string[];
  createdAt: string;
}

export const CAMPUS_OPTIONS: { value: Campus; label: string }[] = [
  { value: 'main', label: '主校区' },
  { value: 'east', label: '东校区' },
  { value: 'west', label: '西校区' },
  { value: 'south', label: '南校区' },
  { value: 'north', label: '北校区' },
];

export const CATEGORY_OPTIONS: { value: PostCategory; label: string; color: string }[] = [
  { value: 'certificate', label: '证件类', color: '#FF7D00' },
  { value: 'electronic', label: '电子类', color: '#722ED1' },
  { value: 'daily', label: '日用品', color: '#13C2C2' },
  { value: 'other', label: '其他', color: '#86909C' },
];

export const TYPE_OPTIONS: { value: PostType; label: string; color: string }[] = [
  { value: 'lost', label: '丢失', color: '#FF3B30' },
  { value: 'found', label: '拾到', color: '#4A90E2' },
];
