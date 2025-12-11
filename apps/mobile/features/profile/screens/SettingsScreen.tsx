import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Text } from '../../../components/ui/Typography/Text';
import { SettingsItem } from '../components/SettingsItem';
import { useProfile } from '../hooks/useProfile';
import { useTheme } from '../../../shared/hooks/ui/useTheme';
import { RootStackParamList } from '../../../types/navigation';
import { useAuth } from '../../../features/auth/hooks/useAuth';
import * as Haptics from 'expo-haptics';

type SettingsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Settings'>;

export const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<SettingsScreenNavigationProp>();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const { profile, privacySettings, notificationSettings, accountSettings } = useProfile();
  const { logout } = useAuth();

  const [notifications, setNotifications] = useState({
    likes: true,
    comments: true,
    follows: true,
    mentions: true,
    reposts: true,
    messages: true,
  });

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            await logout();
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your data will be permanently deleted.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // Implement account deletion
            console.log('Delete account');
          },
        },
      ]
    );
  };

  const renderProfileSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Profile</Text>
      
      <SettingsItem
        title="Edit Profile"
        subtitle="Update your personal information"
        icon={<Ionicons name="person" />}
        onPress={() => navigation.navigate('EditProfile')}
      />
      
      <SettingsItem
        title="Privacy"
        subtitle="Control your privacy settings"
        icon={<Ionicons name="lock-closed" />}
        onPress={() => navigation.navigate('PrivacySettings')}
      />
      
      <SettingsItem
        title="Verification"
        subtitle="Get verified on Threads"
        icon={<Ionicons name="checkmark-circle" />}
        rightText={profile?.isVerified ? 'Verified' : 'Not Verified'}
        onPress={() => navigation.navigate('Verification')}
      />
    </View>
  );

  const renderAccountSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Account</Text>
      
      <SettingsItem
        title="Email & Phone"
        subtitle="Update your contact information"
        icon={<Ionicons name="mail" />}
        onPress={() => navigation.navigate('AccountSettings')}
      />
      
      <SettingsItem
        title="Change Password"
        subtitle="Update your password"
        icon={<Ionicons name="key" />}
        onPress={() => navigation.navigate('ChangePassword')}
      />
      
      <SettingsItem
        title="Language"
        subtitle="App language"
        icon={<Ionicons name="language" />}
        rightText="English"
        onPress={() => navigation.navigate('Language')}
      />
      
      <SettingsItem
        title="Currency"
        subtitle="Preferred currency"
        icon={<Ionicons name="cash" />}
        rightText="USD"
        onPress={() => navigation.navigate('Currency')}
      />
    </View>
  );

  const renderNotificationsSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Notifications</Text>
      
      <SettingsItem
        title="Push Notifications"
        subtitle="Receive push notifications"
        icon={<Ionicons name="notifications" />}
        type="switch"
        value={notifications.likes}
        onValueChange={(value) => setNotifications(prev => ({ ...prev, likes: value }))}
      />
      
      <SettingsItem
        title="Email Notifications"
        subtitle="Receive email notifications"
        icon={<Ionicons name="mail" />}
        type="switch"
        value={notifications.comments}
        onValueChange={(value) => setNotifications(prev => ({ ...prev, comments: value }))}
      />
      
      <SettingsItem
        title="Sound"
        subtitle="Play sound for notifications"
        icon={<Ionicons name="volume-high" />}
        type="switch"
        value={true}
        onValueChange={() => {}}
      />
      
      <SettingsItem
        title="Vibration"
        subtitle="Vibrate for notifications"
        icon={<Ionicons name="phone-portrait" />}
        type="switch"
        value={true}
        onValueChange={() => {}}
      />
    </View>
  );

  const renderPrivacySection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Privacy & Security</Text>
      
      <SettingsItem
        title="Active Sessions"
        subtitle="Manage your logged-in devices"
        icon={<Ionicons name="desktop" />}
        onPress={() => navigation.navigate('ActiveSessions')}
      />
      
      <SettingsItem
        title="Blocked Accounts"
        subtitle="Manage blocked accounts"
        icon={<Ionicons name="ban" />}
        onPress={() => navigation.navigate('BlockedAccounts')}
      />
      
      <SettingsItem
        title="Two-Factor Authentication"
        subtitle="Add extra security to your account"
        icon={<Ionicons name="shield-checkmark" />}
        type="switch"
        value={accountSettings?.twoFactorAuth || false}
        onValueChange={() => {}}
      />
      
      <SettingsItem
        title="Download Your Data"
        subtitle="Get a copy of your data"
        icon={<Ionicons name="download" />}
        onPress={() => navigation.navigate('DownloadData')}
      />
    </View>
  );

  const renderSupportSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Support</Text>
      
      <SettingsItem
        title="Help Center"
        subtitle="Get help and support"
        icon={<Ionicons name="help-circle" />}
        onPress={() => navigation.navigate('HelpCenter')}
      />
      
      <SettingsItem
        title="Report a Problem"
        subtitle="Report bugs or issues"
        icon={<Ionicons name="flag" />}
        onPress={() => navigation.navigate('ReportProblem')}
      />
      
      <SettingsItem
        title="Terms of Service"
        subtitle="Read our terms of service"
        icon={<Ionicons name="document-text" />}
        onPress={() => navigation.navigate('TermsOfService')}
      />
      
      <SettingsItem
        title="Privacy Policy"
        subtitle="Read our privacy policy"
        icon={<Ionicons name="shield" />}
        onPress={() => navigation.navigate('PrivacyPolicy')}
      />
    </View>
  );

  const renderDangerSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Danger Zone</Text>
      
      <SettingsItem
        title="Log Out"
        icon={<Ionicons name="log-out" />}
        type="destructive"
        onPress={handleLogout}
      />
      
      <SettingsItem
        title="Deactivate Account"
        subtitle="Temporarily disable your account"
        icon={<Ionicons name="pause-circle" />}
        type="destructive"
        onPress={handleDeleteAccount}
      />
      
      <SettingsItem
        title="Delete Account"
        subtitle="Permanently delete your account"
        icon={<Ionicons name="trash" />}
        type="destructive"
        onPress={handleDeleteAccount}
      />
    </View>
  );

  const renderHeader = () => (
    <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color={colors.text} />
      </TouchableOpacity>
      
      <Text style={styles.headerTitle}>Settings</Text>
      
      <View style={styles.headerRight} />
    </View>
  );

  const renderProfileCard = () => (
    <TouchableOpacity
      style={[styles.profileCard, { backgroundColor: colors.surface }]}
      onPress={() => (navigation as any).navigate('profile', { userId: profile?.id })}
    >
      <View style={styles.profileInfo}>
        <View style={styles.avatarContainer}>
          <Ionicons name="person-circle" size={48} color={colors.primary} />
        </View>
        
        <View style={styles.profileDetails}>
          <Text style={styles.profileName}>{profile?.name || 'User'}</Text>
          <Text style={styles.profileUsername}>
            @{profile?.username || 'username'}
          </Text>
        </View>
      </View>
      
      <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {renderHeader()}
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {renderProfileCard()}
        
        {renderProfileSection()}
        {renderAccountSection()}
        {renderNotificationsSection()}
        {renderPrivacySection()}
        {renderSupportSection()}
        {renderDangerSection()}
        
        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={[styles.appVersion, { color: colors.textSecondary }]}>
            Threads Clone v1.0.0
          </Text>
          <Text style={[styles.appCopyright, { color: colors.textSecondary }]}>
            © 2024 ExplorAdama. All rights reserved.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerRight: {
    width: 40,
  },
  profileCard: {
    marginHorizontal: 20,
    marginVertical: 16,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    marginRight: 12,
  },
  profileDetails: {
    flex: 1,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  profileUsername: {
    fontSize: 14,
    opacity: 0.6,
  },
  section: {
    marginTop: 24,
    marginHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    opacity: 0.6,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  appInfo: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  appVersion: {
    fontSize: 14,
    marginBottom: 8,
  },
  appCopyright: {
    fontSize: 12,
    textAlign: 'center',
  },
});