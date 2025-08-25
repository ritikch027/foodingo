import React, { useContext } from 'react';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItem,
} from '@react-navigation/drawer';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
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

const Drawer = createDrawerNavigator();

const CustomDrawerContent = props => {
  const { user, setIsLoggedIn, setCartItems } = useContext(UserContext);

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await AsyncStorage.removeItem('token');
          await AsyncStorage.setItem('isLoggedIn', 'false');
          setCartItems([]);
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
          { name: 'Delete Restaurant', icon: 'delete', screen: 'AddItem' },
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
        {/* Header Section */}
        <View style={styles.headerSection}>
          <View style={styles.profileContainer}>
            <Image
              source={{
                uri: user?.image_url || 'https://via.placeholder.com/60',
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
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={() => {
                if (item.screen) {
                  props.navigation.navigate(item.screen);
                } else if (item.action) {
                  item.action();
                }
              }}
            >
              <Icon name={item.icon} size={20} color="#4b0082" />
              <Text style={styles.menuText}>{item.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Social Media Section */}
        <View style={styles.socialSection}>
          <Text style={styles.socialTitle}>Connect With Us</Text>
          <View style={styles.socialContainer}>
            <TouchableOpacity
              style={[styles.socialButton, { backgroundColor: '#E1306C' }]}
              onPress={() => openSocialMedia('instagram')}
            >
              <Icon name="instagram" size={20} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.socialButton, { backgroundColor: '#1877F2' }]}
              onPress={() => openSocialMedia('facebook')}
            >
              <Icon name="facebook" size={20} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.socialButton, { backgroundColor: '#1DA1F2' }]}
              onPress={() => openSocialMedia('twitter')}
            >
              <Icon name="twitter" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </DrawerContentScrollView>

      {/* Footer with Logout */}
      <View style={styles.footerSection}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Icon name="log-out" size={20} color="#ef4444" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
        <Text style={styles.versionText}>Version 1.0.0</Text>
      </View>
    </View>
  );
};

const HomeWithDrawer = () => {
  return (
    <Drawer.Navigator
      drawerContent={props => <CustomDrawerContent {...props} />}
      screenOptions={{
        drawerActiveTintColor: '#4b0082',
        drawerActiveBackgroundColor: 'rgba(75, 0, 130, 0.1)',
        headerShown: false,
        drawerStyle: {
          width: 280,
          backgroundColor: '#fff',
        },
        drawerType: 'slide',
        overlayColor: 'rgba(0, 0, 0, 0.4)',
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

const styles = StyleSheet.create({
  drawerContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerSection: {
    backgroundColor: 'rgb(245, 230, 215)',
    paddingVertical: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 10,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: '#fff',
  },
  profileInfo: {
    marginLeft: 15,
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4b0082',
    marginBottom: 5,
  },
  roleBadge: {
    backgroundColor: '#4b0082',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  roleText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  menuSection: {
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginVertical: 2,
  },
  menuText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 15,
    fontWeight: '500',
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
    fontWeight: '600',
    color: '#4b0082',
    marginBottom: 15,
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  socialButton: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
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
    borderRadius: 12,
    backgroundColor: '#fef2f2',
    marginBottom: 10,
  },
  logoutText: {
    fontSize: 16,
    color: '#ef4444',
    marginLeft: 15,
    fontWeight: '500',
  },
  versionText: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
  },
});

export default HomeWithDrawer;
