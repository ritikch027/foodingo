import React, { useContext } from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import { UserContext } from '../../context/userContext';
import { colors, radii, spacing, typography, shadows } from '../../theme';

const AdminHome = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { user } = useContext(UserContext);
  const firstName = user?.name?.trim()?.split(/\s+/)?.[0] || 'Admin';

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.topRow}>
        <Pressable
          onPress={() => navigation.openDrawer()}
          style={({ pressed }) => [styles.iconBtn, pressed && { opacity: 0.7 }]}
        >
          <Icon name="menu" size={18} color={colors.text} />
        </Pressable>

        <Pressable
          onPress={() => navigation.navigate('Profile')}
          style={({ pressed }) => [styles.iconBtn, pressed && { opacity: 0.7 }]}
        >
          <Icon name="user" size={18} color={colors.text} />
        </Pressable>
      </View>

      <Text style={styles.greet}>Hi {firstName}</Text>
      <Text style={styles.heading}>Admin Dashboard</Text>

      <View style={styles.cardsWrap}>
        <Pressable
          onPress={() => navigation.navigate('AdminManagement')}
          style={({ pressed }) => [
            styles.card,
            pressed && { transform: [{ scale: 0.99 }] },
          ]}
        >
          <View style={styles.cardIcon}>
            <Icon name="shield" size={20} color={colors.primary} />
          </View>
          <View style={styles.cardBody}>
            <Text style={styles.cardTitle}>Manage Platform</Text>
            <Text style={styles.cardSub}>
              Users, restaurants, bans, roles
            </Text>
          </View>
          <Icon name="chevron-right" size={18} color={colors.muted} />
        </Pressable>

        <Pressable
          onPress={() => navigation.navigate('AddCategory')}
          style={({ pressed }) => [
            styles.card,
            pressed && { transform: [{ scale: 0.99 }] },
          ]}
        >
          <View style={styles.cardIcon}>
            <Icon name="tag" size={20} color={colors.primary} />
          </View>
          <View style={styles.cardBody}>
            <Text style={styles.cardTitle}>Add Category</Text>
            <Text style={styles.cardSub}>Create a new food category</Text>
          </View>
          <Icon name="chevron-right" size={18} color={colors.muted} />
        </Pressable>
      </View>
    </View>
  );
};

export default AdminHome;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: spacing.lg,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.soft,
  },
  greet: {
    ...typography.h2,
    color: colors.text,
    marginTop: spacing.sm,
  },
  heading: {
    ...typography.sub,
    color: colors.muted,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  cardsWrap: {
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    ...shadows.soft,
  },
  cardIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: colors.tint,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  cardBody: {
    flex: 1,
  },
  cardTitle: {
    ...typography.h3,
    color: colors.text,
  },
  cardSub: {
    ...typography.caption,
    color: colors.muted,
    marginTop: 2,
  },
});
