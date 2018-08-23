import React from 'react';

import {
	StyleSheet,
	Text,
	TouchableOpacity,
	Linking,
	View
} from 'react-native';

import QRCodeScanner from 'react-native-qrcode-scanner';
import navigate from "../../screens/navigate";
import UserQRCode from "../account/profile/UserQRCode";
import styleUtil from "../../common/styleUtil";
import WebPage from "../../components/WebPage";
import config from "../../common/config";
import Profile from "../account/Profile";
import toast from "../../common/toast";

export default class QRScanner extends React.Component {
	static navigatorStyle = {
		title:'二维码扫描',
		navigationBarInsets:false
	};
	onResponse(e) {
		// console.log(e)
		let scheme = e.data.split('://');
		console.warn(scheme);
		if (config.constant.qrUserIdUri.indexOf(scheme[0]) > -1) {
			navigate.replace(Profile, {_id: scheme[1]})
		}
		else {
			navigate.replace(WebPage, {url:e.data})
		}
	}
	
	render() {
		return (
			<View style={styleUtil.container}>
				<QRCodeScanner
					containerStyle={{
						flex:1
					}}
					cameraStyle={{
						width:styleUtil.window.width,
						height:styleUtil.window.height
					}}
					showMarker={true}
					onRead={this.onResponse.bind(this)}
					bottomViewStyle={{
						position:'absolute',
						bottom:20
					}}
					customMarker={
						<View style={styles.rectangleContainer}>
							<View style={styles.rectangle} />
						</View>
					}
					bottomContent={
						config.user._id && <TouchableOpacity
							style={styles.buttonTouchable}
							onPress={_ => {
								// navigate.push(WebPage)
								navigate.push(UserQRCode, {
									uri: config.constant.qrUserIdUri + config.user._id,
									text: '扫一扫上面的二维码，加我好友',
									title: '我的二维码',
									avatar: [config.user.avatar],
									name: config.user.username || ''
								})
							}}
						>
							<Text style={styles.buttonText}>我的二维码</Text>
						</TouchableOpacity>
					}
				/>
			</View>
		);
	}
}

const styles = StyleSheet.create({
	rectangleContainer: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: 'transparent',
	},
	rectangle: {
		height: 240,
		width: 240,
		borderWidth: 1,
		borderColor: '#00FF00',
		backgroundColor: 'transparent',
	},
	buttonText: {
		fontSize: 16,
		color: '#00FF00',
	},
	buttonTouchable: {
		padding: 10,
	},
});