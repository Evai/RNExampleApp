import React, {
	Component
} from 'react'

import {
	StyleSheet,
	Text,
	View,
	Alert,
	Animated,
	ScrollView
} from 'react-native'

import styleUtil from "../../common/styleUtil";

import UserAbout from "./UserAbout";
import ProfileBackground from "./profile/ProfileBackground";
import ProfileHeader from "./profile/ProfileHeader";
import {ListRow} from 'teaset'
import List from "../../components/List";
import navigate from "../../screens/navigate";
import TopicList from "../home/TopicList";
import request from "../../common/request";
import toast from "../../common/toast";
import FriendList from "../message/FriendList";
import UserList from "./profile/UserList";
import config from "../../common/config";
import HomeIndex from "../home/HomeIndex";
import UserTopicLibrary from "./UserTopicLibrary";
import EditTextArea from "./profile/EditTextArea";
import TabNavBar from "../../screens/TabNavBar";
import FriendDynamic from "../message/FriendDynamic";
import UserDynamicIndex from "../discovery/UserDynamicIndex";
import PhoneLogin from "./PhoneLogin";

const TAB_LIST = (context) => (
	[
		{
			screen: HomeIndex,
			title: '发布的题目',
			total: context.state.user.submitTitleTotal,
			icon: require('../../assets/image/submit.png'),
			passProps: {
				title: '发布的题目',
				leftHidden: false,
				getListType: 'private'
			}
		},
		{
			screen: TopicList,
			title: '做过的题目',
			total: context.state.user.doTitleTotal,
			icon: require('../../assets/image/write.png'),
			passProps: {
				uri: config.api.baseURI + config.api.getJoinList,
				navBarHidden: false,
				profileUser: context.state.user
			}
		},
		{
			screen: UserDynamicIndex,
			title: '发布的动态',
			total: context.state.user.submitDynamicTotal,
			icon: require('../../assets/image/dynamic.png'),
			passProps: {
				visibleType: undefined,
				tabContainerWidth:styleUtil.window.width,
				tabUnderlineDefaultWidth:100,
				tabs: [
					{name: '发布的动态', type: 'new'},
					{name: '参与的动态', type: 'join'},
				]
			}
		}
	]
);

export default class Profile extends Component {
	static navigatorStyle = {
		navBarHidden: true
	};
	
	constructor(props) {
		super(props);
		this.isSelf = props._id === config.user._id;
		this.state = {
			user: {},
			list: [],
			tabList: [],
			scrollY: new Animated.Value(0),
			isLoaded: false
		}
	}
	
	componentDidMount() {
		config.loadData(this._fetchUserProfile, 350)
	}
	
	componentWillUnmount() {
	
	}
	
	updateUser = (user) => {
		this.setState({
			user
		})
	};
	
	_fetchUserProfile = () => {
		// if (this.props._id === config.user._id || this.props.friendUser) {
		// 	return
		// }
		request.post(config.api.baseURI + config.api.userProfile, {
			userId: this.props._id
		}).then(res => {
			if (res.code === 0) {
				let user = res.data;
				let oldUser = config.user;
				if (user._id === oldUser._id) {
					oldUser = {
						...oldUser,
						...user
					};
					TabNavBar.updateUser(oldUser);
				}
				let tabList = this.state.tabList;
				if (!this.isSelf) {
					tabList.push({
						screen: UserList,
						title: '共同关注',
						total:user.commonFollows,
						icon: require('../../assets/image/common_follow.png'),
						passProps: {
							uri: config.api.baseURI + config.api.getCommonFollowList
						}
					});
					if (user.isFriend) {
						tabList.push({
							screen: UserList,
							title: '共同好友',
							total: user.commonFriends,
							icon: require('../../assets/image/common_friend.png'),
							passProps: {
								uri: config.api.baseURI + config.api.getCommonFriendList
							}
						})
					}
				}
				
				this.setState({
					user,
					tabList,
					isLoaded: true
				})
			}
		})
	}
	
