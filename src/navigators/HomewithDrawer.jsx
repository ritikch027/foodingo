import React, { useContext } from 'react';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
} from '@react-navigation/drawer';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  Linking,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Feather';
import { UserContext } from '../utils/userContext';
import Home from '../screens/Home';
import Profile from '../components/profile';
import AddRestaurant from '../additionComponents/AddRestaurant';
import AddItem from '../additionComponents/AddItems';
import AddCategory from '../additionComponents/AddCategory';
import OwnerItemsDashboard from '../screens/OwnerItemsDashboard';
import AdminManagement from '../screens/AdminManagement';
import UserDetails from '../screens/UserDetails';
import RestaurantDetails from '../screens/RestaurantDetails';

import Animated, { FadeInDown } from 'react-native-reanimated';
import { colors, radii, spacing, typography, shadows, motion } from '../theme';

const Drawer = createDrawerNavigator();

/* ---------------- CUSTOM DRAWER ---------------- */

const CustomDrawerContent = props => {
  const { user, setIsLoggedIn } = useContext(UserContext);

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

  const openSocialMedia = platform => {
    const urls = {
      instagram: 'https://www.instagram.com/ritik_chauhan0_',
      facebook: 'https://www.facebook.com/yourcompany',
      twitter: 'https://www.twitter.com/yourcompany',
    };
    Linking.openURL(urls[platform]);
  };

  const menuItems = [
    { name: 'Home', icon: 'home', screen: 'Home' },
    { name: 'Profile', icon: 'user', screen: 'Profile' },

    ...(user?.role === 'customer'
      ? [{ name: 'My Orders', screen: 'MyOrders', icon: 'shopping-bag' }]
      : []),
    ...(user?.role === 'owner'
      ? [
          { name: 'Add Items', icon: 'package', screen: 'AddItem' },
          {
            name: 'Manage Items',
            icon: 'edit-3',
            screen: 'OwnerItemsDashboard',
          },
          { name: 'Orders', icon: 'clipboard', screen: 'RestaurantOrders' },
        ]
      : []),

    ...(user?.role === 'admin'
      ? [
          { name: 'Admin Panel', icon: 'shield', screen: 'AdminManagement' },
          { name: 'Add Category', icon: 'tag', screen: 'AddCategory' },
        ]
      : []),

    {
      name: 'Help & Support',
      icon: 'help-circle',
      action: () => Linking.openURL('https://mywebsite.com/help'),
    },
  ];

  return (
    <View style={styles.drawerContainer}>
      <DrawerContentScrollView {...props} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Animated.View
          entering={FadeInDown.duration(motion.fadeDuration)}
          style={styles.headerSection}
        >
          <View style={styles.profileContainer}>
            <Image
              source={{
                uri:
                  user?.image_url ||
                  'https://cdn-icons-png.flaticon.com/512/149/149071.png',
              }}
              style={styles.profileImage}
            />

            <View style={styles.profileInfo}>
              <Text style={styles.userName}>{user?.name || 'Guest User'}</Text>

              <View style={styles.roleBadge}>
                <Text style={styles.roleText}>
                  {user?.role === 'owner'
                    ? 'Owner'
                    : user?.role === 'admin'
                    ? 'Admin'
                    : 'Customer'}
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Menu */}
        <View style={styles.menuSection}>
          {menuItems.map((item, index) => (
            <Animated.View
              key={index}
              entering={FadeInDown.duration(motion.fadeDuration).delay(
                index * motion.fadeDelay,
              )}
            >
              <Pressable
                style={({ pressed }) => [
                  styles.menuItem,
                  pressed && styles.menuPressed,
                ]}
                onPress={() => {
                  if (item.screen) {
                    props.navigation.navigate(item.screen);
                  } else if (item.action) {
                    item.action();
                  }
                }}
              >
                <Icon name={item.icon} size={20} color={colors.primary} />
                <Text style={styles.menuText}>{item.name}</Text>
              </Pressable>
            </Animated.View>
          ))}
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Social */}
        <View style={styles.socialSection}>
          <Text style={styles.socialTitle}>Connect With Us</Text>

          <View style={styles.socialContainer}>
            <Pressable
              style={[styles.socialButton, { backgroundColor: '#E1306C' }]}
              onPress={() => openSocialMedia('instagram')}
            >
              <Icon name="instagram" size={20} color={colors.surface} />
            </Pressable>

            <Pressable
              style={[styles.socialButton, { backgroundColor: '#1877F2' }]}
              onPress={() => openSocialMedia('facebook')}
            >
              <Icon name="facebook" size={20} color={colors.surface} />
            </Pressable>

            <Pressable
              style={[styles.socialButton, { backgroundColor: '#1DA1F2' }]}
              onPress={() => openSocialMedia('twitter')}
            >
              <Icon name="twitter" size={20} color={colors.surface} />
            </Pressable>
          </View>
        </View>
      </DrawerContentScrollView>

      {/* Footer */}
      <View style={styles.footerSection}>
        <Pressable
          style={({ pressed }) => [
            styles.logoutButton,
            pressed && { opacity: 0.8 },
          ]}
          onPress={handleLogout}
        >
          <Icon name="log-out" size={20} color={colors.error} />
          <Text style={styles.logoutText}>Logout</Text>
        </Pressable>

        <Text style={styles.versionText}>Foodingo v1.0.0</Text>
      </View>
    </View>
  );
};

