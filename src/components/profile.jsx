import {
  StyleSheet,
  Text,
  View,
  Image,
  Dimensions,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { React, useContext } from 'react';
import { UserContext } from '../utils/userContext';
import Icon from 'react-native-vector-icons/Feather';
import api from '../utils/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';

const screenWidth = Dimensions.get('window').width;

const Profile = ({ navigation }) => {
  const { user, setIsLoggedIn, setCartItems } = useContext(UserContext);

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingCard}>
          <Icon name="user" size={40} color="#9ca3af" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </View>
    );
  }

  const handleLogout = async () => {
    Alert.alert('Logout Confirmation', 'Are you sure you want to logout?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
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

  const handleAddItems = () => {
    navigation.navigate('AddItem');
  };
  const handleDeleteRestaurant = async () => {
    const token = await AsyncStorage.getItem('token');
    Alert.alert(
      'Deletion Confirmation',
      'Are you sure you want to remove your restaurant?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await api.delete(
                `/restaurant/delete/${user.restaurant}`,
                {
                  headers: {
                    Authorization: token, // Your JWT token stored in context or state
                  },
                },
              );
              console.log(res.data.message);
              Toast.show({
                type: 'success',
                text1: 'Deletion Successful',
                text2: 'Restaurant Deleted',
              });
              setTimeout(() => {
                navigation.replace('HomeWithDrawer');
              }, 500);
            } catch (err) {
              Toast.show({
                type: 'error',
                text1: err,
                text2: 'Failed to Delete restaurant',
              });
            }
          },
        },
      ],
    );
  };

  const handleEditProfile = () => {
    Alert.alert(
      'Coming Soon',
      'Profile editing feature will be available soon!',
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
      title: 'Register your restaurant With us',
      icon: 'plus',
      onPress: () => navigation.navigate('AddRestaurant'),
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={handleEditProfile}
          >
            <Icon name="edit-3" size={20} color="#4b0082" />
          </TouchableOpacity>
        </View>

        {/* Profile Avatar */}
        <View style={styles.avatarContainer}>
          <Image
            style={styles.avatar}
            source={{
              uri: user.image_url,
            }}
          />
          <TouchableOpacity style={styles.cameraButton}>
            <Icon name="camera" size={16} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* User Info */}
        <Text style={styles.name}>{user.name}</Text>
        <View style={styles.roleBadge}>
          <Icon
            name={user.role === 'owner' ? 'briefcase' : 'user'}
            size={12}
            color="#fff"
          />
          <Text style={styles.roleText}>
            {user.role === 'admin'
              ? 'Admin'
              : user.role == 'owner'
              ? 'Owner'
              : 'Customer'}
          </Text>
        </View>

        {/* Contact Information */}
        <View style={styles.infoSection}>
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Email Address</Text>
            <View style={styles.inputBox}>
              <Icon name="mail" size={18} color="#4b0082" />
              <Text style={styles.inputText}>{user.email}</Text>
            </View>
          </View>

          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Phone Number</Text>
            <View style={styles.inputBox}>
              <Icon name="phone" size={18} color="#4b0082" />
              <Text style={styles.inputText}>+91 {user.phone}</Text>
            </View>
          </View>
        </View>

        {/* Menu Options */}
        <View style={styles.menuSection}>
          {menuOptions.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={option.onPress}
            >
              <View style={styles.menuItemLeft}>
                <Icon name={option.icon} size={20} color="#4b0082" />
                <Text style={styles.menuItemText}>{option.title}</Text>
              </View>
              <Icon name="chevron-right" size={20} color="#9ca3af" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Owner-specific Actions */}
        {user.role === 'owner' && (
          <View style={styles.ownerSection}>
            <Text style={styles.sectionTitle}>Owner Actions</Text>
            <TouchableOpacity
              onPress={handleAddItems}
              style={styles.primaryActionBtn}
            >
              <Icon name="plus" size={20} color="#fff" />
              <Text style={styles.primaryActionText}>
                Add Items to Restaurant
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleDeleteRestaurant}
              style={styles.primaryActionBtn}
            >
              <Icon name="x" size={20} color="#fff" />
              <Text style={styles.primaryActionText}>
                delete Your restaurant
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Logout Button */}
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Icon name="log-out" size={20} color="#ef4444" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Profile;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingBottom: 40,
  },
  header: {
    width: '100%',
    height: 160,
    backgroundColor: 'rgb(245, 230, 215)',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    position: 'relative',
  },
  editButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  avatarContainer: {
    position: 'relative',
    marginTop: -50,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: '#fff',
    backgroundColor: '#e5e7eb',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#4b0082',
    padding: 8,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#fff',
  },
  name: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#4b0082',
    marginTop: 15,
    textAlign: 'center',
  },
  roleBadge: {
    backgroundColor: '#4b0082',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
  },
  roleText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 5,
  },
  infoSection: {
    width: '100%',
    paddingHorizontal: 20,
    marginTop: 30,
  },
  inputWrapper: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
    fontWeight: '500',
  },
  inputBox: {
    backgroundColor: '#f9fafb',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  inputText: {
    fontSize: 15,
    color: '#111827',
    marginLeft: 12,
    flex: 1,
  },
  menuSection: {
    width: '100%',
    paddingHorizontal: 20,
    marginTop: 20,
  },
  menuItem: {
    backgroundColor: '#f9fafb',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 16,
    color: '#111827',
    marginLeft: 12,
    fontWeight: '500',
  },
  ownerSection: {
    width: '100%',
    paddingHorizontal: 20,
    marginTop: 30,
    gap: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4b0082',
    marginBottom: 15,
  },
  primaryActionBtn: {
    backgroundColor: '#4b0082',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  primaryActionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  logoutBtn: {
    backgroundColor: '#fef2f2',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 12,
    marginTop: 30,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  logoutText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingCard: {
    backgroundColor: '#f9fafb',
    padding: 40,
    borderRadius: 20,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  loadingText: {
    fontSize: 18,
    color: '#6b7280',
    marginTop: 15,
  },
});
