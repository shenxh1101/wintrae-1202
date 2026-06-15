import { useState, useEffect, useCallback } from 'react';
import type { Post, PostType, PostCategory, Campus } from '@/types';
import { mockPosts } from '@/data/mockPosts';
import { mockMyFavorites } from '@/data/mockUser';

export interface PostFilter {
  type?: PostType;
  category?: PostCategory;
  campus?: Campus;
  keyword?: string;
  status?: string;
}

export function usePosts(initialFilter?: PostFilter) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<PostFilter>(initialFilter || {});
  const [favorites, setFavorites] = useState<string[]>(mockMyFavorites);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      let filteredPosts = [...mockPosts];
      
      if (filter.type) {
        filteredPosts = filteredPosts.filter(p => p.type === filter.type);
      }
      
      if (filter.category) {
        filteredPosts = filteredPosts.filter(p => p.category === filter.category);
      }
      
      if (filter.campus) {
        filteredPosts = filteredPosts.filter(p => p.location.campus === filter.campus);
      }
      
      if (filter.keyword) {
        const keyword = filter.keyword.toLowerCase();
        filteredPosts = filteredPosts.filter(p =>
          p.title.toLowerCase().includes(keyword) ||
          p.description.toLowerCase().includes(keyword) ||
          p.tags.some(t => t.toLowerCase().includes(keyword))
        );
      }
      
      if (filter.status) {
        filteredPosts = filteredPosts.filter(p => p.status === filter.status);
      }
      
      filteredPosts.sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      setPosts(filteredPosts);
      console.log('[usePosts] 加载帖子成功', { count: filteredPosts.length, filter });
    } catch (error) {
      console.error('[usePosts] 加载帖子失败', error);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const refresh = useCallback(() => {
    fetchPosts();
  }, [fetchPosts]);

  const updateFilter = useCallback((newFilter: Partial<PostFilter>) => {
    setFilter(prev => ({ ...prev, ...newFilter }));
  }, []);

  const toggleFavorite = useCallback((postId: string) => {
    setFavorites(prev => {
      if (prev.includes(postId)) {
        console.log('[usePosts] 取消收藏', postId);
        return prev.filter(id => id !== postId);
      } else {
        console.log('[usePosts] 添加收藏', postId);
        return [...prev, postId];
      }
    });
    
    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        const newCount = favorites.includes(postId)
          ? post.favoriteCount - 1
          : post.favoriteCount + 1;
        return { ...post, favoriteCount: newCount };
      }
      return post;
    }));
  }, [favorites]);

  const isFavorite = useCallback((postId: string) => {
    return favorites.includes(postId);
  }, [favorites]);

  const getPostById = useCallback((postId: string) => {
    return mockPosts.find(p => p.id === postId);
  }, []);

  return {
    posts,
    loading,
    filter,
    refresh,
    updateFilter,
    toggleFavorite,
    isFavorite,
    getPostById,
  };
}
