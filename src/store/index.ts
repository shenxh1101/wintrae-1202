import { create } from 'zustand';
import type { Post, PostType, PostCategory, Campus, Subscription, SystemNotice, PostStatus } from '@/types';
import { mockPosts } from '@/data/mockPosts';
import { mockSubscriptions, mockMyFavorites, mockMyPosts, mockMyClaims, currentUser } from '@/data/mockUser';
import { mockSystemNotices } from '@/data/mockMessages';
import { generateId } from '@/utils';

export interface PostFilter {
  type?: PostType;
  category?: PostCategory;
  campus?: Campus;
  keyword?: string;
  status?: PostStatus | string;
  dateStart?: string;
  dateEnd?: string;
}

interface AppState {
  posts: Post[];
  subscriptions: Subscription[];
  systemNotices: SystemNotice[];
  favorites: string[];
  myPosts: string[];
  myClaims: string[];

  addPost: (post: Post) => void;
  updatePostStatus: (postId: string, status: PostStatus) => void;
  getPostById: (postId: string) => Post | undefined;

  toggleFavorite: (postId: string) => void;
  isFavorite: (postId: string) => boolean;

  addSubscription: (keyword: string) => { success: boolean; message: string };
  removeSubscription: (id: string) => void;
  toggleSubscription: (id: string) => void;
  checkSubscriptionMatch: (post: Post) => SystemNotice[];

  addSystemNotice: (notice: Omit<SystemNotice, 'id' | 'createdAt' | 'isRead'>) => void;
  markNoticeAsRead: (id: string) => void;
  markAllNoticesAsRead: () => void;
  getUnreadNoticeCount: () => number;

  claimPost: (postId: string) => void;
  closePost: (postId: string) => void;

  getFilteredPosts: (filter?: PostFilter) => Post[];
  getMyPosts: () => Post[];
  getMyClaims: () => Post[];
  getMyFavorites: () => Post[];
}

const initialPosts = [...mockPosts];
const initialSubscriptions = [...mockSubscriptions];
const initialNotices = [...mockSystemNotices];
const initialFavorites = [...mockMyFavorites];
const initialMyPosts = [...mockMyPosts];
const initialMyClaims = [...mockMyClaims];

