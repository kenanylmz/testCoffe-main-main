import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Alert } from 'react-native';
import { Camera, useCameraDevice, useCodeScanner } from 'react-native-vision-camera';
import { incrementCoffeeCount, redeemGift } from '../../config/firebase';

const QRScanner = () => {
  const [hasPermission, setHasPermission] = useState(null);
  const [isScanning, setIsScanning] = useState(true);
  const device = useCameraDevice('back');

  const handleQRCode = async (qrData) => {
    try {
      console.log('Okunan QR kod:', qrData); // QR kod içeriğini logla

      let parsedQR;
      try {
        parsedQR = JSON.parse(qrData);
      } catch {
        throw new Error('QR kod geçersiz formatta.');
      }

      // Kupon QR kodu kontrolü
      if (parsedQR.couponId && parsedQR.userId && parsedQR.cafeName) {
        // Kupon kullanımı
        const result = await redeemGift(parsedQR.userId, parsedQR.cafeName, parsedQR.couponId);
        if (result.success) {
          Alert.alert('Başarılı', `${result.userName} Adlı Kullanıcının Bir Adet Hediye Kuponu Kullanılmıştır`, [{ text: 'Tamam' }]);
        } else {
          throw new Error(result.error);
        }
      } else if (parsedQR.userId && parsedQR.cafeName && parsedQR.timestamp) {
        // Kahve QR kodu işleme
        const safeTimestamp = parsedQR.timestamp.replace(/[.:\-]/g, '');
        
        const result = await incrementCoffeeCount(parsedQR.userId, parsedQR.cafeName, {
          userId: parsedQR.userId,
          cafeName: parsedQR.cafeName,
          timestamp: safeTimestamp
        });
        if (result.success) {
          Alert.alert(
            'Başarılı',
            result.hasGift 
              ? `5 kahve tamamlandı! Hediye kazanıldı!`
              : `Kahve sayısı: ${result.coffeeCount}/5`,
            [{ text: 'Tamam' }]
          );
        } else {
          throw new Error(result.error);
        }
      } else {
        throw new Error('QR kod geçersiz formatta. Lütfen Müdavim sayfasından yeni bir QR kod oluşturun.');
      }
    } catch (error) {
      // Sadece Alert göster, loglama yapma
      Alert.alert('Hata', error.message, [{ text: 'Tamam' }]);
    } finally {
      // 2 saniye sonra yeni taramaya izin ver
      setTimeout(() => {
        setIsScanning(true);
      }, 2000);
    }
  };

  const codeScanner = useCodeScanner({
    codeTypes: ['qr'],
    onCodeScanned: (codes) => {
      if (codes.length > 0 && isScanning) {
        setIsScanning(false);
        handleQRCode(codes[0].value);
      }
    }
  });

  useEffect(() => {
    checkPermission();
  }, []);

  const checkPermission = async () => {
    const cameraPermission = await Camera.requestCameraPermission();
    setHasPermission(cameraPermission === 'granted');
  };

  const requestPermission = async () => {
    await checkPermission();
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Kamera izni kontrolü yapılıyor...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Kamera kullanımı için izin gerekli</Text>
        <TouchableOpacity 
          style={styles.button}
          onPress={requestPermission}
        >
          <Text style={styles.buttonText}>İzin Ver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!device) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Kamera bulunamadı</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        codeScanner={codeScanner}
      />
      <View style={styles.overlay}>
        <View style={styles.scanArea} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  text: {
    fontSize: 16,
    color: '#4A3428',
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#4A3428',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  scanArea: {
    width: 200,
    height: 200,
    borderWidth: 2,
    borderColor: '#4A3428',
    backgroundColor: 'transparent',
  }
});

export default QRScanner;
