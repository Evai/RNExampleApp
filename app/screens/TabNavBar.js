import React from 'react'
import {
	Platform,
	View,
	AppState,
	DeviceEventEmitter,
	Vibration,
	NetInfo,
	Animated,
	Alert,
	StatusBar
} from 'react-native'

import {TabView, Badge, NavigationBar} from 'teaset'
import HomeIndex from "../pages/home/HomeIndex";
import MessageIndex from "../pages/message/MessageIndex";
import styleUtil from "../common/styleUtil";
import DiscoveryIndex from "../pages/discovery/DiscoveryIndex";
import AccountIndex from "../pages/account/AccountIndex";
import {Icon} from 'react-native-elements'
import navigate from "./navigate";
import AddTopic from "../pages/topic/AddTopic";
import toast from "../common/toast";
import PhoneLogin from "../pages/account/PhoneLogin";
import config from "../common/config";
import FriendDynamic from "../pages/message/FriendDynamic";
import JPushModule from 'jpush-react-native';
import Search from "../pages/discovery/Search";
import FriendDynamicMsgList from "../pages/message/FriendDynamicMsgList";
import TopicDetail from "../pages/home/TopicDetail";
import request from "../common/request";
import utils from "../common/utils";
import ChatList from "../pages/message/ChatList";
import BadgeAndroid from 'react-native-android-badge'
import {EVENTS} from "../common/IMessage";

const ACTIVE_STYLE = {width: 28, height: 28};

export let MessageBadge = 0;
export let FriendBadge = 0;
export let DynamicBadge = 0;

const receiveCustomMsgEvent = 'receivePushMsg'
const receiveNotificationEvent = 'receiveNotification'
const openNotificationEvent = 'openNotification'
const getRegistrationIdEvent = 'getRegistrationId'

export default class TabNavBar extends React.Component {
	static updateUser(val) {
		DeviceEventEmitter.emit('updateUser', val)
	}
	
	static updateFriendBadge(n) {
		DeviceEventEmitter.emit('updateFriendBadge', n)
	}
	
	static updateMessageBadge(n) {
		DeviceEventEmitter.emit('updateMessageBadge', n)
	}
	
	static updateDynamicBadge(n) {
		DeviceEventEmitter.emit('updateDynamicBadge', n)
	}
	
	constructor(props) {
		super(props);
		this.state = {
			user: config.user,
			type: 'projector',
			custom: true,
			activeIndex: 0,//默认tab页
			currentAppState: AppState.currentState,
			friendBadgeCount: 0,
			notifyCount: 0,
			isAction: true,
			isLoaded: false
		}
		this.springValue = new Animated.Value(0);
	}
	
	componentWillMount() {
		DeviceEventEmitter.addListener('updateUser', val => this.updateUser(val));
		DeviceEventEmitter.addListener('updateFriendBadge', val => this.updateFriendBadge(val));
		DeviceEventEmitter.addListener('updateMessageBadge', val => this.updateMessageBadge(val));
		DeviceEventEmitter.addListener('updateDynamicBadge', val => this.updateDynamicBadge(val));
		AppState.addEventListener('change', this.handleAppStateChange);
		NetInfo.isConnected.addEventListener(
			'connectionChange',
			this.handleFirstConnectivityChange
		);
	}
	
	handleFirstConnectivityChange(isConnected) {
		if (!isConnected) {
			toast.fail("网络未连接");
		}
	}
	
	componentDidMount() {
		// config.removeAllChatList()
		this.init();
		this.initJPush();
		this.spring();
	}
	
	componentWillUnmount() {
		DeviceEventEmitter.removeAllListeners('updateUser');
		DeviceEventEmitter.removeAllListeners('updateFriendBadge');
		AppState.removeEventListener('change', this.handleAppStateChange);
		
		JPushModule.removeReceiveCustomMsgListener(receiveCustomMsgEvent)
		JPushModule.removeReceiveNotificationListener(receiveNotificationEvent)
		JPushModule.removeReceiveOpenNotificationListener(openNotificationEvent)
		JPushModule.removeGetRegistrationIdListener(getRegistrationIdEvent)
		JPushModule.removeReceiveNotificationListener(this.receiveNotification);
		JPushModule.clearAllNotifications()
		NetInfo.isConnected.removeEventListener(
			'connectionChange',
			this.handleFirstConnectivityChange
		);
		imessage.closePing()
	}
	
