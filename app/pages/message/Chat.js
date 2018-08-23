import React from 'react';
import {
	Platform,
	View,
	Keyboard,
	LayoutAnimation,
	Animated,
	Clipboard,
	Vibration,
	CameraRoll,
	AppState,
	Alert,
	KeyboardAvoidingView, Linking
} from 'react-native';

import MessageContainer from './chat/MessageContainer';
import InputToolbar, {MIN_INPUT_TOOLBAR_HEIGHT} from "./chat/InputToolbar";
import {Icon} from 'react-native-elements';
import ChatList from "./ChatList";
import PropTypes from 'prop-types'
import navigate from "../../screens/navigate";
import {ActionPopover, NavigationBar} from 'teaset'
import ChatUserInfo from "./chat/ChatUserInfo";
import config from "../../common/config";
import toast from "../../common/toast";
import TabNavBar, {MessageBadge} from "../../screens/TabNavBar";
import styleUtil from "../../common/styleUtil";
import NavBar from "../../components/NavBar";
import Emoticons from "../../components/emoticon/Emoticons";
import LoadingMore from "../../components/load/LoadingMore";
import ChatGroupInfo from "./chat/ChatGroupInfo";
import NavigatorPage from "../../components/NavigatorPage";
import uuid from "uuid";
import ImageCached from "../../components/ImageCached";
import ShareMessage from "./chat/ShareMessage";
import request from "../../common/request";
import utils from "../../common/utils";


const RegHttp = /^http:\/\/|^https:\/\//;

export default class Chat extends NavigatorPage {
	static defaultProps = {
		...NavigatorPage.defaultProps,
		navigationBarInsets: false,
		navBarHidden: true
	};
	
	constructor(props) {
		super(props);
		let messages = this.formatData(props.messages);
		messages.forEach((v, i) => {
			if (v.status === 'send') {
				messages[i].status = 'failed'
			}
		});
		
		Object.assign(this.state, {
			isInitialized: false, // initialization will calculate maxHeight before rendering the chat
			canLoadMore: props.canLoadMore,
			currentMetering: 0,
			messages: messages || [],
			showMenuBar: false,
			menuBarOrigin: {},
			menuItems: [],
			isLoadingEarlier: false,
			messagesContainerHeight: new Animated.Value(0),
			leftTitle: MessageBadge > 99 ? '99+' : (MessageBadge > 0 ? MessageBadge + '' : '返回'),
			title: props.item.name,
			avatar: props.item.avatar,
			vibration: true,
			collectList: []
		})
		this._isMounted = false;
		this.toId = props.item.toId;
		this.total = props.total;
		this.chatType = Number(props.item.chatType);
		this.fromUser = {
			_id: config.user._id,
			username: config.user.username,
			avatar: config.user.avatar
		};
		this._keyboardHeight = 0;
		this._bottomOffset = 0;
		this._maxHeight = 0;
		this._touchStarted = false;
		this._isFirstLayout = true;
		this._isTypingDisabled = false;
		this._locale = 'en';
		this.recordTime = 0;
		
		this.onSend = this.onSend.bind(this);
		this.onTouchStart = this.onTouchStart.bind(this);
		this.onTouchMove = this.onTouchMove.bind(this);
		this.onTouchEnd = this.onTouchEnd.bind(this);
		this.onKeyboardWillShow = this.onKeyboardWillShow.bind(this);
		this.onKeyboardWillHide = this.onKeyboardWillHide.bind(this);
		this.onKeyboardDidShow = this.onKeyboardDidShow.bind(this);
		this.onKeyboardDidHide = this.onKeyboardDidHide.bind(this);
		
		this.invertibleScrollViewProps = {
			inverted: false,
			keyboardShouldPersistTaps: "handled",
			keyboardDismissMode: "on-drag",
			onTouchStart: this.onTouchStart,
			onTouchMove: this.onTouchMove,
			onTouchEnd: this.onTouchEnd,
			onKeyboardWillShow: this.onKeyboardWillShow,
			onKeyboardWillHide: this.onKeyboardWillHide,
			onKeyboardDidShow: this.onKeyboardDidShow,
			onKeyboardDidHide: this.onKeyboardDidHide,
		};
	}
	
