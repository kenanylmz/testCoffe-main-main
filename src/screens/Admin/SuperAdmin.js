import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { TouchableOpacity, Image, StyleSheet, BackHandler, Alert, View, Text } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AdminEkle from './AdminEkle';
import Adminler from './Adminler';
import auth from '@react-native-firebase/auth';

const Tab = createBottomTabNavigator();

const SuperAdmin = () => {
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
        <Text style={styles.headerTitle}>Super Admin Panel</Text>
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
      
      <Tab.Navigator
        screenOptions={{
          tabBarStyle: {
            backgroundColor: '#FFF',
            borderTopWidth: 1,
            borderTopColor: '#F0F0F0',
            height: 60,
          },
          tabBarActiveTintColor: '#4A3428',
          tabBarInactiveTintColor: '#999',
          headerShown: false,
        }}>
        <Tab.Screen
          name="Admin Ekle"
          component={AdminEkle}
          options={{
            tabBarIcon: ({focused}) => (
              <Image
                source={require('../../styles/profile_icon.png')}
                style={{
                  width: 24,
                  height: 24,
                  tintColor: focused ? '#4A3428' : '#999',
                }}
              />
            ),
          }}
        />
        <Tab.Screen
          name="Adminler"
          component={Adminler}
          options={{
            tabBarIcon: ({focused}) => (
              <Image
                source={require('../../styles/profile_icon.png')}
                style={{
                  width: 24,
                  height: 24,
                  tintColor: focused ? '#4A3428' : '#999',
                }}
              />
            ),
          }}
        />
      </Tab.Navigator>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
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
});

export default SuperAdmin;