	getUserInfo = () => {
		if (!config.user._id) {
			return;
		}
		request.post(config.api.baseURI + config.api.getUserInfo)
			.then(res => {
				if (res.code === 0) {
					let user = res.data;
					let oldUser = config.user;
					if (user._id === oldUser._id) {
						oldUser = {
							...oldUser,
							...user
						};
						this.updateUser(oldUser);
					}
				}
			}).catch()
	}
	
	init = () => {
		config.getUser().then(user => {
			this.setState({isLoaded: true});
			if (user._id) {
				imessage.init(config.api.webSocketURI + user._id + '/' + user.accessToken);
				this.updateUser(user);
				this.getUserInfo(user._id);
				this.getNewDynamicCount();
				this.fetchCollectList();
				this.checkAbnormalLogin();
				// this.setJPushAlias(user.accessToken);
				config.getFriendList().then(list => {
					for (let key in list) {
						config.friendList = config.friendList.concat(list[key])
					}
				});
				//获取未读消息
				config.getChatList().then(list => {
					this.updateUnReadMsg(list)
				});
				//获取未读动态
				// config.getDynamicMsg().then(list => {
				// 	this.updateDynamicBadge(list.length)
				// });
				//接收消息
				imessage.onReceiveMsg(res => {
					if (res.code !== 0) return;
					let isMuted = false;//一开始为震动
					let msg = res.data;
					if (!Array.isArray(msg)) {
						msg = [msg];
					}
					msg.forEach((v, i) => {
						if (v.isMuted && v.mutedUserId === config.user._id) {
							isMuted = true;
						}
						else if (!v.isMuted && v.mutedUserId === config.user._id) {
							isMuted = false;//如果发现没有静音，直接终止
							return true;
						}
					});
					if (!isMuted && this.state.user.vibration) {
						Vibration.vibrate();
					}
					config.saveConversation(res.data).then(list => {
						this.updateUnReadMsg(list)
					});
				});
				//获取系统通知消息
				imessage.onSystemMsgReceive(res => {
					if (res.code !== 0) return;
					config.saveSystemNotice(res.data)
				});
				//获取新的好友
				imessage.onGetNewFriends(res => {
					if (res.code !== 0) return;
					config.saveRequestAddFriendList(res.data)
						.then(count => {
							this.updateFriendBadge(count)
						})
				});
				//获取异常登录通知
				imessage.onAbnormalLogin(res => {
					if (res.code !== 0) return;
					Alert.alert(res.data);
					this.abnormalLogin()
				});
				// this.getTopicMsg()
			}
		});
	};
	
	fetchCollectList = () => {
		request.post(config.api.baseURI + config.api.getEmoticon)
			.then(res => {
				if (res.code === 0) {
					config.setCollectEmoticon(res.data)
				}
			})
	};
	
	abnormalLogin = () => {
		imessage.closeWebSocket(true);
		JPushModule.deleteAlias(() => {
		});
		this.updateUser({});
		config.removeUser();
	};
	
	getTopicMsg = () => {
		//获取新的题目通知消息
		imessage
			.onTopicMsgReceive(res => {
				if (res.code !== 0) return;
			})
	}
	
	initJPush = () => {
		if (Platform.OS === 'android') {
			JPushModule.initPush();
			JPushModule.notifyJSDidLoad(resultCode => {
			})
		} else {
			JPushModule.setupPush()
		}
		JPushModule.addReceiveCustomMsgListener(map => {
			// console.log("custom:" ,map)
		})
		JPushModule.addReceiveNotificationListener(map => {
			// console.log(map)
			if (map.extras.event === EVENTS.ABNORMAL_LOGIN) {
				Alert.alert(map.aps.alert.body);
				this.abnormalLogin();
			}
		})
		JPushModule.addReceiveOpenNotificationListener(map => {
			// console.warn("open:", map)
			if (map.extras.activeIndex) {
				this.setState({activeIndex: Number(map.extras.activeIndex)})
			}
		});
		JPushModule.addGetRegistrationIdListener(registrationId => {
			// console.log(registrationId)
		})
	};
	
