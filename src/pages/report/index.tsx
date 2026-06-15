import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, Textarea, Image, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { getQueryString, generateId } from '@/utils';
import styles from './index.module.scss';

const REPORT_REASONS = [
  { value: 'fake', label: '虚假信息', icon: '📋' },
  { value: 'harass', label: '恶意骚扰', icon: '🚫' },
  { value: 'violation', label: '违规内容', icon: '⚠️' },
  { value: 'fraud', label: '诈骗嫌疑', icon: '🕵️' },
  { value: 'other', label: '其他原因', icon: '📝' },
];

const ReportPage: React.FC = () => {
  const [postId, setPostId] = useState('');
  const [postTitle, setPostTitle] = useState('');
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  React.useEffect(() => {
    const id = getQueryString('postId');
    const title = getQueryString('postTitle');
    if (id) {
      setPostId(id);
    }
    if (title) {
      setPostTitle(decodeURIComponent(title));
    }
  }, []);

  const isValid = useMemo(() => {
    return reason && description.trim().length >= 10;
  }, [reason, description]);

  const handleChooseImage = useCallback(async () => {
    try {
      const res = await Taro.chooseImage({
        count: 3 - images.length,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
      });
      if (res.tempFilePaths) {
        setImages(prev => [...prev, ...res.tempFilePaths]);
        console.log('[Report] 选择图片成功', res.tempFilePaths);
      }
    } catch (error) {
      console.error('[Report] 选择图片失败', error);
    }
  }, [images.length]);

  const handleDeleteImage = useCallback((index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handlePreviewImage = useCallback((index: number) => {
    Taro.previewImage({
      current: images[index],
      urls: images,
    });
  }, [images]);

  const handleSubmit = useCallback(async () => {
    if (!isValid || submitting) return;

    setSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));

      const reportData = {
        id: generateId(),
        postId,
        reason,
        description: description.trim(),
        images,
        createdAt: new Date().toISOString(),
      };

      console.log('[Report] 举报提交成功', reportData);

      Taro.showToast({
        title: '举报已提交',
        icon: 'success',
        duration: 2000,
      });

      setTimeout(() => {
        Taro.navigateBack();
      }, 1500);
    } catch (error) {
      console.error('[Report] 举报提交失败', error);
      Taro.showToast({
        title: '提交失败，请重试',
        icon: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  }, [isValid, submitting, postId, reason, description, images]);

  const handleCancel = useCallback(() => {
    Taro.showModal({
      title: '提示',
      content: '确定要取消举报吗？',
      success: (res) => {
        if (res.confirm) {
          Taro.navigateBack();
        }
      },
    });
  }, []);

  return (
    <View className={styles.page}>
      {postTitle && (
        <View className={styles.postInfoCard}>
          <Text className={styles.postInfoLabel}>举报帖子</Text>
          <Text className={styles.postInfoTitle}>{postTitle}</Text>
        </View>
      )}

      <View className={styles.formSection}>
        <Text className={styles.sectionTitle}>
          <Text className={styles.required}>*</Text>
          举报原因
        </Text>
        <View className={styles.reasonGrid}>
          {REPORT_REASONS.map(item => (
            <View
              key={item.value}
              className={classnames(styles.reasonItem, reason === item.value && styles.active)}
              onClick={() => setReason(item.value)}
            >
              <Text className={styles.reasonIcon}>{item.icon}</Text>
              <Text className={styles.reasonLabel}>{item.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.formSection}>
        <Text className={styles.sectionTitle}>
          <Text className={styles.required}>*</Text>
          详细描述
        </Text>
        <Textarea
          className={styles.textarea}
          placeholder="请详细描述举报原因，提供相关细节有助于我们更快处理（至少10字）..."
          value={description}
          onInput={(e) => setDescription(e.detail.value)}
          maxLength={500}
        />
        <Text className={styles.charCount}>
          {description.length}/500
        </Text>
      </View>

      <View className={styles.formSection}>
        <Text className={styles.sectionTitle}>上传凭证（最多3张）</Text>
        <Text className={styles.sectionDesc}>
          请上传能够证明举报内容的截图或照片，以便我们核实处理
        </Text>
        <View className={styles.imageUpload}>
          {images.map((img, index) => (
            <View className={styles.imageItem} key={index}>
              <Image
                src={img}
                mode="aspectFill"
                onClick={() => handlePreviewImage(index)}
                onError={(e) => console.error('[Report] 图片加载失败', e)}
              />
              <View className={styles.deleteBtn} onClick={() => handleDeleteImage(index)}>
                <Text>×</Text>
              </View>
            </View>
          ))}
          {images.length < 3 && (
            <View className={styles.uploadBtn} onClick={handleChooseImage}>
              <Text className={styles.uploadIcon}>+</Text>
              <Text className={styles.uploadText}>添加凭证</Text>
            </View>
          )}
        </View>
      </View>

      <View className={styles.noticeCard}>
        <Text className={styles.noticeIcon}>📢</Text>
        <View className={styles.noticeContent}>
          <Text className={styles.noticeTitle}>温馨提示</Text>
          <Text className={styles.noticeText}>
            恶意举报、虚假举报将受到平台处罚，请确保举报内容真实有效。我们会在24小时内处理您的举报。
          </Text>
        </View>
      </View>

      <View className={styles.submitBar}>
        <Button className={styles.cancelBtn} onClick={handleCancel}>
          <Text>取消</Text>
        </Button>
        <Button
          className={classnames(styles.submitBtn, !isValid && styles.disabled)}
          onClick={handleSubmit}
          disabled={!isValid || submitting}
        >
          <Text>{submitting ? '提交中...' : '提交举报'}</Text>
        </Button>
      </View>
    </View>
  );
};

export default ReportPage;