	renderNavigationBar() {
		return (
			<NavBar
				style={{position: 'absolute'}}
				title={this.state.title}
				leftOnPress={_ => {
					Keyboard.dismiss();
					navigate.popToTop();
				}}
				leftTitle={this.state.leftTitle}
				leftTitleStyle={{
					opacity: 1
				}}
				leftStyle={{
					marginLeft: 0
				}}
				renderRightView={
					<NavigationBar.Button
						onPress={_ => {
							if (this.chatType === 1) {
								navigate.push(ChatUserInfo, {item: this.props.item, _Chat: this})
							} else {
								navigate.push(ChatGroupInfo, {item: this.props.item, _Chat: this})
							}
						}}>
						{this.chatType === 1 && <Icon name={'person'} size={28} color={styleUtil.navIconColor}/>}
						{this.chatType === 2 && <Icon name={'group'} size={28} color={styleUtil.navIconColor}/>}
					</NavigationBar.Button>
				}
			/>
		)
	};
	
	componentDidMount() {
		// config.removeChatWithUser(this.toId)
		// config.removeAllChatList()
		AppState.addEventListener('change', this.handleAppStateChange);
		Vibration.cancel();
		this._isMounted = true;
		this.listenerChatWithDetail()
		this.getVibration();
		config.getCollectEmoticon().then(list => {
			if (list.length > 0) {
				this.updateCollectList(list)
			}
		});
	}
	
	updateCollectList = (arr) => {
		if (!Array.isArray(arr)) {
			arr = [arr]
		}
		let list = [...arr];
		if (list[0].id !== 0) {
			list.unshift({id: 0})
		}
		this.setState({collectList: list});
		config.setCollectEmoticon(list)
	};
	
	componentWillUnmount() {
		this._isMounted = false;
		imessage.onReceiveMsg(data => ChatList.onReceive(data));
		AppState.removeEventListener('change', this.handleAppStateChange);
	}
	
	shouldComponentUpdate(nextProps, nextState) {
		return nextProps !== nextState
	}
	
	getVibration = () => {
		config.getVibration().then(data => {
			if (!data) {
				this.setState({vibration: true})
			} else {
				if (data.vibration) {
					this.setState({vibration: true})
				} else {
					this.setState({vibration: false})
				}
			}
		})
	};
	
	listenerChatWithDetail = () => {
		imessage.onReceiveMsg(data => this.onReceive(data))
	};
	
	handleAppStateChange = (nextAppState) => {
		// console.warn(nextAppState)
		if (!nextAppState.match(/inactive|background|active/)) {
			return;
		}
		if (nextAppState === 'active') {
			this.listenerChatWithDetail()
		}
	};
	
	onReceive = (res) => {
		if (!this._isMounted) {
			return
		}
		if (res.code !== 0) return;
		let list = res.data;
		if (!Array.isArray(list)) {
			list = [list]
		}
		let badge = 0;
		let isMuted = false;
		list.forEach((v, i) => {
			if (v.isMuted && v.mutedUserId === config.user._id) {
				isMuted = true;
			}
			else if (!v.isMuted && v.mutedUserId === config.user._id) {
				isMuted = false;//如果发现没有静音，直接终止
				return true;
			}
		});
		if (!isMuted && config.user.vibration) {
			Vibration.vibrate();
		}
		let currentData = [];
		let otherData = [];
		for (let data of list) {
			if (data.chatType === 1 && data.fromUserId === this.toId) {
				badge += 1;
				currentData.push(data);
			}
			else if (data.chatType === 2 && data.gid === this.toId) {
				badge += 1;
				currentData.push(data);
			}
			else {
				otherData.push(data);
			}
			if (badge > 0) {
				TabNavBar.updateMessageBadge(MessageBadge - badge);
			}
		}
		this.updateMessages(currentData);
		this.updateReceiveMsg(otherData);
	};
	
	updateReceiveMsg = (msgs) => {
		if (!Array.isArray(msgs)) {
			msgs = [msgs];
		}
		msgs.forEach((data) => {
			let count = MessageBadge + data.unreadMsg;
			if (count > 0) {
				this.setState({
					leftTitle: count > 99 ? '99+' : count + ''
				});
			}
			TabNavBar.updateMessageBadge(count);
			let tabs = this.props.tabs;
			if (tabs) {
				tabs[0].badgeCount = MessageBadge;
				this.props.updateTabs(tabs);
			}
		});
		
		config.saveConversation(msgs).then(list => {
			ChatList.updateList(list)
		});
		// if (data.chatType === 1) {
		// 	data.name = data.fromUser.username;
		// 	data.avatar = [data.fromUser.avatar];
		// }
		
	};
	
