import React, { useState, useCallback } from 'react';
import {
  View,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CreatePostForm } from '../components/CreatePostForm';
import { useSocial } from '../hooks/useSocial';
import { useSocialAnalytics } from '../hooks/useSocial';
import { useTheme } from '../../../shared/hooks/ui/useTheme';
import { RootStackParamList } from '../../../types/navigation';
import { CreatePostData } from '../types/social.types';
import * as Haptics from 'expo-haptics';

type CreatePostScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'CreatePost'>;

export const CreatePostScreen: React.FC = () => {
  const navigation = useNavigation<CreatePostScreenNavigationProp>();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  
  const { createPost } = useSocial();
  const { recordPostCreated } = useSocialAnalytics();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = useCallback(async (data: CreatePostData) => {
    setIsSubmitting(true);
    
    try {
      const post = await createPost(data);
      
      if (post) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        recordPostCreated(post.id, data.isDraft ? 'draft' : 'published');
        
        Alert.alert(
          'Success!',
          data.isDraft ? 'Post saved as draft' : 'Post published successfully',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
            data.isDraft
              ? {
                  text: 'Edit Draft',
                  onPress: () => {
                    // Navigate to drafts or edit screen
                  },
                }
              : {
                  text: 'View Post',
                  onPress: () => navigation.navigate('PostDetail', { postId: post.id }),
                },
          ]
        );
      } else {
        throw new Error('Failed to create post');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to create post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [createPost, recordPostCreated, navigation]);

  const handleCancel = useCallback(() => {
    Alert.alert(
      'Discard Post?',
      'Are you sure you want to discard this post?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Discard',
          style: 'destructive',
          onPress: () => navigation.goBack(),
        },
      ]
    );
  }, [navigation]);

  return (
    <SafeAreaView style={[{ flex: 1, backgroundColor: colors.background }]}>
      <CreatePostForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={isSubmitting}
      />
    </SafeAreaView>
  );
};

export default CreatePostScreen;