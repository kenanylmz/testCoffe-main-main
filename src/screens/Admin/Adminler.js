import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import database from '@react-native-firebase/database';
import auth from '@react-native-firebase/auth';
import { deleteAdmin } from '../../config/firebase';

const Adminler = () => {
  const [admins, setAdmins] = useState([]);

  useEffect(() => {
    const adminsRef = database().ref('users');
    const onValueChange = adminsRef.orderByChild('role').equalTo('admin')
      .on('value', snapshot => {
        const data = snapshot.val();
        if (data) {
          const adminList = Object.entries(data).map(([id, admin]) => ({
            id,
            ...admin,
          }));
          setAdmins(adminList);
        } else {
          setAdmins([]);
        }
      });

    // Cleanup subscription
    return () => adminsRef.off('value', onValueChange);
  }, []);

  const handleDeleteAdmin = async (adminId, adminEmail) => {
    Alert.alert(
      'Admin Sil',
      'Bu admini silmek istediğinizden emin misiniz?',
      [
        {
          text: 'İptal',
          style: 'cancel',
        },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await deleteAdmin(adminId);
              if (result.success) {
                Alert.alert('Başarılı', 'Admin başarıyla silindi.');
              } else {
                Alert.alert('Hata', result.error);
              }
            } catch (error) {
              Alert.alert('Hata', error.message);
            }
          },
        },
      ],
    );
  };

  const renderAdminItem = ({ item }) => (
    <View style={styles.adminItem}>
      <View style={styles.adminInfo}>
        <Text style={styles.adminName}>{item.name} {item.surname}</Text>
        <Text style={styles.adminEmail}>{item.email}</Text>
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDeleteAdmin(item.id, item.email)}>
        <Image
          source={require('../../styles/delete_icon.png')}
          style={styles.deleteIcon}
        />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Adminler</Text>
      {admins.length > 0 ? (
        <FlatList
          data={admins}
          renderItem={renderAdminItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <Text style={styles.noAdminText}>Henüz admin bulunmamaktadır.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#4A3428',
    textAlign: 'center',
  },
  listContainer: {
    paddingBottom: 20,
  },
  adminItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  adminInfo: {
    flex: 1,
  },
  adminName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4A3428',
  },
  adminEmail: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  deleteButton: {
    padding: 8,
  },
  deleteIcon: {
    width: 24,
    height: 24,
    tintColor: '#FF3B30',
  },
  noAdminText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginTop: 20,
  },
});

export default Adminler;
