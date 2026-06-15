import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, Input, ScrollView, Picker } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import type { PostType, PostCategory, Campus } from '@/types';
import { TYPE_OPTIONS, CATEGORY_OPTIONS, CAMPUS_OPTIONS } from '@/types';
import { usePosts } from '@/hooks/usePosts';
import { useDebounce } from '@/hooks/useDebounce';
import PostCard from '@/components/PostCard';
import Empty from '@/components/Empty';
import Loading from '@/components/Loading';
import styles from './index.module.scss';

const hotKeywords = ['身份证', '手机', '校园卡', '钥匙', '笔记本', '耳机', '钱包', '眼镜'];

const SearchPage: React.FC = () => {
  const [keyword, setKeyword] = useState('');
  const [searchHistory, setSearchHistory] = useState<string[]>(['手机', '身份证']);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [type, setType] = useState<PostType | ''>('');
  const [category, setCategory] = useState<PostCategory | ''>('');
  const [campus, setCampus] = useState<Campus | ''>('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const debouncedKeyword = useDebounce(keyword, 300);

  const { posts, loading, updateFilter, refresh } = usePosts();

  useEffect(() => {
    if (hasSearched || debouncedKeyword) {
      updateFilter({
        keyword: debouncedKeyword || undefined,
        type: type || undefined,
        category: category || undefined,
        campus: campus || undefined,
      });
    }
  }, [debouncedKeyword, type, category, campus, updateFilter, hasSearched]);

  const handleSearch = useCallback(() => {
    if (keyword.trim()) {
      setHasSearched(true);
      if (!searchHistory.includes(keyword.trim())) {
        setSearchHistory(prev => [keyword.trim(), ...prev.slice(0, 9)]);
      }
      updateFilter({ keyword: keyword.trim() });
    }
  }, [keyword, searchHistory, updateFilter]);

  const handleKeywordClick = useCallback((kw: string) => {
    setKeyword(kw);
    setHasSearched(true);
    updateFilter({ keyword: kw });
  }, [updateFilter]);

  const handleClearKeyword = useCallback(() => {
    setKeyword('');
    setHasSearched(false);
    updateFilter({ keyword: undefined });
  }, [updateFilter]);

  const handleClearHistory = useCallback(() => {
    Taro.showModal({
      title: '提示',
      content: '确定清空搜索历史吗？',
      success: (res) => {
        if (res.confirm) {
          setSearchHistory([]);
        }
      },
    });
  }, []);

  const handleDeleteHistory = useCallback((index: number) => {
    setSearchHistory(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleSubscribe = useCallback(() => {
    if (!keyword.trim()) {
      Taro.showToast({ title: '请先输入关键词', icon: 'none' });
      return;
    }
    Taro.navigateTo({
      url: `/pages/subscription/index?add=${encodeURIComponent(keyword.trim())}`,
    });
  }, [keyword]);

  const goToDetail = useCallback((postId: string) => {
    Taro.navigateTo({
      url: `/pages/detail/index?id=${postId}`,
    });
  }, []);

  const showEmptyState = !hasSearched && !keyword;

  return (
    <View className={styles.page}>
      <View className={styles.searchHeader}>
        <View className={styles.searchBar}>
          <Text className={styles.searchIcon}>🔍</Text>
          <Input
            className={styles.searchInput}
            placeholder="搜索物品名称、特征、地点..."
            value={keyword}
            onInput={(e) => setKeyword(e.detail.value)}
            onConfirm={handleSearch}
            confirmType="search"
            focus
          />
          {keyword && (
            <Text className={styles.clearBtn} onClick={handleClearKeyword}>✕</Text>
          )}
        </View>
        <Text className={styles.cancelBtn} onClick={handleSearch}>搜索</Text>
      </View>

      {keyword && (
        <View className={styles.subscriptionBtn} onClick={handleSubscribe}>
          <Text>🔔</Text>
          <Text className={styles.subscriptionText}>订阅 "{keyword}" 关键词提醒</Text>
        </View>
      )}

      {!showEmptyState && (
        <ScrollView className={styles.filterBar} scrollX showScrollbar={false}>
          <View
            className={classnames(styles.filterItem, showAdvanced && styles.active)}
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            <Text>⚙️ 筛选</Text>
            <Text>{showAdvanced ? '▲' : '▼'}</Text>
          </View>
          {type && (
            <View
              className={classnames(styles.filterItem, styles.active)}
              onClick={() => setType('')}
            >
              <Text>{TYPE_OPTIONS.find(t => t.value === type)?.label}</Text>
              <Text>×</Text>
            </View>
          )}
          {category && (
            <View
              className={classnames(styles.filterItem, styles.active)}
              onClick={() => setCategory('')}
            >
              <Text>{CATEGORY_OPTIONS.find(c => c.value === category)?.label}</Text>
              <Text>×</Text>
            </View>
          )}
          {campus && (
            <View
              className={classnames(styles.filterItem, styles.active)}
              onClick={() => setCampus('')}
            >
              <Text>{CAMPUS_OPTIONS.find(c => c.value === campus)?.label}</Text>
              <Text>×</Text>
            </View>
          )}
        </ScrollView>
      )}

      {showAdvanced && (
        <View className={styles.advancedFilter}>
          <View className={styles.filterRow}>
            <Text className={styles.filterLabel}>类型</Text>
            <View className={styles.filterOptions}>
              {TYPE_OPTIONS.map(item => (
                <View
                  key={item.value}
                  className={classnames(styles.filterOption, type === item.value && styles.active)}
                  onClick={() => setType(type === item.value ? '' : item.value)}
                >
                  <Text>{item.label}</Text>
                </View>
              ))}
            </View>
          </View>

          <View className={styles.filterRow}>
            <Text className={styles.filterLabel}>分类</Text>
            <View className={styles.filterOptions}>
              {CATEGORY_OPTIONS.map(item => (
                <View
                  key={item.value}
                  className={classnames(styles.filterOption, category === item.value && styles.active)}
                  onClick={() => setCategory(category === item.value ? '' : item.value)}
                >
                  <Text>{item.label}</Text>
                </View>
              ))}
            </View>
          </View>

          <View className={styles.filterRow}>
            <Text className={styles.filterLabel}>校区</Text>
            <View className={styles.filterOptions}>
              {CAMPUS_OPTIONS.map(item => (
                <View
                  key={item.value}
                  className={classnames(styles.filterOption, campus === item.value && styles.active)}
                  onClick={() => setCampus(campus === item.value ? '' : item.value)}
                >
                  <Text>{item.label}</Text>
                </View>
              ))}
            </View>
          </View>

          <View className={styles.filterRow}>
            <Text className={styles.filterLabel}>时间范围</Text>
            <View className={styles.dateRange}>
              <Picker
                mode="date"
                value={startDate}
                onChange={(e) => setStartDate(e.detail.value)}
              >
                <View className={classnames(styles.datePicker, !startDate && styles.placeholder)}>
                  <Text>{startDate || '开始日期'}</Text>
                </View>
              </Picker>
              <Text className={styles.dateSep}>至</Text>
              <Picker
                mode="date"
                value={endDate}
                onChange={(e) => setEndDate(e.detail.value)}
              >
                <View className={classnames(styles.datePicker, !endDate && styles.placeholder)}>
                  <Text>{endDate || '结束日期'}</Text>
                </View>
              </Picker>
            </View>
          </View>
        </View>
      )}

      {showEmptyState ? (
        <ScrollView>
          <View className={styles.hotSection}>
            <View className={styles.sectionTitle}>
              <Text className={styles.titleText}>🔥 热门搜索</Text>
            </View>
            <View className={styles.tagsWrap}>
              {hotKeywords.map((kw, index) => (
                <View
                  key={index}
                  className={styles.hotTag}
                  onClick={() => handleKeywordClick(kw)}
                >
                  <Text>{kw}</Text>
                </View>
              ))}
            </View>
          </View>

          {searchHistory.length > 0 && (
            <View className={styles.historySection}>
              <View className={styles.sectionTitle}>
                <Text className={styles.titleText}>🕐 搜索历史</Text>
                <Text className={styles.clearHistory} onClick={handleClearHistory}>清空</Text>
              </View>
              {searchHistory.map((item, index) => (
                <View className={styles.historyItem} key={index}>
                  <View
                    className={styles.historyContent}
                    onClick={() => handleKeywordClick(item)}
                  >
                    <Text className={styles.historyIcon}>🕐</Text>
                    <Text className={styles.historyText}>{item}</Text>
                  </View>
                  <Text
                    className={styles.deleteIcon}
                    onClick={() => handleDeleteHistory(index)}
                  >
                    ✕
                  </Text>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      ) : (
        <ScrollView className={styles.searchResults}>
          {loading && <Loading text="搜索中..." />}

          {!loading && (
            <Text className={styles.resultCount}>
              找到 {posts.length} 条相关结果
            </Text>
          )}

          {!loading && posts.length === 0 && (
            <Empty
              icon="🔍"
              text="没有找到相关帖子"
              description="试试其他关键词或调整筛选条件"
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
      )}
    </View>
  );
};

export default SearchPage;