	formatData(arr) {
		arr.sort(function (a, b) {
			return b.createdAt - a.createdAt
		});
		return arr;
	}
	
	concatMessage(messages, newData) {
		let isHas = false;
		messages.forEach((res, i) => {
			if (res.msgId === newData.msgId) {
				if (messages[i].status === 'success' && messages[i].flags !== true) {
					messages[i].flags = true;
				}
				else if (messages[i].status !== 'success') {
					messages[i] = newData;
				}
				isHas = true;
			}
		});
		if (!isHas) {
			messages = [newData].concat(messages);
		}
		return messages
	}
	
	isLocalFile = (file) => {
		if (!RegHttp.test(file.path)) {
			file.path = file.path.indexOf('file://') > -1 ? file.path : 'file://' + file.path;
		}
	};
	
	onSend(obj) {
		// console.warn(obj)
		obj.toId = obj.toId || this.toId;
		obj.chatType = obj.chatType || this.chatType;
		if (obj.text) {
			obj.text = Emoticons.stringify(obj.text);
			if (obj.chatType === 2) {
				this.sendAfter(imessage.createGroupText(obj))
			} else {
				this.sendAfter(imessage.createSingleText(obj));
			}
		}
		else if (obj.image) {
			this.isLocalFile(obj.image);
			if (obj.chatType === 2) {
				this.sendAfter(imessage.createGroupImage(obj))
			} else {
				this.sendAfter(imessage.createSingleImage(obj))
			}
		}
		else if (obj.location) {
			if (obj.chatType === 2) {
				this.sendAfter(imessage.createGroupLocation(obj))
			} else {
				this.sendAfter(imessage.createSingleLocation(obj))
			}
		}
		else if (obj.voice) {
			this.isLocalFile(obj.voice);
			if (obj.chatType === 2) {
				this.sendAfter(imessage.createGroupVoice(obj))
			} else {
				this.sendAfter(imessage.createSingleVoice(obj))
			}
		}
		else if (obj.video) {
			this.isLocalFile(obj.video);
			if (obj.chatType === 2) {
				this.sendAfter(imessage.createGroupVideo(obj))
			} else {
				this.sendAfter(imessage.createSingleVideo(obj))
			}
		}
	}
	
	sendAfter = (im) => {
		im.then(data => {
			const body = data.chatBody;
			if (body.toUserId === this.toId || body.gid === this.toId) {
				this.updateMessages(body);
			}
			if (body.image || body.voice || body.video) {
				return imessage.upload(body, body.msgType)
					.then(obj => {
						data.chatBody = obj;
						return imessage.send(data);
					})
			}
			return imessage.send(data)
		}).then(res => {
			if (JSON.stringify(res) === '{}') return;
			const data = res.data;
			if (res.code === 0) {
				if (data.toUserId === this.toId || data.gid === this.toId) {
					this.updateMessages(data);
				} else {
					this.updateReceiveMsg(data);
				}
			} else {
				const sendData = imessage.sendData;
				sendData.status = 'failed';
				this.updateMessages(sendData)
				if (res.code === 1001) {
					let newData = Object.assign({}, sendData);
					newData.notification = res.msg;
					newData.msgType = 'notification';
					newData.text = null;
					newData.image = null;
					newData.location = null;
					newData.msgId = uuid.v4();
					this.updateMessages(newData);
				}
			}
		}).catch();
	};
	
