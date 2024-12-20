import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  TouchableOpacity,
  Alert,
  SafeAreaView,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import auth from '@react-native-firebase/auth';
import database from '@react-native-firebase/database';

const windowWidth = Dimensions.get('window').width;

const Mudavim = ({route}) => {
  const cafeName = route?.params?.cafeName;
  const logoPath = route?.params?.logoPath;
  const currentUser = auth().currentUser;
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (currentUser && cafeName) {
      const userCafeRef = database().ref(`users/${currentUser.uid}/cafes/${cafeName}`);
      const unsubscribe = userCafeRef.on('value', (snapshot) => {
        const cafeData = snapshot.val();
        if (cafeData) {
          setProgress(cafeData.coffeeCount || 0);
          
          // 5 kahveye ulaşıldığında bildirim göster
          if (cafeData.coffeeCount === 5 && cafeData.hasGift) {
            Alert.alert(
              'Tebrikler! 🎉',
              'Müdavim seviyesine ulaştınız! Kuponlarım sayfasından hediye kahve kuponunuzu görebilirsiniz.',
              [{ text: 'Tamam', style: 'default' }],
              { cancelable: true }
            );
          }
        }
      });

      return () => userCafeRef.off('value', unsubscribe);
    }
  }, [currentUser, cafeName]);

  // Generate unique QR code value
  const qrValue = JSON.stringify({
    userId: currentUser?.uid || 'guest',
    userEmail: currentUser?.email || 'guest',
    cafeName: cafeName,
    timestamp: new Date().toISOString(),
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>
          Hoşgeldiniz, {currentUser?.displayName || 'Misafir'}
        </Text>
      </View>

      <View style={styles.content}>
        <View style={styles.logoContainer}>
          {logoPath && (
            <Image
              source={
                logoPath === '../styles/arabica_logo.png'
                  ? require('../styles/arabica_logo.png')
                  : require('../styles/harputdibek_logo.png')
              }
              style={styles.logo}
            />
          )}
        </View>

        <View style={styles.qrSection}>
          <View style={styles.qrWrapper}>
            <QRCode
              value={qrValue}
              size={windowWidth * 0.4}
              backgroundColor="#F5E6D3"
            />
          </View>
          <Text style={styles.instructionText}>
            İndirimden yararlanmak için kasada QR Kodunu gösteriniz.
          </Text>
        </View>

        <View style={styles.progressSection}>
          <View style={styles.imageContainer}>
            <Image
              source={require('../styles/mudavim1.png')}
              style={styles.mudavimImage}
            />
          </View>

          <View style={styles.progressBarContainer}>
            <View
              style={[styles.progressBar, {width: `${(progress / 5) * 100}%`}]}
            />
          </View>

          <Text style={styles.progressText}>{progress}/5 Kahve</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4A3428',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  logoContainer: {
    width: '100%',
    height: windowWidth * 0.25,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  logo: {
    width: '60%',
    height: '100%',
    resizeMode: 'contain',
  },
  qrSection: {
    alignItems: 'center',
    marginTop: 30,
    width: '100%',
  },
  qrWrapper: {
    padding: 25,
    backgroundColor: '#F5E6D3',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 8,
  },
  instructionText: {
    marginTop: 20,
    fontSize: 15,
    textAlign: 'center',
    color: '#4A3428',
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  progressSection: {
    alignItems: 'center',
    marginTop: 40,
    width: '100%',
  },
  imageContainer: {
    marginBottom: 20,
  },
  mudavimImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  progressBarContainer: {
    width: windowWidth * 0.8,
    height: 12,
    backgroundColor: '#F5E6D3',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#C97D7D',
    borderRadius: 6,
  },
  progressText: {
    marginTop: 12,
    fontSize: 16,
    color: '#4A3428',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});

export default Mudavim;
