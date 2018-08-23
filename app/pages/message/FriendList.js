'use strict';

import React, {
	Component
} from 'react';
import {
	View,
	Text,
	StyleSheet,
	DeviceEventEmitter,
	TouchableWithoutFeedback
} from 'react-native';
import IndexedListView, {AlphaBetaList} from '../../components/IndexedListView'
import styleUtil from "../../common/styleUtil";
import {
	ListRow,
	Theme,
	Badge
} from 'teaset'
import {
	Avatar,
	Icon,
} from 'react-native-elements'
import navigate from "../../screens/navigate";
import Profile from "../account/Profile";
import ScrollPage from "../../components/ScrollPage";
import RequestAddFriendList from "./RequestAddFriendList";
import utils from "../../common/utils";
import TabNavBar from "../../screens/TabNavBar";
import Search from "../discovery/Search";
import SimilarText from "../../components/SimilarText";
import ImageCached from "../../components/ImageCached";
import GroupChatList from "./GroupChatList";

export default class FriendList extends Component {
	static addFriend = (val) => {
		DeviceEventEmitter.emit('addFriend', val)
	};
	
	static removeFriend = (val) => {
		DeviceEventEmitter.emit('removeFriend', val)
	};
	
	constructor(props) {
		super(props)
		this.state = {
			list: props.friendList || {},
			letters:[]
		}
	}
	
	componentDidMount() {
		this._isMounted = true;
		DeviceEventEmitter.addListener('addFriend', v => this.addFriend(v))
		DeviceEventEmitter.addListener('removeFriend', v => this.removeFriend(v))
		this.getFriendList()
	}
	
	componentWillUnmount() {
		this._isMounted = false;
		DeviceEventEmitter.removeAllListeners('addFriend')
		DeviceEventEmitter.removeAllListeners('removeFriend')
	}
	
	componentWillReceiveProps(nextProps) {
		if (this.props.friendList !== nextProps.friendList) {
			this.setState({
				list: nextProps.friendList,
				letters:Object.keys(nextProps.friendList)
			})
		}
	}
	
	getFriendList = () => {
		// storageUtil.removeItem(config.constant.friends)
		config.getFriendList().then(list => {
			if (list) {
				this.setState({
					list,
					letters:Object.keys(list)
				})
			}
		})
	};
	
	addFriend = user => {
		if (this._isMounted) {
			config.friendList.push(user);
			let list = utils.sortByPinYin(config.friendList)
			config.setFriendList(list)
			this.setState({
				list,
				letters:Object.keys(list)
			})
		}
	};
	
	removeFriend = user => {
		if (this._isMounted) {
			let index = config.friendList.findIndex(item => item._id === user._id);
			if (index > -1) {
				config.friendList.splice(index, 1);
			}
			let list = utils.sortByPinYin(config.friendList)
			config.setFriendList(list);
			this.setState({
				list,
				letters:Object.keys(list)
			})
		}
	};
	
	_renderRow = (item, sectionId, index) => {
		let list = this.state.list;
		return (
			<ListRow
				title={
					<View style={{
						flexDirection: 'row',
						marginLeft: 8,
						alignItems:'center'
					}}>
						<Icon
							name={item.gender === 1 ? 'gender-male' : item.gender === 2 ?  'gender-female' : 'gender-male-female'}
							type={'material-community'}
							size={20}
							color={item.gender === 1 ? '#009ad6' : item.gender === 2 ?  '#f391a9' : '#7D26CD'}
							containerStyle={{marginRight: 5}}
						/>
						<Text
							numberOfLines={1}
							style={{
								width: styleUtil.window.width - 210
							}}>{item.username}</Text>
					</View>
				}
				titleStyle={{marginLeft: 10}}
				detail={<SimilarText similar={item.similar}/>}
				onPress={_ => navigate.push(Profile, {
					_id: item._id
				})}
				icon={<ImageCached
					component={Avatar}
					medium
					rounded
					source={config.defaultAvatar(item.avatar)}
				/>
				}
				topSeparator={
					index === 0 ? 'full' : 'none'
				}
				bottomSeparator={
					Number(index) + 1 === list[sectionId].length ? 'full' : 'indent'
				}
				accessory={'none'}
			/>
		)
	};
	
	_renderFooter = () => {
		return (
			<View style={{
				padding: 15,
				borderTopColor: Theme.rowSeparatorColor,
				borderTopWidth: Theme.rowSeparatorLineWidth,
			}}>
				<Text style={{
					textAlign: 'center',
					fontSize: 16
				}}>共{config.friendList.length}位好友，好友上限150位</Text>
			</View>
		)
	};
	
	_renderSearch = () => {
		return (
			<TouchableWithoutFeedback
				onPress={_ => navigate.pushNotNavBar(Search, {
					selectValue: '好友',
					friendList: config.friendList
				})}
			>
				<View style={{
					backgroundColor: 'white',
					margin: 5,
					padding: 5,
					borderWidth: styleUtil.borderSeparator,
					borderColor: styleUtil.borderColor,
					borderRadius: 3,
					flexDirection: 'row',
					alignItems: 'center',
					justifyContent: 'center'
				}}>
					<Icon
						name={'search'}
						color={'#666'}
					/>
					<Text style={{
						color: '#666',
					}}>搜索</Text>
				</View>
			</TouchableWithoutFeedback>
		)
	};
	
	renderHeader = () => {
		return (
			<View>
				<ListRow
					title={'新的朋友'}
					icon={require('../../assets/image/add_friend.png')}
					detail={
						this.props.tabs[1].badgeCount > 0
							? <Badge count={this.props.tabs[1].badgeCount}/>
							: undefined
					}
					accessory={'none'}
					onPress={_ => {
						let tabs = this.props.tabs;
						tabs[1].badgeCount = 0;
						this.props.updateTabs(tabs);
						TabNavBar.updateFriendBadge(0);
						navigate.push(RequestAddFriendList, {
							tabs: this.props.tabs,
							updateTabs: this.props.updateTabs
						})
					}}
				/>
				<ListRow
					title={'群聊'}
					icon={require('../../assets/image/group_chat.png')}
					// accessory={'none'}
					onPress={_ => {
						navigate.pushNotNavBar(GroupChatList)
					}}
					accessory={'none'}
					bottomSeparator={'none'}
				/>
			</View>
		)
	};
	
	onChangeVisibleRows = (visibleRows, changedRows) => {
		// console.warn(visibleRows)
		let list = this.state.list;
		if (Object.keys(list).length > 0) {
			for (let key in visibleRows) {
				for (let index in visibleRows[key]) {
					list[key][index].isViewable = visibleRows[key][index];
				}
			}
		}
		this.setState({list})
	};
	
	render() {
		return (
			<View style={styles.container}>
				{this._renderSearch()}
				<IndexedListView
					ref={ele => this.indexList = ele}
					list={this.state.list}
					renderRow={this._renderRow}
					renderFooter={this._renderFooter}
					renderHeader={this.renderHeader}
					// onChangeVisibleRows={this.onChangeVisibleRows}
				/>
				<AlphaBetaList
					onLetterPress={letter => {
						this.indexList && this.indexList.scrollToSection(letter)
					}}
					letters={this.state.letters}
				/>
			</View>
		)
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: styleUtil.backgroundColor
	},
	row: {
		paddingVertical: 10,
		flexDirection: 'row',
		alignItems: 'center',
	},
	avatar: {
		height: 50,
		width: 50,
		borderRadius: 25,
		marginHorizontal: 20,
	},
	name: {
		fontSize: 18
	}
});