/**
 * @format
 */

import {AppRegistry, LogBox} from 'react-native';
// Suppress specific warning for camera session configuration
LogBox.ignoreLogs(['[session/invalid-output-configuration']);

import App from './App';
import {name as appName} from './app.json';

AppRegistry.registerComponent(appName, () => App);