	updateMessages = (msgs) => {
		if (this._isMounted) {
			if (!Array.isArray(msgs)) {
				msgs = [msgs];
			}
			// this.animateMessages()
			let messages = [...this.state.messages];
			msgs.forEach((item, i) => {
				let data = msgs[i];
				if (data && data.msgId) {
					// data.text = Emoticons.parse(data.text);
					if (data.fromUserId === config.user._id) {
						//判断是否是自己发的消息，更改消息状态
						data.fromUser = this.fromUser;
						this.scrollToBottom();
					}
					//如果为当前聊天用户发送的消息，更新列表
					data.unreadMsg = 0;
					//改变聊天标题
					if (data.name && this.state.title !== data.name) {
						this.setState({title: data.name})
					}
					data.name = data.name ? data.name : this.state.title;
					data.avatar = data.avatar ? data.avatar : this.state.avatar;
					data.toId = data.toId ? data.toId : this.props.item.toId;
					if (this.chatType === 1) {
						data.toUserId = data.toId;
					} else {
						data.gid = data.toId;
					}
					messages = this.concatMessage(messages, data);
				}
			});
			this.formatData(messages);
			this.setState({
				messages
			});
			config.saveConversation(msgs).then(list => {
				ChatList.updateList(list)
			});
		}
	};
	
	_showPopover = ({x, y, width, height}, items, message) => {
		let align = 'center';
		if (message.fromUser._id === config.user._id) {
			align = 'end'
		} else {
			align = 'start'
		}
		ActionPopover.show({
			x: x,
			y: y,
			width,
			height
		}, items, {align});
	};
	
	onMessageLongPress(origin, message) {
		// console.warn("on message long press:", message);
		let items = [
			{
				title: '转发', onPress: _ => {
					navigate.pushNotNavBar(ShareMessage, {
						onSend: this.onSend,
						message
					})
				}
			},
			{
				title: '删除', onPress: _ => {
					Alert.alert('确定删除吗？', '', [
						{text: '取消',},
						{
							text: '确定', onPress: _ => {
								let messages = [...this.state.messages];
								let index = messages.findIndex(item => item.msgId === message.msgId);
								if (index < 0) {
									return;
								}
								messages.splice(index, 1);
								this.formatData(messages);
								this.setState({messages});
								config.getConversationWithKey(this.toId).then(map => {
									delete map[message.msgId];
									config.setConversationWithKey(this.toId, map);
								})
							}
						},
					])
				}
			},
		];
		if (message.msgType === 'text') {
			items.unshift({
				title: '复制', onPress: _ => {
					Clipboard.setString(message.text);
				}
			})
		}
		else if (message.msgType === 'image') {
			items.unshift({
				title: '添加到表情', onPress: _ => {
					request.post(config.api.baseURI + config.api.addEmoticon, {
						image: message.image.path
					}).then(res => {
						toast.modalLoadingHide()
						if (res.code === 0) {
							toast.success('添加成功');
							config.getCollectEmoticon().then(list => {
								list.push(res.data);
								this.setState({collectList: list});
								config.setCollectEmoticon(list)
							});
						}
					})
				}
			})
		} else if (message.msgType === 'voice') {
			items.splice(0, 1)
		} else if (message.msgType === 'location') {
			items.unshift({
				title: '复制', onPress: _ => {
					Clipboard.setString(message.location.address);
				}
			})
		}
		this._showPopover(origin, items, message)
	}
	
	onMessagePress(pressView, message) {
		if (message.msgType === 'image') {
			let image = message.image;
			ImageCached.onImagePress(pressView, ImageCached.generateCacheImages([{uri: image.path}], image.width || 100, image.height || 100))
		}
		else if (message.msgType === 'location') {
			this.openMap(message.location)
		}
	}
	
	openMap = (location) => {
		const url = Platform.select({
			ios: `http://maps.apple.com/?ll=${location.latitude},${location.longitude}`,
			android: `http://www.google.cn/maps/@${location.latitude},${location.longitude},17z`
		});
		// const url = `https://ditu.amap.com/regeo?lng=${location.longitude}&lat=${location.latitude}&name=&adcode=`;
		Linking.canOpenURL(url).then(supported => {
			if (supported) {
				return Linking.openURL(url);
			}
		}).catch(err => {
			// console.error('An error occurred', err);
		});
	}
	
	getChildContext() {
		return {
			getLocale: this.getLocale.bind(this)
		};
	}
	
	getLocale() {
		return this._locale;
	}
	
	setMaxHeight(height) {
		this._maxHeight = height;
	}
	
	getMaxHeight() {
		return this._maxHeight;
	}
	
	setIsFirstLayout(value) {
		this._isFirstLayout = value;
	}
	
