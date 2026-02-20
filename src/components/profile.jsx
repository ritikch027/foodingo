import React, { useContext } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  SafeAreaView,
  ScrollView,
  Pressable,
} from 'react-native';

import { UserContext } from '../utils/userContext';
import { useConfirm } from '../utils/confirm';
import { showSnack, showSimpleToast } from '../utils/toast';
import Icon from 'react-native-vector-icons/Feather';
import { colors, radii, spacing, typography, shadows } from '../theme';

const Profile = ({ navigation }) => {
  const { user, logout } = useContext(UserContext);
  const confirm = useConfirm();

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingCard}>
          <Icon name="user" size={36} color={colors.muted} />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </View>
    );
  }

  /* ---------------- ACTIONS ---------------- */

  const handleLogout = async () => {
    const ok = await confirm({
      title: 'Logout',
      message: 'Are you sure you want to logout?',
      confirmText: 'Logout',
      cancelText: 'Cancel',
      destructive: true,
    });

    if (!ok) return;
    await logout();
    showSimpleToast('Logged out');
  };

  const menuOptions = [
    {
      title: 'Notifications',
      icon: 'bell',
      onPress: () => showSnack('Notifications are cooking. Coming soon!'),
    },
    {
      title: 'Settings',
      icon: 'settings',
      onPress: () => navigation.navigate('Settings'),
    },
    user.role === 'customer' && {
      title: 'Register your restaurant',
      icon: 'plus',
      onPress: () => navigation.navigate('AddRestaurant'),
    },
  ].filter(Boolean);

  /* ---------------- UI ---------------- */

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topBar} />

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Profile</Text>
        </View>

        {/* Avatar */}
        <View style={styles.avatarContainer}>
          <Image
            style={styles.avatar}
            source={{
              uri:
                user.image_url ||
                'https://cdn-icons-png.flaticon.com/512/149/149071.png',
            }}
          />
        </View>

        {/* Name */}
        <Text style={styles.name}>{user.name}</Text>

        {/* Role */}
        <View style={styles.roleBadge}>
          <Icon
            name={user.role === 'owner' ? 'briefcase' : 'user'}
            size={12}
            color={colors.surface}
          />
          <Text style={styles.roleText}>
            {user.role === 'admin'
              ? 'Admin'
              : user.role === 'owner'
              ? 'Owner'
              : 'Customer'}
          </Text>
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Icon name="mail" size={18} color={colors.primary} />
            <Text style={styles.infoText}>{user.email}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Icon name="phone" size={18} color={colors.primary} />
            <Text style={styles.infoText}>+91 {user.phone}</Text>
          </View>
        </View>

        {/* Menu */}
        <View style={styles.menuSection}>
          {menuOptions.map((option, index) => (
            <Pressable
              key={index}
              onPress={option.onPress}
              style={({ pressed }) => [
                styles.menuItem,
                pressed && { opacity: 0.85 },
              ]}
            >
              <View style={styles.menuLeft}>
                <Icon name={option.icon} size={20} color={colors.primary} />
                <Text style={styles.menuText}>{option.title}</Text>
              </View>
              <Icon name="chevron-right" size={20} color={colors.muted} />
            </Pressable>
          ))}
        </View>

        {/* Logout */}
        <Pressable
          onPress={handleLogout}
          style={({ pressed }) => [
            styles.logoutBtn,
            pressed && { opacity: 0.85 },
          ]}
        >
          <Icon name="log-out" size={20} color={colors.error} />
          <Text style={styles.logoutText}>Logout</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Profile;

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg,
  },

  container: {
    alignItems: 'center',
    paddingBottom: spacing.xl,
  },
  topBar: {
    width: '100%',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },

  header: {
    width: '100%',
    paddingVertical: spacing.xl,
    alignItems: 'center',
    backgroundColor: colors.tintAlt,
    borderBottomLeftRadius: radii.xl,
    borderBottomRightRadius: radii.xl,
  },

  headerTitle: {
    ...typography.h2,
    color: colors.text,
  },

  avatarContainer: {
    marginTop: -30,
    backgroundColor: colors.surface,
    borderRadius: 60,
    padding: 4,
    ...shadows.card,
  },

  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: colors.border,
  },

  name: {
    ...typography.h1,
    color: colors.text,
    marginTop: spacing.sm,
  },

  roleBadge: {
    marginTop: spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 999,
  },

  roleText: {
    color: colors.surface,
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 6,
  },

  infoCard: {
    width: '90%',
    marginTop: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.lg,
    ...shadows.soft,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },

  infoText: {
    ...typography.body,
    color: colors.text,
  },

  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },

  menuSection: {
    width: '90%',
    marginTop: spacing.lg,
  },

  menuItem: {
    backgroundColor: colors.surface,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
    ...shadows.soft,
  },

  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  menuText: {
    ...typography.sub,
    color: colors.text,
    marginLeft: spacing.sm,
  },

  logoutBtn: {
    marginTop: spacing.lg,
    backgroundColor: '#FEF2F2',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
    borderRadius: radii.lg,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FECACA',
    gap: spacing.sm,
  },

  logoutText: {
    color: colors.error,
    fontSize: 16,
    fontWeight: '700',
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.bg,
  },

  loadingCard: {
    backgroundColor: colors.surface,
    padding: spacing.xl,
    borderRadius: radii.lg,
    alignItems: 'center',
    ...shadows.soft,
  },

  loadingText: {
    ...typography.sub,
    color: colors.muted,
    marginTop: spacing.sm,
  },
});
