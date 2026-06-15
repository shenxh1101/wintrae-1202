import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';

export interface TagProps {
  type?: 'lost' | 'found' | 'category' | 'normal' | 'status-active' | 'status-closed' | 'status-claimed';
  color?: string;
  children: React.ReactNode;
}

const Tag: React.FC<TagProps> = ({ type = 'normal', color, children }) => {
  const typeClassMap = {
    'lost': styles.lost,
    'found': styles.found,
    'category': styles.category,
    'normal': styles.normal,
    'status-active': styles.statusActive,
    'status-closed': styles.statusClosed,
    'status-claimed': styles.statusClaimed,
  };

  const inlineStyle = color ? { backgroundColor: `${color}15`, color } : undefined;

  return (
    <View className={classnames(styles.tag, typeClassMap[type])} style={inlineStyle}>
      <Text>{children}</Text>
    </View>
  );
};

export default Tag;
