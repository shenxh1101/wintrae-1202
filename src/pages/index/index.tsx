import React, { useState, useCallback } from 'react';
import { View, Text, Input, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import type { PostType, PostCategory } from '@/types';
import { CATEGORY_OPTIONS } from '@/types';
import { usePosts } from '@/hooks/usePosts';
import PostCard from '@/components/PostCard';
import Empty from '@/components/Empty';
import Loading from '@/components/Loading';
import styles from './index.module.scss';

const HomePage: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  const [activeType, setActiveType] = useState<PostType | 'all'>('all');
  const [activeCategory, setActiveCategory] = useState<PostCategory | 'all'>('all');
  const [refreshing, setRefreshing] = useState(false);

  const { posts, loading, updateFilter, refresh } = usePosts();

  const handleSearch = useCallback((value: string) => {
    setSearchText(value);
    updateFilter({ keyword: value || undefined });
  }, [updateFilter]);

  const handleTypeChange = useCallback((type: PostType | 'all') => {
    setActiveType(type);
    updateFilter({ type: type === 'all' ? undefined : type });
  }, [updateFilter]);

  const handleCategoryChange = useCallback((category: PostCategory | 'all') => {
    setActiveCategory(category);
    updateFilter({ category: category === 'all' ? undefined : category });
  }, [updateFilter]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refresh();
    } finally {
      setRefreshing(false);
    }
  }, [refresh]);

  const goToDetail = useCallback((postId: string) => {
    Taro.navigateTo({
      url: `/pages/detail/index?id=${postId}`,
    });
  }, []);

  const goToPublish = useCallback(() => {
    Taro.switchTab({
      url: '/pages/publish/index',
    });
  }, []);

  const goToSearch = useCallback(() => {
    Taro.switchTab({
      url: '/pages/search/index',
    });
  }, []);

  const lostCount = posts.filter(p => p.type === 'lost').length;
  const foundCount = posts.filter(p => p.type === 'found').length;

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <View className={styles.searchBar} onClick={goToSearch}>
          <Text className={styles.searchIcon}>🔍</Text>
          <Input
            className={styles.searchInput}
            placeholder="搜索丢失或拾到的物品..."
            value={searchText}
            onInput={(e) => handleSearch(e.detail.value)}
            confirmType="search"
          />
        </View>

        <View className={styles.quickStats}>
          <View className={styles.statItem}>
            <Text className={styles.statNumber}>{posts.length}</Text>
            <Text className={styles.statLabel}>全部帖子</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statNumber}>{lostCount}</Text>
            <Text className={styles.statLabel}>寻物启事</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statNumber}>{foundCount}</Text>
            <Text className={styles.statLabel}>招领信息</Text>
          </View>
        </View>
      </View>

      <View className={styles.filterSection}>
        <View className={styles.typeTabs}>
          <View
            className={classnames(styles.typeTab, activeType === 'all' && styles.active)}
            onClick={() => handleTypeChange('all')}
          >
            <Text>全部</Text>
          </View>
          <View
            className={classnames(styles.typeTab, activeType === 'lost' && styles.active)}
            onClick={() => handleTypeChange('lost')}
          >
            <Text>🔴 丢失</Text>
          </View>
          <View
            className={classnames(styles.typeTab, activeType === 'found' && styles.active)}
            onClick={() => handleTypeChange('found')}
          >
            <Text>🔵 拾到</Text>
          </View>
        </View>

        <ScrollView className={styles.categoryTabs} scrollX showScrollbar={false}>
          <View
            className={classnames(styles.categoryTab, activeCategory === 'all' && styles.active)}
            onClick={() => handleCategoryChange('all')}
          >
            <Text>全部分类</Text>
          </View>
          {CATEGORY_OPTIONS.map(item => (
            <View
              key={item.value}
              className={classnames(styles.categoryTab, activeCategory === item.value && styles.active)}
              onClick={() => handleCategoryChange(item.value)}
            >
              <Text>{item.label}</Text>
            </View>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        className={styles.postList}
        scrollY
        refresherEnabled
        refresherTriggered={refreshing}
        onRefresherrefresh={handleRefresh}
        refresherDefaultStyle="none"
        refresherThreshold={50}
      >
        {loading && <Loading text="加载中..." />}
        
        {!loading && posts.length === 0 && (
          <Empty
            icon="📭"
            text="暂无相关帖子"
            description="试试调整筛选条件或发布新帖子"
          />
        )}

        {!loading && posts.map(post => (
          <PostCard
            key={post.id}
            post={post}
            onClick={() => goToDetail(post.id)}
          />
        ))}
      </ScrollView>

      <View className={styles.publishBtn} onClick={goToPublish}>
        <Text className={styles.publishIcon}>+</Text>
      </View>
    </View>
  );
};

export default HomePage;
