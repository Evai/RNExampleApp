import React, {
	Component
} from 'react';
import {
	View,
	Text,
	TextInput,
	StyleSheet,
	TouchableOpacity,
	ScrollView
} from 'react-native';

import {Icon} from 'react-native-elements'
import styleUtil from '../../common/styleUtil'
import navigate from "../../screens/navigate";
import TabNavBar from "../../screens/TabNavBar";
import ScrollPage from "../../components/ScrollPage";
import {NavigationBar} from 'teaset'
import JPushModule from 'jpush-react-native';
import * as DeviceInfo from 'react-native-device-info';
import config from "../../common/config";


export default class AccountLogin extends Component {
	static navigatorStyle = {
		title: '账号登录',
		leftView: (
			<NavigationBar.LinkButton
				title={'关闭'}
				onPress={_ => navigate.popToTop()}
			/>
		)
	};
	
	state = {
		account: '',
		password: '',
		secureTextEntry: true
	};
	
	getDeviceInfo = () => {
		return {
			deviceName: DeviceInfo.getDeviceName(),//设备名称
			userAgent: DeviceInfo.getUserAgent(),//设备代理信息
			uniqueId: DeviceInfo.getUniqueID(),//设备唯一id
			systemName: DeviceInfo.getSystemName(),//系统名称
			systemVersion: DeviceInfo.getSystemVersion(),//系统版本
		}
	};
	
	//登录
	_login = () => {
		let deviceInfo = this.getDeviceInfo();
		let body = {
			account: this.state.account,
			password: this.state.password,
			...deviceInfo
		};
		
		toast.modalLoading();
		request.post(config.api.baseURI + config.api.accountLogin, body)
			.then(res => {
				toast.modalLoadingHide()
				if (res.code === 0) {
					let user = res.data;
					user.accessToken = res.accessToken;
					user.vibration = true;
					this.setJPushAlias(user.accessToken);
					TabNavBar.updateUser(user);
					imessage.pingPong();
					toast.success('登录成功');
					config.setIsLogined();
					navigate.popToTop()
				}
			})
			.catch(err => {
				// console.warn(err)
				toast.modalLoadingHide()
				toast.fail('登录失败')
			})
	}
	
	setJPushAlias = (alias) => {
		// console.log(alias)
		JPushModule.setAlias(alias, map => {
			if (map.errorCode === 0) {
				console.log('set alias succeed')
			} else if (map.errorCode === 6002) {
				this.setJPushAlias(alias)
			}
		})
	};
	
	
	_btnStyle = (bool) => (
		bool ? styleUtil.themeColor : styleUtil.disabledColor
	)
	
	render() {
		const {account, password, secureTextEntry} = this.state;
		return (
			<ScrollView keyboardShouldPersistTaps={'handled'} style={styles.signUpBox}>
				<TextInput
					placeholder='请输入账号'
					autoCorrect={false}
					autoCapitalize={'none'}
					underlineColorAndroid='transparent'
					style={styles.inputField}
					value={account}
					maxLength={30}
					onChangeText={text => {
						this.setState({account: text})
					}}
				/>
				<View style={[styles.inputField,{
					flexDirection:'row',
					justifyContent:'space-between',
					alignItems:'center',
				}]}>
					<TextInput
						placeholder='请输入密码'
						autoCorrect={false}
						underlineColorAndroid='transparent'
						secureTextEntry={secureTextEntry}
						style={{flex: 1,height:40}}
						value={password}
						maxLength={30}
						onChangeText={text => {
							this.setState({password: text})
						}}
					/>
					<Icon
						name={secureTextEntry ? 'visibility-off' : 'visibility'}
						size={20}
						onPress={_ => this.setState({secureTextEntry:!secureTextEntry})}
					/>
				</View>
				<TouchableOpacity
					activeOpacity={account.length > 0 && password.length > 0 ? 0.5 : 1}
					style={[styles.buttonBox, {
						backgroundColor: this._btnStyle(account.length > 0 && password.length > 0),
						borderColor: this._btnStyle(account.length > 0 && password.length > 0)
					}]}
					onPress={this._login}>
					<Text style={styles.buttonText}>登录</Text>
				</TouchableOpacity>
			</ScrollView>
		)
	}
	
}


const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: styleUtil.backgroundColor,
	},
	signUpBox: {
		marginTop: 10,
		padding: 10
	},
	title: {
		marginBottom: 20,
		color: '#333',
		fontSize: 20,
		textAlign: "center"
	},
	inputField: {
		height: 40,
		padding: 5,
		backgroundColor: '#fff',
		borderWidth: styleUtil.borderSeparator,
		borderColor: styleUtil.borderColor,
		borderRadius: 4,
		marginVertical: 5
	},
	buttonBox: {
		backgroundColor: styleUtil.themeColor,
		padding: 12,
		height: 50,
		marginTop: 20,
		borderWidth: 1,
		borderColor: styleUtil.themeColor,
		borderRadius: 4
	},
	buttonText: {
		fontSize: 20,
		color: '#fff',
		textAlign: 'center'
	},
	passwordBox: {
		flexDirection: 'row',
		marginTop: 10,
		justifyContent: 'space-between'
	},
	countBtn: {
		width: 110,
		height: 40,
		padding: 10,
		marginLeft: 8,
		borderWidth: 1,
		borderColor: styleUtil.themeColor,
		backgroundColor: styleUtil.themeColor,
		borderRadius: 4
	},
	countBtnText: {
		textAlign: 'center',
		color: '#fff',
		fontSize: 16
	},
	closeModal: {
		position: 'absolute',
		bottom: 20,
		alignSelf: 'center'
	}
})