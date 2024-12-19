import React from 'react'; //Admin 
import { View, Text, StyleSheet, TouchableOpacity, Image, BackHandler } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import auth from '@react-native-firebase/auth';
import QRScanner from './QRScanner';

const Tab = createBottomTabNavigator();

const AdminHome = ({ navigation }) => {
  const handleLogout = async () => {
    try {
      await auth().signOut();
      // Çıkış işlemi Firebase tarafından handle edilecek
    } catch (error) {
      console.error('Çıkış yapılırken hata:', error);
      Alert.alert(
        'Hata',
        'Çıkış yapılırken bir hata oluştu. Lütfen tekrar deneyin.'
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Admin Panel</Text>
        <TouchableOpacity 
          onPress={handleLogout}
          style={styles.logoutButton}
        >
          <Image
            source={require('../../styles/cıkıs_icon.png')}
            style={styles.logoutIcon}
          />
        </TouchableOpacity>
      </View>
      <View style={styles.content}>
        <Text style={styles.text}>Admin Paneli</Text>
      </View>
    </View>
  );
};

const Admin = () => {
  // Geri tuşunu engelle
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        return true; // true döndürerek geri tuşunu engelliyoruz
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () =>
        BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [])
  );

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          backgroundColor: '#FFF',
          borderTopWidth: 1,
          borderTopColor: '#F0F0F0',
        },
        tabBarActiveTintColor: '#4A3428',
        tabBarInactiveTintColor: '#999',
        headerShown: false,
      }}
    >
      <Tab.Screen 
        name="AdminHome" 
        component={AdminHome}
        options={{
          tabBarLabel: 'Ana Sayfa',
          tabBarIcon: ({ color }) => (
            <Image
              source={require('../../styles/anasayfa_icon.png')}
              style={[styles.tabIcon, { tintColor: color }]}
            />
          ),
        }}
      />
      <Tab.Screen 
        name="QRScanner" 
        component={QRScanner}
        options={{
          tabBarLabel: 'QR Okut',
          tabBarIcon: ({ color }) => (
            <Image
              source={require('../../styles/kart_icon.png')}
              style={[styles.tabIcon, { tintColor: color }]}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF',
    height: 60,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4A3428',
  },
  logoutButton: {
    padding: 5,
  },
  logoutIcon: {
    width: 24,
    height: 24,
    tintColor: '#4A3428',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  tabIcon: {
    width: 24,
    height: 24,
  },
});

export default Admin;
