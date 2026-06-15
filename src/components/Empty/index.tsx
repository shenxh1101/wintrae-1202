import React from 'react';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';

export interface EmptyProps {
  icon?: string;
  text?: string;
  description?: string;
}

const Empty: React.FC<EmptyProps> = ({
  icon = '📭',
  text = '暂无数据',
  description,
}) => {
  return (
    <View className={styles.empty}>
      <View className={styles.icon}>
        <Text>{icon}</Text>
      </View>
      <Text className={styles.text}>{text}</Text>
      {description && <Text className={styles.description}>{description}</Text>}
    </View>
  );
};

export default Empty;
