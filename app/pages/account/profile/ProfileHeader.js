import React from 'react'
import {
	StyleSheet,
	View,
	Text,
	TouchableOpacity,
	Animated,
	Image,
	Alert,
} from 'react-native'
import {DEFAULT_NAVBAR_HEIGHT, DEFAULT_WINDOW_MULTIPLIER, SCREEN_HEIGHT} from "./constants";
import {
	Avatar,
	Button,
	Icon
} from 'react-native-elements'
import PropTypes from 'prop-types'
import navigate from "../../../screens/navigate";
import utils from "../../../common/utils";
import UserEdit from "./UserEdit";
import Chat from "../../message/Chat";
import toast from "../../../common/toast";
import request from "../../../common/request";
import config from "../../../common/config";
import FriendList from "../../message/FriendList";
import EditTextArea from "./EditTextArea";
import UserList from "./UserList";
import {AlbumView, Overlay} from 'teaset'
import ImageCached from "../../../components/ImageCached";
import WebPage from "../../../components/WebPage";
import {MessageBadge} from "../../../screens/TabNavBar";
import TabNavBar from "../../../screens/TabNavBar";
import ChatList from "../../message/ChatList";
import styleUtil from "../../../common/styleUtil";
import PhoneLogin from "../PhoneLogin";

export default class ProfileHeader extends React.Component {
	static defaultProps = {
		windowHeight: SCREEN_HEIGHT * DEFAULT_WINDOW_MULTIPLIER,
	};
	
	static propTypes = {
		backgroundSource: PropTypes.string,
		windowHeight: PropTypes.number,
		avatar: Image.propTypes.source,
		id: PropTypes.string,
		username: PropTypes.string,
		follows: PropTypes.number,
		fans: PropTypes.number,
		gender: PropTypes.number,
		similar: PropTypes.number,
		verifySimilar: PropTypes.number,
		scrollY: PropTypes.object.isRequired,
		isFriend: PropTypes.bool,
		isFollow: PropTypes.bool,
	};
	
	constructor(props) {
		super(props)
		this.state = {
			id: props.id,
			isFollow: props.isFollow,
			isFriend: props.isFriend,
			followLoading: false,
			friendLoading: false
		}
	}
	
	componentWillReceiveProps(props) {
		if (props.id !== this.state.id || props.isFollow !== this.state.isFriend || props.isFriend !== this.state.isFriend) {
			this.setState({
				id: props.id,
				isFollow: props.isFollow,
				isFriend: props.isFriend
			})
		}
	}
	
	_onFollow = () => {
		if (!config.user._id) {
			navigate.push(PhoneLogin);
			return;
		}
		let {id, isFollow} = this.state
		this.setState({followLoading: true})
		request.post(config.api.baseURI + config.api.followUser, {
			followUserId: id,
			isFollow: !isFollow
		}).then(res => {
			this.setState({followLoading: false})
			if (res.code === 0) {
				this.setState({
					isFollow: !isFollow
				})
			}
		})
	};
	
	verifyFriend = () => {
		let {id} = this.props;
		this.setState({friendLoading: true});
		request.post(config.api.baseURI + config.api.addFriend, {
			friendId: id
		}).then(res => {
			if (res.code === 0) {
				imessage.createSingleNotification("你们已经成为好友了，现在可以开始聊天啦", id)
					.then(data => imessage.send(data))
					.then(res => {
						if (res.code === 0) {
							config.saveConversation(res.data).then(list => {
								let unreadMsg = 0;
								list.forEach((v, i) => {
									unreadMsg += v.unreadMsg;
								});
								ChatList.updateList(list);
							});
						}
					});
				toast.success('添加好友成功');
				config.getRequestAddFriendList()
					.then(list => {
						let index = list.findIndex(item => item._id === id);
						if (index > -1) {
							list.splice(index, 1);
						}
						config.setRequestAddFriendList(list);
					});
				this.setState({
					isFriend: true
				});
				FriendList.addFriend(res.data);
			}
			this.setState({friendLoading: false});
		}).catch(e => {
		})
	};
	