	setJPushAlias = (alias) => {
		JPushModule.setAlias(alias, map => {
			if (map.errorCode === 0) {
				console.log('set alias succeed')
			} else if (map.errorCode === 6002) {//超时
				this.setJPushAlias(alias)
			}
		})
	};
	
	updateUnReadMsg = (list) => {
		let unreadMsg = 0;
		list.forEach((v, i) => {
			unreadMsg += v.unreadMsg || 0;
		});
		this.updateMessageBadge(MessageBadge + unreadMsg)
	};
	
	handleAppStateChange = (nextAppState) => {
		if (!nextAppState.match(/inactive|background|active/)) {
			return;
		}
		// console.warn(nextAppState)
		if (this.state.currentAppState.match(/inactive|background/) && nextAppState === 'active') {
			if (config.user._id) {
				// FriendDynamic.listenerDynamicMsg();//监听动态
				MessageIndex.listenerFriendAndDynamic();//监听好友
				// this.getTopicMsg();
				let now = new Date();
				config.getRefreshDynamicTime(time => {
					if (now - time > 1800) {
						FriendDynamic.fetchDynamicWithRefreshing();
						config.setRefreshDynamicTime(now)
					}
				});
				this.getNewDynamicCount();
				this.checkAbnormalLogin();
			}
			// ChatList.listenerChatMsg();//监听消息
			// this.init()
			// console.warn('App has come to the foreground!')
			imessage.reconnect();
		}
		else if (nextAppState.match(/inactive|background/)) {
			imessage.closeWebSocket(false);
			imessage.closePing();
			if (config.user._id) {
				config.removeTopicLibraryList();
			}
			// config.removeRequestAddFriendList()
		}
		this.setState({
			currentAppState: nextAppState
		});
	};
	
	checkAbnormalLogin = () => {
		request.post(config.api.baseURI + config.api.checkAbnormalLogin).then(res => {
			if (res.code === 0 && res.data) {
				Alert.alert(res.data);
				imessage.closeWebSocket(true);
				JPushModule.deleteAlias(() => {
				});
				this.updateUser({});
				config.removeUser();
			}
		})
	};
	
	getNewDynamicCount = () => {
		config.getFriendDynamicLastTime()
			.then(data => {
				if (!data) {
					data = {};
					data.createdAt = +new Date()
				}
				else if (typeof data.createdAt === 'string') {
					data.createdAt = utils.strToTimeStamp(data.createdAt)
				}
				// console.warn(data.createdAt)
				request.post(config.api.baseURI + config.api.getNewDynamicCount, {
					// createdAt: data.createdAt,
					lastCreatedAt: data.createdAt
				}).then(res => {
					if (res.code === 0) {
						if (res.data > 0) {
							config.setFriendDynamicNewCount(res.data);
							MessageIndex.setFriendDynamicNewCount(res.data)
						}
					}
				}).catch()
			})
		
	};
	
	updateUser(user) {
		config.setUser(user);
		this.setState({user})
	}
	
	updateMessageBadge = (n) => {
		if (n <= 0) {
			n = 0;
		}
		MessageBadge = n;
		if (Platform.OS === 'ios') {
			JPushModule.setBadge(n, success => {
			});
		} else {
			BadgeAndroid.setBadge(n)
		}
		
		this.updateFriendBadgeCount({message: n})
	};
	
	updateFriendBadge = (n) => {
		if (n <= 0) {
			n = 0;
		}
		FriendBadge = n;
		this.updateFriendBadgeCount({friend: n})
	};
	
	updateDynamicBadge = (n) => {
		if (n <= 0) {
			n = 0;
		}
		DynamicBadge = n;
		this.updateFriendBadgeCount({dynamic: n})
	};
	
	updateFriendBadgeCount = ({message = MessageBadge, friend = FriendBadge, dynamic = DynamicBadge}) => {
		let count = message + friend + dynamic;
		this.setState({
			friendBadgeCount: count
		})
	};
	
	onchangeTab = index => {
		this.setState({activeIndex: index})
	};
	
	spring = () => {
		this.springValue.setValue(0.8);
		Animated.spring(
			this.springValue,
			{
				toValue: 1,
				friction: 1
			}
		).start();
	}
	
