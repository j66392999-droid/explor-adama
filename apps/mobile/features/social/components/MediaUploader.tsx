import React from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../../components/ui/Typography/Text';
import { Button } from '../../../components/ui/Button';
import { useTheme } from '../../../shared/hooks/ui/useTheme';
import { MediaFile } from '../types/social.types';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';

interface MediaUploaderProps {
  media: MediaFile[];
  onAddMedia: (media: MediaFile[]) => void;
  onRemoveMedia: (index: number) => void;
  maxFiles?: number;
  style?: any;
}

export const MediaUploader: React.FC<MediaUploaderProps> = ({
  media,
  onAddMedia,
  onRemoveMedia,
  maxFiles = 10,
  style,
}) => {
  const { colors } = useTheme();

  const handlePickMedia = async () => {
    if (media.length >= maxFiles) {
      Alert.alert('Limit Reached', `You can only upload up to ${maxFiles} files.`);
      return;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Please grant media library permissions to upload photos and videos.',
        [{ text: 'OK' }]
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsMultipleSelection: true,
      quality: 0.8,
      allowsEditing: false,
      selectionLimit: maxFiles - media.length,
    });

    if (!result.canceled) {
      const newMedia = result.assets
        .map(asset => {
          let type: 'image' | 'video' = 'image';
          if (asset.type === 'video' || asset.uri.includes('.mp4')) {
            type = 'video';
          } else if (asset.type === 'image' || asset.uri.includes('.jpg') || asset.uri.includes('.jpeg') || asset.uri.includes('.png')) {
            type = 'image';
          } else {
            // skip unsupported types
            return null;
          }
          return {
            uri: asset.uri,
            type,
            filename: asset.fileName ?? undefined,
            size: asset.fileSize,
          };
        })
        .filter((item): item is NonNullable<typeof item> => !!item);
      
      onAddMedia(newMedia);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const handleTakePhoto = async () => {
    if (media.length >= maxFiles) {
      Alert.alert('Limit Reached', `You can only upload up to ${maxFiles} files.`);
      return;
    }

    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Please grant camera permissions to take photos.',
        [{ text: 'OK' }]
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const newMedia = [{
        uri: result.assets[0].uri,
        type: 'image' as const,
        filename: `photo_${Date.now()}.jpg`,
        size: undefined,
      }];
      
      onAddMedia(newMedia);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const handleRemove = (index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onRemoveMedia(index);
  };

  const renderMediaItem = (item: MediaFile, index: number) => (
    <View key={index} style={styles.mediaItem}>
      {item.type === 'video' ? (
        <View style={styles.videoContainer}>
          <Image source={{ uri: item.uri }} style={styles.mediaImage} />
          <View style={styles.videoOverlay}>
            <Ionicons name="play" size={24} color="white" />
          </View>
        </View>
      ) : (
        <Image source={{ uri: item.uri }} style={styles.mediaImage} />
      )}
      
      <TouchableOpacity
        style={[styles.removeButton, { backgroundColor: colors.error }]}
        onPress={() => handleRemove(index)}
      >
        <Ionicons name="close" size={16} color="white" />
      </TouchableOpacity>
      
      {item.type === 'video' && (
        <View style={styles.videoBadge}>
          <Ionicons name="videocam" size={12} color="white" />
        </View>
      )}
    </View>
  );

  return (
    <View style={[styles.container, style]}>
      {media.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.mediaList}
        >
          {media.map(renderMediaItem)}
          
          {media.length < maxFiles && (
            <TouchableOpacity
              style={[styles.addButton, { borderColor: colors.border }]}
              onPress={handlePickMedia}
            >
              <Ionicons name="add" size={32} color={colors.textSecondary} />
              <Text style={[styles.addText, { color: colors.textSecondary }]}>
                Add More
              </Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      ) : (
        <View style={styles.emptyState}>
          <View style={[styles.emptyIcon, { backgroundColor: colors.surfaceVariant }]}>
            <Ionicons name="images" size={40} color={colors.textSecondary} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            No media selected
          </Text>
          <Text style={[styles.emptyDescription, { color: colors.textSecondary }]}>
            Add photos or videos to your post
          </Text>
          
          <View style={styles.buttonGroup}>
            <Button
              title="Choose from Library"
              variant="outline"
              onPress={handlePickMedia}
              leftIcon={<Ionicons name="images" size={20} />}
              style={styles.actionButton}
            />
            <Button
              title="Take Photo"
              variant="outline"
              onPress={handleTakePhoto}
              leftIcon={<Ionicons name="camera" size={20} />}
              style={styles.actionButton}
            />
          </View>
        </View>
      )}

      {media.length > 0 && (
        <View style={styles.stats}>
          <Text style={[styles.statsText, { color: colors.textSecondary }]}>
            {media.length}/{maxFiles} files
          </Text>
          <Text style={[styles.statsText, { color: colors.textSecondary }]}>
            {media.filter(m => m.type === 'video').length} videos,{' '}
            {media.filter(m => m.type === 'image').length} photos
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  mediaList: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  mediaItem: {
    position: 'relative',
    width: 100,
    height: 100,
    borderRadius: 8,
    overflow: 'hidden',
  },
  mediaImage: {
    width: '100%',
    height: '100%',
  },
  videoContainer: {
    position: 'relative',
  },
  videoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  addButton: {
    width: 100,
    height: 100,
    borderRadius: 8,
    borderWidth: 2,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  addText: {
    fontSize: 12,
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 40,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingHorizontal: 4,
  },
  statsText: {
    fontSize: 12,
  },
});