	renderProfileHeader = (user, scrollY) => {
		return (
			<ProfileHeader
				windowHeight={300}
				scrollY={scrollY}
				user={user}
				id={user._id}
				username={user.username}
				navBarTitle={user.username}
				follows={user.follows}
				fans={user.fans}
				avatar={config.defaultAvatar(user.avatar)}
				gender={user.gender}
				similar={user.similar}
				verifySimilar={user.verifySimilar}
				isFollow={user.isFollow}
				isFriend={user.isFriend}
				verifyFriend={this.props.verifyFriend}
				updateUser={this.updateUser}
			/>
		)
	}
	
	renderBackground = (user, scrollY) => {
		return (
			<ProfileBackground
				backTitle={this.props.backTitle}
				windowHeight={300}
				scrollY={scrollY}
				backgroundSource={user.background ? {uri: user.background} : null}
				avatar={user.avatar}
				navBarColor={styleUtil.themeColor}
				navBarTitle={user.username}
				leftIcon={{
					name: 'ios-arrow-back',
					type: 'ionicon',
					size: 35
				}}
				leftIconOnPress={_ => navigate.pop()}
			/>
		)
	};
	
	removeFriend = user => {
		toast.modalLoading()
		request.post(config.api.baseURI + config.api.removeFriend, {
			friendId: user._id
		}).then(res => {
			toast.modalLoadingHide()
			if (res.code === 0) {
				toast.success('删除好友成功');
				FriendList.removeFriend(user);
				user.isFriend = false;
				this.setState({
					user
				})
			}
		}).catch(e => {
			toast.modalLoadingHide()
		})
	};
	
	render() {
		let {user, scrollY} = this.state;
		return (
			<View style={styleUtil.container}>
				{this.renderBackground(user, scrollY)}
				<ScrollView
					onScroll={Animated.event([{
						nativeEvent: {
							contentOffset: {
								y: this.state.scrollY
							}
						}
					}])}
					scrollEventThrottle={16}
				>
					{this.renderProfileHeader(user, scrollY)}
					{this.state.isLoaded && this.renderContent(user)}
				</ScrollView>
			</View>
		)
	}
	
	reportUser = (item, callback) => {
		if (!config.user._id) {
			navigate.push(PhoneLogin);
			return;
		}
		request.post(config.api.baseURI + config.api.reportUser, {
			userId: item.id,
			businessId: 1,
			content: item.content,
			reportType: 1
		}).then(res => {
			if (res.code === 0) {
				Alert.alert('举报成功，平台将会在24小时之内给出回复');
				callback && callback()
			}
		}).catch()
	};
	
	shieldUser = () => {
		if (!config.user._id) {
			navigate.push(PhoneLogin);
			return;
		}
		let user = this.state.user;
		const isShield = !user.isShield;
		TopicList.removeTopicWithUserId(user._id)
		FriendDynamic.removeDynamicWithUserId(user._id)
		request.post(config.api.baseURI + config.api.shieldUser, {
			userId: user._id,
			isShield: isShield
		}).then(res => {
			if (res.code === 0) {
				user.isShield = isShield;
				this.setState({
					user:user
				});
				if (isShield) {
					TopicList.removeTopicWithUserId(user._id)
					FriendDynamic.removeDynamicWithUserId(user._id)
					toast.success('已屏蔽用户');
				} else {
					toast.success('已取消屏蔽');
				}
				
			}
		}).catch()
	}
	
