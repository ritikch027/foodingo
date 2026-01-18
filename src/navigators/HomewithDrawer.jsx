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

import Home from '../Home';
import Profile from '../components/profile';
import AddRestaurant from '../additionComponents/AddRestaurant';
import AddItem from '../additionComponents/AddItems';
import AddCategory from '../additionComponents/AddCategory';

import Animated, { FadeInDown } from 'react-native-reanimated';

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

    ...(user?.role === 'owner'
      ? [
          { name: 'Add Items', icon: 'package', screen: 'AddItem' },
          { name: 'Add Category', icon: 'tag', screen: 'AddCategory' },
        ]
      : []),

    ...(user?.role === 'admin'
      ? [
          { name: 'Delete Restaurant', icon: 'trash-2', screen: 'AddItem' },
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
        <Animated.View entering={FadeInDown} style={styles.headerSection}>
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
            <Animated.View key={index} entering={FadeInDown.delay(index * 60)}>
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
                <Icon name={item.icon} size={20} color="#4f46e5" />
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
              <Icon name="instagram" size={20} color="#fff" />
            </Pressable>

            <Pressable
              style={[styles.socialButton, { backgroundColor: '#1877F2' }]}
              onPress={() => openSocialMedia('facebook')}
            >
              <Icon name="facebook" size={20} color="#fff" />
            </Pressable>

            <Pressable
              style={[styles.socialButton, { backgroundColor: '#1DA1F2' }]}
              onPress={() => openSocialMedia('twitter')}
            >
              <Icon name="twitter" size={20} color="#fff" />
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
          <Icon name="log-out" size={20} color="#ef4444" />
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
          backgroundColor: '#fff',
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
    </Drawer.Navigator>
  );
};

export default HomeWithDrawer;

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  drawerContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },

  headerSection: {
    backgroundColor: '#eef2ff',
    paddingVertical: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 10,
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
    borderColor: '#fff',
  },

  profileInfo: {
    marginLeft: 14,
    flex: 1,
  },

  userName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 6,
  },

  roleBadge: {
    backgroundColor: '#4f46e5',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },

  roleText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },

  menuSection: {
    paddingHorizontal: 10,
    paddingTop: 10,
  },

  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 14,
    marginVertical: 4,
  },

  menuPressed: {
    backgroundColor: '#eef2ff',
  },

  menuText: {
    fontSize: 16,
    color: '#111827',
    marginLeft: 15,
    fontWeight: '600',
  },

  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 20,
    marginHorizontal: 20,
  },

  socialSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },

  socialTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 15,
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
    elevation: 3,
  },

  footerSection: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingVertical: 20,
    paddingHorizontal: 20,
  },

  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 14,
    backgroundColor: '#fef2f2',
    marginBottom: 10,
  },

  logoutText: {
    fontSize: 16,
    color: '#ef4444',
    marginLeft: 15,
    fontWeight: '700',
  },

  versionText: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
  },
});
