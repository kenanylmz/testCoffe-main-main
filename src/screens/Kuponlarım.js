import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
  TouchableOpacity,
  Modal,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import database from '@react-native-firebase/database';
import QRCode from 'react-native-qrcode-svg';

const windowWidth = Dimensions.get('window').width;

const Kuponlarım = () => {
  const [coupons, setCoupons] = useState([]);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const currentUser = auth().currentUser;

  useEffect(() => {
    if (!currentUser) return;

    const couponsRef = database().ref(`/coupons/${currentUser.uid}`);

    const onValueChange = snapshot => {
      const data = snapshot.val();
      if (!data) {
        setCoupons([]);
        return;
      }

      const currentDate = new Date();
      const activeCoupons = [];
      const updates = {};
      let hasUpdates = false;

      Object.entries(data).forEach(([key, coupon]) => {
        const expiryDate = new Date(coupon.expiryDate);

        if (expiryDate < currentDate || coupon.isUsed) {
          updates[`/coupons/${currentUser.uid}/${key}`] = null;
          hasUpdates = true;
        } else {
          const diffTime = Math.abs(expiryDate - currentDate);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          activeCoupons.push({
            id: key,
            ...coupon,
            remainingDays: diffDays,
          });
        }
      });

      if (hasUpdates) {
        database().ref().update(updates);
      }

      activeCoupons.sort(
        (a, b) => new Date(a.expiryDate) - new Date(b.expiryDate),
      );
      setCoupons(activeCoupons);
    };

    couponsRef.on('value', onValueChange);

    return () => couponsRef.off('value', onValueChange);
  }, [currentUser]);

  const generateQRValue = coupon => {
    return JSON.stringify({
      couponId: coupon.id,
      userId: currentUser?.uid,
      cafeName: coupon.cafeName,
      expiryDate: coupon.expiryDate,
      timestamp: new Date().toISOString(),
    });
  };

  const renderCouponCard = coupon => {
    return (
      <TouchableOpacity
        key={coupon.id}
        style={styles.card}
        onPress={() => setSelectedCoupon(coupon)}>
        <Image
          source={require('../styles/kart_icon.png')}
          style={styles.cardIcon}
        />
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>
            {coupon.cafeName}'den 1 adet hediye kahve kazandınız
          </Text>
          <Text style={styles.expiryText}>
            Kullanım süresi: {coupon.remainingDays} gün
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Kuponlarım</Text>
      <ScrollView style={styles.scrollView}>
        {coupons.length > 0 ? (
          coupons.map(coupon => renderCouponCard(coupon))
        ) : (
          <Text style={styles.noCouponsText}>
            Henüz kazanılmış kuponunuz bulunmamaktadır.
          </Text>
        )}
      </ScrollView>

      <Modal
        visible={selectedCoupon !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSelectedCoupon(null)}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setSelectedCoupon(null)}>
          <View style={styles.modalContent}>
            <View style={styles.qrContainer}>
              {selectedCoupon && (
                <QRCode
                  value={generateQRValue(selectedCoupon)}
                  size={windowWidth * 0.6}
                  backgroundColor="#FFF"
                />
              )}
            </View>
            {selectedCoupon && (
              <Text style={styles.modalText}>
                {selectedCoupon.cafeName} Kupon QR Kodu
              </Text>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#4A3428',
    marginBottom: 20,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  card: {
    backgroundColor: 'orange',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    flexDirection: 'row',
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
  cardIcon: {
    width: 60,
    height: 60,
    resizeMode: 'contain',
    marginRight: 15,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    color: '#4A3428',
    fontWeight: '500',
    marginBottom: 8,
  },
  expiryText: {
    fontSize: 14,
    color: '#666',
  },
  noCouponsText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
    marginTop: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 30,
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
  qrContainer: {
    padding: 20,
    backgroundColor: '#FFF',
    borderRadius: 15,
    marginBottom: 15,
  },
  modalText: {
    fontSize: 16,
    color: '#4A3428',
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default Kuponlarım;
