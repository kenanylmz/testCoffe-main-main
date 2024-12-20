import auth from '@react-native-firebase/auth';
import database from '@react-native-firebase/database';

export const signUp = async (email, password, name, surname) => {
  try {
    // Create user with email and password
    const userCredential = await auth().createUserWithEmailAndPassword(email, password);
    
    // Update user profile with name and surname
    await userCredential.user.updateProfile({
      displayName: `${name} ${surname}`,
    });

    // Add user to realtime database with default role and usercafe
    await database().ref(`users/${userCredential.user.uid}`).set({
      email: email,
      name: name,
      surname: surname,
      role: 'user',
      cafename: 'usercafe',
      createdAt: database.ServerValue.TIMESTAMP
    });

    // Send verification email
    await userCredential.user.sendEmailVerification();

    return { 
      success: true, 
      user: userCredential.user,
      message: 'Doğrulama e-postası gönderildi. Lütfen e-postanızı kontrol edin.'
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const signIn = async (email, password) => {
  try {
    if (!email || !password) {
      return {
        success: false,
        error: {
          code: 'auth/invalid-credentials',
          message: 'E-posta ve şifre gereklidir.'
        }
      };
    }

    const userCredential = await auth().signInWithEmailAndPassword(email, password);
    
    if (!userCredential || !userCredential.user) {
      return {
        success: false,
        error: {
          code: 'auth/unknown',
          message: 'Giriş işlemi başarısız oldu.'
        }
      };
    }

    // Get user role from database
    const userSnapshot = await database()
      .ref(`users/${userCredential.user.uid}`)
      .once('value');
    
    const userData = userSnapshot.val();
    
    // If user data doesn't exist in database, create it with default role and cafename
    if (!userData) {
      const defaultUserData = {
        email: userCredential.user.email,
        role: 'user',
        cafename: 'usercafe',
        createdAt: database.ServerValue.TIMESTAMP
      };
      
      await database()
        .ref(`users/${userCredential.user.uid}`)
        .set(defaultUserData);
        
      return {
        success: true,
        user: userCredential.user,
        role: 'user'
      };
    }

    return { 
      success: true, 
      user: userCredential.user,
      role: userData.role || 'user'
    };
  } catch (error) {
    console.error('SignIn Error:', error);
    return { 
      success: false, 
      error: {
        code: error.code || 'auth/unknown',
        message: error.message || 'Giriş yapılırken bir hata oluştu.'
      }
    };
  }
};

export const signOut = async () => {
  try {
    await auth().signOut();
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const checkEmailVerification = async () => {
  try {
    await auth().currentUser.reload();
    return { 
      success: true, 
      isVerified: auth().currentUser.emailVerified 
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const resendVerificationEmail = async () => {
  try {
    await auth().currentUser.sendEmailVerification();
    return { 
      success: true, 
      message: 'Doğrulama e-postası tekrar gönderildi.' 
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const checkUserRole = async (userId) => {
  try {
    const snapshot = await database()
      .ref(`users/${userId}`)
      .once('value');
    
    const userData = snapshot.val();
    return { 
      success: true, 
      role: userData?.role || 'user' 
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Yeni admin ekleme fonksiyonu - Var olan kullanıcıyı da admin yapabilir
export const addAdmin = async (email, password, name, surname) => {
  try {
    let userId;

    try {
      // Önce yeni kullanıcı oluşturmayı dene
      const userCredential = await auth().createUserWithEmailAndPassword(email, password);
      userId = userCredential.user.uid;
      
      // Yeni kullanıcı için profil güncelle
      await userCredential.user.updateProfile({
        displayName: `${name} ${surname}`,
      });
    } catch (error) {
      // Eğer email zaten kullanılıyorsa
      if (error.code === 'auth/email-already-in-use') {
        // Email ile giriş yapmayı dene
        const signInResult = await auth().signInWithEmailAndPassword(email, password);
        userId = signInResult.user.uid;
      } else {
        // Başka bir hata varsa fırlat
        throw error;
      }
    }

    // Get super admin's cafename
    const currentUserSnapshot = await database()
      .ref(`users/${auth().currentUser.uid}`)
      .once('value');
    const superAdminCafename = currentUserSnapshot.val()?.cafename;

    // Database'e admin rolüyle ekle/güncelle
    await database().ref(`users/${userId}`).set({
      email: email,
      name: name,
      surname: surname,
      role: 'admin',
      cafename: superAdminCafename,
      createdAt: database.ServerValue.TIMESTAMP
    });

    return { 
      success: true, 
      message: 'Admin başarıyla eklendi/güncellendi.'
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Admin silme fonksiyonu - Sadece database'den silme
export const deleteAdmin = async (adminId) => {
  try {
    // Delete from database
    await database().ref(`users/${adminId}`).remove();

    return { 
      success: true, 
      message: 'Admin başarıyla silindi.'
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// QR kodunun kullanılıp kullanılmadığını kontrol et
const checkQRUsage = async (qrData) => {
  try {
    const qrRef = database().ref(`usedQRCodes/${qrData.userId}/${qrData.timestamp}`);
    const snapshot = await qrRef.once('value');
    
    if (snapshot.exists()) {
      return {
        success: false,
        error: 'Bu QR kod daha önce kullanılmış. Lütfen yeni QR kod oluşturun.'
      };
    }

    // QR kodu kullanıldı olarak işaretle
    await qrRef.set({
      cafeName: qrData.cafeName,
      usedAt: database.ServerValue.TIMESTAMP
    });

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Kahve sayısını artır ve hediye durumunu kontrol et
export const incrementCoffeeCount = async (userId, cafeName, qrData) => {
  try {
    // Önce QR kodunun kullanılıp kullanılmadığını kontrol et
    const qrCheck = await checkQRUsage(qrData);
    if (!qrCheck.success) {
      return qrCheck;
    }

    const userCafeRef = database().ref(`users/${userId}/cafes/${cafeName}`);
    const snapshot = await userCafeRef.once('value');
    const cafeData = snapshot.val();

    // Kahve sayısını artır
    let coffeeCount = (cafeData?.coffeeCount || 0) + 1;
    const hasGift = coffeeCount >= 5;

    // Önce mevcut durumu kaydet
    await userCafeRef.update({
      coffeeCount: coffeeCount,
      hasGift: hasGift
    });

    // 5 kahveye ulaşıldıysa kupon oluştur ve sayacı sıfırla
    if (coffeeCount >= 5) {
      // Kupon oluştur
      const couponRef = database().ref(`/coupons/${userId}`).push();
      await couponRef.set({
        cafeName: cafeName,
        createdAt: database.ServerValue.TIMESTAMP,
        expiryDate: new Date(Date.now() + (3 * 24 * 60 * 60 * 1000)).toISOString(), // 3 gün geçerli
        isUsed: false
      });
      
      // Sayacı sıfırla
      await userCafeRef.update({
        coffeeCount: 0,
        hasGift: true
      });
      
      coffeeCount = 0;
    }

    return {
      success: true,
      coffeeCount: coffeeCount,
      hasGift: hasGift
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Hediye kullanımını işle
export const redeemGift = async (userId, cafeName, couponId) => {
  try {
    // Önce kullanıcı bilgilerini al
    const userSnapshot = await database().ref(`users/${userId}`).once('value');
    const userData = userSnapshot.val();
    
    if (!userData) {
      return {
        success: false,
        error: 'Kullanıcı bulunamadı.'
      };
    }

    // Kuponu kontrol et
    const couponRef = database().ref(`coupons/${userId}/${couponId}`);
    const couponSnapshot = await couponRef.once('value');
    const coupon = couponSnapshot.val();

    if (!coupon) {
      return {
        success: false,
        error: 'Kupon bulunamadı.'
      };
    }

    if (coupon.cafeName !== cafeName) {
      return {
        success: false,
        error: 'Bu kupon başka bir kafeye aittir.'
      };
    }

    // Kuponu sil
    await couponRef.remove();

    return {
      success: true,
      message: 'Hediye başarıyla kullanıldı.',
      userName: `${userData.name} ${userData.surname}`
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