	_addFriend = () => {
		let {similar, verifySimilar} = this.props;
		similar = utils.formatSimilar(similar);
		if (verifySimilar > similar) {
			Alert.alert('对方设置了加他为好友时相似度不能低于' + verifySimilar + '%');
			return;
		}
		// this.setState({friendLoading: true});
		navigate.pushNotNavBar(EditTextArea, {
			title: '好友请求验证',
			submit: this.addFriendVerify,
			text: '我是 ' + config.user.username
		})
	};
	
	addFriendVerify = text => {
		toast.modalLoading()
		setTimeout(_ => {
			toast.modalLoadingHide()
		}, config.timeout);
		imessage.sendRequestAddFriend(this.state.id, text)
			.then(res => {
				toast.modalLoadingHide()
				if (res.code === 0) {
					toast.success('好友请求发送成功');
					navigate.pop();
				}
			})
			.catch(e => {
			toast.modalLoadingHide()
		})
	};
	
	_sendMessage = () => {
		let user = this.props.user;
		config.getConversationWithKey(this.props.user._id).then(map => {
			let list = [];
			Object.keys(map).forEach((key) => {
				list.push(map[key])
			});
			utils.formatData(list)
			let total = list.length;
			list = list.slice(0, config.pageSize);
			let canLoadMore = list.length >= config.pageSize;
			navigate.pushNotNavBar(Chat, {
				...this.props,
				item: {
					name: user.username,
					avatar: [user.avatar],
					toId: user._id,
					chatType: 1
				},
				messages: list,
				total,
				canLoadMore
			})
		});
	}
	
	renderRightButton = (id, isFriend) => {
		if (id === '4gYMBEVlpk') {
			return '发送消息'
		}
		return isFriend ? '发送消息' : this.props.verifyFriend ? '通过验证' : '加为好友'
	};
	
	rightOnPress = (id, isFriend) => {
		if (!config.user._id) {
			navigate.push(PhoneLogin);
			return;
		}
		if (id === '4gYMBEVlpk') {
			return this._sendMessage()
		}
		return isFriend ? this._sendMessage() : this.props.verifyFriend ? this.verifyFriend() : this._addFriend()
	}
	
	_renderButton = () => {
		let {
			id,
			isFriend,
			isFollow,
			followLoading,
			friendLoading,
		} = this.state;
		if (id && id === config.user._id) {
			return <Button
				onPress={_ => navigate.push(UserEdit, {updateUser: this.props.updateUser})}
				icon={{
					name: 'edit',
					size: 20
				}}
				small
				rounded
				outline
				buttonStyle={styles.button}
				textStyle={styles.buttonText}
				title={'编辑资料'}/>
		}
		return (
			<View style={{
				marginTop: 10,
				flexDirection: 'row'
			}}>
				<Button
					onPress={this._onFollow}
					loading={followLoading}
					icon={{
						style: {
							display: followLoading ? 'none' : 'flex'
						},
						name: isFollow ? 'check' : 'add',
						size: 20
					}}
					small
					rounded
					outline
					buttonStyle={styles.button}
					textStyle={styles.buttonText}
					title={isFollow ? '已关注' : '关注Ta'}/>
				<Button
					onPress={_ => this.rightOnPress(id, isFriend)}
					loading={friendLoading}
					icon={{
						style: {
							display: friendLoading ? 'none' : 'flex'
						},
						name: isFriend ? 'send-o' : id === '4gYMBEVlpk' ? 'send-o' : 'person-add',
						size: 20,
						type: isFriend ? 'font-awesome' : id === '4gYMBEVlpk' ? 'font-awesome' : 'material'
					}}
					small
					rounded
					outline
					buttonStyle={styles.button}
					textStyle={styles.buttonText}
					title={this.renderRightButton(id, isFriend)}/>
			</View>
		)
	};
	
