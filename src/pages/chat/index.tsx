import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, Image, Textarea, Button, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { mockChatMessages } from '@/data/mockMessages';
import { mockConversations } from '@/data/mockMessages';
import { currentUser } from '@/data/mockUser';
import { mockPosts } from '@/data/mockPosts';
import { formatDateTime, getQueryString, generateId } from '@/utils';
import type { Message } from '@/types';
import styles from './index.module.scss';

const quickReplies = [
  '请问物品还在吗？',
  '能约个时间交接吗？',
  '明天下午有空吗？',
  '请问具体位置在哪里？',
  '好的，谢谢！',
];

const ChatPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [postTitle, setPostTitle] = useState('');
  const [otherUser, setOtherUser] = useState<{ name: string; avatar: string } | null>(null);
  const [showSchedule, setShowSchedule] = useState(false);
  const scrollRef = useRef<any>(null);

  useEffect(() => {
    const postId = getQueryString('postId');
    const userId = getQueryString('userId');
    const convId = getQueryString('convId');

    console.log('[Chat] 获取参数:', { postId, userId, convId });

    const post = mockPosts.find(p => p.id === postId);
    if (post) {
      setPostTitle(post.title);
      if (post.author.id !== currentUser.id) {
        setOtherUser({
          name: post.author.name,
          avatar: post.author.avatar,
        });
      }
    }

    if (convId) {
      const conv = mockConversations.find(c => c.id === convId);
      if (conv) {
        setOtherUser({
          name: conv.otherUser.name,
          avatar: conv.otherUser.avatar,
        });
        setPostTitle(conv.postTitle);
      }
    }

    setMessages(mockChatMessages);

    setTimeout(() => {
      scrollRef.current?.scrollToBottom?.();
    }, 100);
  }, []);

  const handleSend = useCallback(() => {
    if (!input.trim()) return;

    const newMessage: Message = {
      id: generateId(),
      senderId: currentUser.id,
      receiverId: 'other',
      content: input.trim(),
      type: 'text',
      createdAt: new Date().toISOString(),
      isRead: false,
    };

    setMessages(prev => [...prev, newMessage]);
    setInput('');
    console.log('[Chat] 发送消息:', newMessage);

    setTimeout(() => {
      scrollRef.current?.scrollToBottom?.();
    }, 50);
  }, [input]);

  const handleQuickReply = useCallback((text: string) => {
    setInput(text);
  }, []);

  const handleSchedule = useCallback(() => {
    setShowSchedule(true);
  }, []);

  const handleConfirmSchedule = useCallback(() => {
    const newMessage: Message = {
      id: generateId(),
      senderId: currentUser.id,
      receiverId: 'other',
      content: '【约定交接】\n时间：明天下午3点\n地点：一食堂门口\n请准时到达！',
      type: 'text',
      createdAt: new Date().toISOString(),
      isRead: false,
    };
    setMessages(prev => [...prev, newMessage]);
    setShowSchedule(false);
    Taro.showToast({
      title: '已发送约定',
      icon: 'success',
    });
  }, []);

  const isMine = (msg: Message) => msg.senderId === currentUser.id;

  return (
    <View className={styles.page}>
      {postTitle && (
        <View className={styles.postInfo}>
          <Text className={styles.postIcon}>📌</Text>
          <Text className={styles.postTitle}>{postTitle}</Text>
        </View>
      )}

      <ScrollView
        className={styles.messageList}
        scrollY
        ref={scrollRef}
        scrollWithAnimation
      >
        {messages.map(msg => (
          <View
            key={msg.id}
            className={classnames(styles.messageItem, isMine(msg) ? styles.mine : styles.other)}
          >
            <View className={styles.avatar}>
              <Image
                src={isMine(msg) ? currentUser.avatar : otherUser?.avatar}
                mode="aspectFill"
                onError={(e) => console.error('[Chat] 头像加载失败', e)}
              />
            </View>
            <View className={styles.messageContent}>
              {msg.content.startsWith('【约定交接】') ? (
                <View className={styles.scheduleCard}>
                  {msg.content.split('\n').map((line, i) => (
                    <Text key={i}>{line}</Text>
                  ))}
                </View>
              ) : (
                <View className={styles.messageBubble}>
                  <Text>{msg.content}</Text>
                </View>
              )}
              <Text className={styles.messageTime}>{formatDateTime(msg.createdAt)}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <ScrollView className={styles.quickReply} scrollX showScrollbar={false}>
        {quickReplies.map((reply, index) => (
          <View
            key={index}
            className={styles.quickReplyItem}
            onClick={() => handleQuickReply(reply)}
          >
            <Text>{reply}</Text>
          </View>
        ))}
        <View
          className={styles.quickReplyItem}
          onClick={handleSchedule}
        >
          <Text>📅 约定交接</Text>
        </View>
      </ScrollView>

      {showSchedule && (
        <View style={{ padding: 16, background: '#fff' }}>
          <View className={styles.scheduleCard}>
            <Text>📅 约定交接时间</Text>
            <Text>时间：明天下午3点</Text>
            <Text>地点：一食堂门口</Text>
            <Button className={styles.scheduleBtn} onClick={handleConfirmSchedule}>
              <Text>确认发送</Text>
            </Button>
          </View>
        </View>
      )}

      <View className={styles.inputBar}>
        <Textarea
          className={styles.input}
          placeholder="输入消息..."
          value={input}
          onInput={(e) => setInput(e.detail.value)}
          onConfirm={handleSend}
          maxLength={500}
          autoHeight
        />
        <Button
          className={classnames(styles.sendBtn, !input.trim() && styles.disabled)}
          onClick={handleSend}
          disabled={!input.trim()}
        >
          <Text>发送</Text>
        </Button>
      </View>
    </View>
  );
};

export default ChatPage;
