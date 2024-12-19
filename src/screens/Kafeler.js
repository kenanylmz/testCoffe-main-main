import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Image,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';

const windowWidth = Dimensions.get('window').width;
const cardWidth = (windowWidth - 60) / 2; // 60 = padding (20) * 2 + space between cards (20)

const cafes = [
  {
    id: 1,
    name: 'Arabica Coffee',
    logoPath: '../styles/arabica_logo.png',
  },
  {
    id: 2,
    name: 'Harput Dibek',
    logoPath: '../styles/harputdibek_logo.png',
  },
];

const Kafeler = ({navigation}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCafes = cafes.filter(cafe =>
    cafe.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleCafeSelection = (cafeName, logoPath) => {
    navigation.navigate('MainTabs', {
      screen: 'Anasayfa',
      params: {
        cafeName: cafeName,
        logoPath: logoPath,
      },
    });
  };

  const renderCafeCards = () => {
    const rows = [];
    for (let i = 0; i < filteredCafes.length; i += 2) {
      const row = (
        <View key={i} style={styles.row}>
          <TouchableOpacity
            style={styles.card}
            onPress={() =>
              handleCafeSelection(
                filteredCafes[i].name,
                filteredCafes[i].logoPath,
              )
            }>
            <Image
              source={
                filteredCafes[i].logoPath === '../styles/arabica_logo.png'
                  ? require('../styles/arabica_logo.png')
                  : require('../styles/harputdibek_logo.png')
              }
              style={styles.cardImage}
            />
            <Text style={styles.cardText}>{filteredCafes[i].name}</Text>
          </TouchableOpacity>
          {i + 1 < filteredCafes.length && (
            <TouchableOpacity
              style={styles.card}
              onPress={() =>
                handleCafeSelection(
                  filteredCafes[i + 1].name,
                  filteredCafes[i + 1].logoPath,
                )
              }>
              <Image
                source={
                  filteredCafes[i + 1].logoPath === '../styles/arabica_logo.png'
                    ? require('../styles/arabica_logo.png')
                    : require('../styles/harputdibek_logo.png')
                }
                style={styles.cardImage}
              />
              <Text style={styles.cardText}>{filteredCafes[i + 1].name}</Text>
            </TouchableOpacity>
          )}
        </View>
      );
      rows.push(row);
    }
    return rows;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cafe Seç</Text>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchBar}
          placeholder="Cafe ara..."
          placeholderTextColor="#666"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {renderCafeCards()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontStyle: 'italic',
    marginBottom: 20,
    textAlign: 'center',
  },
  searchContainer: {
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
  searchBar: {
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    color: '#000',
    paddingLeft: 20,
    height: 50,
  },
  scrollContent: {
    flexGrow: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  card: {
    width: cardWidth,
    aspectRatio: 1,
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardImage: {
    width: '80%',
    height: '80%',
    resizeMode: 'contain',
  },
  cardText: {
    marginTop: 10,
    fontSize: 16,
    textAlign: 'center',
  },
});

export default Kafeler;
