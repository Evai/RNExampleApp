'use strict'

import React, {Component} from 'react';
import {
	View,
	StyleSheet,
	DeviceEventEmitter
} from 'react-native';
import styleUtil from "../../common/styleUtil";
import ChatList from './ChatList'
import FriendList from './FriendList'
import NeedLogin from "../../components/NeedLogin";
import ScrollableTabView from 'react-native-scrollable-tab-view'
import FriendDynamic from './FriendDynamic'
import TabBar from '../../components/tabbar/TabBar'
import NavigatorPage from "../../components/NavigatorPage";
import AddButton from "./AddButton";
import NavBar from "../../components/NavBar";
import TabNavBar, {DynamicBadge, FriendBadge, MessageBadge} from "../../screens/TabNavBar";
import utils from "../../common/utils";
import config from "../../common/config";

export default class MessageIndex extends NavigatorPage {
	static defaultProps = {
		...NavigatorPage.navigatorStyle,
		title: '好友',
		showBackButton: false,
		navBarHidden: true,
		navigationBarInsets: false
	};
	
	static listenerFriendAndDynamic = () => {
		DeviceEventEmitter.emit('listenerFriendAndDynamic')
	};
	
	static setFriendDynamicNewCount = (val) => {
		DeviceEventEmitter.emit('setFriendDynamicNewCount', val)
	};
	
	constructor(props) {
		super(props);
		Object.assign(this.state, {
			tabs: [
				{name: '消息', badgeCount: 0},
				{name: '好友', badgeCount: 0},
				{name: '动态', badgeCount: 0, newCount: 0},
			],
			friendList: {},
			activeIndex: 0,
			fromIndex: 0,
		});
		this._isMounted = false
	}
	
	componentDidMount() {
		config.getFriendDynamicNewCount().then(data => {
			if (data && data.count > 0) {
				this.setFriendDynamicNewCount(data.count);
			}
		});
		// config.removeRequestAddFriendList()
		this._isMounted = true;
		DeviceEventEmitter.addListener('listenerFriendAndDynamic', this.listenerFriendAndDynamic);
		DeviceEventEmitter.addListener('setFriendDynamicNewCount', val => this.setFriendDynamicNewCount(val));
		let tabs = this.state.tabs;
		//接收消息
		tabs[0].badgeCount = MessageBadge;
		tabs[1].badgeCount = FriendBadge;
		tabs[2].badgeCount = DynamicBadge;
		this.updateTabs(tabs);
		this.listenerFriendAndDynamic()
	}
	
	componentWillUnmount() {
		this._isMounted = false;
		DeviceEventEmitter.removeAllListeners('listenerFriendAndDynamic')
	}
	
	listenerFriendAndDynamic = () => {
		if (this._isMounted) {
			let tabs = this.state.tabs;
			//获取新的好友
			imessage.onGetNewFriends(res => {
					if (res.code !== 0) return;
					config.saveRequestAddFriendList(res.data)
						.then(count => {
							tabs[1].badgeCount = count;
							this.updateTabs(tabs);
							TabNavBar.updateFriendBadge(count);
						})
				});
			//获取新的动态消息
			// FriendDynamic.listenerDynamicMsg();
		}
	};
	
	setFriendDynamicNewCount = (count) => {
		if (this._isMounted) {
			let tabs = this.state.tabs;
			tabs[2].newCount = count;
			this.updateTabs(tabs)
		}
	};
	
	updateTabs = tabs => {
		this.setState({
			tabs
		});
	};
	
	onChangeTab = ({i, ref, from}) => {
		if (this.state.activeIndex !== i) {
			this.setState({
				activeIndex: i,
				fromIndex:from
			}, _ => {
				if (i === 1) {
					config.getFriendList().then(list => {
						if (list) {
							this.setState({
								friendList: list
							})
						}
						config.loadData(this.fetchFriends, 500)
					})
				}
				else if (i === 2) {
					config.setFriendDynamicNewCount(0);
					this.setFriendDynamicNewCount(0);
					// let tabs = this.state.tabs;
					// tabs[2].badgeCount = 0;
					// this.updateTabs(tabs);
					FriendDynamic.fetchDynamicWithRefreshing();
					// FriendDynamic.listenerDynamicMsg()
					// this.refs['friendDynamic'] && this.refs['friendDynamic'].getDynamicMsg()
				}
			});
		}
	};
	
	fetchFriends = () => {
		request.post(config.api.baseURI + config.api.getFriendList)
			.then(res => {
				// console.log(res)
				if (res.code === 0) {
					let list = utils.sortByPinYin(res.data)
					config.friendList = res.data;
					config.setFriendList(list)
					this.setState({
						friendList: list
					})
				}
			})
	};
	
	renderNavBar = props => {
		return (
			<NavBar
				renderTitleView={<TabBar
					backgroundColor={null}
					textStyle={styles.label}
					activeTextColor={styleUtil.activeTextColor}
					inactiveTextColor={styleUtil.inactiveTextColor}
					underlineStyle={styleUtil.underlineStyle}
					fromIndex={this.state.fromIndex}
					tabContainerWidth={210}
					style={{
						width: 210,
						paddingTop:10,
						borderBottomWidth:0
					}}
					{...props}
					tabs={this.state.tabs}
				/>}
				leftHidden={true}
				renderRightView={<AddButton style={{
					paddingRight: 8,
					width: 50,
					alignItems: 'flex-end'
				}}/>}
			/>
		)
	};
	
	setLastCreatedAt = (list) => {
		if (list.length > 0) {
			config.setFriendDynamicLastTime(list[0].createdAt)
		}
	};
	
	renderPage() {
		const user = this.props.user;
		if (!user.accessToken) {
			return <NeedLogin isLoaded={true} user={user}/>
		}
		return (
			<ScrollableTabView
				tabBarPosition={'top'}
				renderTabBar={this.renderNavBar}
				onChangeTab={this.onChangeTab}
				initialPage={0}
				prerenderingSiblingsNumber={1}
			>
				<ChatList
					ref={v => this.chatList = v}
					{...this.props}
					tabLabel={'消息'}
					backTitle={'消息'}
					tabs={this.state.tabs}
					updateTabs={this.updateTabs}
					currentAppState={this.props.currentAppState}
				/>
				<FriendList
					{...this.props}
					tabLabel={'好友'}
					backTitle={'好友'}
					tabs={this.state.tabs}
					updateTabs={this.updateTabs}
					friendList={this.state.friendList}
				/>
				<FriendDynamic
					{...this.props}
					ref={'friendDynamic'}
					tabLabel={'动态'}
					backTitle={'动态'}
					tabs={this.state.tabs}
					updateTabs={this.updateTabs}
					visibleType={1}
					setLastCreatedAt={this.setLastCreatedAt}
					isShowSubject={true}
				/>
			</ScrollableTabView>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: styleUtil.backgroundColor
	},
	label: {
		fontSize: 14,
		fontWeight: '700',
	},
});