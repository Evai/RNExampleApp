'use strict'

import React, {
	Component
} from 'react'
import {
	StyleSheet,
	Text,
	View,
	ScrollView,
	Alert,
} from 'react-native'
import styleUtil from "../../common/styleUtil";
import {
	Icon,
	Avatar
} from 'react-native-elements'
import {ListRow, Button} from 'teaset'
import PhoneLogin from "./PhoneLogin";
import navigate from "../../screens/navigate";
import Profile from "./Profile";
import NavigatorPage from "../../components/NavigatorPage";
import TabNavBar from "../../screens/TabNavBar";
import MessageSetting from "./MessageSetting";
import PrivacySetting from "./PrivacySetting";
import request from "../../common/request";
import config from "../../common/config";
import JPushModule from 'jpush-react-native';
import ClearCache from "./ClearCache";
import ImageCached from "../../components/ImageCached";
import EditTextArea from "./profile/EditTextArea";
import toast from "../../common/toast";
import ShareWeChat from "../../components/ShareWeChat";
import WebPage from "../../components/WebPage";
import UserIntegral from "./UserIntegral";
import storageUtil from "../../common/storageUtil";
import AboutUs from "./AboutUs";

const list = [
	// {
	// 	title: '账户安全',
	// 	icon: 'lock',
	// 	type: 'materialIcons',
	// 	onPress: _ => navigate.push(AccountSecurity)
	// },
	{
		title: '我的积分',
		icon: require('../../assets/image/integral.png'),
		onPress: _ => {
			if (!config.user._id) {
				navigate.push(PhoneLogin);
			} else {
				navigate.push(UserIntegral)
			}
		}
	},
	{
		title: '消息设置',
		icon: require('../../assets/image/message.png'),
		onPress: _ => {
			if (!config.user._id) {
				navigate.push(PhoneLogin);
			} else {
				navigate.push(MessageSetting)
			}
		}
	},
	{
		title: '隐私设置',
		icon: require('../../assets/image/private.png'),
		onPress: _ => {
			if (!config.user._id) {
				navigate.push(PhoneLogin);
			} else {
				navigate.push(PrivacySetting)
			}
		}
	},
	{
		title: '关于我们',
		onPress: _ => navigate.push(AboutUs),
		icon: require('../../assets/image/about_us.png'),
	},
	{
		title: '意见反馈',
		icon: require('../../assets/image/feedback.png'),
		onPress: _ => navigate.pushNotNavBar(EditTextArea, {
			text: '',
			title: '意见反馈',
			maxLength: 1000,
			placeholder: '写下你对该软件在使用过程中的问题和意见，帮助我们更好地完善软件，感谢您的支持',
			submit: text => {
				request.post(config.api.baseURI + config.api.addFeedback, {
					content: text
				}).then(res => {
					if (res.code === 0) {
						toast.success('感谢您的反馈，我们会及时处理');
						navigate.pop();
					}
				}).catch()
			}
		})
	},
	{
		title: '推荐朋友',
		icon: require('../../assets/image/share.png'),
		onPress: _ => {
			ShareWeChat.show({
				type: 'news',
				title: '于何处，寻找价值观一致的同类人',
				description: '有些人，只是我们短暂人生的过客，很快便在我们的记忆中被抹掉；还有些人，却在与我们插肩而过之后，让我们的心为之改变。人生若之如初见，那是怎样的美好。在这里，遇见对的人，就是你一生的幸福……',
				thumbImage: config.api.imageURI + 'uploads/image/app_icon.png',
				imageUrl: config.api.imageURI + 'uploads/image/app_icon.png',
				webpageUrl: 'http://a.app.qq.com/o/simple.jsp?pkgname=com.whereapp'
			}, success => {
				request.post(config.api.baseURI + config.api.shareApp)
					.then(res => {
						if (res.code === 0) {
							toast.success('分享成功');
						}
					})
			})
		}
	},
	{
		title: '清理缓存',
		icon: require('../../assets/image/clear.png'),
		onPress: _ => navigate.pushNotNavBar(ClearCache)
	}
];

export default class AccountIndex extends NavigatorPage {
	static defaultProps = {
		...NavigatorPage.navigatorStyle,
		title: '账户',
		showBackButton: false
	};
	
	constructor(props) {
		super(props);
		Object.assign(this.state, {})
	}
	
