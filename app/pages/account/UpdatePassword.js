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
import config from "../../common/config";
import NavBar from "../../components/NavBar";
import utils from "../../common/utils";


export default class UpdatePassword extends Component {
	static navigatorStyle = {
		title: '设置密码',
		scene: navigate.sceneConfig.FloatFromBottom,
		navBarHidden: true,
	};
	
	state = {
		password: '',
		confirmPassword: '',
	};
	
	isFinished = () => {
		return this.state.password.length > 5 && this.state.confirmPassword.length > 5
	};
	
	renderNavBar = () => {
		return (
			<NavBar
				title={'设置密码'}
				renderLeftView={<NavigationBar.LinkButton
					title={'关闭'}
					onPress={_ => navigate.pop()}
				/>}
				rightHidden={false}
				rightTitle={'完成'}
				rightStyle={{
					color: this.isFinished() ? styleUtil.successColor : styleUtil.disabledColor
				}}
				rightDisabled={!this.isFinished()}
				rightOnPress={_ => {
					const {password, confirmPassword} = this.state;
					if (password.trim().length < 6) {
						Alert.alert('密码长度过短，不能少于6位');
						return;
					}
					if (password.trim() !== confirmPassword.trim()) {
						Alert.alert('两次填写的密码不一致');
						return;
					}
					if (!utils.checkPassword(password)) {
						Alert.alert('密码必须包含字母和数字组合')
						return;
					}
					this.props.submit && this.props.submit(password);
				}}
			/>
		)
	};
	
	
	submit = () => {
		this.props.submit && this.props.submit(body)
	}
	
	render() {
		return (
			<View style={styleUtil.container}>
				{this.renderNavBar()}
				<ScrollPage>
					<View style={styles.signUpBox}>
						<TextInput
							placeholder='密码(至少6位,必须包含字母数字组合)'
							autoCorrect={false}
							style={styles.inputField}
							secureTextEntry={true}
							value={this.state.password}
							maxLength={30}
							onChangeText={text => {
								this.setState({password: text})
							}}
						/>
						<TextInput
							placeholder='请确认密码'
							autoCorrect={false}
							secureTextEntry={true}
							style={styles.inputField}
							value={this.state.confirmPassword}
							maxLength={30}
							onChangeText={text => {
								this.setState({confirmPassword: text})
							}}
						/>
					</View>
				</ScrollPage>
			</View>
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
		fontSize: 14,
		backgroundColor: '#fff',
		borderRadius: 4,
		borderWidth: styleUtil.borderSeparator,
		borderColor: styleUtil.borderColor,
		marginVertical: 5
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