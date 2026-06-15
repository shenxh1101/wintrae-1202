import React, { useCallback } from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { currentUser, mockMyPosts, mockMyClaims, mockMyFavorites } from '@/data/mockUser';
import { mockSubscriptions } from '@/data/mockUser';
import styles from './index.module.scss';

const MinePage: React.FC = () => {
  const handleMenuClick = useCallback((path: string) => {
    Taro.navigateTo({ url: path });
  }, []);

  const handleTabClick = useCallback((tab: string) => {
    Taro.showToast({
      title: `${tab}功能开发中`,
      icon: 'none',
    });
  }, []);

  const menuItems = [
    { icon: '📝', text: '我的发布', path: '', badge: mockMyPosts.length },
    { icon: '✅', text: '我的认领', path: '', badge: mockMyClaims.length },
    { icon: '⭐', text: '我的收藏', path: '', badge: mockMyFavorites.length },
    { icon: '🔔', text: '订阅管理', path: '/pages/subscription/index', badge: mockSubscriptions.length },
  ];

  const moreItems = [
    { icon: '🚨', text: '举报记录', path: '' },
    { icon: '⚙️', text: '设置', path: '' },
    { icon: '❓', text: '帮助与反馈', path: '' },
    { icon: '📋', text: '关于我们', path: '' },
  ];

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.header}>
        <View className={styles.userCard}>
          <View className={styles.avatar}>
            <Image
              src={currentUser.avatar}
              mode="aspectFill"
              onError={(e) => console.error('[Mine] 头像加载失败', e)}
            />
          </View>
          <View className={styles.userInfo}>
            <Text className={styles.userName}>{currentUser.name}</Text>
            <View className={styles.userRole}>
              <Text>{currentUser.role === 'student' ? '🎓 学生' : '🏢 后勤人员'}</Text>
            </View>
          </View>
        </View>

        <View className={styles.statsRow}>
          <View className={styles.statItem}>
            <Text className={styles.statNumber}>{mockMyPosts.length}</Text>
            <Text className={styles.statLabel}>发布</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statNumber}>{mockMyClaims.length}</Text>
            <Text className={styles.statLabel}>认领</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statNumber}>{mockMyFavorites.length}</Text>
            <Text className={styles.statLabel}>收藏</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statNumber}>{mockSubscriptions.length}</Text>
            <Text className={styles.statLabel}>订阅</Text>
          </View>
        </View>
      </View>

      <View className={styles.quickActions}>
        <View className={styles.quickAction} onClick={() => handleTabClick('发布')}>
          <View className={styles.quickIcon}>
            <Text>📝</Text>
          </View>
          <Text className={styles.quickText}>我发布的</Text>
        </View>
        <View className={styles.quickAction} onClick={() => handleTabClick('认领')}>
          <View className={styles.quickIcon}>
            <Text>✅</Text>
          </View>
          <Text className={styles.quickText}>我认领的</Text>
        </View>
        <View className={styles.quickAction} onClick={() => handleTabClick('收藏')}>
          <View className={styles.quickIcon}>
            <Text>⭐</Text>
          </View>
          <Text className={styles.quickText}>我收藏的</Text>
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>我的内容</Text>
        {menuItems.map((item, index) => (
          <View
            key={index}
            className={styles.menuItem}
            onClick={() => item.path ? handleMenuClick(item.path) : handleTabClick(item.text)}
          >
            <View className={styles.menuLeft}>
              <View className={styles.menuIcon}>
                <Text>{item.icon}</Text>
              </View>
              <Text className={styles.menuText}>{item.text}</Text>
            </View>
            <View style={{ display: 'flex', alignItems: 'center' }}>
              {item.badge > 0 && (
                <View className={styles.menuBadge}>
                  <Text>{item.badge}</Text>
                </View>
              )}
              <Text className={styles.menuArrow}>›</Text>
            </View>
          </View>
        ))}
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>更多</Text>
        {moreItems.map((item, index) => (
          <View
            key={index}
            className={styles.menuItem}
            onClick={() => item.path ? handleMenuClick(item.path) : handleTabClick(item.text)}
          >
            <View className={styles.menuLeft}>
              <View className={styles.menuIcon}>
                <Text>{item.icon}</Text>
              </View>
              <Text className={styles.menuText}>{item.text}</Text>
            </View>
            <Text className={styles.menuArrow}>›</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

export default MinePage;
