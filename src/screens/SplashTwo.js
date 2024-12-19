import React, {useState} from 'react';
import {
  View,
  Image,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';

const {width} = Dimensions.get('window');

const SplashTwo = ({navigation}) => {
  const [currentPage, setCurrentPage] = useState(0);

  const handleScroll = event => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const page = Math.round(offsetX / width);
    setCurrentPage(page);
  };

  const handleSkip = () => {
    if (currentPage < 2) {
      scrollViewRef.current?.scrollTo({
        x: width * (currentPage + 1),
        animated: true,
      });
    } else {
      navigation.replace('Login');
    }
  };

  const handleSkipToLogin = () => {
    navigation.replace('Login');
  };

  const scrollViewRef = React.useRef(null);

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}>
        {/* First Page */}
        <View style={styles.page}>
          <TouchableOpacity
            style={styles.skipTopButton}
            onPress={handleSkipToLogin}>
            <Text style={styles.skipTopText}>Atla</Text>
          </TouchableOpacity>
          <Image
            source={require('../styles/splash_two1.png')}
            style={styles.image}
            resizeMode="contain"
          />
          <Image
            source={require('../styles/splash_two2.png')}
            style={styles.image}
            resizeMode="contain"
          />
          <Image
            source={require('../styles/splash_two3.png')}
            style={styles.image}
            resizeMode="contain"
          />
        </View>

        {/* Second Page */}
        <View style={styles.page}>
          <TouchableOpacity
            style={styles.skipTopButton}
            onPress={handleSkipToLogin}>
            <Text style={styles.skipTopText}>Atla</Text>
          </TouchableOpacity>
          <Image
            source={require('../styles/splash_two4.png')}
            style={styles.image}
            resizeMode="contain"
          />
          <Image
            source={require('../styles/splash_two5.png')}
            style={styles.image}
            resizeMode="contain"
          />
          <Image
            source={require('../styles/splash_two6.png')}
            style={styles.image}
            resizeMode="contain"
          />
        </View>

        {/* Third Page */}
        <View style={styles.page}>
          <TouchableOpacity
            style={styles.skipTopButton}
            onPress={handleSkipToLogin}>
            <Text style={styles.skipTopText}>Atla</Text>
          </TouchableOpacity>
          <Image
            source={require('../styles/splash_two7.png')}
            style={styles.image}
            resizeMode="contain"
          />
          <Image
            source={require('../styles/splash_two8.png')}
            style={styles.image}
            resizeMode="contain"
          />
          <Image
            source={require('../styles/splash_two9.png')}
            style={styles.image}
            resizeMode="contain"
          />
        </View>
      </ScrollView>

      {/* Navigation Dots */}
      <View style={styles.dotsContainer}>
        <View style={[styles.dot, currentPage === 0 && styles.activeDot]} />
        <View style={[styles.dot, currentPage === 1 && styles.activeDot]} />
        <View style={[styles.dot, currentPage === 2 && styles.activeDot]} />
      </View>

      {/* Skip Button */}
      <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
        <Text style={styles.skipText}>Geç</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#C8B39E82',
  },
  page: {
    width: width,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  image: {
    width: width * 0.8,
    height: width * 0.4,
    marginVertical: 10,
  },
  dotsContainer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    flexDirection: 'row',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ccc',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: 'black',
  },
  skipButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    backgroundColor: 'white',
  },
  skipText: {
    color: 'black',
    fontSize: 16,
  },
  skipTopButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  skipTopText: {
    color: 'black',
    fontSize: 14,
    fontWeight: '800',
  },
});

export default SplashTwo;
