import React from 'react';
import {
	StyleSheet,
	StatusBar,
	Platform
} from 'react-native'

import {TeaNavigator, Theme} from 'teaset';
import TabNavBar from './app/screens/TabNavBar';
import styleUtil from "./app/common/styleUtil";
import navigate from "./app/screens/navigate";
import Request from './app/common/request'
import config from './app/common/config'
import storageUtil from './app/common/storageUtil'
import toast from "./app/common/toast";
import SplashScreen from 'react-native-splash-screen'
import CodePush from 'react-native-code-push'
import IMessage from "./app/common/IMessage";
// import {Geolocation} from "react-native-amap-geolocation";
export const GeoLocation = Platform.OS === 'ios' ? null : require('react-native-amap-geolocation').Geolocation;


global.request = Request;
global.config = config;
global.storageUtil = storageUtil;
global.toast = toast;
global.imessage = new IMessage();

Theme.set({
	fitIPhoneX: true,
	tvBarBtnIconActiveTintColor: styleUtil.themeColor,
	tvBarBtnActiveTitleColor: styleUtil.themeColor,
	navColor: 'white',
	backgroundColor: 'white',
	navTintColor: 'black',
	navTitleColor: 'black',
	navSeparatorLineWidth: styleUtil.borderSeparator,
	navSeparatorColor: styleUtil.borderColor,
	navType: 'auto', //'auto', 'ios', 'android'
	navStatusBarStyle: 'dark-content', //'default', 'light-content', 'dark-content'
});


class App extends React.Component {
	
	constructor() {
		super();
	}
	
	async componentWillMount() {
		CodePush.sync({},() => {}, () => {});
		if (GeoLocation) {
			await GeoLocation.init({
				ios: "",
				android: ""
			});
			GeoLocation.setOptions({
				interval: 8000,
				distanceFilter: 20,
				reGeocode: true
			});
		}
	}
	
	componentDidMount() {
		SplashScreen.hide();
	}
	
	componentWillUnmount() {
	
	}
	
	render() {
		return <TeaNavigator
			ref={v => navigate.setContainer(v)}
			rootView={<TabNavBar/>}
		/>;
	}
}

let codePushOptions = { checkFrequency: CodePush.CheckFrequency.MANUAL };

App = CodePush(codePushOptions)(App);
export default App;
