import React, {
	Component
} from 'react';
import {
	View,
	Text,
	TextInput,
	StyleSheet,
	TouchableOpacity, Alert
} from 'react-native';

import CountDownText from '../../components/countdown/countDownText'
import styleUtil from '../../common/styleUtil'
import navigate from "../../screens/navigate";
import TabNavBar from "../../screens/TabNavBar";
import ScrollPage from "../../components/ScrollPage";
import {NavigationBar} from 'teaset'
import * as DeviceInfo from 'react-native-device-info';
import config from "../../common/config";


export default class UpdatePhone extends Component {
	static navigatorStyle = {
		title: '更换手机号',
		leftView: (
			<NavigationBar.LinkButton
				title={'关闭'}
				onPress={_ => navigate.pop()}
			/>
		)
	};
	
	state = {
		phone: '',
		verifyCode: '',
		isSend: false,
		isCountEnd: false,
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
	
	
	//发送验证码
	_sendVerifyCode = () => {
		let phone = this.state.phone;
		if (phone.length < 11) return;
		if (phone === config.user.phone) {
			Alert.alert('新手机号不能和旧手机号相同')
			return;
		}
		toast.modalLoading();
		request.post(config.api.baseURI + config.api.sendVerifyCode, {
			phone
		}).then(res => {
			toast.modalLoadingHide()
			// console.log(res)
			if (res.code === 0) {
				toast.success('短信验证码已发送');
				// alert(res.data)
				this.setState({
					isSend: true,
					isCountEnd: false
				})
			}
			else if (res.code === 10) {
				this.setState({
					isSend: true,
					isCountEnd: false
				})
				alert(res.msg);
			}
		}).catch(err => {
			console.warn(err)
			toast.modalLoadingHide()
			toast.fail('获取验证码失败')
		})
		
	}
	//登录
	_login = () => {
		// let deviceInfo = this.getDeviceInfo();
		let body = {
			phone: this.state.phone,
			vCode: this.state.verifyCode,
		};
		
		if (body.phone.length < 11 || body.vCode.length < 6) {
			return
		}
		this.props.submit && this.props.submit(body)
	}
	
	_countEnd = () => {
		this.setState({
			isCountEnd: true
		})
	}
	
	_btnStyle = (bool) => (
		bool ? styleUtil.themeColor : styleUtil.disabledColor
	)
	
	render() {
		return (
			<ScrollPage>
				<View style={styles.signUpBox}>
					<TextInput
						placeholder='请输入手机号'
						autoCorrect={false}
						keyboardType={'number-pad'}
						style={styles.inputField}
						value={this.state.phone}
						maxLength={11}
						onChangeText={text => {
							this.setState({phone: text})
						}}
					/>
					{
						this.state.isSend
						&& <View style={styles.verifyCodeBox}>
							<TextInput
								placeholder='请输入验证码'
								autoCorrect={false}
								keyboardType={'number-pad'}
								style={[styles.inputField, {flex: 1}]}
								value={this.state.verifyCode}
								maxLength={6}
								onChangeText={text => {
									this.setState({verifyCode: text})
								}}
							/>
							{
								!this.state.isCountEnd
									? <View style={[styles.countBtn, {
										backgroundColor: (!this.state.isCountEnd ? styleUtil.disabledColor : styleUtil.themeColor),
										borderColor: (!this.state.isCountEnd ? styleUtil.disabledColor : styleUtil.themeColor)
									}]}>
										<CountDownText
											style={[styles.countBtnText, {fontSize: 13}]}
											countType='seconds' // 计时类型：seconds / date
											auto={true} // 自动开始
											afterEnd={this._countEnd} // 结束回调
											timeLeft={60} // 正向计时 时间起点为0秒
											step={-1} // 计时步长，以秒为单位，正数则为正计时，负数为倒计时
											startText='获取验证码' // 开始的文本
											endText='获取验证码' // 结束的文本
											intervalText={(sec) => sec + '秒重新获取'} // 定时的文本回调
										/>
									</View>
									: <TouchableOpacity
										activeOpacity={0.5}
										style={styles.countBtn}
										onPress={this._sendVerifyCode}>
										<Text style={styles.countBtnText}>获取验证码</Text>
									</TouchableOpacity>
							}
						</View>
					}
					{
						this.state.isSend
							? <TouchableOpacity
								activeOpacity={this.state.phone.length >= 11 && this.state.verifyCode.length >= 6 ? 0.5 : 1}
								style={[styles.buttonBox, {
									backgroundColor: this._btnStyle(this.state.phone.length >= 11 && this.state.verifyCode.length >= 6),
									borderColor: this._btnStyle(this.state.phone.length >= 11 && this.state.verifyCode.length >= 6)
								}]}
								onPress={this._login}>
								<Text style={styles.buttonText}>登录</Text>
							</TouchableOpacity>
							: <TouchableOpacity
								activeOpacity={this.state.phone.length >= 11 ? 0.5 : 1}
								style={[styles.buttonBox, {
									borderColor: this._btnStyle(this.state.phone.length >= 11),
									backgroundColor: this._btnStyle(this.state.phone.length >= 11)
								}]}
								onPress={this._sendVerifyCode}>
								<Text style={styles.buttonText}>获取验证码</Text>
							</TouchableOpacity>
					}
				
				</View>
			</ScrollPage>
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
		color: '#666',
		fontSize: 16,
		backgroundColor: '#fff',
		borderRadius: 4,
		borderWidth:styleUtil.borderSeparator,
		borderColor:styleUtil.borderColor,
	},
	buttonBox: {
		backgroundColor: styleUtil.themeColor,
		padding: 12,
		height: 50,
		marginVertical: 15,
		borderWidth: 1,
		borderColor: styleUtil.themeColor,
		borderRadius: 4
	},
	buttonText: {
		fontSize: 20,
		color: '#fff',
		textAlign: 'center'
	},
	verifyCodeBox: {
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