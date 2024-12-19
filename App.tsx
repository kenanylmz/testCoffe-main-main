import React, {useEffect, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {Image, ActivityIndicator, View} from 'react-native';
import auth, {FirebaseAuthTypes} from '@react-native-firebase/auth';
import database from '@react-native-firebase/database';
import Splash from './src/screens/Splash';
import SplashTwo from './src/screens/SplashTwo';
import Login from './src/screens/Login';
import Kafeler from './src/screens/Kafeler';
import Kayıt from './src/screens/Kayıt';
import Dogrulama from './src/screens/Dogrulama';
import Mudavim from './src/screens/Mudavim';
import Kuponlarım from './src/screens/Kuponlarım';
import Profil from './src/screens/Profil';
import Admin from './src/screens/Admin/Admin';
import SuperAdmin from './src/screens/Admin/SuperAdmin';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TabNavigator = () => {
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
      }}>
      <Tab.Screen
        name="Anasayfa"
        component={Mudavim}
        options={{
          tabBarIcon: ({focused}) => (
            <Image
              source={require('./src/styles/anasayfa_icon.png')}
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
        name="Kuponlarım"
        component={Kuponlarım}
        options={{
          tabBarIcon: ({focused}) => (
            <Image
              source={require('./src/styles/kuponlarım_icon.png')}
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
        name="Profil"
        component={Profil}
        options={{
          tabBarIcon: ({focused}) => (
            <Image
              source={require('./src/styles/profil_icon.png')}
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
  );
};

const App = () => {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isFirstLaunch, setIsFirstLaunch] = useState(true);
  const [isRoleLoading, setIsRoleLoading] = useState(true);

  // Handle user state changes
  async function onAuthStateChanged(user: FirebaseAuthTypes.User | null) {
    setUser(user);

    if (user) {
      setIsRoleLoading(true);
      try {
        // Get user role from database
        const snapshot = await database()
          .ref(`users/${user.uid}`)
          .once('value');
        
        const userData = snapshot.val();
        console.log('User role:', userData?.role); // Debug log
        setUserRole(userData?.role || 'user');
      } catch (error) {
        console.error('Error fetching user role:', error);
        setUserRole('user'); // Fallback to user role
      } finally {
        setIsRoleLoading(false);
      }
    } else {
      setUserRole(null);
      setIsRoleLoading(false);
    }

    if (initializing) setInitializing(false);
  }

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber;
  }, []);

  // Show loading spinner while initializing or loading role
  if (initializing || isRoleLoading) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF'}}>
        <ActivityIndicator size="large" color="#4A3428" />
      </View>
    );
  }

  // Splash ekranları için ayrı Stack
  if (isFirstLaunch && !user) {
    return (
      <NavigationContainer>
        <Stack.Navigator screenOptions={{headerShown: false}}>
          <Stack.Screen 
            name="Splash" 
            component={Splash}
            listeners={{
              focus: () => {
                setTimeout(() => {
                  setIsFirstLaunch(false);
                }, 2000);
              },
            }}
          />
          <Stack.Screen name="SplashTwo" component={SplashTwo} />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }

  console.log('Current user role:', userRole); // Debug log

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{headerShown: false}}>
        {!user ? (
          // Auth screens
          <>
            <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name="Kayıt" component={Kayıt} />
            <Stack.Screen name="Dogrulama" component={Dogrulama} />
          </>
        ) : (
          // App screens based on user role
          <>
            {userRole === 'superadmin' && (
              <Stack.Screen 
                name="SuperAdmin" 
                component={SuperAdmin}
                options={{
                  headerShown: false,
                  gestureEnabled: false,
                }}
              />
            )}
            {userRole === 'admin' && (
              <Stack.Screen 
                name="AdminScreen" 
                component={Admin}
                options={{
                  headerShown: false,
                  gestureEnabled: false,
                }}
              />
            )}
            {userRole === 'user' && (
              <>
                <Stack.Screen name="Kafeler" component={Kafeler} />
                <Stack.Screen name="MainTabs" component={TabNavigator} />
              </>
            )}
            <Stack.Screen name="Dogrulama" component={Dogrulama} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
