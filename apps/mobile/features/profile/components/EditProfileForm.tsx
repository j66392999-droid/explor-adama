import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../../components/ui/Typography/Text';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Loading } from '../../../components/ui/Loading';
import { useTheme } from '../../../shared/hooks/ui/useTheme';
import { EditProfileData } from '../types/profile.types';
import { formatUsername } from '../../../shared/utils/formatters';
import * as Haptics from 'expo-haptics';

interface EditProfileFormProps {
  profile: EditProfileData;
  onSubmit: (data: EditProfileData) => Promise<void>;
  onCancel: () => void;
  onAvatarChange: () => void;
  onCoverChange: () => void;
  isLoading?: boolean;
}

export const EditProfileForm: React.FC<EditProfileFormProps> = ({
  profile,
  onSubmit,
  onCancel,
  onAvatarChange,
  onCoverChange,
  isLoading = false,
}) => {
  const { colors } = useTheme();

  const [formData, setFormData] = useState<EditProfileData>({
    name: profile.name || '',
    username: profile.username || '',
    bio: profile.bio || '',
    location: profile.location || '',
    website: profile.website || '',
    avatar: profile.avatar,
    coverImage: profile.coverImage,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof EditProfileData, string>>>({});

  const handleChange = (field: keyof EditProfileData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof EditProfileData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (!/^[a-zA-Z0-9_]{3,30}$/.test(formData.username)) {
      newErrors.username = 'Username must be 3-30 characters and can only contain letters, numbers, and underscores';
    }

    if (formData.bio && formData.bio.length > 160) {
      newErrors.bio = 'Bio must be less than 160 characters';
    }

    if (formData.website && !/^https?:\/\/.+\..+/.test(formData.website)) {
      newErrors.website = 'Please enter a valid website URL';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    try {
      await onSubmit(formData);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    }
  };

  const handleAvatarPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onAvatarChange();
  };

  const handleCoverPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onCoverChange();
  };

  const characterCount = formData.bio?.length || 0;
  const maxBioLength = 160;

  if (isLoading) {
    return <Loading message="Updating profile..." />;
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
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <Button
            title="Save"
            onPress={handleSubmit}
            disabled={isLoading}
            variant="ghost"
          />
        </View>

        {/* Cover Image */}
        <TouchableOpacity style={styles.coverContainer} onPress={handleCoverPress}>
          <Image
            source={{ 
              uri: formData.coverImage || 'https://images.unsplash.com/photo-1519681393784-d120267933ba'
            }}
            style={styles.coverImage}
          />
          <View style={styles.coverOverlay}>
            <View style={[styles.coverButton, { backgroundColor: 'rgba(0,0,0,0.7)' }]}>
              <Ionicons name="camera" size={20} color="white" />
              <Text style={styles.coverButtonText}>Edit cover</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Avatar */}
        <View style={styles.avatarSection}>
          <TouchableOpacity onPress={handleAvatarPress}>
            <Image
              source={{ uri: formData.avatar || 'https://via.placeholder.com/100' }}
              style={styles.avatar}
            />
            <View style={[styles.avatarOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
              <Ionicons name="camera" size={24} color="white" />
            </View>
          </TouchableOpacity>
          <Text style={styles.avatarHint}>Tap to change photo</Text>
        </View>

        {/* Form Fields */}
        <View style={styles.form}>
          {/* Name */}
          <View style={styles.field}>
            <Text style={styles.label}>Name *</Text>
            <Input
              value={formData.name}
              onChangeText={(value) => handleChange('name', value)}
              placeholder="Your name"
              maxLength={50}
              error={errors.name}
              autoCapitalize="words"
            />
          </View>

          {/* Username */}
          <View style={styles.field}>
            <Text style={styles.label}>Username *</Text>
            <Input
              value={formData.username}
              onChangeText={(value) => handleChange('username', value)}
              placeholder="username"
              maxLength={30}
              error={errors.username}
              autoCapitalize="none"
              leftText="@"
            />
            <Text style={styles.hint}>
              This is your unique identifier. Others can mention you using @{formData.username || 'username'}
            </Text>
          </View>

          {/* Bio */}
          <View style={styles.field}>
            <Text style={styles.label}>Bio</Text>
            <Input
              value={formData.bio}
              onChangeText={(value) => handleChange('bio', value)}
              placeholder="Tell your story..."
              multiline
              numberOfLines={4}
              maxLength={maxBioLength}
              error={errors.bio}
              style={styles.bioInput}
            />
            <View style={styles.bioFooter}>
              <Text style={[styles.charCount, { 
                color: characterCount > maxBioLength ? colors.error : colors.textSecondary 
              }]}>
                {characterCount}/{maxBioLength}
              </Text>
              {characterCount > maxBioLength && (
                <Text style={[styles.errorText, { color: colors.error }]}>
                  Character limit exceeded
                </Text>
              )}
            </View>
          </View>

          {/* Location */}
          <View style={styles.field}>
            <Text style={styles.label}>Location</Text>
            <Input
              value={formData.location}
              onChangeText={(value) => handleChange('location', value)}
              placeholder="City, Country"
              maxLength={100}
              leftIcon={<Ionicons name="location" size={20} color={colors.textSecondary} />}
            />
          </View>

          {/* Website */}
          <View style={styles.field}>
            <Text style={styles.label}>Website</Text>
            <Input
              value={formData.website}
              onChangeText={(value) => handleChange('website', value)}
              placeholder="https://example.com"
              maxLength={100}
              error={errors.website}
              leftIcon={<Ionicons name="link" size={20} color={colors.textSecondary} />}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Social Links */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Social Links</Text>
            <Text style={styles.sectionDescription}>
              Connect your other social media accounts
            </Text>
            
            <TouchableOpacity style={[styles.socialButton, { backgroundColor: colors.surfaceVariant }]}>
              <Ionicons name="logo-twitter" size={20} color="#1DA1F2" />
              <Text style={styles.socialButtonText}>Connect Twitter</Text>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity style={[styles.socialButton, { backgroundColor: colors.surfaceVariant }]}>
              <Ionicons name="logo-instagram" size={20} color="#E1306C" />
              <Text style={styles.socialButtonText}>Connect Instagram</Text>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Delete Account */}
          <View style={styles.dangerSection}>
            <Text style={styles.dangerTitle}>Account Actions</Text>
            
            <TouchableOpacity style={[styles.dangerButton, { backgroundColor: colors.surface }]}>
              <Ionicons name="download" size={20} color={colors.text} />
              <Text style={styles.dangerButtonText}>Download your data</Text>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity style={[styles.dangerButton, { backgroundColor: colors.surface }]}>
              <Ionicons name="log-out" size={20} color={colors.error} />
              <Text style={[styles.dangerButtonText, { color: colors.error }]}>
                Deactivate account
              </Text>
              <Ionicons name="chevron-forward" size={20} color={colors.error} />
            </TouchableOpacity>
          </View>
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
            title="Save Changes"
            onPress={handleSubmit}
            disabled={isLoading}
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  coverContainer: {
    position: 'relative',
    height: 160,
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  coverOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  coverButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  coverButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  avatarSection: {
    alignItems: 'center',
    marginTop: -40,
    marginBottom: 24,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: 'white',
  },
  avatarOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarHint: {
    marginTop: 8,
    fontSize: 12,
    opacity: 0.6,
  },
  form: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  hint: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: 4,
  },
  bioInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  bioFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  charCount: {
    fontSize: 12,
  },
  errorText: {
    fontSize: 12,
    fontWeight: '500',
  },
  section: {
    marginTop: 32,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    opacity: 0.6,
    marginBottom: 16,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 12,
    gap: 12,
  },
  socialButtonText: {
    flex: 1,
    fontSize: 16,
  },
  dangerSection: {
    marginTop: 32,
    marginBottom: 24,
  },
  dangerTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#FF3B30',
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 12,
    gap: 12,
  },
  dangerButtonText: {
    flex: 1,
    fontSize: 16,
  },
  bottomActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 32,
    gap: 12,
  },
  bottomButton: {
    flex: 1,
  },
});