import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import {checkEmailVerification, resendVerificationEmail} from '../config/firebase';
import auth from '@react-native-firebase/auth';

const Dogrulama = ({route, navigation}) => {
  const currentUser = auth().currentUser;
  const email = route.params?.email || currentUser?.email || 'your email';
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);

  const checkVerification = async () => {
    if (!currentUser) {
      Alert.alert('Hata', 'Kullanıcı oturumu bulunamadı.');
      return;
    }

    setChecking(true);
    try {
      await currentUser.reload(); // Kullanıcı bilgilerini yenile
      const isVerified = currentUser.emailVerified;
      
      if (isVerified) {
        Alert.alert(
          'Başarılı',
          'E-posta adresiniz doğrulandı!',
          [
            {
              text: 'Tamam',
              onPress: () => navigation.replace('Kafeler'),
            },
          ],
          {cancelable: false}
        );
      } else {
        Alert.alert('Bilgi', 'E-posta adresiniz henüz doğrulanmamış.');
      }
    } catch (error) {
      Alert.alert('Hata', error.message || 'Doğrulama kontrolü başarısız oldu.');
    } finally {
      setChecking(false);
    }
  };

  const handleResendEmail = async () => {
    if (!currentUser) {
      Alert.alert('Hata', 'Kullanıcı oturumu bulunamadı.');
      return;
    }

    setLoading(true);
    try {
      await currentUser.sendEmailVerification();
      Alert.alert('Başarılı', 'Doğrulama e-postası tekrar gönderildi.');
    } catch (error) {
      Alert.alert('Hata', error.message || 'E-posta gönderimi başarısız oldu.');
    } finally {
      setLoading(false);
    }
  };

  const openEmail = () => {
    Linking.openURL('mailto:');
  };

  useEffect(() => {
    const checkInterval = setInterval(checkVerification, 5000);
    return () => clearInterval(checkInterval);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.innerContainer}>
        <Text style={styles.title}>E-posta Doğrulama</Text>
        
        <Text style={styles.description}>
          {email === 'your email' 
            ? 'Lütfen e-posta adresinize gönderilen doğrulama e-postasını onaylayın.'
            : `Lütfen ${email} adresine gönderilen doğrulama e-postasını onaylayın.`}
        </Text>

        <TouchableOpacity style={styles.button} onPress={openEmail}>
          <Text style={styles.buttonText}>E-posta Uygulamasını Aç</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.button} 
          onPress={checkVerification}
          disabled={checking}>
          <Text style={styles.buttonText}>
            {checking ? 'Kontrol Ediliyor...' : 'Doğrulama Durumunu Kontrol Et'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.resendButton}
          onPress={handleResendEmail}
          disabled={loading}>
          <Text style={styles.resendButtonText}>
            {loading ? 'Gönderiliyor...' : 'Doğrulama E-postasını Tekrar Gönder'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#C8B39E82',
  },
  innerContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    color: 'black',
    textAlign: 'center',
    marginBottom: 30,
  },
  button: {
    backgroundColor: 'black',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 10,
    marginTop: 20,
    width: '100%',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  resendButton: {
    backgroundColor: 'transparent',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 10,
    marginTop: 20,
  },
  resendButtonText: {
    color: 'black',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
});

export default Dogrulama;
