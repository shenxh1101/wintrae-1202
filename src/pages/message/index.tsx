import React, { useState, useCallback } from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { mockConversations, mockSystemNotices } from '@/data/mockMessages';
import { formatRelativeTime } from '@/utils';
import Empty from '@/components/Empty';
import styles from './index.module.scss';

type TabType = 'conversation' | 'notice';

const MessagePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('conversation');
  const [conversations, setConversations] = useState(mockConversations);
  const [notices, setNotices] = useState(mockSystemNotices);

  const unreadConvCount = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);
  const unreadNoticeCount = notices.filter(n => !n.isRead).length;

  const handleConvClick = useCallback((convId: string, postId: string) => {
    setConversations(prev => prev.map(conv =>
      conv.id === convId ? { ...conv, unreadCount: 0 } : conv
    ));
    Taro.navigateTo({
      url: `/pages/chat/index?convId=${convId}&postId=${postId}`,
    });
  }, []);

  const handleNoticeClick = useCallback((notice: typeof mockSystemNotices[0]) => {
    setNotices(prev => prev.map(n =>
      n.id === notice.id ? { ...n, isRead: true } : n
    ));
    if (notice.relatedPostId) {
      Taro.navigateTo({
        url: `/pages/detail/index?id=${notice.relatedPostId}`,
      });
    }
  }, []);

  const getNoticeIcon = (type: string) => {
    const icons: Record<string, string> = {
      subscription: '🔔',
      claim: '✅',
      system: '📢',
    };
    return icons[type] || '📬';
  };

  const getNoticeTitle = (type: string) => {
    const titles: Record<string, string> = {
      subscription: '订阅提醒',
      claim: '认领通知',
      system: '系统通知',
    };
    return titles[type] || '消息通知';
  };

  return (
    <View className={styles.page}>
      <View className={styles.tabs}>
        <View
          className={classnames(styles.tab, activeTab === 'conversation' && styles.active)}
          onClick={() => setActiveTab('conversation')}
        >
          <Text>私信</Text>
          {unreadConvCount > 0 && (
            <View className={styles.tabBadge}>
              <Text>{unreadConvCount > 99 ? '99+' : unreadConvCount}</Text>
            </View>
          )}
        </View>
        <View
          className={classnames(styles.tab, activeTab === 'notice' && styles.active)}
          onClick={() => setActiveTab('notice')}
        >
          <Text>通知</Text>
          {unreadNoticeCount > 0 && (
            <View className={styles.tabBadge}>
              <Text>{unreadNoticeCount}</Text>
            </View>
          )}
        </View>
      </View>

      <ScrollView className={styles.list} scrollY>
        {activeTab === 'conversation' ? (
          conversations.length === 0 ? (
            <Empty
              icon="💬"
              text="暂无私信"
              description="去帖子详情页联系发布者吧"
            />
          ) : (
            conversations.map(conv => (
              <View
                key={conv.id}
                className={styles.conversationItem}
                onClick={() => handleConvClick(conv.id, conv.postId)}
              >
                <View className={styles.avatar}>
                  {conv.unreadCount > 0 && (
                    <View className={styles.unreadBadge}>
                      <Text>{conv.unreadCount > 99 ? '99+' : conv.unreadCount}</Text>
                    </View>
                  )}
                  <Image
                    src={conv.otherUser.avatar}
                    mode="aspectFill"
                    onError={(e) => console.error('[Message] 头像加载失败', e)}
                  />
                </View>
                <View className={styles.convContent}>
                  <View className={styles.convHeader}>
                    <Text className={styles.convName}>{conv.otherUser.name}</Text>
                    <Text className={styles.convTime}>{formatRelativeTime(conv.updatedAt)}</Text>
                  </View>
                  <Text className={styles.convPost}>📌 {conv.postTitle}</Text>
                  <Text className={styles.convLastMsg}>
                    {conv.lastMessage.senderId === 'current' ? '我: ' : ''}
                    {conv.lastMessage.content}
                  </Text>
                </View>
              </View>
            ))
          )
        ) : (
          notices.length === 0 ? (
            <Empty
              icon="🔔"
              text="暂无通知"
              description="订阅关键词后，新帖会第一时间通知您"
            />
          ) : (
            notices.map(notice => (
              <View
                key={notice.id}
                className={classnames(styles.noticeItem, !notice.isRead && styles.unread)}
                onClick={() => handleNoticeClick(notice)}
              >
                <View className={styles.noticeHeader}>
                  <View className={styles.noticeType}>
                    <View className={styles.noticeIcon}>
                      <Text>{getNoticeIcon(notice.type)}</Text>
                    </View>
                    <View className={styles.noticeInfo}>
                      <Text className={styles.noticeTitle}>{getNoticeTitle(notice.type)}</Text>
                      <Text className={styles.noticeTime}>{formatRelativeTime(notice.createdAt)}</Text>
                    </View>
                  </View>
                  {!notice.isRead && <View className={styles.unreadDot} />}
                </View>
                <Text className={styles.noticeContent}>{notice.content}</Text>
              </View>
            ))
          )
        )}
      </ScrollView>
    </View>
  );
};

export default MessagePage;
