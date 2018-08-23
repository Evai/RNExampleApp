import React from 'react';
import {
	Image,
	TouchableOpacity,
	View,
	StyleSheet,
	Switch,
	Text
} from 'react-native';
import styleUtil from "../../../common/styleUtil";
import {ListRow} from 'teaset'
import {Avatar, Icon} from 'react-native-elements'
import ScrollPage from "../../../components/ScrollPage";
import ChatList from "../ChatList";
import navigate from "../../../screens/navigate";
import Profile from "../../account/Profile";
import CreateChat from "../CreateChat";
import ImageCached from "../../../components/ImageCached";
import request from "../../../common/request";
import config from "../../../common/config";
import toast from "../../../common/toast";


export default class ChatUserInfo extends React.Component {
	static navigatorStyle = {
		title: '聊天详情'
	};
	
	constructor(props) {
		super(props);
		let item = props.item;
		this.state = {
			userInfo: {
				_id: item.toId,
				username: item.name,
				avatar: item.avatar
			},
			isMuted: props.item.isMuted && props.item.mutedUserId === config.user._id
		};
	}
	
	componentDidMount() {
	
	}
	
	_changeState(isMuted) {
		this.setState({
			isMuted
		})
		config.getConversationWithKey(this.props.item.toId).then(map => {
			Object.keys(map).forEach((key) => {
				map[key].isMuted = isMuted;
				map[key].mutedUserId = config.user._id
			});
			config.setConversationWithKey(this.props.item.toId, map);
		});
		
		config.getChatList().then(list => {
			let index = list.findIndex(item => item.toId === this.props.item.toId);
			if (index > -1) {
				list[index].isMuted = isMuted;
				list[index].mutedUserId = config.user._id
				ChatList.updateList(list);
			}
		});
		request.post(config.api.baseURI + config.api.setUserMute, {
			userId: this.props.item.toId,
			isMuted: isMuted
		}).then(res => {
		
		}).catch(e => {
			toast.fail('设置失败')
		})
	}
	
	clearMessage = () => {
		let items = [{
			title: '清空聊天记录', onPress: _ => {
				this.props._Chat.setState({
					messages: [],
					canLoadMore: false
				}, _ => {
					config.removeChatWithUser(this.props.item.toId);
					// config.removeAllChatList();
					this.removeChatListWithUser(this.state.userInfo);
				});
			}
		}];
		config.showAction(items)
	};
	
	removeChatListWithUser = (user) => {
		return config.getChatList().then(chatList => {
			if (chatList && chatList.length > 0) {
				let index = chatList.findIndex(item => item.toId === this.props.item.toId);
				if (index > -1) {
					let data = Object.assign({}, chatList[index]);
					chatList[index] = {};
					chatList[index].toId = this.props.item.toId;
					chatList[index].name = user.username;
					chatList[index].avatar = user.avatar;
					chatList[index].createdAt = data.createdAt;
					chatList[index].unreadMsg = 0;
					chatList[index].chatType = data.chatType;
					config.setChatList(chatList);
					//更新聊天列表list
					ChatList.updateList(chatList);
				}
			}
		})
	}
	
	render() {
		const {userInfo} = this.state;
		return (
			<ScrollPage style={styleUtil.container}>
				<View style={styles.membersWarp}>
					<TouchableOpacity
						onPress={_ => navigate.push(Profile, {
							_id: this.state.userInfo._id
						})}
						style={styles.member}>
						<ImageCached
							component={Avatar}
							source={config.defaultAvatar(Array.isArray(userInfo.avatar) ? userInfo.avatar[0] : userInfo.avatar)}
							medium
							rounded
						/>
						<Text style={{fontSize: 12, marginTop: 5}} numberOfLines={1}>{userInfo.username}</Text>
					</TouchableOpacity>
					{/*<TouchableOpacity*/}
					{/*style={styles.member}*/}
					{/*onPress={_ => navigate.push(CreateChat)}*/}
					{/*>*/}
					{/*<Icon*/}
					{/*containerStyle={{*/}
					{/*borderWidth: 1,*/}
					{/*borderStyle: 'dotted',*/}
					{/*borderColor: '#ccc',*/}
					{/*borderRadius: 3,*/}
					{/*width: 50,*/}
					{/*height: 50*/}
					{/*}}*/}
					{/*name={'ios-add'}*/}
					{/*type={'ionicon'}*/}
					{/*size={50}*/}
					{/*color={'#ccc'}*/}
					{/*/>*/}
					{/*<View style={{height: 12, marginTop: 5}}/>*/}
					{/*</TouchableOpacity>*/}
				</View>
				<View style={{backgroundColor: '#fff', marginTop: 12}}>
					<ListRow
						style={{marginLeft: 5}}
						title={'消息免打扰'}
						detail={<Switch value={this.state.isMuted}
						                onValueChange={v => this._changeState(v)}/>}
						topSeparator={'full'}
						bottomSeparator={'full'}
					/>
				</View>
				<View style={{backgroundColor: '#fff', marginTop: 12}}>
					<ListRow
						style={{marginLeft: 5}}
						title={'清空聊天记录'}
						onPress={this.clearMessage}
						topSeparator={'full'}
						bottomSeparator={'full'}
					/>
				</View>
			</ScrollPage>
		);
	}
}
const styles = StyleSheet.create({
	membersWarp: {
		backgroundColor: "#fff",
		padding: 12,
		flexWrap: 'wrap',
		flexDirection: 'row',
		alignItems: 'center',
		borderBottomWidth: styleUtil.borderSeparator,
		borderColor: styleUtil.borderColor
	},
	member: {
		width: 75,
		height: 75,
		paddingVertical: 5,
		justifyContent: 'center',
		alignItems: 'center',
		marginRight: 15,
		marginBottom: 10
	},
	avatar: {
		width: 45,
		height: 45,
		borderRadius: 5
	}
});