import React, { useState } from 'react';
import {
  View,
  Alert,
  ActionSheetIOS,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { EditProfileForm } from '../components/EditProfileForm';
import { useProfile } from '../hooks/useProfile';
import { RootStackParamList } from '../../../types/navigation';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';

type EditProfileScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'EditProfile'>;

export const EditProfileScreen: React.FC = () => {
  const navigation = useNavigation<EditProfileScreenNavigationProp>();
  
  const { profile, updateProfile, uploadAvatar, uploadCoverImage, pickImage, takePhoto } = useProfile();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    
    try {
      await updateProfile(data);
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const showImageOptions = async (type: 'avatar' | 'cover') => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Take Photo', 'Choose from Library'],
          cancelButtonIndex: 0,
        },
        async (buttonIndex) => {
          await handleImageSelection(buttonIndex, type);
        }
      );
    } else {
      // For Android, show a custom modal or use another approach
      Alert.alert(
        'Change Photo',
        'Choose an option',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Take Photo',
            onPress: async () => await handleImageSelection(1, type),
          },
          {
            text: 'Choose from Library',
            onPress: async () => await handleImageSelection(2, type),
          },
        ]
      );
    }
  };

  const handleImageSelection = async (optionIndex: number, type: 'avatar' | 'cover') => {
    let imageUri: string | null = null;

    switch (optionIndex) {
      case 1: // Take Photo
        imageUri = await takePhoto();
        break;
      case 2: // Choose from Library
        imageUri = await pickImage();
        break;
      default:
        return;
    }

    if (imageUri) {
      try {
        if (type === 'avatar') {
          await uploadAvatar(imageUri);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } else {
          await uploadCoverImage(imageUri);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to upload image. Please try again.');
      }
    }
  };

  const handleAvatarChange = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    showImageOptions('avatar');
  };

  const handleCoverChange = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    showImageOptions('cover');
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  if (!profile) {
    return null;
  }

  const editProfileData = {
    name: profile.name,
    username: profile.username || '',
    bio: profile.bio || '',
    location: profile.location || '',
    website: profile.website || '',
    avatar: profile.avatar,
    coverImage: profile.coverImage,
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <EditProfileForm
        profile={editProfileData}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        onAvatarChange={handleAvatarChange}
        onCoverChange={handleCoverChange}
        isLoading={isSubmitting}
      />
    </SafeAreaView>
  );
};

export default EditProfileScreen;