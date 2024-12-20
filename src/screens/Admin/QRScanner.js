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

      // QR kod içeriğini parse et
      let type, userId, cafeName;
      
      let parsedQR;
      try {
        parsedQR = JSON.parse(qrData);
        
        // Cafe QR formatı kontrolü
        if (parsedQR.userId && parsedQR.cafeName) {
          // Cafe QR kodu - otomatik olarak kahve tipi olarak işle
          type = 'coffee';
          userId = parsedQR.userId;
          cafeName = parsedQR.cafeName;
        } else {
          // Standart QR format kontrolü
          type = parsedQR.type;
          userId = parsedQR.userId;
          cafeName = parsedQR.cafeName;
        }
      } catch {
        // JSON parse edilemezse string format olarak dene
        const parts = qrData.split(':');
        if (parts.length >= 2) {
          type = parts[0];
          userId = parts[1];
        }
      }

      console.log('Parse edilen değerler:', { type, userId }); // Parse edilen değerleri logla

      if (!type || !userId) {
        throw new Error('QR kod geçersiz formatta. Lütfen Müdavim sayfasından yeni bir QR kod oluşturun.');
      }

      // type değerlerini küçük harfe çevir
      type = type.toLowerCase().trim();

      if (!cafeName) {
        throw new Error('QR kodunda kafe adı bulunamadı. Lütfen Müdavim sayfasından yeni bir QR kod oluşturun.');
      }

      if (type === 'coffee' || type === 'kahve') {
        // QR kodundan gelen timestamp'i kullan
        if (!parsedQR.timestamp) {
          throw new Error('QR kodunda zaman bilgisi bulunamadı. Lütfen Müdavim sayfasından yeni bir QR kod oluşturun.');
        }

        // Timestamp'i güvenli formata dönüştür (nokta ve diğer özel karakterleri kaldır)
        const safeTimestamp = parsedQR.timestamp.replace(/[.:\-]/g, '');
        
        const result = await incrementCoffeeCount(userId, cafeName, {
          userId: userId,
          cafeName: cafeName,
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
      } else if (type === 'gift' || type === 'hediye') {
        // Hediye kullanımı
        const result = await redeemGift(userId, cafeName);
        if (result.success) {
          Alert.alert('Başarılı', 'Hediye başarıyla kullanıldı!', [{ text: 'Tamam' }]);
        } else {
          throw new Error(result.error);
        }
      } else {
        throw new Error(`Geçersiz QR kod tipi: ${type}. Lütfen geçerli bir QR kod okutun.`);
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
