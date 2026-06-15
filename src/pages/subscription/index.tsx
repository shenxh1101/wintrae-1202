import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Input, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { getQueryString, formatDate } from '@/utils';
import { useAppStore } from '@/store';
import Empty from '@/components/Empty';
import styles from './index.module.scss';

const SubscriptionPage: React.FC = () => {
  const subscriptions = useAppStore((state) => state.subscriptions);
  const addSubscription = useAppStore((state) => state.addSubscription);
  const removeSubscription = useAppStore((state) => state.removeSubscription);
  const toggleSubscription = useAppStore((state) => state.toggleSubscription);

  const [newKeyword, setNewKeyword] = useState('');

  useEffect(() => {
    const addKeyword = getQueryString('add');
    if (addKeyword) {
      setNewKeyword(decodeURIComponent(addKeyword));
    }
  }, []);

  const handleAdd = useCallback(() => {
    const result = addSubscription(newKeyword);
    if (result.success) {
      setNewKeyword('');
      console.log('[Subscription] 添加订阅:', newKeyword);
    }
    Taro.showToast({
      title: result.message,
      icon: result.success ? 'success' : 'none',
    });
  }, [newKeyword, addSubscription]);

  const handleToggle = useCallback(
    (id: string) => {
      toggleSubscription(id);
    },
    [toggleSubscription]
  );

  const handleDelete = useCallback(
    (id: string, keyword: string) => {
      Taro.showModal({
        title: '取消订阅',
        content: `确定要取消订阅"${keyword}"吗？`,
        success: (res) => {
          if (res.confirm) {
            removeSubscription(id);
            console.log('[Subscription] 取消订阅:', id);
            Taro.showToast({
              title: '已取消订阅',
              icon: 'none',
            });
          }
        },
      });
    },
    [removeSubscription]
  );

  return (
    <View className={styles.page}>
      <View className={styles.headerCard}>
        <Text className={styles.headerTitle}>🔔 关键词订阅</Text>
        <Text className={styles.headerDesc}>
          订阅关键词后，当有新帖子匹配您的关键词时，会第一时间通知您。最多可订阅10个关键词。
        </Text>
      </View>

      <View className={styles.addSection}>
        <Text className={styles.addTitle}>添加新关键词</Text>
        <View className={styles.addInputRow}>
          <Input
            className={styles.addInput}
            placeholder="输入关键词，如：身份证、手机"
            value={newKeyword}
            onInput={(e) => setNewKeyword(e.detail.value)}
            onConfirm={handleAdd}
            maxLength={20}
          />
          <Button
            className={classnames(styles.addBtn, !newKeyword.trim() && styles.disabled)}
            onClick={handleAdd}
            disabled={!newKeyword.trim()}
          >
            <Text>订阅</Text>
          </Button>
        </View>
      </View>

      <View className={styles.listSection}>
        <Text className={styles.listTitle}>我的订阅 ({subscriptions.length}/10)</Text>

        {subscriptions.length === 0 ? (
          <View className={styles.empty}>
            <Text className={styles.emptyIcon}>🔔</Text>
            <Text className={styles.emptyText}>暂无订阅</Text>
            <Text className={styles.emptyDesc}>
              订阅关键词后，新帖子会第一时间通知您
            </Text>
          </View>
        ) : (
          subscriptions.map((sub) => (
            <View key={sub.id} className={styles.subItem}>
              <View className={styles.subContent}>
                <Text className={styles.subIcon}>
                  {sub.enabled ? '🔔' : '🔕'}
                </Text>
                <View>
                  <Text className={styles.subKeyword}>{sub.keyword}</Text>
                  <Text className={styles.subDate}>
                    订阅于 {formatDate(sub.createdAt)}
                  </Text>
                </View>
              </View>
              <View className={styles.subActions}>
                <View
                  className={classnames(styles.switch, sub.enabled && styles.active)}
                  onClick={() => handleToggle(sub.id)}
                />
                <Text
                  className={styles.deleteBtn}
                  onClick={() => handleDelete(sub.id, sub.keyword)}
                >
                  🗑️
                </Text>
              </View>
            </View>
          ))
        )}
      </View>
    </View>
  );
};

export default SubscriptionPage;