/* ---------------- NAVIGATOR ---------------- */

const HomeWithDrawer = () => {
  return (
    <Drawer.Navigator
      drawerContent={props => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          width: 280,
          backgroundColor: colors.surface,
        },
        drawerType: 'slide',
        overlayColor: 'rgba(0,0,0,0.4)',
      }}
    >
      <Drawer.Screen name="Home" component={Home} />
      <Drawer.Screen name="Profile" component={Profile} />
      <Drawer.Screen name="AddRestaurant" component={AddRestaurant} />
      <Drawer.Screen name="AddItem" component={AddItem} />
      <Drawer.Screen name="AddCategory" component={AddCategory} />
      <Drawer.Screen name="AdminManagement" component={AdminManagement} />
      <Drawer.Screen name="UserDetails" component={UserDetails} />
      <Drawer.Screen name="RestaurantDetails" component={RestaurantDetails} />
      <Drawer.Screen
        name="OwnerItemsDashboard"
        component={OwnerItemsDashboard}
      />
    </Drawer.Navigator>
  );
};

export default HomeWithDrawer;

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  drawerContainer: {
    flex: 1,
    backgroundColor: colors.surface,
  },

  headerSection: {
    backgroundColor: colors.tintAlt,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    borderBottomLeftRadius: radii.xl,
    borderBottomRightRadius: radii.xl,
    marginBottom: spacing.sm,
  },

  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  profileImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 3,
    borderColor: colors.surface,
  },

  profileInfo: {
    marginLeft: spacing.md,
    flex: 1,
  },

  userName: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.xs,
  },

  roleBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },

  roleText: {
    color: colors.surface,
    fontSize: 12,
    fontWeight: '700',
  },

  menuSection: {
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.sm,
  },

  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.lg,
    marginVertical: 4,
  },

  menuPressed: {
    backgroundColor: colors.tint,
  },

  menuText: {
    ...typography.sub,
    color: colors.text,
    marginLeft: spacing.md,
  },

  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.lg,
    marginHorizontal: spacing.lg,
  },

  socialSection: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },

  socialTitle: {
    ...typography.sub,
    color: colors.text,
    marginBottom: spacing.sm,
  },

  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },

  socialButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.soft,
  },

  footerSection: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
  },

  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.lg,
    backgroundColor: '#FEF2F2',
    marginBottom: spacing.sm,
  },

  logoutText: {
    ...typography.sub,
    color: colors.error,
    marginLeft: spacing.md,
  },

  versionText: {
    ...typography.caption,
    color: colors.muted,
    textAlign: 'center',
  },
});
