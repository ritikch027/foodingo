import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Alert,
  BackHandler,
} from 'react-native';
import Toast from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/Feather';
import { useFocusEffect } from '@react-navigation/native';
import api from '../utils/api';
import { UserContext } from '../utils/userContext';
import { colors, radii, spacing, typography, shadows } from '../theme';

const ROLE_OPTIONS = ['customer', 'owner', 'admin'];

const normalize = value =>
  String(value || '')
    .toLowerCase()
    .trim();

const getUserRole = user => normalize(user?.role) || 'customer';

const isUserBanned = user =>
  Boolean(user?.isBanned || user?.banned || user?.status === 'banned');

const UserDetails = ({ route, navigation }) => {
  const { user: currentUser } = React.useContext(UserContext);
  const [targetUser, setTargetUser] = useState(route?.params?.user || null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setTargetUser(route?.params?.user || null);
  }, [route?.params?.user]);

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        navigation.navigate('AdminManagement');
        return true;
      };

      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress,
      );

      return () => subscription.remove();
    }, [navigation]),
  );

  const role = useMemo(() => getUserRole(targetUser), [targetUser]);
  const banned = useMemo(() => isUserBanned(targetUser), [targetUser]);

  const updateUserRole = async (userId, nextRole) => {
    const payload = { role: nextRole };
    await api.patch(`/admin/users/${userId}/role`, payload);
  };

  const handleChangeRole = nextRole => {
    if (!targetUser?._id || role === nextRole) return;

    const userLabel =
      targetUser?.name || targetUser?.email || targetUser?.phone || 'this user';

    Alert.alert(
      'Confirm Role Change',
      `Change ${userLabel}'s role from ${role} to ${nextRole}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              setLoading(true);
              await updateUserRole(targetUser._id, nextRole);
              setTargetUser(prev => ({ ...prev, role: nextRole }));
              Toast.show({
                type: 'success',
                text1: `Role updated to ${nextRole}`,
              });
            } catch (error) {
              Toast.show({
                type: 'error',
                text1: 'Failed to update role',
                text2: error?.response?.data?.message || 'Please try again',
              });
            } finally {
              setLoading(false);
            }
          },
        },
      ],
    );
  };

  const handleToggleBan = async () => {
    if (!targetUser?._id) return;

    if (role === 'admin') {
      Toast.show({
        type: 'error',
        text1: 'Admins cannot be banned',
      });
      return;
    }

    const nextBanState = !banned;
    const actionLabel = nextBanState ? 'ban' : 'unban';
    const userLabel =
      targetUser?.name || targetUser?.email || targetUser?.phone || 'this user';

    Alert.alert(
      nextBanState ? 'Confirm Ban' : 'Confirm Unban',
      `${nextBanState ? 'Ban' : 'Unban'} ${userLabel}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          style: nextBanState ? 'destructive' : 'default',
          onPress: async () => {
            try {
              setLoading(true);
              await api.patch(`/admin/users/${targetUser._id}/ban`, {
                isBanned: nextBanState,
              });
              setTargetUser(prev => ({
                ...prev,
                isBanned: nextBanState,
                banned: nextBanState,
                status: nextBanState ? 'banned' : 'active',
              }));
              Toast.show({
                type: 'success',
                text1: `User ${actionLabel}ned`,
              });
            } catch (error) {
              Toast.show({
                type: 'error',
                text1: `Failed to ${actionLabel} user`,
                text2: error?.response?.data?.message || 'Please try again',
              });
            } finally {
              setLoading(false);
            }
          },
        },
      ],
    );
  };

  if (currentUser?.role !== 'admin') {
    return (
      <View style={styles.unauthorizedWrap}>
        <Icon name="lock" size={28} color={colors.muted} />
        <Text style={styles.unauthorizedText}>
          Only admins can access this page
        </Text>
      </View>
    );
  }

  if (!targetUser) {
    return (
      <View style={styles.unauthorizedWrap}>
        <Text style={styles.unauthorizedText}>User details not available</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.headerRow}>
        <Text style={styles.heading}>User Details</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.rowSpace}>
          <Text style={styles.cardTitle}>{targetUser?.name || 'Unnamed user'}</Text>
          <View
            style={[styles.badge, banned ? styles.badgeDanger : styles.badgeOk]}
          >
            <Text style={styles.badgeText}>{banned ? 'Banned' : 'Active'}</Text>
          </View>
        </View>
        <Text style={styles.cardMeta}>Email: {targetUser?.email || '-'}</Text>
        <Text style={styles.cardMeta}>Phone: {targetUser?.phone || '-'}</Text>
        <Text style={styles.cardMeta}>Role: {role}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Change Role</Text>
        <View style={styles.roleActionsRow}>
          {ROLE_OPTIONS.map(option => {
            const selected = option === role;
            return (
              <Pressable
                key={option}
                onPress={() => handleChangeRole(option)}
                disabled={loading || selected}
                style={({ pressed }) => [
                  styles.roleBtn,
                  selected && styles.roleBtnActive,
                  (pressed || loading) && { opacity: 0.85 },
                ]}
              >
                <Text
                  style={[styles.roleBtnText, selected && styles.roleBtnTextActive]}
                >
                  {option}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <Pressable
        onPress={handleToggleBan}
        disabled={loading || role === 'admin'}
        style={({ pressed }) => [
          styles.actionBtn,
          banned ? styles.unbanBtn : styles.banBtn,
          (pressed || loading || role === 'admin') && { opacity: 0.85 },
        ]}
      >
        {loading ? (
          <ActivityIndicator size="small" color={colors.surface} />
        ) : (
          <Text style={styles.actionBtnText}>
            {banned ? 'Unban User' : 'Ban User'}
          </Text>
        )}
      </Pressable>

      {role === 'admin' && (
        <Text style={styles.helperText}>Admins cannot be banned.</Text>
      )}
    </View>
  );
};

export default UserDetails;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  heading: {
    ...typography.h2,
    color: colors.text,
  },
  card: {
    marginTop: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    ...shadows.soft,
  },
  rowSpace: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  cardTitle: {
    ...typography.h3,
    color: colors.text,
    flex: 1,
  },
  cardMeta: {
    ...typography.sub,
    color: colors.muted,
    marginTop: 4,
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  badgeOk: {
    backgroundColor: '#DCFCE7',
  },
  badgeDanger: {
    backgroundColor: '#FEE2E2',
  },
  badgeText: {
    ...typography.caption,
    color: colors.text,
    fontWeight: '700',
  },
  section: {
    marginTop: spacing.lg,
  },
  sectionTitle: {
    ...typography.sub,
    color: colors.text,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  roleActionsRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  roleBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  roleBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  roleBtnText: {
    ...typography.caption,
    color: colors.text,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  roleBtnTextActive: {
    color: colors.surface,
  },
  actionBtn: {
    marginTop: spacing.lg,
    borderRadius: radii.md,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },
  banBtn: {
    backgroundColor: colors.warning,
  },
  unbanBtn: {
    backgroundColor: colors.info,
  },
  actionBtnText: {
    color: colors.surface,
    fontWeight: '700',
    fontSize: 14,
  },
  helperText: {
    ...typography.caption,
    color: colors.muted,
    marginTop: spacing.sm,
  },
  unauthorizedWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.bg,
  },
  unauthorizedText: {
    ...typography.sub,
    color: colors.muted,
    textAlign: 'center',
  },
});