	renderCustomButton() {
		let bigIcon = (
			<View style={{
				width: 42,
				height: 42,
				borderRadius: 27,
				// shadowColor: styleUtil.themeColor,
				// shadowOffset: {height:0, width:0},
				// shadowOpacity: 0.2,
				// shadowRadius: 0.5,
				alignItems: 'center',
				justifyContent: 'center',
			}}>
				{/*<Image*/}
				{/*style={{width: 44, height: 44, borderRadius: 22}}*/}
				{/*source={require('teaset/example/images/faircup.jpg')}*/}
				{/*/>*/}
				<Icon
					name={'ios-add-circle'}
					type={'ionicon'}
					size={40}
					color={styleUtil.themeColor}
				/>
			</View>
		);
		return (
			<TabView.Sheet
				type='button'
				// title='Custom'
				icon={bigIcon}
				iconContainerStyle={{justifyContent: 'flex-end'}}
				onPress={() => {
					if (!config.user || !config.user._id || !config.user.accessToken) {
						navigate.push(PhoneLogin)
					} else {
						navigate.push(AddTopic)
					}
				}}
			/>
		);
	}
	
	render() {
		let {type, custom, activeIndex, friendBadgeCount, user} = this.state;
		let customBarStyle = Platform.OS === 'android' ? null : {
			borderTopWidth: styleUtil.borderSeparator,
			shadowColor: '#ccc',
			shadowOffset: {height: -1},
			shadowOpacity: 0.4,
			shadowRadius: 0.5,
			backgroundColor: 'white'
		};
		return (
			<TabView style={{flex: 1}}
			         activeIndex={activeIndex}
			         onChange={index => this.onchangeTab(index)}
			         barStyle={customBarStyle}
			         type={type}>
				<TabView.Sheet
					title='首页'
					icon={require('../assets/image/home.png')}
					onPress={this.spring}
					activeIcon={
						<Animated.Image
							source={require('../assets/image/home_active.png')}
							style={{
								width: 21,
								height: 21,
								tintColor: styleUtil.themeColor,
								transform: [{scale: this.springValue}]
							}}
						/>
					}
					// activeImageStyle={ACTIVE_STYLE}
				>
					<HomeIndex
						user={user}
						renderRightView={
							<NavigationBar.Button
								onPress={_ => {
									navigate.pushNotNavBar(Search, {
										selectValue: '题目',
									})
								}}
							>
								<Icon
									name={'ios-search-outline'}
									type={'ionicon'}
									color={styleUtil.navIconColor}
									size={30}
								/>
							</NavigationBar.Button>
						}
					/>
				</TabView.Sheet>
				<TabView.Sheet
					title='好友'
					icon={require('../assets/image/friend.png')}
					onPress={this.spring}
					activeIcon={
						<Animated.Image
							source={require('../assets/image/friend_active.png')}
							style={{
								width: 26,
								height: 23,
								tintColor: styleUtil.themeColor,
								transform: [{scale: this.springValue}]
							}}
						/>
					}
					badge={friendBadgeCount > 0
						? <Badge
							style={{
								position: 'absolute',
								top: 5,
								right: 5
							}}
							type={'dot'}
						/>
						: undefined}
				>
					<MessageIndex user={user} currentAppState={this.state.currentAppState}/>
				</TabView.Sheet>
				{custom ? this.renderCustomButton() : null}
				<TabView.Sheet
					title='发现'
					icon={require('../assets/image/discovery.png')}
					activeIcon={
						<Animated.Image
							source={require('../assets/image/discovery_active.png')}
							style={{
								...ACTIVE_STYLE,
								tintColor: styleUtil.themeColor,
								transform: [{scale: this.springValue}]
							}}
						/>
					}
					onPress={this.spring}
				>
					<DiscoveryIndex user={user}/>
				</TabView.Sheet>
				<TabView.Sheet
					title='我的'
					icon={require('../assets/image/me.png')}
					activeIcon={
						<Animated.Image
							source={require('../assets/image/me_active.png')}
							style={{
								...ACTIVE_STYLE,
								tintColor: styleUtil.themeColor,
								transform: [{scale: this.springValue}]
							}}
						/>
					}
					onPress={_ => {
						this.spring();
						if (this.state.activeIndex !== 3) {
							this.getUserInfo();
						}
					}}
				>
					<AccountIndex user={user}/>
				</TabView.Sheet>
			</TabView>
		);
	}
}