	renderContent = (user) => {
		return (
			<View style={styleUtil.container}>
				<View style={{marginTop: 20}}>
					<ListRow
						title={'个人介绍'}
						onPress={_ => {
							navigate.pushNotNavBar(UserAbout, {
								user,
								title: '个人介绍',
								userId: user._id,
								isProfile: true
							})
						}}
						icon={require('../../assets/image/resume.png')}
						topSeparator={'full'}
						bottomSeparator={'full'}
					/>
				</View>
				<View style={{marginTop: 20}}>
					<ListRow
						title={'个人题库'}
						detail={user.topicLibraryTotal}
						onPress={_ => {
							navigate.pushNotNavBar(UserTopicLibrary, {
								user,
								title: '个人题库',
								userId: user._id,
								isShowDefault: true
							})
						}}
						icon={require('../../assets/image/title_menu.png')}
						topSeparator={'full'}
					/>
					<ListRow
						title={'收藏的题库'}
						detail={user.topicLibraryCollectTotal}
						onPress={_ => {
							navigate.pushNotNavBar(UserTopicLibrary, {
								user,
								title: '收藏的题库',
								userId: user._id,
								isShowDefault: false
							})
						}}
						icon={require('../../assets/image/collect.png')}
						bottomSeparator={'full'}
					/>
				</View>
				<List>
					{
						TAB_LIST(this).map((v, i, arr) => (
							<ListRow
								key={v.title}
								title={v.title}
								detail={v.total}
								icon={v.icon}
								onPress={_ => {
									navigate.pushNotNavBar(v.screen, {
										user,
										title: v.title,
										userId: user._id,
										isProfile: true,
										...v.passProps
									})
								}}
								topSeparator={i === 0 ? 'full' : 'none'}
								bottomSeparator={i + 1 === arr.length ? 'full' : 'indent'}
							/>
						))
					}
				</List>
				<View style={{marginTop: 10}}>
					{
						this.state.tabList.map((v, i, arr) => (
							<ListRow
								key={v.title}
								title={v.title}
								detail={v.total}
								icon={v.icon}
								onPress={() => {
									navigate.pushNotNavBar(v.screen, {
										user,
										title: v.title,
										userId: user._id,
										isProfile: true,
										...v.passProps
									})
								}}
								topSeparator={i === 0 ? 'full' : 'none'}
								bottomSeparator={i + 1 === arr.length ? 'full' : 'indent'}
							/>
						))
					}
				</View>
				{
					!this.isSelf && <List style={{
						backgroundColor: styleUtil.backgroundColor
					}}>
						<ListRow
							title={'举报用户'}
							titleStyle={{
								color: 'red',
								textAlign: 'center'
							}}
							underlayColor={styleUtil.underlayColor}
							onPress={_ => {
								navigate.pushNotNavBar(EditTextArea, {
									title: '举报内容',
									maxLength: 100,
									text: '',
									placeholder: '请填写该用户违反了哪些信息',
									submit: text => this.reportUser({
										id: user._id,
										content: text
									}, _ => navigate.pop())
								})
							}}
							topSeparator={'full'}
							bottomSeparator={'full'}
							accessory={'none'}
						/>
						<View style={{marginTop: 10}}>
							<ListRow
								title={user.isShield ? '取消屏蔽':'屏蔽用户'}
								titleStyle={{
									color: 'red',
									textAlign: 'center'
								}}
								underlayColor={styleUtil.underlayColor}
								onPress={_ => {
									Alert.alert('屏蔽该用户后你将无法看到Ta发布的题目、动态和题库，并且双方无法再进行互动，确认继续吗？', '', [
										{text: '取消'},
										{text: '确定', onPress: this.shieldUser},
									])
								}}
								topSeparator={'full'}
								bottomSeparator={'full'}
								accessory={'none'}
							/>
						</View>
					
					</List>
				}
				<List style={{
					marginBottom: 20,
					backgroundColor: styleUtil.backgroundColor
				}}>
					{
						user.isFriend && !this.isSelf
						&& <ListRow
							title={'删除好友'}
							titleStyle={{
								color: 'red',
								textAlign: 'center'
							}}
							underlayColor={styleUtil.underlayColor}
							onPress={_ => {
								Alert.alert(
									'删除后双方将不再接收到聊天消息，是否继续?',
									'',
									[
										{text: '取消'},
										{text: '确认', onPress: _ => this.removeFriend(user)},
									],
									{cancelable: false}
								)
							}}
							topSeparator={'full'}
							bottomSeparator={'full'}
							accessory={'none'}
						/>
					}
				</List>
			</View>
		)
	}
}