	render() {
		let {windowHeight, id, avatar, username, follows, fans, gender, similar, scrollY} = this.props;
		const newWindowHeight = windowHeight - DEFAULT_NAVBAR_HEIGHT;
		
		return (
			<Animated.View
				style={{
					opacity: scrollY.interpolate({
						inputRange: [-windowHeight, 0, windowHeight * DEFAULT_WINDOW_MULTIPLIER + DEFAULT_NAVBAR_HEIGHT],
						outputRange: [1, 1, 0]
					})
				}}
			>
				<View style={[styles.container, {height: newWindowHeight}]}>
					<View>
						<ImageCached
							component={Avatar}
							large
							rounded
							isOnPress
							source={avatar}
							images={[avatar]}
							viewStyle={styles.avatarView}
						/>
						{username &&
						<View style={{paddingVertical: 10}}>
							{
								config.user._id !== id &&
								<View style={{
									flexDirection: 'row',
									justifyContent: 'center',
									alignItems: 'center',
									marginBottom: 10
								}}>
									<Icon
										name={'info-outline'}
										// type={'ionicon'}
										color={'white'}
										size={20}
										underlayColor={'transparent'}
										iconStyle={styleUtil.shadowText}
										onPress={_ => {
											navigate.push(WebPage, {
												url: config.api.imageURI + 'html/about_similar.html'
											})
										}}
									/>
									<Text style={[styleUtil.shadowText, {
										textAlign: 'center',
										fontSize: 18,
										color: '#fff',
										fontWeight: '700',
										paddingLeft: 5
									}]}>
										相似度：{utils.formatSimilar(similar)} %
									</Text>
								</View>
							}
							<View style={{
								flexDirection: 'row',
								justifyContent: 'center',
								alignItems: 'flex-start'
							}}>
								<Text style={[styleUtil.shadowText, {
									textAlign: 'center',
									fontSize: 20,
									color: '#fff',
									paddingBottom: 5,
									paddingRight: 5,
									fontWeight: 'bold'
								}]}>{username}</Text>
								<View style={{
									backgroundColor: gender === 1 ? '#009ad6' : gender === 2 ? '#f391a9' : '#7D26CD',
									width: 20,
									height: 20,
									borderRadius: 11,
									justifyContent: 'center',
									alignItems: 'center'
								}}>
									<Icon
										name={gender === 1 ? 'gender-male' : gender === 2 ? 'gender-female' : 'gender-male-female'}
										type={'material-community'}
										size={16}
										color={'#fff'}
									/>
								</View>
							</View>
							<View style={{
								flexDirection: 'row',
								justifyContent: 'center',
								alignItems: 'center'
							}}>
								<TouchableOpacity
									activeOpacity={0.7}
									onPress={_ => {
										navigate.pushNotNavBar(UserList, {
											title: '关注（' + (follows || 0) + '）',
											uri: config.api.baseURI + config.api.getUserFollowList,
											userId: id
										})
									}}
								>
									<Text style={[styleUtil.shadowText, {
										textAlign: 'center',
										fontSize: 17,
										color: 'rgba(247,247, 250, 1)',
										paddingBottom: 5
									}]}>关注 {follows || 0} | </Text>
								</TouchableOpacity>
								<TouchableOpacity
									activeOpacity={0.7}
									onPress={_ => {
										navigate.pushNotNavBar(UserList, {
											title: '粉丝（' + (fans || 0) + '）',
											uri: config.api.baseURI + config.api.getUserFansList,
											userId: id
										})
									}}
								>
									<Text style={[styleUtil.shadowText, {
										textAlign: 'center',
										fontSize: 17,
										color: 'rgba(247,247, 250, 1)',
										paddingBottom: 5
									}]}>粉丝 {fans || 0}</Text>
								</TouchableOpacity>
							</View>
							{this._renderButton()}
						</View>
						}
					</View>
				</View>
			</Animated.View>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		justifyContent: 'center',
		alignItems: 'center'
	},
	avatarView: {
		justifyContent: 'center',
		alignItems: 'center'
	},
	button: {
		backgroundColor: 'rgba(0,0,0,.3)',
		padding: 6,
	},
	buttonText: {
		fontSize: 17,
		fontWeight: '600'
	}
})