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

    // Add user to realtime database with default role
    await database().ref(`users/${userCredential.user.uid}`).set({
      email: email,
      name: name,
      surname: surname,
      role: 'user',
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
    const userCredential = await auth().signInWithEmailAndPassword(email, password);
    
    // Get user role from database
    const userSnapshot = await database()
      .ref(`users/${userCredential.user.uid}`)
      .once('value');
    
    const userData = userSnapshot.val();
    const userRole = userData?.role || 'user';

    return { 
      success: true, 
      user: userCredential.user,
      role: userRole 
    };
  } catch (error) {
    return { success: false, error: error.message };
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

    // Database'e admin rolüyle ekle/güncelle
    await database().ref(`users/${userId}`).set({
      email: email,
      name: name,
      surname: surname,
      role: 'admin',
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
