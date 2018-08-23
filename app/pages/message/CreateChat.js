import React from 'react';
import {
	View,
	Text,
	Animated,
	ScrollView,
	StyleSheet
} from 'react-native';
import IndexedListView from '../../components/IndexedListView'
import styleUtil from "../../common/styleUtil";
import {Avatar} from 'react-native-elements'
import SearchFriend from "./SearchFriend";
import {fromJS} from 'immutable'
import SearchView from "./SearchView";
import navigate from "../../screens/navigate";
import {NavigationBar} from 'teaset'
import toast from "../../common/toast";
import ChatList from "./ChatList";
import TabNavBar, {MessageBadge} from "../../screens/TabNavBar";
import Chat from "./Chat";
import config from "../../common/config";
import NavBar from "../../components/NavBar";
import request from "../../common/request";
import utils from "../../common/utils";
import ImageCached from "../../components/ImageCached";


const checkedTextWidth = 90;

export default class CreateChat extends React.Component {
	static navigatorStyle = {
		scene: navigate.sceneConfig.FloatFromBottom,
		navBarHidden: true
	};
	
	constructor(props) {
		super(props);
		let objFriend = {};
		let memberArr = [];
		if (props.members) {
			props.members.forEach((v, i) => {
				if (!objFriend[v._id]) {
					objFriend[v._id] = 1;
				}
			});
			config.friendList.forEach((v, i) => {
				if (objFriend[v._id]) {
					memberArr.push(v)
				}
			})
			if (objFriend[config.user._id]) {
				let index = memberArr.findIndex(item => item._id === config.user._id);
				if (index < 0) {
					memberArr.push(config.user)
				}
			}
		}
		this.state = {
			list: {},
			user: props.user || config.user,
			isSearch: false,
			searchList: [],//搜索到的好友列表
			checkedList: [],//已选择的好友列表
			opacity: new Animated.Value(0),
			members: memberArr, //群成员列表
			memberTotal: props.members ? props.members.length : 0
		};
		this.friendList = fromJS(config.friendList).toJS()
	}
	
	componentDidMount() {
		this._getFriendList()
	}
	
	renderNavBar = () => {
		let disabled = this.state.checkedList.length === 0;
		return (
			<NavBar
				title={'选择好友'}
				renderLeftView={<NavigationBar.LinkButton
					title={'关闭'}
					onPress={_ => navigate.pop()}
				/>}
				rightTitle={'完成'}
				rightStyle={{
					color: disabled ? styleUtil.disabledColor : styleUtil.successColor
				}}
				rightOnPress={_ => {
					if (this.props.submit) {
						return this.props.submit(this.state.checkedList)
					}
					this.rightOnPress()
				}}
				rightDisabled={disabled}
			/>
		)
	};
	
	rightOnPress = () => {
		// console.warn(this.state.checkedList)
		// return;
		let checkedList = this.state.checkedList;
		if (checkedList.length === 1) {
			let row = checkedList[0];
			this.singleChat(row)
		} else {
			let isHas = false;
			let user = {
				_id: config.user._id,
				username: config.user.username,
				avatar: config.user.avatar
			};
			let index;
			checkedList.forEach((v, i) => {
				if (v._id === config.user._id) {
					index = i;
					isHas = true;
					checkedList[i] = user
				}
			});
			if (!isHas) {
				checkedList.unshift(user)
			}
			if (checkedList.length === 2) {
				if (index) {
					checkedList.splice(index, 1);
				}
				this.singleChat(checkedList[0]);
				return;
			}
			let groupName = [];
			let memberIds = [];
			checkedList.forEach((v, i) => {
				groupName.push(v.username);
				memberIds.push(v._id);
			});
			let name = groupName.join('、');
			toast.modalLoading();
			request.post(config.api.baseURI + config.api.createGroup, {
				name,
				memberIds
			}).then(res => {
				toast.modalLoadingHide();
				if (res.code === 0) {
					imessage
						.createGroupNotification(config.user.username + ' 邀请了 ' + name + ' 加入了群聊', res.data.id)
						.then(data => imessage.send(data))
						.then(res => {
							if (res.code === 0) {
								config.saveConversation(res.data).then(list => {
									ChatList.updateList(list);
									navigate.pop();
								})
							}
						})
				}
			}).catch(e => {
				toast.modalLoadingHide();
			})
		}
	};
	
	singleChat = row => {
		row.name = row.username;
		row.toId = row._id;
		config.getUnreadCount(row._id).then(count => {
			config.resetUnreadCount(row._id).then(list => {
				ChatList.updateList(list)
			});
			TabNavBar.updateFriendBadge(MessageBadge - count)
		}).then(_ => {
			config.getConversationWithKey(row._id).then(map => {
				let list = [];
				Object.keys(map).forEach((key) => {
					list.push(map[key])
				});
				utils.formatData(list);
				list = list || [];
				list = list.slice(0, config.pageSize);
				let canLoadMore = list.length >= config.pageSize;
				navigate.pushNotNavBar(Chat, {
					item:row,
					chatType: 1,
					messages: list,
					canLoadMore
				})
			});
		})
	};
	
