import React from 'react'
import {
	View,
	Text,
	StyleSheet
} from 'react-native'

import NavigatorPage from "../../components/NavigatorPage";
import SearchView from "../message/SearchView";
import ScrollPage from "../../components/ScrollPage";
import UserListRow from "../../components/UserListRow";
import ChatListRow from "../message/ChatListRow";
import TopicItem from "../home/TopicItem";
import request from "../../common/request";
import toast from "../../common/toast";
import styleUtil from "../../common/styleUtil";
import navigate from "../../screens/navigate";
import config from "../../common/config";
import {MessageBadge} from "../../screens/TabNavBar";
import Chat from "../message/Chat";
import TabNavBar from "../../screens/TabNavBar";
import ChatList from "../message/ChatList";
import utils from "../../common/utils";

export default class Search extends NavigatorPage {
	static defaultProps = {
		...NavigatorPage.navigatorStyle,
		title: '搜一搜'
	};
	
	constructor(props) {
		super(props)
		Object.assign(this.state, {
			list: [],
			isSearch: false,
			text: '',
			chatList: [],
			friendList: [],
			selectValue: props.selectValue || '题目'
		})
		this.chatList = []
		this.friendList = config.friendList
	}
	
	componentWillMount() {
		config.getChatList().then(list => {
			if (list) {
				for (let key in list) {
					this.chatList = this.chatList.concat(list[key])
				}
			}
		})
	}
	
	_onChangeText = (val) => {
		val = val.trim();
		if (!val) {
			this.setState({
				list: []
			});
			return;
		}
		if (this.state.selectValue === '题目') {
			this.setState({
				text: val
			})
		}
		else if (this.state.selectValue === '会话') {
			let arr = [];
			if (this.chatList.length > 0) {
				for (let item of this.chatList) {
					if (item.name.indexOf(val.toUpperCase()) >= 0 ||
						item.name.indexOf(val.toLowerCase()) >= 0) {
						arr.push(item)
					}
				}
			}
			arr.forEach((v, i) => {
				arr[i].isViewable = true;
			});
			this.setState({
				list: arr
			})
		}
		else if (this.state.selectValue === '好友') {
			let arr = [];
			if (this.friendList.length > 0) {
				for (let item of this.friendList) {
					if (item.username.indexOf(val.toUpperCase()) >= 0
						|| item.username.indexOf(val.toLowerCase()) >= 0) {
						arr.push(item)
					}
				}
			}
			arr.forEach((v, i) => {
				arr[i].isViewable = true;
			});
			this.setState({
				list: arr
			})
		}
	};
	
	pushChat = item => {
		config.getUnreadCount(item.toId).then(count => {
			config.resetUnreadCount(item.toId).then(list => {
				ChatList.updateList(list)
			});
			// console.warn(count)
			if (count > 0) {
				let tabs = this.props.tabs;
				tabs[0].badgeCount = MessageBadge - count;
				this.props.updateTabs(tabs)
				TabNavBar.updateMessageBadge(MessageBadge - count)
			}
			config.getConversationWithKey(item.toId).then(map => {
				let list = [];
				Object.keys(map).forEach((key) => {
					list.push(map[key])
				});
				utils.formatData(list);
				let total = list.length;
				list = list.slice(0, config.pageSize);
				let canLoadMore = list.length >= config.pageSize;
				navigate.pushNotNavBar(Chat, {
					item,
					messages: list,
					total,
					canLoadMore,
					navigationBarInsets: false,
					navBarHidden: true
				})
			});
		});
	};
	
	renderContent = () => {
		if (this.state.selectValue === '会话') {
			return this.state.list.map((v, i, arr) => (
				<ChatListRow
					key={i}
					item={v}
					index={i}
					list={arr}
					onPress={_ => this.pushChat(v)}
				/>
			))
		}
		else if (this.state.selectValue === '好友') {
			return this.state.list.map((v, i, arr) => (
				<UserListRow
					key={i}
					item={v}
					index={i}
					list={arr}
				/>
			))
		}
		else if (this.state.selectValue === '题目') {
			return this.state.list.map((v, i) => (
				<TopicItem key={i} item={v} />
			))
		}
		return <View/>
	};
	
	searchTopic = () => {
		if (this.state.selectValue !== '题目') {
			return;
		}
		toast.modalLoading();
		request.post(config.api.baseURI + config.api.searchTopic, {
			pageNum: 1,
			pageSize: 20,
			content: this.state.text
		}).then(res => {
			toast.modalLoadingHide();
			if (res.code === 0) {
				let list = res.data.list;
				list.forEach((v, i) => {
					list[i].isViewable = true;
				});
				this.setState({
					list
				})
			}
		}).catch(e => {
			toast.modalLoadingHide()
		})
	};
	
	onSelectedValue = (item, index) => {
		this.setState({
			selectValue: item,
			list:[]
		})
	};
	
	renderPage() {
		return (
			<View style={styleUtil.container}>
				<SearchView
					isSearch={this.state.isSearch}
					onChangeText={this._onChangeText}
					onFocus={_ => this.setState({isSearch: true})}
					onCancel={_ => this.setState({isSearch: false})}
					selectValue={this.state.selectValue}
					onSelectedValue={this.onSelectedValue}
					onSubmit={this.searchTopic}
				/>
				<ScrollPage>
					{this.renderContent()}
				</ScrollPage>
			</View>
		)
	}
}