	componentWillMount() {
	
	}
	
	componentWillUnmount() {
	
	}
	
	goProfile = (user) => {
		if (!user._id) {
			navigate.push(PhoneLogin);
			return
		}
		navigate.push(Profile, {
			...this.props,
			_id: user._id
		})
	};
	
	logout = () => {
		Alert.alert(
			'提示',
			'退出后将不会再接收消息。确认退出登录吗？',
			[
				{
					text: '退出', onPress: () => {
						request.post(config.api.baseURI + config.api.logout)
							.then(res => {
								if (res.code === 0) {
									imessage.closeWebSocket(true);
									imessage.closePing();
									JPushModule.deleteAlias(() => {
									});
									TabNavBar.updateUser({});
									config.removeUser();
									toast.success('已退出登录');
								}
							})
					}
				},
				{
					text: '取消', onPress: () => {
					}, style: 'cancel'
				},
			],
			{cancelable: true}
		)
	};
	
	signIn = () => {
		if (!config.user._id) {
			navigate.push(PhoneLogin);
			return;
		}
		request.post(config.api.baseURI + config.api.signIn)
			.then(res => {
				if (res.code === 0) {
					let user = this.props.user;
					user.isSignIn = true;
					user.integral += 3;
					TabNavBar.updateUser(user);
					Alert.alert('签到成功，奖励3积分');
				}
			}).catch()
	};
	
	_renderContent = () => {
		let {user} = this.props;
		return (
			<View>
				<View style={{marginTop: 20}}>
					<ListRow
						title={
							<View style={{
								flexDirection: 'row',
								marginLeft: 8,
								alignItems: 'center'
							}}>
								{user._id && <Icon
									name={user.gender === 1 ? 'gender-male' : user.gender === 2 ? 'gender-female' : 'gender-male-female'}
									type={'material-community'}
									size={20}
									color={user.gender === 1 ? '#009ad6' : user.gender === 2 ? '#f391a9' : '#7D26CD'}
									containerStyle={{marginRight: 5}}
								/>}
								<Text style={{fontSize: 16}}>
									{user.username ? user.username : '请先登录'}
								</Text>
							</View>
							
						}
						titleStyle={{marginLeft: 10}}
						onPress={_ => this.goProfile(user)}
						icon={
							<Avatar
								large
								rounded
								source={config.defaultAvatar(user.avatar)}
							/>
						}
						detail={
							<Button
								title={user.isSignIn ? '已签到' : '签到'}
								titleStyle={{color: 'white'}}
								disabled={user.isSignIn}
								style={{
									backgroundColor: user.isSignIn ? styleUtil.disabledColor : styleUtil.themeColor,
									borderColor: user.isSignIn ? styleUtil.disabledColor : styleUtil.themeColor,
								}}
								onPress={this.signIn}
							/>
						}
						topSeparator={'full'}
						bottomSeparator={'full'}
						// accessory={'none'}
					/>
				</View>
				<View style={{marginTop: 20}}>
					{
						list.map((v, i, arr) => (
							<ListRow
								key={i}
								title={v.title}
								onPress={v.onPress}
								icon={v.icon}
								topSeparator={i === 0 ? 'full' : 'none'}
								bottomSeparator={i + 1 === arr.length ? 'full' : 'indent'}
							/>
						))
					}
				</View>
				{
					user._id &&
					<View style={{marginTop: 20, marginBottom: 10}}>
						<ListRow
							title={'退出登录'}
							titleStyle={styles.logoutText}
							onPress={this.logout}
							accessory={'none'}
							topSeparator={'full'}
							bottomSeparator={'full'}
						/>
					</View>
				}
			</View>
		)
	}
	
	renderPage() {
		return (
			<View style={styles.container}>
				<ScrollView>
					{this._renderContent()}
				</ScrollView>
			</View>
		)
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: styleUtil.backgroundColor,
	},
	itemContainer: {
		height: 100,
		justifyContent: 'center',
		alignItems: 'center'
	},
	avatarContainer: {
		width: 75,
		height: 75,
		borderRadius: 8,
		marginRight: 15
	},
	avatar: {
		width: 75,
		height: 75,
		borderRadius: 8
	},
	logoutText: {
		color: 'red',
		textAlign: 'center'
	}
})