	_getFriendList = () => {
		// storageUtil.removeItem(config.constant.friends)
		config.getFriendList().then(list => {
			if (list) {
				this.setState({
					list
				})
			}
			config.loadData(this._fetchData)
		})
	};
	
	_fetchData = () => {
		request.post(config.api.baseURI + config.api.getFriendList)
			.then(res => {
				// console.log(res)
				if (res.code === 0) {
					this.setState({
						list: utils.sortByPinYin(res.data)
					}, _ => {
						config.setFriendList(this.state.list)
					});
				}
			})
	}
	
	_updateList = (row) => {
		let list = fromJS(this.state.list).toJS();
		for (let key in list) {
			for (let i = 0; i < list[key].length; i++) {
				if (list[key][i]._id === row._id) {
					list[key][i] = row;
					break
				}
			}
		}
		return list
	};
	
	_updateCheckedList = (checkedList, row) => {
		let list = this._updateList(row);
		this.setState({
			checkedList,
			list
		}, _ => {
			let index = this.friendList.findIndex(item => item._id === row._id)
			this.friendList[index] = row
			Animated.timing(this.state.opacity,
				{
					toValue: checkedList.length > 0 ? 1 : 0,
					duration: 20
				}
			).start();
		})
	}
	
	_renderRow = (item, sectionId, index) => {
		return (
			<SearchFriend
				row={item}
				i={index}
				arr={this.state.list}
				checkedList={this.state.checkedList}
				updateCheckedList={this._updateCheckedList}
				members={this.state.members}
				memberTotal={this.state.memberTotal}
			/>
		)
	}
	
	_onChangeText = (val) => {
		let arr = [];
		if (val) {
			for (let item of this.friendList) {
				if (item.username.indexOf(val.toUpperCase()) >= 0
					|| item.username.indexOf(val.toLowerCase()) >= 0) {
					arr.push(item)
				}
			}
		}
		this.setState({searchList: arr})
	}
	
	_onContentSizeChange = (width, height) => {
		const left = checkedTextWidth + 30
		if (width > styleUtil.window.width - left) {
			this._avatarScroll && this._avatarScroll.scrollTo({
				x: width - styleUtil.window.width + left,
				animated: true
			})
		}
	}
	
	_renderSearch = (isSearch) => {
		return (
			<SearchView
				isSearch={isSearch}
				onChangeText={this._onChangeText}
				onFocus={_ => this.setState({isSearch: true})}
				onCancel={_ => this.setState({isSearch: false})}
				showSelectValue={false}
			/>
		)
	}
	
	render() {
		let {
			isSearch,
			list,
			checkedList,
			searchList
		} = this.state
		return (
			<View style={styleUtil.container}>
				{this.renderNavBar()}
				{this._renderSearch(isSearch)}
				{
					checkedList.length > 0 && <Animated.View style={{
						marginBottom: 5,
						marginLeft: 10,
						marginRight: 15,
						flexDirection: 'row',
						alignItems: 'center',
						opacity: this.state.opacity
					}}>
						<View style={{width: checkedTextWidth}}>
							<Text style={{color: '#666'}}>已选择
								<Text style={{color: '#000'}}>{checkedList.length}</Text>
								人:</Text>
						</View>
						<ScrollView
							ref={ele => this._avatarScroll = ele}
							horizontal={true}
							onContentSizeChange={this._onContentSizeChange}
						>
							{checkedList.map((v, i) => (
								<ImageCached
									key={i}
									component={Avatar}
									rounded
									containerStyle={{marginRight: 5}}
									source={config.defaultAvatar(v.avatar)}
									onPress={_ => {
										let arr = checkedList
										v.checked = false
										arr.splice(i, 1)
										this._updateCheckedList(arr, v)
									}}
								/>
							))}
						</ScrollView>
					</Animated.View>
				}
				<IndexedListView
					visible={!isSearch}
					list={list}
					renderRow={this._renderRow}
					keyboardDismissMode={'on-drag'}
				/>
				{
					isSearch && <ScrollView
						keyboardDismissMode={'on-drag'}
					>
						{
							searchList.map((v, i, arr) => (
								<SearchFriend
									key={i}
									row={v}
									i={i}
									arr={arr}
									checkedList={checkedList}
									updateCheckedList={this._updateCheckedList}
									members={this.state.members}
									memberTotal={this.state.memberTotal}
								/>
							))
						}
					</ScrollView>
				}
			</View>
		)
	}
}

