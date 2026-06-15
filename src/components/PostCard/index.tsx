import React from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import dayjs from 'dayjs';
import classnames from 'classnames';
import type { Post } from '@/types';
import { CAMPUS_OPTIONS, TYPE_OPTIONS, CATEGORY_OPTIONS } from '@/types';
import Tag from '@/components/Tag';
import styles from './index.module.scss';

export interface PostCardProps {
  post: Post;
  onClick?: () => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, onClick }) => {
  const getCampusLabel = (campus: string) => {
    return CAMPUS_OPTIONS.find(item => item.value === campus)?.label || campus;
  };

  const getStatusText = (status: string) => {
    const map: Record<string, string> = {
      active: '进行中',
      closed: '已关闭',
      claimed: '已认领',
    };
    return map[status] || status;
  };

  const getStatusType = (status: string) => {
    const map: Record<string, 'status-active' | 'status-closed' | 'status-claimed'> = {
      active: 'status-active',
      closed: 'status-closed',
      claimed: 'status-claimed',
    };
    return map[status] || 'status-active';
  };

  const getCategoryLabel = (category: string) => {
    return CATEGORY_OPTIONS.find(item => item.value === category)?.label || category;
  };

  const getCategoryColor = (category: string) => {
    return CATEGORY_OPTIONS.find(item => item.value === category)?.color;
  };

  const formatTime = (dateStr: string) => {
    const date = dayjs(dateStr);
    const now = dayjs();
    const diff = now.diff(date, 'hour');
    
    if (diff < 1) return '刚刚';
    if (diff < 24) return `${diff}小时前`;
    if (diff < 48) return '昨天';
    return date.format('MM-DD');
  };

  const handleClick = () => {
    onClick?.();
  };

  return (
    <View className={styles.card} onClick={handleClick}>
      <View className={styles.header}>
        <View className={styles.leftInfo}>
          <Image
            className={styles.avatar}
            src={post.author.avatar}
            mode="aspectFill"
            onError={(e) => console.error('[PostCard] 头像加载失败', e)}
          />
          <View className={styles.userInfo}>
            <Text className={styles.userName}>{post.author.name}</Text>
            <Text className={styles.userRole}>
              {post.author.role === 'student' ? '学生' : '后勤人员'}
            </Text>
          </View>
        </View>
        <View className={styles.rightTags}>
          <Tag type={post.type as 'lost' | 'found'}>
            {TYPE_OPTIONS.find(item => item.value === post.type)?.label}
          </Tag>
          {post.status !== 'active' && (
            <Tag type={getStatusType(post.status)}>
              {getStatusText(post.status)}
            </Tag>
          )}
        </View>
      </View>

      <View className={styles.content}>
        <Text className={styles.title}>{post.title}</Text>
        <Text className={styles.description}>{post.description}</Text>

        {post.images.length > 0 && (
          <View className={styles.images}>
            {post.images.slice(0, 3).map((img, index) => (
              <View className={styles.imageItem} key={index}>
                <Image
                  src={img}
                  mode="aspectFill"
                  onError={(e) => console.error('[PostCard] 图片加载失败', e)}
                />
              </View>
            ))}
            {post.images.length > 3 && (
              <View className={styles.moreImages}>
                <Text>+{post.images.length - 3}</Text>
              </View>
            )}
          </View>
        )}

        {post.tags.length > 0 && (
          <View className={styles.tags}>
            <Tag type="category" color={getCategoryColor(post.category)}>
              {getCategoryLabel(post.category)}
            </Tag>
            {post.tags.slice(0, 3).map((tag, index) => (
              <Tag key={index} type="normal">{tag}</Tag>
            ))}
          </View>
        )}
      </View>

      <View className={styles.footer}>
        <View className={styles.location}>
          <Text>📍 {getCampusLabel(post.location.campus)} · {post.location.place}</Text>
        </View>
        <View className={styles.metaInfo}>
          <View className={styles.metaItem}>
            <Text>👁 {post.viewCount}</Text>
          </View>
          <View className={styles.metaItem}>
            <Text>⭐ {post.favoriteCount}</Text>
          </View>
          <View className={styles.metaItem}>
            <Text>{formatTime(post.createdAt)}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default PostCard;
