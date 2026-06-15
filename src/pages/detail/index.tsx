import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Image, Textarea, Button, Map } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import type { Post } from '@/types';
import { CAMPUS_OPTIONS, CATEGORY_OPTIONS, TYPE_OPTIONS } from '@/types';
import { currentUser } from '@/data/mockUser';
import { useAppStore } from '@/store';
import Tag from '@/components/Tag';
import Loading from '@/components/Loading';
import { formatDateTime, formatRelativeTime, getQueryString } from '@/utils';
import styles from './index.module.scss';

const DetailPage: React.FC = () => {
  const [postId, setPostId] = useState('');
  const [loading, setLoading] = useState(true);
  const [inquiry, setInquiry] = useState('');

  const storePosts = useAppStore((state) => state.posts);
  const storeGetPostById = useAppStore((state) => state.getPostById);
  const toggleFavorite = useAppStore((state) => state.toggleFavorite);
  const isFavorite = useAppStore((state) => state.isFavorite);
  const claimPost = useAppStore((state) => state.claimPost);
  const closePost = useAppStore((state) => state.closePost);
  const updatePostStatus = useAppStore((state) => state.updatePostStatus);

  const post = storeGetPostById(postId);
  const favState = post ? isFavorite(post.id) : false;

  useEffect(() => {
    const id = getQueryString('id');
    console.log('[Detail] 获取帖子ID:', id);
    setPostId(id || '');

    setTimeout(() => {
      setLoading(false);
    }, 300);
  }, [storePosts]);

  useEffect(() => {
    if (!loading && post) {
      const viewCount = post.viewCount;
      updatePostStatus(post.id, post.status);
    }
  }, [loading, post, post?.id, post?.status, updatePostStatus]);

  const getCampusLabel = (campus: string) => {
    return CAMPUS_OPTIONS.find((item) => item.value === campus)?.label || campus;
  };

  const getCategoryLabel = (category: string) => {
    return CATEGORY_OPTIONS.find((item) => item.value === category)?.label || category;
  };

  const getCategoryColor = (category: string) => {
    return CATEGORY_OPTIONS.find((item) => item.value === category)?.color;
  };

  const handleFavorite = useCallback(() => {
    if (!post) return;
    toggleFavorite(post.id);
    const newState = !favState;
    Taro.showToast({
      title: newState ? '收藏成功' : '已取消收藏',
      icon: 'none',
    });
  }, [post, favState, toggleFavorite]);

  const handleReport = useCallback(() => {
    if (!post) return;
    Taro.navigateTo({
      url: `/pages/report/index?postId=${post.id}&postTitle=${encodeURIComponent(post.title)}`,
    });
  }, [post]);

  const handleContact = useCallback(() => {
    if (!post) return;
    if (post.author.id === currentUser.id) {
      Taro.showToast({ title: '不能联系自己', icon: 'none' });
      return;
    }
    Taro.navigateTo({
      url: `/pages/chat/index?postId=${post.id}&userId=${post.author.id}`,
    });
  }, [post]);

  const handleSendInquiry = useCallback(() => {
    if (!inquiry.trim() || !post) return;
    console.log('[Detail] 发送追问:', inquiry);
    Taro.showToast({
      title: '追问已发送',
      icon: 'success',
    });
    setInquiry('');
  }, [inquiry, post]);

  const handleClaim = useCallback(() => {
    if (!post) return;
    Taro.showModal({
      title: '确认认领',
      content: `确认要认领「${post.title}」吗？请确保这是您的物品。认领后帖子将显示为"已认领"状态。`,
      success: (res) => {
        if (res.confirm) {
          console.log('[Detail] 确认认领:', post.id);
          claimPost(post.id);
          Taro.showToast({
            title: '认领成功',
            icon: 'success',
          });
        }
      },
    });
  }, [post, claimPost]);

  const handleClosePost = useCallback(() => {
    if (!post) return;
    Taro.showModal({
      title: '关闭帖子',
      content: '确认要关闭此帖子吗？关闭后将不再展示。',
      success: (res) => {
        if (res.confirm) {
          console.log('[Detail] 关闭帖子:', post.id);
          closePost(post.id);
          Taro.showToast({
            title: '帖子已关闭',
            icon: 'success',
          });
        }
      },
    });
  }, [post, closePost]);

  const handleImagePreview = useCallback(
    (current: string) => {
      if (!post) return;
      Taro.previewImage({
        current,
        urls: post.images,
      });
    },
    [post]
  );

  if (loading) {
    return <Loading fullPage text="加载中..." />;
  }

  if (!post) {
    return (
      <View className={styles.page}>
        <View style={{ padding: 100 }}>
          <Text style={{ textAlign: 'center', display: 'block', color: '#86909C' }}>
            帖子不存在或已删除
          </Text>
        </View>
      </View>
    );
  }

  const isAuthor = post.author.id === currentUser.id;
  const isClosed = post.status === 'closed' || post.status === 'claimed';

  return (
    <View className={styles.page}>
      {isClosed && (
        <View className={styles.closedBanner}>
          <Text>✅</Text>
          <Text className={styles.closedText}>
            {post.status === 'claimed' ? '此物品已被认领' : '此帖子已关闭'}
          </Text>
        </View>
      )}

      <View className={styles.content}>
        <View className={styles.header}>
          <View className={styles.authorInfo}>
            <View className={styles.avatar}>
              <Image
                src={post.author.avatar}
                mode="aspectFill"
                onError={(e) => console.error('[Detail] 头像加载失败', e)}
              />
            </View>
            <View className={styles.authorDetail}>
              <Text className={styles.authorName}>{post.author.name}</Text>
              <Text className={styles.authorMeta}>
                {post.author.role === 'student' ? '学生' : '后勤人员'} ·{' '}
                {formatRelativeTime(post.createdAt)}
              </Text>
            </View>
          </View>
          <View className={styles.tags}>
            <Tag type={post.type as 'lost' | 'found'}>
              {TYPE_OPTIONS.find((t) => t.value === post.type)?.label}
            </Tag>
            {post.status !== 'active' && (
              <Tag type={`status-${post.status}` as any}>
                {post.status === 'active'
                  ? '进行中'
                  : post.status === 'claimed'
                  ? '已认领'
                  : '已关闭'}
              </Tag>
            )}
          </View>
        </View>

        <View className={styles.titleSection}>
          <Text className={styles.title}>{post.title}</Text>
          <View className={styles.metaRow}>
            <View className={styles.metaItem}>
              <Text>👁</Text>
              <Text>{post.viewCount} 浏览</Text>
            </View>
            <View className={styles.metaItem}>
              <Text>⭐</Text>
              <Text>{post.favoriteCount} 收藏</Text>
            </View>
          </View>
        </View>

        {post.images.length > 0 && (
          <View className={styles.images}>
            {post.images.map((img, index) => (
              <View
                key={index}
                className={styles.imageItem}
                onClick={() => handleImagePreview(img)}
              >
                <Image
                  src={img}
                  mode="aspectFill"
                  onError={(e) => console.error('[Detail] 图片加载失败', e)}
                />
              </View>
            ))}
          </View>
        )}

        <Text className={styles.description}>{post.description}</Text>

        <View className={styles.infoSection}>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>物品分类</Text>
            <Text className={styles.infoValue}>{getCategoryLabel(post.category)}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>位置</Text>
            <Text className={styles.infoValue}>
              {getCampusLabel(post.location.campus)} · {post.location.place}
            </Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>时间范围</Text>
            <Text className={styles.infoValue}>
              {post.dateRange.start}
              {post.dateRange.end !== post.dateRange.start && ` ~ ${post.dateRange.end}`}
            </Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>特征标签</Text>
            <View className={styles.featureTags}>
              <Tag type="category" color={getCategoryColor(post.category)}>
                {getCategoryLabel(post.category)}
              </Tag>
              {post.tags.map((tag, index) => (
                <Tag key={index} type="normal">
                  {tag}
                </Tag>
              ))}
            </View>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>发布时间</Text>
            <Text className={styles.infoValue}>{formatDateTime(post.createdAt)}</Text>
          </View>
          {post.status !== 'active' && (
            <View className={styles.infoRow}>
              <Text className={styles.infoLabel}>状态更新</Text>
              <Text className={styles.infoValue}>{formatDateTime(post.updatedAt)}</Text>
            </View>
          )}
        </View>
      </View>

      {post.location.latitude && post.location.longitude && (
        <View className={styles.mapSection}>
          <Text className={styles.sectionTitle}>📍 位置地图</Text>
          <View className={styles.mapContainer}>
            {process.env.TARO_ENV !== 'h5' ? (
              <Map
                className={styles.map}
                latitude={post.location.latitude}
                longitude={post.location.longitude}
                markers={[
                  {
                    id: 0,
                    latitude: post.location.latitude,
                    longitude: post.location.longitude,
                    width: 40,
                    height: 40,
                  },
                ]}
                scale={16}
                showLocation
              />
            ) : (
              <View className={styles.mapPlaceholder}>
                <Text style={{ fontSize: 48 }}>🗺️</Text>
                <Text>
                  {getCampusLabel(post.location.campus)} · {post.location.place}
                </Text>
              </View>
            )}
          </View>
        </View>
      )}

      {!isClosed && !isAuthor && (
        <View className={styles.inquirySection}>
          <Text className={styles.sectionTitle}>❓ 对物品有疑问？发起追问</Text>
          <View className={styles.inquiryInput}>
            <Textarea
              className={styles.inquiryTextarea}
              placeholder="请输入您的问题，例如：请问物品现在在哪里？"
              value={inquiry}
              onInput={(e) => setInquiry(e.detail.value)}
              maxLength={200}
            />
            <Button
              className={classnames(styles.sendBtn, !inquiry.trim() && styles.disabled)}
              onClick={handleSendInquiry}
              disabled={!inquiry.trim()}
            >
              <Text>发送</Text>
            </Button>
          </View>
        </View>
      )}

      <View className={styles.actionBar}>
        <Button
          className={classnames(styles.iconBtn, favState && styles.active)}
          onClick={handleFavorite}
        >
          <Text className={styles.iconBtnIcon}>{favState ? '⭐' : '☆'}</Text>
          <Text className={styles.iconBtnText}>收藏</Text>
        </Button>
        <Button className={styles.iconBtn} onClick={handleReport}>
          <Text className={styles.iconBtnIcon}>🚨</Text>
          <Text className={styles.iconBtnText}>举报</Text>
        </Button>

        {isAuthor ? (
          <Button
            className={classnames(styles.actionBtn, styles.secondaryBtn)}
            onClick={handleClosePost}
            disabled={isClosed}
          >
            <Text>{isClosed ? '已关闭' : '关闭帖子'}</Text>
          </Button>
        ) : (
          <>
            <Button
              className={classnames(styles.actionBtn, styles.secondaryBtn)}
              onClick={handleContact}
              disabled={isClosed}
            >
              <Text>💬 私信联系</Text>
            </Button>
            {post.type === 'found' && (
              <Button
                className={classnames(styles.actionBtn, styles.primaryBtn)}
                onClick={handleClaim}
                disabled={isClosed}
              >
                <Text>{isClosed ? '已认领' : '✅ 我要认领'}</Text>
              </Button>
            )}
            {post.type === 'lost' && (
              <Button
                className={classnames(styles.actionBtn, styles.primaryBtn)}
                onClick={handleContact}
                disabled={isClosed}
              >
                <Text>📞 提供线索</Text>
              </Button>
            )}
          </>
        )}
      </View>
    </View>
  );
};

export default DetailPage;
