import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, Input, Textarea, Image, Picker, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import type { Post, PostType, PostCategory, Campus, PostStatus } from '@/types';
import { CAMPUS_OPTIONS, CATEGORY_OPTIONS } from '@/types';
import { currentUser } from '@/data/mockUser';
import { generateId } from '@/utils';
import { useAppStore } from '@/store';
import styles from './index.module.scss';

const PublishPage: React.FC = () => {
  const [type, setType] = useState<PostType>('lost');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<PostCategory | ''>('');
  const [campus, setCampus] = useState<Campus | ''>('');
  const [place, setPlace] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const addPost = useAppStore((state) => state.addPost);

  const isValid = useMemo(() => {
    return title.trim() && description.trim() && category && campus && place && startDate;
  }, [title, description, category, campus, place, startDate]);

  const handleChooseImage = useCallback(async () => {
    try {
      const res = await Taro.chooseImage({
        count: 9 - images.length,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
      });
      if (res.tempFilePaths) {
        setImages(prev => [...prev, ...res.tempFilePaths]);
        console.log('[Publish] 选择图片成功', res.tempFilePaths);
      }
    } catch (error) {
      console.error('[Publish] 选择图片失败', error);
    }
  }, [images.length]);

  const handleDeleteImage = useCallback((index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleAddTag = useCallback(() => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed) && tags.length < 5) {
      setTags(prev => [...prev, trimmed]);
      setTagInput('');
    }
  }, [tagInput, tags]);

  const handleRemoveTag = useCallback((index: number) => {
    setTags(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!isValid || submitting) return;

    setSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      const campusLatLongMap: Record<string, { lat: number; lng: number }> = {
        main: { lat: 39.9042, lng: 116.4074 },
        east: { lat: 39.9052, lng: 116.4084 },
        west: { lat: 39.9032, lng: 116.4064 },
        south: { lat: 39.9022, lng: 116.4054 },
        north: { lat: 39.9072, lng: 116.4104 },
      };
      const latLong = campusLatLongMap[campus as string] || campusLatLongMap.main;

      const newPost: Post = {
        id: generateId(),
        type,
        category: category as PostCategory,
        title: title.trim(),
        description: description.trim(),
        images,
        location: {
          campus: campus as Campus,
          place: place.trim(),
          latitude: latLong.lat,
          longitude: latLong.lng,
        },
        dateRange: {
          start: startDate,
          end: endDate || startDate,
        },
        tags,
        author: currentUser,
        status: 'active' as PostStatus,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        viewCount: 0,
        favoriteCount: 0,
      };

      addPost(newPost);
      console.log('[Publish] 发布成功', newPost);

      Taro.showToast({
        title: '发布成功',
        icon: 'success',
        duration: 2000,
      });

      setTimeout(() => {
        Taro.switchTab({
          url: '/pages/index/index',
        });
      }, 1500);
    } catch (error) {
      console.error('[Publish] 发布失败', error);
      Taro.showToast({
        title: '发布失败',
        icon: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  }, [isValid, submitting, type, title, description, category, campus, place, startDate, endDate, images, tags]);

  const handleReset = useCallback(() => {
    Taro.showModal({
      title: '提示',
      content: '确定要清空表单吗？',
      success: (res) => {
        if (res.confirm) {
        setTitle('');
        setDescription('');
        setCategory('');
        setCampus('');
        setPlace('');
        setStartDate('');
        setEndDate('');
        setImages([]);
        setTags([]);
        }
      },
    });
  }, []);

  const campusIndex = useMemo(() => {
    return CAMPUS_OPTIONS.findIndex(item => item.value === campus);
  }, [campus]);

  const today = useMemo(() => {
    return new Date().toISOString().split('T')[0];
  }, []);

  return (
    <View className={styles.page}>
      <View className={styles.typeSelector}>
        <View
          className={classnames(styles.typeOption, type === 'lost' && styles.lostActive)}
          onClick={() => setType('lost')}
        >
          <Text className={styles.typeIcon}>🔴</Text>
          <Text className={styles.typeText}>我丢失了物品</Text>
          <Text className={styles.typeDesc}>发布寻物启事</Text>
        </View>
        <View
          className={classnames(styles.typeOption, type === 'found' && styles.foundActive)}
          onClick={() => setType('found')}
        >
          <Text className={styles.typeIcon}>🔵</Text>
          <Text className={styles.typeText}>我拾到了物品</Text>
          <Text className={styles.typeDesc}>发布招领信息</Text>
        </View>
      </View>

      <View className={styles.formSection}>
        <Text className={styles.sectionTitle}>
          <Text className={styles.required}>*</Text>
          基本信息
        </Text>

        <View className={styles.inputRow}>
          <Text className={styles.label}>物品标题</Text>
          <Input
            className={styles.input}
            placeholder={type === 'lost' ? '例如：丢失身份证一张' : '例如：拾到手机一部'}
            value={title}
            onInput={(e) => setTitle(e.detail.value)}
            maxLength={50}
          />
        </View>

        <View className={styles.inputRow}>
          <Text className={styles.label}>物品分类</Text>
          <View className={styles.radioGroup}>
            {CATEGORY_OPTIONS.map(item => (
              <View
                key={item.value}
                className={classnames(styles.radioItem, category === item.value && styles.active)}
                onClick={() => setCategory(item.value)}
              >
                <Text>{item.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <View className={styles.inputRow}>
          <Text className={styles.label}>详细描述</Text>
          <Textarea
            className={styles.textarea}
            placeholder={type === 'lost' 
              ? '请详细描述物品特征、丢失经过等信息，越详细越有助于找回...'
              : '请详细描述物品特征、拾到时间地点等信息...'
            }
            value={description}
            onInput={(e) => setDescription(e.detail.value)}
            maxLength={500}
          />
        </View>
      </View>

      <View className={styles.formSection}>
        <Text className={styles.sectionTitle}>
          <Text className={styles.required}>*</Text>
          位置信息
        </Text>

        <View className={styles.pickerRow}>
          <View className={styles.pickerItem}>
            <Text className={styles.label}>校区</Text>
            <Picker
              mode="selector"
            range={CAMPUS_OPTIONS.map(item => item.label)}
            value={campusIndex >= 0 ? campusIndex : 0}
              onChange={(e) => {
              const index = parseInt(e.detail.value);
              setCampus(CAMPUS_OPTIONS[index].value);
            }}
            >
            <View className={classnames(styles.pickerValue, !campus && styles.placeholder)}>
              <Text>{campus ? CAMPUS_OPTIONS.find(item => item.value === campus)?.label : '请选择校区'}</Text>
            </View>
          </Picker>
        </View>

        <View className={styles.pickerItem}>
          <Text className={styles.label}>具体地点</Text>
          <Input
            className={styles.input}
            placeholder="例如：图书馆三楼"
            value={place}
            onInput={(e) => setPlace(e.detail.value)}
            maxLength={30}
          />
        </View>
        </View>
      </View>

      <View className={styles.formSection}>
        <Text className={styles.sectionTitle}>
          <Text className={styles.required}>*</Text>
          时间信息
        </Text>

        <View className={styles.pickerRow}>
          <View className={styles.pickerItem}>
            <Text className={styles.label}>开始日期</Text>
            <Picker
              mode="date"
              value={startDate}
              end={today}
              onChange={(e) => setStartDate(e.detail.value)}
            >
              <View className={classnames(styles.pickerValue, !startDate && styles.placeholder)}>
                <Text>{startDate || '选择日期'}</Text>
              </View>
            </Picker>
          </View>

          <View className={styles.pickerItem}>
            <Text className={styles.label}>结束日期（可选）</Text>
            <Picker
              mode="date"
              value={endDate}
              end={today}
              onChange={(e) => setEndDate(e.detail.value)}
            >
              <View className={classnames(styles.pickerValue, !endDate && styles.placeholder)}>
                <Text>{endDate || '选择日期'}</Text>
              </View>
            </Picker>
          </View>
        </View>
      </View>

      <View className={styles.formSection}>
        <Text className={styles.sectionTitle}>物品照片（最多9张）</Text>
        <View className={styles.imageUpload}>
          {images.map((img, index) => (
            <View className={styles.imageItem} key={index}>
              <Image
                src={img}
                mode="aspectFill"
                onError={(e) => console.error('[Publish] 图片加载失败', e)}
              />
              <View className={styles.deleteBtn} onClick={() => handleDeleteImage(index)}>
                <Text>×</Text>
              </View>
            </View>
          ))}
          {images.length < 9 && (
            <View className={styles.uploadBtn} onClick={handleChooseImage}>
              <Text className={styles.uploadIcon}>+</Text>
              <Text className={styles.uploadText}>添加照片</Text>
            </View>
          )}
        </View>
      </View>

      <View className={styles.formSection}>
        <Text className={styles.sectionTitle}>特征标签（最多5个）</Text>
        {tags.length > 0 && (
          <View className={styles.tagContainer}>
            {tags.map((tag, index) => (
              <View className={styles.tagItem} key={index}>
                <Text>{tag}</Text>
                <Text onClick={() => handleRemoveTag(index)}>×</Text>
              </View>
            ))}
          </View>
        )}
        <View className={styles.tagInput}>
          <Input
            className={styles.tagInputField}
            placeholder="输入标签，例如：黑色、iPhone、有划痕"
            value={tagInput}
            onInput={(e) => setTagInput(e.detail.value)}
            onConfirm={handleAddTag}
            maxLength={10}
          />
          <Button className={styles.addTagBtn} onClick={handleAddTag}>
            <Text>+</Text>
          </Button>
        </View>
      </View>

      <View className={styles.submitBar}>
        <Button className={styles.cancelBtn} onClick={handleReset}>
          <Text>清空</Text>
        </Button>
        <Button
          className={classnames(styles.submitBtn, !isValid && styles.disabled)}
          onClick={handleSubmit}
          disabled={!isValid || submitting}
        >
          <Text>{submitting ? '发布中...' : '立即发布'}</Text>
        </Button>
      </View>
    </View>
  );
};

export default PublishPage;