	getIsFirstLayout() {
		return this._isFirstLayout;
	}
	
	setKeyboardHeight(height) {
		this._keyboardHeight = height;
	}
	
	getKeyboardHeight() {
		return this._keyboardHeight;
	}
	
	onKeyboardWillShow(e) {
		this.setKeyboardHeight(e.endCoordinates ? e.endCoordinates.height : e.end.height);
		this.inputToolbar.actionBarHeight = 0;
		const newMessagesContainerHeight = this.getMaxHeight() - this.inputToolbar.getToolbarHeight() - this.getKeyboardHeight();
		// if (e && e.duration && e.duration > 0) {
		// 	let animation = LayoutAnimation.create(
		// 		e.duration,
		// 		LayoutAnimation.Types[e.easing],
		// 		LayoutAnimation.Properties.opacity);
		// 	LayoutAnimation.configureNext(animation);
		// }
		// console.log(e)
		this.setState({
			messagesContainerHeight: new Animated.Value(newMessagesContainerHeight),
		});
	}
	
	onKeyboardWillHide(e) {
		this.setKeyboardHeight(0);
		// console.info(this.getMaxHeight(), this.getKeyboardHeight())
		const newMessagesContainerHeight = this.getMaxHeight() - this.inputToolbar.getToolbarHeight() - this.getKeyboardHeight();
		// if (e && e.duration && e.duration > 0) {
		// 	let animation = LayoutAnimation.create(
		// 		e.duration,
		// 		LayoutAnimation.Types[e.easing],
		// 		LayoutAnimation.Properties.opacity);
		// 	LayoutAnimation.configureNext(animation);
		// }
		this.setState({
			messagesContainerHeight: new Animated.Value(newMessagesContainerHeight)
		});
	}
	
	onKeyboardDidShow(e) {
		if (Platform.OS === 'android') {
			this.onKeyboardWillShow(e);
		}
		this.inputToolbar.dismiss();
	}
	
	onKeyboardDidHide(e) {
		// console.info('keyboard hide', e)
		if (Platform.OS === 'android') {
			this.onKeyboardWillHide(e);
		}
	}
	
	scrollToBottom(animated = true) {
		this._messageContainerRef && this._messageContainerRef.scrollTo({
			y: 0,
			animated,
		});
	}
	
	onTouchStart() {
		this._touchStarted = true;
		this.inputToolbar.dismiss();
	}
	
	onTouchMove() {
		this._touchStarted = false;
	}
	
	onTouchEnd() {
		if (this._touchStarted === true && !this.state.showMenuBar) {
			Keyboard.dismiss();
			this.inputToolbar.dismiss();
		}
		this._touchStarted = false;
	}
	
	prepareMessagesContainerHeight(value) {
		return new Animated.Value(value);
	}
	
	animateMessages = () => {
		LayoutAnimation.configureNext({
			duration: 500,
			create: {
				duration: 300,
				type: LayoutAnimation.Types.keyboard,
				property: LayoutAnimation.Properties.opacity,
			},
			update: {
				type: LayoutAnimation.Types.spring,
				property: LayoutAnimation.Properties.opacity,
				springDamping: 200,
			}
		});
	};
	
	onInputToolbarHeightChange(h) {
		const newMessagesContainerHeight = this.getMaxHeight() - this.inputToolbar.getToolbarHeight() - this.getKeyboardHeight();
		if (Platform.OS === 'ios') {
			LayoutAnimation.configureNext(LayoutAnimation.create(
				100,
				LayoutAnimation.Types.keyboard,
				LayoutAnimation.Properties.scaleXY
			));
		} else {
			LayoutAnimation.configureNext(LayoutAnimation.create(
				100,
				LayoutAnimation.Types.linear,
				LayoutAnimation.Properties.opacity
			));
		}
		
		this.setState({
			messagesContainerHeight: new Animated.Value(newMessagesContainerHeight),
			showMenuBar: false
		});
	}
	
