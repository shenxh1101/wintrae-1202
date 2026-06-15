import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';

export interface LoadingProps {
  text?: string;
  fullPage?: boolean;
}

const Loading: React.FC<LoadingProps> = ({ text = '加载中...', fullPage = false }) => {
  return (
    <View className={classnames(styles.loading, fullPage && styles.fullPage)}>
      <View className={styles.spinner} />
      {text && <Text className={styles.text}>{text}</Text>}
    </View>
  );
};

export default Loading;
