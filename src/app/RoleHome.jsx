import React, { useContext, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../lib/api';
import { UserContext } from '../context/userContext';
import Home from '../features/browse/Home';
import OwnerHome from '../features/owner/OwnerHome';
import AdminHome from '../features/admin/AdminHome';
import { colors, spacing, typography } from '../theme';

const normalizeRole = role =>
  String(role || '')
    .toLowerCase()
    .trim();

const RoleHome = ({ navigation }) => {
  const { user, setUser } = useContext(UserContext);
  const [loadingUser, setLoadingUser] = useState(!user);

  useEffect(() => {
    let mounted = true;

    const ensureUser = async () => {
      try {
        if (user?._id) {
          if (mounted) setLoadingUser(false);
          return;
        }

        const token = await AsyncStorage.getItem('token');
        if (!token) {
          if (mounted) setLoadingUser(false);
          return;
        }

        const res = await api.get('/userdata');
        if (mounted && res.data?.user) {
          setUser(res.data.user);
        }
      } catch {
        // fall back to customer view if user can't be loaded
      } finally {
        if (mounted) setLoadingUser(false);
      }
    };

    ensureUser();
    return () => {
      mounted = false;
    };
  }, [user?._id, setUser]);

  if (loadingUser) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loaderText}>Loading...</Text>
      </View>
    );
  }

  const role = normalizeRole(user?.role) || 'customer';

  if (role === 'admin') {
    return <AdminHome navigation={navigation} />;
  }

  if (role === 'owner') {
    return <OwnerHome navigation={navigation} />;
  }

  return <Home navigation={navigation} />;
};

export default RoleHome;

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  loaderText: {
    marginTop: spacing.sm,
    ...typography.sub,
    color: colors.muted,
  },
});
