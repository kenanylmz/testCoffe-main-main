import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {signUp} from '../config/firebase';

const Kayıt = ({navigation}) => {
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);

  const validatePassword = (text) => {
    setPassword(text);
    
    if (text.length < 8) {
      setPasswordError('Şifre en az 8 karakter olmalıdır!');
      return false;
    }

    const specialChars = /[!@#$%^&*(),.?":{}|<>]/;
    if (specialChars.test(text)) {
      setPasswordError('Şifre özel karakter içermemelidir!');
      return false;
    }

    if (confirmPassword && text !== confirmPassword) {
      setPasswordError('Şifreler eşleşmiyor!');
      return false;
    }

    setPasswordError('');
    return true;
  };

  const validateConfirmPassword = (text) => {
    setConfirmPassword(text);
    
    if (text !== password) {
      setPasswordError('Şifreler eşleşmiyor!');
      return false;
    }

    setPasswordError('');
    return true;
  };

  const handleRegister = async () => {
    if (!name || !surname || !email || !password || !confirmPassword) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurunuz.');
      return;
    }

    if (password.length < 8) {
      setPasswordError('Şifre en az 8 karakter olmalıdır!');
      return;
    }

    const specialChars = /[!@#$%^&*(),.?":{}|<>]/;
    if (specialChars.test(password)) {
      setPasswordError('Şifre özel karakter içermemelidir!');
      return;
    }

    if (password !== confirmPassword) {
      setPasswordError('Şifreler eşleşmiyor!');
      return;
    }

    setLoading(true);
    const result = await signUp(email, password, name, surname);
    setLoading(false);

    if (result.success) {
      Alert.alert(
        'E-posta Doğrulama',
        'Doğrulama e-postası gönderildi. Lütfen e-postanızı kontrol edin.',
        [
          {
            text: 'Tamam',
            onPress: () => {
              navigation.navigate('Dogrulama', {
                email: email,
                userId: result.user.uid
              });
            },
          },
        ],
        { cancelable: false }
      );
    } else {
      Alert.alert('Hata', result.error || 'Kayıt işlemi başarısız oldu.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.innerContainer}>
        <Text style={styles.title}>Hesap Oluştur</Text>

        <TextInput
          style={styles.input}
          placeholder="Ad"
          placeholderTextColor="#666"
          value={name}
          onChangeText={setName}
        />

        <TextInput
          style={styles.input}
          placeholder="Soyad"
          placeholderTextColor="#666"
          value={surname}
          onChangeText={setSurname}
        />

        <TextInput
          style={styles.input}
          placeholder="E-mail"
          placeholderTextColor="#666"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          style={[styles.input, passwordError && password ? styles.errorInput : null]}
          placeholder="Şifre"
          placeholderTextColor="#666"
          value={password}
          onChangeText={validatePassword}
          secureTextEntry
        />

        <TextInput
          style={[styles.input, passwordError && confirmPassword ? styles.errorInput : null]}
          placeholder="Tekrar Şifre"
          placeholderTextColor="#666"
          value={confirmPassword}
          onChangeText={validateConfirmPassword}
          secureTextEntry
        />

        {passwordError ? (
          <Text style={styles.errorText}>{passwordError}</Text>
        ) : null}

        <TouchableOpacity 
          style={styles.registerButton} 
          onPress={handleRegister}
          disabled={loading}
        >
          <Text style={styles.registerButtonText}>
            {loading ? 'Kayıt yapılıyor...' : 'Kayıt Ol'}
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
    padding: 20,
  },
  innerContainer: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 20,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'black',
    textAlign: 'center',
    marginBottom: 30,
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  errorInput: {
    borderColor: 'red',
    borderWidth: 1,
  },
  errorText: {
    color: 'red',
    marginBottom: 15,
    textAlign: 'center',
  },
  registerButton: {
    backgroundColor: 'black',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  registerButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Kayıt;
