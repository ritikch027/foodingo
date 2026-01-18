import React, { useContext } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  SafeAreaView,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';

import { UserContext } from '../utils/userContext';
import Icon from 'react-native-vector-icons/Feather';
import api from '../utils/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';

const Profile = ({ navigation }) => {
  const { user, setIsLoggedIn } = useContext(UserContext);

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingCard}>
          <Icon name="user" size={42} color="#9ca3af" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </View>
    );
  }

  /* ---------------- ACTIONS ---------------- */

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await AsyncStorage.removeItem('token');
          setIsLoggedIn(false);
        },
      },
    ]);
  };

  const handleDeleteRestaurant = async () => {
    const token = await AsyncStorage.getItem('token');

    Alert.alert(
      'Delete Restaurant',
      'Are you sure you want to delete your restaurant?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/restaurant/delete/${user.restaurant}`, {
                headers: { Authorization: token },
              });

              Toast.show({
                type: 'success',
                text1: 'Restaurant deleted successfully',
              });

              navigation.replace('HomeWithDrawer');
            } catch (err) {
              Toast.show({
                type: 'error',
                text1: 'Delete failed',
                text2: 'Could not delete restaurant',
              });
            }
          },
        },
      ],
    );
  };

  const menuOptions = [
    {
      title: 'Order History',
      icon: 'clock',
      onPress: () =>
        Alert.alert('Coming Soon', 'Order history feature coming soon!'),
    },
    {
      title: 'Notifications',
      icon: 'bell',
      onPress: () =>
        Alert.alert('Coming Soon', 'Notifications feature coming soon!'),
    },
    {
      title: 'Settings',
      icon: 'settings',
      onPress: () =>
        Alert.alert('Coming Soon', 'Settings feature coming soon!'),
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
            color="#fff"
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
            <Icon name="mail" size={18} color="#4f46e5" />
            <Text style={styles.infoText}>{user.email}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Icon name="phone" size={18} color="#4f46e5" />
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
                pressed && { opacity: 0.8 },
              ]}
            >
              <View style={styles.menuLeft}>
                <Icon name={option.icon} size={20} color="#4f46e5" />
                <Text style={styles.menuText}>{option.title}</Text>
              </View>
              <Icon name="chevron-right" size={20} color="#9ca3af" />
            </Pressable>
          ))}
        </View>

        {/* Owner Section */}
        {user.role === 'owner' && (
          <View style={styles.ownerSection}>
            <Text style={styles.sectionTitle}>Owner Actions</Text>

            <Pressable
              onPress={() => navigation.navigate('AddItem')}
              style={styles.primaryBtn}
            >
              <Icon name="plus" size={20} color="#fff" />
              <Text style={styles.primaryText}>Add Items</Text>
            </Pressable>

            <Pressable
              onPress={handleDeleteRestaurant}
              style={[styles.primaryBtn, { backgroundColor: '#ef4444' }]}
            >
              <Icon name="trash-2" size={20} color="#fff" />
              <Text style={styles.primaryText}>Delete Restaurant</Text>
            </Pressable>
          </View>
        )}

        {/* Logout */}
        <Pressable
          onPress={handleLogout}
          style={({ pressed }) => [
            styles.logoutBtn,
            pressed && { opacity: 0.8 },
          ]}
        >
          <Icon name="log-out" size={20} color="#ef4444" />
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
    backgroundColor: '#f9fafb',
  },

  container: {
    alignItems: 'center',
    paddingBottom: 40,
  },

  header: {
    width: '100%',
    paddingVertical: 26,
    alignItems: 'center',
    backgroundColor: '#eef2ff',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },

  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
  },

  avatarContainer: {
    marginTop: -40,
    backgroundColor: '#fff',
    borderRadius: 60,
    padding: 4,
    elevation: 4,
  },

  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#e5e7eb',
  },

  name: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    marginTop: 12,
  },

  roleBadge: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4f46e5',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },

  roleText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 6,
  },

  infoCard: {
    width: '90%',
    marginTop: 26,
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 20,
    elevation: 2,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  infoText: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '600',
  },

  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 16,
  },

  menuSection: {
    width: '90%',
    marginTop: 30,
  },

  menuItem: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    elevation: 2,
  },

  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  menuText: {
    fontSize: 16,
    color: '#111827',
    marginLeft: 12,
    fontWeight: '600',
  },

  ownerSection: {
    width: '90%',
    marginTop: 30,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 16,
  },

  primaryBtn: {
    backgroundColor: '#4f46e5',
    paddingVertical: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    gap: 8,
  },

  primaryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },

  logoutBtn: {
    marginTop: 30,
    backgroundColor: '#fef2f2',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fecaca',
    gap: 8,
  },

  logoutText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '700',
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },

  loadingCard: {
    backgroundColor: '#fff',
    padding: 40,
    borderRadius: 20,
    alignItems: 'center',
    elevation: 2,
  },

  loadingText: {
    fontSize: 18,
    color: '#6b7280',
    marginTop: 15,
  },
});