export const useAppStore = create<AppState>((set, get) => ({
  posts: initialPosts,
  subscriptions: initialSubscriptions,
  systemNotices: initialNotices,
  favorites: initialFavorites,
  myPosts: initialMyPosts,
  myClaims: initialMyClaims,

  addPost: (post) => {
    set((state) => {
      const newPosts = [post, ...state.posts];
      const newMyPosts = state.myPosts.includes(post.id)
        ? state.myPosts
        : [post.id, ...state.myPosts];

      const matchedNotices = get().checkSubscriptionMatch(post);
      const newNotices = [...matchedNotices, ...state.systemNotices];

      return {
        posts: newPosts,
        myPosts: newMyPosts,
        systemNotices: newNotices,
      };
    });
  },

  updatePostStatus: (postId, status) => {
    set((state) => ({
      posts: state.posts.map((p) =>
        p.id === postId ? { ...p, status, updatedAt: new Date().toISOString() } : p
      ),
    }));
  },

  getPostById: (postId) => {
    return get().posts.find((p) => p.id === postId);
  },

  toggleFavorite: (postId) => {
    set((state) => {
      const isFav = state.favorites.includes(postId);
      const newFavorites = isFav
        ? state.favorites.filter((id) => id !== postId)
        : [...state.favorites, postId];

      const newPosts = state.posts.map((p) => {
        if (p.id === postId) {
          return {
            ...p,
            favoriteCount: isFav ? p.favoriteCount - 1 : p.favoriteCount + 1,
          };
        }
        return p;
      });

      return {
        favorites: newFavorites,
        posts: newPosts,
      };
    });
  },

  isFavorite: (postId) => {
    return get().favorites.includes(postId);
  },

  addSubscription: (keyword) => {
    const trimmed = keyword.trim();
    if (!trimmed) return { success: false, message: '请输入关键词' };

    const { subscriptions } = get();
    if (subscriptions.some((s) => s.keyword === trimmed)) {
      return { success: false, message: '该关键词已订阅' };
    }
    if (subscriptions.length >= 10) {
      return { success: false, message: '最多订阅10个关键词' };
    }

    const newSub: Subscription = {
      id: generateId(),
      keyword: trimmed,
      enabled: true,
      createdAt: new Date().toISOString(),
    };

    set((state) => ({
      subscriptions: [newSub, ...state.subscriptions],
    }));

    return { success: true, message: '订阅成功' };
  },

  removeSubscription: (id) => {
    set((state) => ({
      subscriptions: state.subscriptions.filter((s) => s.id !== id),
    }));
  },

  toggleSubscription: (id) => {
    set((state) => ({
      subscriptions: state.subscriptions.map((s) =>
        s.id === id ? { ...s, enabled: !s.enabled } : s
      ),
    }));
  },

  checkSubscriptionMatch: (post) => {
    const { subscriptions } = get();
    const enabledSubs = subscriptions.filter((s) => s.enabled);
    const notices: SystemNotice[] = [];

    enabledSubs.forEach((sub) => {
      const kw = sub.keyword.toLowerCase();
      const matched =
        post.title.toLowerCase().includes(kw) ||
        post.description.toLowerCase().includes(kw) ||
        post.tags.some((t) => t.toLowerCase().includes(kw));

      if (matched) {
        notices.push({
          id: generateId(),
          type: 'subscription',
          title: '订阅提醒',
          content: `你订阅的关键词"${sub.keyword}"有新的帖子发布：${post.title}`,
          relatedPostId: post.id,
          createdAt: new Date().toISOString(),
          isRead: false,
        });
      }
    });

    return notices;
  },

  addSystemNotice: (notice) => {
    set((state) => ({
      systemNotices: [
        {
          ...notice,
          id: generateId(),
          createdAt: new Date().toISOString(),
          isRead: false,
        },
        ...state.systemNotices,
      ],
    }));
  },

  markNoticeAsRead: (id) => {
    set((state) => ({
      systemNotices: state.systemNotices.map((n) =>
        n.id === id ? { ...n, isRead: true } : n
      ),
    }));
  },

  markAllNoticesAsRead: () => {
    set((state) => ({
      systemNotices: state.systemNotices.map((n) => ({ ...n, isRead: true })),
    }));
  },

  getUnreadNoticeCount: () => {
    return get().systemNotices.filter((n) => !n.isRead).length;
  },

  claimPost: (postId) => {
    const post = get().posts.find((p) => p.id === postId);
    if (!post) return;

    set((state) => {
      const newPosts = state.posts.map((p) =>
        p.id === postId
          ? { ...p, status: 'claimed' as PostStatus, updatedAt: new Date().toISOString() }
          : p
      );

      const newMyClaims = state.myClaims.includes(postId)
        ? state.myClaims
        : [postId, ...state.myClaims];

      const claimNotice: SystemNotice = {
        id: generateId(),
        type: 'claim',
        title: '认领通知',
        content: `你发布的帖子"${post.title}"已被认领，请及时处理交接`,
        relatedPostId: postId,
        createdAt: new Date().toISOString(),
        isRead: false,
      };

      return {
        posts: newPosts,
        myClaims: newMyClaims,
        systemNotices: [claimNotice, ...state.systemNotices],
      };
    });
  },

  closePost: (postId) => {
    set((state) => ({
      posts: state.posts.map((p) =>
        p.id === postId
          ? { ...p, status: 'closed' as PostStatus, updatedAt: new Date().toISOString() }
          : p
      ),
    }));
  },

  getFilteredPosts: (filter) => {
    const { posts } = get();
    if (!filter) {
      return [...posts].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    let result = [...posts];

    if (filter.type) {
      result = result.filter((p) => p.type === filter.type);
    }
    if (filter.category) {
      result = result.filter((p) => p.category === filter.category);
    }
    if (filter.campus) {
      result = result.filter((p) => p.location.campus === filter.campus);
    }
    if (filter.status) {
      result = result.filter((p) => p.status === filter.status);
    }
    if (filter.keyword) {
      const kw = filter.keyword.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(kw) ||
          p.description.toLowerCase().includes(kw) ||
          p.tags.some((t) => t.toLowerCase().includes(kw))
      );
    }
    if (filter.dateStart) {
      const start = new Date(filter.dateStart).getTime();
      result = result.filter((p) => new Date(p.dateRange.start).getTime() >= start);
    }
    if (filter.dateEnd) {
      const end = new Date(filter.dateEnd).getTime() + 24 * 60 * 60 * 1000 - 1;
      result = result.filter((p) => new Date(p.dateRange.end).getTime() <= end);
    }

    result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return result;
  },

  getMyPosts: () => {
    const { posts, myPosts } = get();
    const result = posts.filter((p) => myPosts.includes(p.id));
    result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return result;
  },

  getMyClaims: () => {
    const { posts, myClaims } = get();
    const result = posts.filter((p) => myClaims.includes(p.id));
    result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return result;
  },

  getMyFavorites: () => {
    const { posts, favorites } = get();
    const result = posts.filter((p) => favorites.includes(p.id));
    result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return result;
  },
}));
