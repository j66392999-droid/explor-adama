import React, { useState, useRef } from 'react';
import {
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../../components/ui/Typography/Text';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Loading } from '../../../components/ui/Loading';
import { MediaUploader } from './MediaUploader';
import { useTheme } from '../../../shared/hooks/ui/useTheme';
import { CreatePostData, MediaFile } from '../types/social.types';

interface CreatePostFormProps {
  onSubmit: (data: CreatePostData) => Promise<void>;
  onCancel: () => void;
  initialData?: Partial<CreatePostData>;
  isLoading?: boolean;
}

export const CreatePostForm: React.FC<CreatePostFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
  isLoading = false,
}) => {
  const { colors, spacing } = useTheme();
  const contentInputRef = useRef<TextInput>(null);

  const [title, setTitle] = useState(initialData?.title || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [category, setCategory] = useState(initialData?.category || '');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [media, setMedia] = useState<MediaFile[]>(initialData?.media || []);
  const [isDraft, setIsDraft] = useState(initialData?.isDraft || false);

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleAddMedia = (newMedia: MediaFile[]) => {
    setMedia([...media, ...newMedia]);
  };

  const handleRemoveMedia = (index: number) => {
    setMedia(media.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }

    if (!content.trim()) {
      Alert.alert('Error', 'Please enter content');
      return;
    }

    const postData: CreatePostData = {
      title: title.trim(),
      content: content.trim(),
      tags,
      media,
      isDraft,
    };

    if (category.trim()) {
      postData.category = category.trim();
    }

    try {
      await onSubmit(postData);
    } catch (error) {
      Alert.alert('Error', 'Failed to create post. Please try again.');
    }
  };

  const handleSaveDraft = () => {
    setIsDraft(true);
    handleSubmit();
  };

  const characterCount = content.length;
  const isOverLimit = characterCount > 5000;

  if (isLoading) {
    return <Loading message="Creating post..." />;
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onCancel}>
            <Ionicons name="close" size={28} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Post</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={handleSaveDraft} style={styles.draftButton}>
              <Text style={[styles.draftText, { color: colors.textSecondary }]}>
                Save Draft
              </Text>
            </TouchableOpacity>
            <Button
              title="Post"
              onPress={handleSubmit}
              disabled={isLoading || !title.trim() || !content.trim()}
              style={styles.postButton}
            />
          </View>
        </View>

        {/* Title Input */}
        <View style={styles.section}>
          <TextInput
            style={[styles.titleInput, { color: colors.text }]}
            placeholder="Title"
            placeholderTextColor={colors.textTertiary}
            value={title}
            onChangeText={setTitle}
            maxLength={100}
            returnKeyType="next"
            onSubmitEditing={() => contentInputRef.current?.focus()}
          />
          <Text style={[styles.charCount, { color: colors.textSecondary }]}>
            {title.length}/100
          </Text>
        </View>

        {/* Content Input */}
        <View style={styles.section}>
          <TextInput
            ref={contentInputRef}
            style={[styles.contentInput, { color: colors.text }]}
            placeholder="What's on your mind?"
            placeholderTextColor={colors.textTertiary}
            value={content}
            onChangeText={setContent}
            multiline
            numberOfLines={8}
            textAlignVertical="top"
            maxLength={5000}
          />
          <View style={styles.contentFooter}>
            <Text style={[styles.charCount, { 
              color: isOverLimit ? colors.error : colors.textSecondary 
            }]}>
              {characterCount}/5000
            </Text>
            {isOverLimit && (
              <Text style={[styles.errorText, { color: colors.error }]}>
                Character limit exceeded
              </Text>
            )}
          </View>
        </View>

        {/* Category Input */}
        <View style={styles.section}>
          <Input
            placeholder="Category (optional)"
            value={category}
            onChangeText={setCategory}
            leftIcon={<Ionicons name="pricetag" size={20} color={colors.textSecondary} />}
          />
        </View>

        {/* Tags Input */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tags</Text>
          <View style={styles.tagInputContainer}>
            <Input
              placeholder="Add a tag"
              value={tagInput}
              onChangeText={setTagInput}
              onSubmitEditing={handleAddTag}
              style={styles.tagInput}
            />
            <Button
              title="Add"
              onPress={handleAddTag}
              size="small"
              disabled={!tagInput.trim()}
              style={styles.addTagButton}
            />
          </View>
          
          {tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {tags.map((tag, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.tag, { backgroundColor: colors.surfaceVariant }]}
                  onPress={() => handleRemoveTag(tag)}
                >
                  <Text style={styles.tagText}>#{tag}</Text>
                  <Ionicons name="close" size={14} color={colors.textSecondary} />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Media Upload */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Media</Text>
          <MediaUploader
            media={media}
            onAddMedia={handleAddMedia}
            onRemoveMedia={handleRemoveMedia}
            maxFiles={10}
            style={styles.mediaUploader}
          />
        </View>

        {/* Post Settings */}
        <View style={[styles.section, styles.settingsSection]}>
          <Text style={styles.sectionTitle}>Post Settings</Text>
          
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => setIsDraft(!isDraft)}
          >
            <View style={styles.settingLeft}>
              <Ionicons 
                name={isDraft ? 'eye-off' : 'eye'} 
                size={20} 
                color={colors.textSecondary} 
              />
              <Text style={styles.settingText}>
                {isDraft ? 'Save as Draft' : 'Publish Immediately'}
              </Text>
            </View>
            <Ionicons
              name={isDraft ? 'checkmark-circle' : 'checkmark-circle-outline'}
              size={24}
              color={isDraft ? colors.primary : colors.textSecondary}
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="people" size={20} color={colors.textSecondary} />
              <Text style={styles.settingText}>Who can see this post?</Text>
            </View>
            <Text style={[styles.settingValue, { color: colors.primary }]}>Public</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="notifications" size={20} color={colors.textSecondary} />
              <Text style={styles.settingText}>Turn off commenting</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Bottom Actions */}
        <View style={styles.bottomActions}>
          <Button
            title="Cancel"
            variant="outline"
            onPress={onCancel}
            style={styles.bottomButton}
          />
          <Button
            title={isDraft ? 'Save Draft' : 'Publish Post'}
            onPress={handleSubmit}
            disabled={isLoading || !title.trim() || !content.trim()}
            style={styles.bottomButton}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  draftButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  draftText: {
    fontSize: 14,
  },
  postButton: {
    minWidth: 80,
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  titleInput: {
    fontSize: 22,
    fontWeight: 'bold',
    minHeight: 40,
  },
  contentInput: {
    fontSize: 16,
    lineHeight: 22,
    minHeight: 160,
  },
  contentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  charCount: {
    fontSize: 12,
  },
  errorText: {
    fontSize: 12,
    fontWeight: '500',
  },
  tagInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  tagInput: {
    flex: 1,
    marginBottom: 0,
  },
  addTagButton: {
    minWidth: 60,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  tagText: {
    fontSize: 14,
  },
  mediaUploader: {
    marginTop: 8,
  },
  settingsSection: {
    borderBottomWidth: 0,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingText: {
    fontSize: 16,
  },
  settingValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  bottomActions: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  bottomButton: {
    flex: 1,
  },
});