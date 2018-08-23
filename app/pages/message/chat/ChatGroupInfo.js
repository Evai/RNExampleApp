import React from 'react';
import {
	Alert,
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
import request from "../../../common/request";
import config from "../../../common/config";
import EditName from "../../../components/EditName";
import toast from "../../../common/toast";
import GroupDescription from "./GroupDescription";
import GroupMembersCheck from "./GroupMembersCheck";
import ImageCached from "../../../components/ImageCached";

const AVATAR_SIZE = (styleUtil.window.width - 20 - 12 * 3) / 4;

export default class ChatGroupInfo extends React.Component {
	static navigatorStyle = {
		title: '聊天详情'
	};
	
	constructor(props) {
		super(props);
		this.item = props.item;
		this.state = {
			groupInfo: {
				members: [],
				master: {},
			},
			isMuted: props.item.isMuted && props.item.mutedUserId === config.user._id,
			isShowMemberName: true,
		};
	}
	
	componentDidMount() {
		config.getChatGroupInfo(this.item.toId).then(data => {
			if (!data) {
				config.loadData(this.fetchData)
			} else {
				this.setState({groupInfo: data}, _ => {
					config.loadData(this.fetchData, 500)
				})
			}
		});
	}
	
	fetchData = () => {
		request.post(config.api.baseURI + config.api.getGroupInfo, {
			gid: this.item.toId
		}).then(res => {
			if (res.code === 0) {
				let groupInfo = res.data;
				let members = groupInfo.members;
				members.forEach((v, i) => {
					if (v.isGroupMaster === 1) {
						groupInfo.master = v;
					}
				});
				this.setState({groupInfo});
				config.setChatGroupInfo(this.item.toId, groupInfo)
			}
		})
	};
	
	_changeState(isMuted) {
		this.setState({
			isMuted: isMuted
		});
		config.getConversationWithKey(this.item.toId).then(map => {
			Object.keys(map).forEach((key) => {
				map[key].isMuted = isMuted;
				map[key].mutedUserId = config.user._id
			});
			config.setConversationWithKey(this.item.toId, map);
		});
		
		config.getChatList().then(list => {
			let index = list.findIndex(item => item.toId === this.item.toId);
			if (index > -1) {
				list[index].isMuted = isMuted;
				list[index].mutedUserId = config.user._id
				ChatList.updateList(list);
			}
		});
		request.post(config.api.baseURI + config.api.setGroupMute, {
			gid: this.item.toId,
			isMuted: isMuted
		}).then(res => {
		
		}).catch(e => {
			toast.fail('设置失败')
		})
	}
	
	setMaster = master => {
		let groupInfo = this.state.groupInfo;
		groupInfo.master = master
		this.setState({groupInfo})
	}
	
	clearMessage = () => {
		let items = [{
			title: '清空聊天记录', onPress: _ => {
				this.props._Chat.setState({
					messages: [],
					canLoadMore: false
				}, _ => {
					config.removeChatWithUser(this.item.toId);
					// config.removeAllChatList();
					this.removeChatListWithUser();
				});
			}
		}];
		config.showAction(items)
	};
	
	removeChatListWithUser = () => {
		const row = this.item;
		return config.getChatList().then(chatList => {
			if (chatList && chatList.length > 0) {
				let index = chatList.findIndex(item => item.toId === row.toId);
				if (index > -1) {
					let data = Object.assign({}, chatList[index]);
					chatList[index] = {};
					chatList[index].toId = this.item.toId;
					chatList[index].name = data.name;
					chatList[index].avatar = data.avatar;
					chatList[index].createdAt = data.createdAt;
					chatList[index].unreadMsg = 0;
					chatList[index].chatType = data.chatType;
					config.setChatList(chatList);
					//更新聊天列表list
					ChatList.updateList(chatList);
				}
			}
		})
	};
	
	submitName = text => {
		if (!text) {
			toast.info('请输入群聊名称');
			return;
		}
		toast.modalLoadingHide()
		request.post(config.api.baseURI + config.api.updateGroupInfo, {
			gid: this.item.toId,
			name: text
		}).then(res => {
			toast.modalLoadingHide()
			if (res.code === 0) {
				navigate.pop();
				toast.success("修改群聊名称成功")
				let groupInfo = this.state.groupInfo;
				groupInfo.name = text
				this.setState({
					groupInfo
				});
				config.setChatGroupInfo(this.item.toId, groupInfo)
				imessage
					.createGroupNotification(config.user.username + '修改群名为' + '“' + text + '”', this.item.toId)
					.then(data => imessage.send(data))
					.then(res => {
						if (res.code === 0) {
							this.props._Chat.setState({title: text}, _ => {
								this.props._Chat.updateMessages(res.data)
							})
						}
					})
			}
		}).catch(e => {
			toast.modalLoadingHide()
		})
	};
	
	submitDescription = text => {
		toast.modalLoadingHide()
		request.post(config.api.baseURI + config.api.updateGroupInfo, {
			gid: this.item.toId,
			description: text
		}).then(res => {
			toast.modalLoadingHide()
			if (res.code === 0) {
				navigate.pop();
				toast.success("修改成功")
				let groupInfo = this.state.groupInfo;
				groupInfo.description = text;
				this.setState({
					groupInfo
				});
				config.setChatGroupInfo(this.item.toId, groupInfo)
				if (text) {
					imessage
						.sendGroupText('@所有人\n' + text, this.item.toId)
						.then(res => {
							if (res.code === 0) {
								this.props._Chat.updateMessages(res.data)
							}
						})
				}
			}
		}).catch(e => {
			toast.modalLoadingHide()
		})
	};
	
	isMaster = () => {
		return config.user._id === (this.state.groupInfo.master ? this.state.groupInfo.master._id : null);
	};
	
	exitGroup = () => {
		toast.modalLoading();
		request.post(config.api.baseURI + config.api.exitGroup, {
			gid: this.item.toId
		}).then(res => {
			toast.modalLoadingHide();
			if (res.code === 0) {
				this.props._Chat.setState({
					messages: [],
					canLoadMore: false
				});
				config.removeChatWithUser(this.item.toId);
				config.removeChatListWithToId(this.item.toId)
					.then(list => {
						ChatList.updateList(list);
						navigate.popToTop()
					})
			}
		}).catch(e => {
			toast.modalLoadingHide()
		})
	};
	
	addMembers = (checkedList) => {
		let groupName = [];
		let memberIds = [];
		checkedList.forEach((v, i) => {
			groupName.push(v.username);
			memberIds.push(v._id);
		});
		let name = groupName.join('、');
		toast.modalLoading();
		request.post(config.api.baseURI + config.api.addGroupMembers, {
			gid: this.item.toId,
			userIds: memberIds
		}).then(res => {
			if (res.code === 0) {
				imessage
					.createGroupNotification(config.user.username + ' 邀请了 ' + name + ' 加入了群聊', this.item.toId)
					.then(data => imessage.send(data))
					.then(res => {
						toast.modalLoadingHide();
						if (res.code === 0) {
							config.saveConversation(res.data).then(list => {
								let groupInfo = this.state.groupInfo;
								groupInfo.members = groupInfo.members.concat(checkedList);
								this.setState({
									groupInfo
								});
								config.setChatGroupInfo(this.item.toId, groupInfo)
								this.props._Chat.updateMessages(res.data)
								ChatList.updateList(list);
								navigate.pop();
							})
						}
					})
			}
		}).catch(e => {
			toast.modalLoadingHide();
		})
	};
	
	removeMembers = checkedList => {
		if (checkedList.length === 0) {
			return
		}
		let memberIds = [];
		let checkObj = {};
		checkedList.forEach((v, i) => {
			checkObj[v._id] = 1;
			memberIds.push(v._id)
		})
		toast.modalLoading();
		request.post(config.api.baseURI + config.api.removeGroupMembers, {
			gid: this.item.toId,
			userIds: memberIds
		}).then(res => {
			toast.modalLoadingHide()
			if (res.code === 0) {
				let groupInfo = this.state.groupInfo;
				for (let i = groupInfo.members.length - 1; i >= 0; i--) {
					//删除选中的群成员
					if (checkObj[groupInfo.members[i]._id]) {
						groupInfo.members.splice(i, 1);
					}
				}
				this.setState({groupInfo});
				config.setChatGroupInfo(this.item.toId, groupInfo)
				navigate.pop()
			}
		}).catch(e => {
			toast.modalLoadingHide()
		})
	};
	
	setGroupMaster = checkedList => {
		if (checkedList.length === 0) {
			return
		}
		let checkedUser = checkedList[0];
		toast.modalLoading();
		request.post(config.api.baseURI + config.api.setGroupMaster, {
			gid: this.item.toId,
			userId: checkedUser._id
		}).then(res => {
			toast.modalLoadingHide();
			if (res.code === 0) {
				this.setMaster(checkedUser)
				navigate.pop()
				toast.success('转让群主成功!')
				imessage
					.createGroupNotification(checkedUser.username + '成为了新群主', this.props.groupInfo.id)
					.then(data => imessage.send(data))
					.then(res => {
						if (res.code === 0) {
							this.props._Chat.updateMessages(res.data)
						}
					})
			}
		}).catch(e => {
			toast.modalLoadingHide()
		})
	}
	
	render() {
		const {groupInfo} = this.state;
		return (
			<ScrollPage style={styleUtil.container}>
				<View style={styles.membersWarp}>
					{groupInfo.members && groupInfo.members.map((v, i) => (
						<TouchableOpacity
							key={i}
							onPress={_ => navigate.push(Profile, {
								_id: v._id
							})}
							style={[styles.member, {marginRight: (i + 1) % 4 === 0 ? 0 : 12}]}>
							<ImageCached
								component={Avatar}
								medium
								rounded
								source={config.defaultAvatar(v.avatar)}
							/>
							<Text style={{fontSize: 12, marginTop: 5}} numberOfLines={1}>{v.username}</Text>
						</TouchableOpacity>
					))}
					<TouchableOpacity
						style={[styles.member, {marginRight: 0}]}
						onPress={_ => navigate.push(CreateChat, {
							members: this.state.groupInfo.members,
							submit: this.addMembers
						})}
					>
						<Icon
							containerStyle={{
								borderWidth: 1,
								borderStyle: 'dotted',
								borderColor: styleUtil.borderColor,
								borderRadius: 3,
								width: 50,
								height: 50
							}}
							name={'ios-add'}
							type={'ionicon'}
							size={50}
							color={'#ccc'}
						/>
						<View style={{height: 12, marginTop: 5}}/>
					</TouchableOpacity>
					{this.isMaster() && <TouchableOpacity
						style={[styles.member, {marginRight: 0}]}
						onPress={_ => navigate.pushNotNavBar(GroupMembersCheck, {
							groupInfo: this.state.groupInfo,
							master: this.state.groupInfo.master,
							submit: this.removeMembers,
							type: 'checked',
							title: '删除群成员'
						})}
					>
						<Icon
							containerStyle={{
								borderWidth: 1,
								borderStyle: 'dotted',
								borderColor: styleUtil.borderColor,
								borderRadius: 3,
								width: 50,
								height: 50
							}}
							name={'ios-remove'}
							type={'ionicon'}
							size={50}
							color={'#ccc'}
						/>
						<View style={{height: 12, marginTop: 5}}/>
					</TouchableOpacity>}
				</View>
				<View style={{backgroundColor: '#fff', marginTop: 12}}>
					<ListRow
						style={{marginLeft: 5}}
						title={'群聊名称'}
						detail={groupInfo.name}
						topSeparator={'full'}
						onPress={_ => {
							if (this.isMaster()) {
								navigate.push(EditName, {
									title: '修改群聊名称',
									submit: this.submitName,
									text: groupInfo.name
								})
							} else {
								Alert.alert('只有群主才能修改群聊名称')
							}
						}}
					/>
					{/*<ListRow*/}
					{/*style={{marginLeft: 5}}*/}
					{/*title={'群聊二维码'}*/}
					{/*detail={<Icon*/}
					{/*name={'qrcode'}*/}
					{/*type={'material-community'}*/}
					{/*color={styleUtil.detailTextColor}*/}
					{/*size={18}*/}
					{/*/>}*/}
					{/*onPress={_ => navigate.push(UserQRCode, {*/}
					{/*uri: config.constant.qrGroupIdUri + this.item.toId,*/}
					{/*text: '扫一扫上面的二维码，加入群聊',*/}
					{/*title: '群聊二维码',*/}
					{/*avatar: this.item.avatar,*/}
					{/*name: this.item.name,*/}
					{/*isGroup: true*/}
					{/*})}*/}
					{/*/>*/}
					<ListRow
						style={{marginLeft: 5}}
						title={'群公告'}
						detail={groupInfo.description ? groupInfo.description : '未设置'}
						onPress={_ => {
							if (!groupInfo.description && !this.isMaster()) {
								return Alert.alert('只有群主才能修改群公告')
							}
							navigate.push(GroupDescription, {
								text: groupInfo.description || '',
								title: '群公告',
								submit: this.submitDescription,
								master: this.state.groupInfo.master,
								updatedAt: this.state.groupInfo.updatedAt
							})
						}}
						bottomSeparator={this.isMaster() ? 'indent' : 'full'}
					/>
					{this.isMaster() && <ListRow
						style={{marginLeft: 5}}
						title={'群主转让'}
						bottomSeparator={'full'}
						onPress={_ => navigate.pushNotNavBar(GroupMembersCheck, {
							...this.props,
							groupInfo: this.state.groupInfo,
							master: this.state.groupInfo.master,
							submit: this.setGroupMaster,
							title: '选择新群主'
						})}
					/>}
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
				<View style={{marginTop: 12}}>
					<ListRow
						title={'退出该群'}
						titleStyle={{
							color: 'red',
							textAlign: 'center'
						}}
						onPress={_ => {
							let msg = '退出后不会通知群聊中其他成员，且不会再接收此群聊消息，确认继续吗?';
							Alert.alert(
								msg,
								'',
								[
									{
										text: '取消', onPress: () => {
										}
									},
									{
										text: '确认', onPress: this.exitGroup
									},
								],
								{cancelable: false}
							)
						}}
						accessory={'none'}
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
		padding: 10,
		flexWrap: 'wrap',
		flexDirection: 'row',
		alignItems: 'center',
		borderBottomWidth: styleUtil.borderSeparator,
		borderColor: styleUtil.borderColor
	},
	member: {
		width: AVATAR_SIZE,
		height: AVATAR_SIZE,
		justifyContent: 'center',
		alignItems: 'center',
		marginBottom: 10
	},
	avatar: {
		width: 45,
		height: 45,
		borderRadius: 5
	}
});