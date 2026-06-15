import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useAppStore } from '@/store';
import { getQueryString } from '@/utils';
import PostCard from '@/components/PostCard';
import Empty from '@/components/Empty';
import Loading from '@/components/Loading';
import styles from './index.module.scss';

type ListType = 'published' | 'claimed' | 'favorites';

const titleMap: Record<ListType, string> = {
  published: '我的发布',
  claimed: '我的认领',
  favorites: '我的收藏',
};

const ListPage: React.FC = () => {
  const [listType, setListType] = useState<ListType>('published');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const getMyPosts = useAppStore((state) => state.getMyPosts);
  const getMyClaims = useAppStore((state) => state.getMyClaims);
  const getMyFavorites = useAppStore((state) => state.getMyFavorites);
  const storePosts = useAppStore((state) => state.posts);
  const storeFavorites = useAppStore((state) => state.favorites);
  const storeClaims = useAppStore((state) => state.myClaims);
  const storeMine = useAppStore((state) => state.myPosts);

  useEffect(() => {
    const type = getQueryString('type') as ListType;
    const validTypes: ListType[] = ['published', 'claimed', 'favorites'];
    const finalType = validTypes.includes(type) ? type : 'published';
    setListType(finalType);
    Taro.setNavigationBarTitle({ title: titleMap[finalType] });
  }, []);

  const list = useMemo(() => {
    switch (listType) {
      case 'published':
        return getMyPosts();
      case 'claimed':
        return getMyClaims();
      case 'favorites':
        return getMyFavorites();
      default:
        return [];
    }
  }, [listType, getMyPosts, getMyClaims, getMyFavorites, storePosts, storeFavorites, storeClaims, storeMine]);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timer);
  }, [listType]);

  const goToDetail = useCallback((postId: string) => {
    Taro.navigateTo({ url: `/pages/detail/index?id=${postId}` });
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setRefreshing(false);
  }, []);

  const emptyConfig = {
    published: {
      icon: '📝',
      text: '暂无发布',
      description: '去发布一条失物或招领信息吧',
    },
    claimed: {
      icon: '✅',
      text: '暂无认领记录',
      description: '去看看有没有你丢失的物品吧',
    },
    favorites: {
      icon: '⭐',
      text: '暂无收藏',
      description: '收藏感兴趣的帖子，方便后续查看',
    },
  };

  return (
    <View className={styles.page}>
      {loading ? (
        <Loading fullPage text="加载中..." />
      ) : list.length === 0 ? (
        <Empty
          icon={emptyConfig[listType].icon}
          text={emptyConfig[listType].text}
          description={emptyConfig[listType].description}
        />
      ) : (
        <ScrollView
          className={styles.list}
          scrollY
          refresherEnabled
          refresherTriggered={refreshing}
          onRefresherrefresh={handleRefresh}
          refresherDefaultStyle="none"
          refresherThreshold={50}
        >
          <View className={styles.listHeader}>
            <Text className={styles.listCount}>共 {list.length} 条记录</Text>
          </View>
          {list.map((post) => (
            <PostCard key={post.id} post={post} onClick={() => goToDetail(post.id)} />
          ))}
        </ScrollView>
      )}
    </View>
  );
};

export default ListPage;