	onLoadMoreAsync = () => {
		if (!this.state.canLoadMore || !this._isMounted || !this.state.isFocused) {
			return
		}
		// console.log('onisLoadingEarlier')
		this.setState({isLoadingEarlier: true});
		setTimeout(() => {
			config.getConversationWithKey(this.toId).then(map => {
				// console.warn(list)
				let list = [];
				Object.keys(map).forEach((key) => {
					list.push(map[key])
				});
				utils.formatData(list);
				if (list.length <= 0) return;
				this.total = list.length;
				this.setState((previousState) => {
					let newState = {
						isLoadingEarlier: false
					};
					// list.forEach((v, i) => {
					// 	if (v.avatar !== config.user.avatar) {
					// 		list[i].avatar = config.user.avatar
					// 	}
					// });
					let index = this.state.messages.length;
					list = list.slice(index, index + config.pageSize);
					if (list.length < config.pageSize) {
						newState.canLoadMore = false;
					}
					if (list) {
						newState.messages = previousState.messages.concat(list)
					}
					return newState
				});
			})
		}, config.loadingTime);
	};
	
	_hasMore = () => {
		return this.state.messages.length < this.total
	};
	
	_fetchMoreData = () => {
		if (this._hasMore() && !this.state.isLoadingEarlier) {
			this.onLoadMoreAsync()
		}
	};
	
	renderLoadEarlier = () => {
		return (
			<LoadingMore hasMore={this._hasMore()} showText={false}/>
		)
	};
	
	onAvatarLongPress = (message) => {
		if (this.inputToolbar && this.inputToolbar.search) {
			this.setState({showMenuBar: true})
			this.inputToolbar.updateText('@' + message.fromUser.username + ' ');
			this.inputToolbar.search.focus();
		}
	};
	
	renderMessages() {
		const session = {};
		return (
			<Animated.View style={{height: this.state.messagesContainerHeight}}>
				<MessageContainer
					canLoadMore={this.state.canLoadMore}
					onLoadMoreAsync={this._fetchMoreData}
					user={config.user}
					session={session}
					// isLoadingEarlier={this.state.isLoadingEarlier}
					renderLoadEarlier={this.renderLoadEarlier}
					invertibleScrollViewProps={this.invertibleScrollViewProps}
					onMessageLongPress={this.onMessageLongPress.bind(this)}
					onMessagePress={this.onMessagePress.bind(this)}
					messages={this.state.messages}
					onSend={this.onSend}
					onAvatarLongPress={this.onAvatarLongPress}
					ref={component => this._messageContainerRef = component}
					updateMessages={this.updateMessages}
				/>
			</Animated.View>
		);
	}
	
	renderInputToolbar() {
		const inputToolbarProps = {
			onSend: this.onSend,
			onHeightChange: this.onInputToolbarHeightChange.bind(this),
			giftedChat: this,
			collectList: this.state.collectList,
			updateCollectList: this.updateCollectList
		};
		return (
			<InputToolbar
				ref={(input) => this.inputToolbar = input}
				{...inputToolbarProps}
			/>
		);
	}
	
	renderPage() {
		// const {showMenuBar, menuBarOrigin, menuItems} = this.state
		if (this.state.isInitialized === true) {
			let onViewLayout = (e) => {
				if (this.getIsFirstLayout() === true) {
					this.setIsFirstLayout(false);
				}
			};
			return (
				<View behavior="position"
				      style={{flex: 1, marginTop: styleUtil.navBarHeight + (Platform.OS === 'ios' ? 0 : 25)}}>
					<View
						style={{flex: 1, backgroundColor: "#f7f7f7"}}
						onLayout={onViewLayout}>
						{this.state.isFocused && this.renderMessages()}
						{this.state.isFocused && this.renderInputToolbar()}
					</View>
				</View>
			);
		}
		let onViewLayout = (e) => {
			const layout = e.nativeEvent.layout;
			if (layout.height === 0) {
				return;
			}
			this.setMaxHeight(layout.height);
			let t = this.prepareMessagesContainerHeight(this.getMaxHeight() - MIN_INPUT_TOOLBAR_HEIGHT);
			this.setState({
				isInitialized: true,
				messagesContainerHeight: t
			});
		};
		return (
			<View style={{
				flex: 1,
				backgroundColor: "transparent",
				marginTop: styleUtil.navBarHeight + (Platform.OS === 'ios' ? 0 : 25)
			}}
			      onLayout={onViewLayout}>
			</View>
		);
	}
}

Chat.childContextTypes = {
	getLocale: PropTypes.func,
};