import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
} from 'react-native';
import auth from '@react-native-firebase/auth';

const Profil = ({navigation}) => {
  const currentUser = auth().currentUser;
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
  const [firstName, setFirstName] = useState(
    currentUser?.displayName?.split(' ')[0] || '',
  );
  const [lastName, setLastName] = useState(
    currentUser?.displayName?.split(' ')[1] || '',
  );

  const handleSave = async () => {
    try {
      const newDisplayName = `${firstName} ${lastName}`.trim();
      await currentUser.updateProfile({
        displayName: newDisplayName,
      });
      setDisplayName(newDisplayName);
      setIsEditing(false);
      Alert.alert('Başarılı', 'Profil bilgileriniz güncellendi.');
    } catch (error) {
      Alert.alert('Hata', 'Profil güncellenirken bir hata oluştu.');
    }
  };

  const handleLogout = async () => {
    try {
      await auth().signOut();
      // Instead of using reset, we'll let the auth state change handle navigation
    } catch (error) {
      Alert.alert('Hata', 'Çıkış yapılırken bir hata oluştu.');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <View style={styles.imageContainer}>
            <Image
              source={require('../styles/profil_icon.png')}
              style={styles.profileImage}
            />
          </View>

          <View style={styles.infoContainer}>
            {isEditing ? (
              <>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Ad</Text>
                  <TextInput
                    style={styles.input}
                    value={firstName}
                    onChangeText={setFirstName}
                    placeholder="Adınız"
                    placeholderTextColor="#999"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Soyad</Text>
                  <TextInput
                    style={styles.input}
                    value={lastName}
                    onChangeText={setLastName}
                    placeholder="Soyadınız"
                    placeholderTextColor="#999"
                  />
                </View>
              </>
            ) : (
              <View style={styles.infoRow}>
                <Text style={styles.label}>Ad Soyad</Text>
                <Text style={styles.value}>{displayName}</Text>
              </View>
            )}

            <View style={styles.infoRow}>
              <Text style={styles.label}>E-posta</Text>
              <Text style={styles.value}>{currentUser?.email}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.editButton}
            onPress={() => {
              if (isEditing) {
                handleSave();
              } else {
                setIsEditing(true);
              }
            }}>
            <Text style={styles.editButtonText}>
              {isEditing ? 'Kaydet' : 'Düzenle'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Image
          source={require('../styles/cıkıs_icon.png')}
          style={styles.logoutIcon}
        />
        <Text style={styles.logoutText}>Çıkış Yap</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    alignItems: 'center',
  },
  imageContainer: {
    marginVertical: 20,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F5E6D3',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  profileImage: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
  },
  infoContainer: {
    width: '100%',
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  infoRow: {
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  value: {
    fontSize: 16,
    color: '#4A3428',
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#4A3428',
  },
  editButton: {
    backgroundColor: '#4A3428',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  editButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF4444',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  logoutIcon: {
    width: 24,
    height: 24,
    marginRight: 10,
    tintColor: '#FFF',
  },
  logoutText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default Profil;
