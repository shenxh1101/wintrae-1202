import { useState, useEffect, useCallback, useMemo } from 'react';
import type { PostType, PostCategory, Campus } from '@/types';
import { useAppStore, PostFilter } from '@/store';

export type { PostFilter };

export function usePosts(initialFilter?: PostFilter) {
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<PostFilter>(initialFilter || {});

  const allPosts = useAppStore((state) => state.posts);
  const storeGetFilteredPosts = useAppStore((state) => state.getFilteredPosts);
  const storeToggleFavorite = useAppStore((state) => state.toggleFavorite);
  const storeIsFavorite = useAppStore((state) => state.isFavorite);
  const storeGetPostById = useAppStore((state) => state.getPostById);
  const addPost = useAppStore((state) => state.addPost);
  const claimPost = useAppStore((state) => state.claimPost);
  const closePost = useAppStore((state) => state.closePost);

  const posts = useMemo(() => {
    return storeGetFilteredPosts(filter);
  }, [allPosts, filter, storeGetFilteredPosts]);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 200));
      console.log('[usePosts] 加载帖子成功', { count: posts.length, filter });
    } catch (error) {
      console.error('[usePosts] 加载帖子失败', error);
    } finally {
      setLoading(false);
    }
  }, [posts.length, filter]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const refresh = useCallback(() => {
    fetchPosts();
  }, [fetchPosts]);

  const updateFilter = useCallback((newFilter: Partial<PostFilter>) => {
    setFilter((prev) => ({ ...prev, ...newFilter }));
  }, []);

  const toggleFavorite = useCallback(
    (postId: string) => {
      storeToggleFavorite(postId);
    },
    [storeToggleFavorite]
  );

  const isFavorite = useCallback(
    (postId: string) => {
      return storeIsFavorite(postId);
    },
    [storeIsFavorite]
  );

  const getPostById = useCallback(
    (postId: string) => {
      return storeGetPostById(postId);
    },
    [storeGetPostById]
  );

  return {
    posts,
    loading,
    filter,
    refresh,
    updateFilter,
    toggleFavorite,
    isFavorite,
    getPostById,
    addPost,
    claimPost,
    closePost,
  };
}
