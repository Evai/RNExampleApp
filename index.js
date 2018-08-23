// __STRESS_TEST__ = false;
// __DEV__ = true
import {
	AppRegistry
} from 'react-native'
import App from './App';

if (!__DEV__) {
	global.console = {
		info: () => {
		},
		log: () => {
		},
		warn: () => {
		},
		debug: () => {
		},
		error: () => {
		},
	};
}
console.ignoredYellowBox = [ 'Setting a timer' ]
// YellowBox.ignoreWarnings(['Remote debugger','Module RCTImageLoader','Module RCTVideoManager']);

AppRegistry.registerComponent('whereApp', () => App);