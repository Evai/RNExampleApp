import React from 'react'

import {
	StyleSheet,
	Text,
	View,
	FlatList,
	Image,
	DeviceEventEmitter,
	Alert, Animated,
	InteractionManager
} from 'react-native'
import styleUtil from "../../common/styleUtil";
import DynamicItem from "./DynamicItem";
import LoadingMore from "../../components/load/LoadingMore";
import Separator from "../../components/Separator";
import navigate from "../../screens/navigate";
import DynamicDetail from "./DynamicDetail";
import config from "../../common/config";
import toast from "../../common/toast";
import Profile from "../account/Profile";
import {ActionPopover, Button, PullPicker} from 'teaset'
import FriendDynamicMsgList from "./FriendDynamicMsgList";
import TabNavBar from "../../screens/TabNavBar";
import ImageCached from "../../components/ImageCached";
import request from "../../common/request";
import EditTextArea from "../account/profile/EditTextArea";
import utils from "../../common/utils";
import NavigatorPage from "../../components/NavigatorPage";
import PhoneLogin from "../account/PhoneLogin";
import {EVENTS} from "../../common/IMessage";

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

export default class FriendDynamic extends NavigatorPage {
	static defaultProps = {
		...NavigatorPage.navigatorStyle,
		isRefresh: true
	};
	
	static listenerDynamicMsg = () => {
		DeviceEventEmitter.emit('listenerDynamicMsg')
	};
	
	static fetchDynamicWithRefreshing = () => {
		DeviceEventEmitter.emit('fetchDynamicWithRefreshing')
	};
	
	static removeDynamicWithUserId = (val) => {
		DeviceEventEmitter.emit('removeDynamicWithUserId', val)
	};
	
	constructor(props) {
		super(props);
		this.page = 1;
		this.total = 1;
		Object.assign(this.state, {
			// scrollY: new Animated.Value(0),
			// _id: props.route._id,
			user: props.user || {},
			list: [],
			isLoading: false, //上拉加载
			isRefreshing: false, //下拉刷新
			dynamicMsgList: []
		})
	}
	
	componentDidMount() {
		this._isMounted = true;
		// DeviceEventEmitter.addListener('listenerDynamicMsg', this.listenerDynamicMsg)
		DeviceEventEmitter.addListener('fetchDynamicWithRefreshing', this.fetchDataWithRefreshing)
		DeviceEventEmitter.addListener('removeDynamicWithUserId', v => this.removeDynamicWithUserId(v))
		// this.props.route.fetchUserProfile(this)
		this.setState({isLoading: true})
		InteractionManager.runAfterInteractions(() => {
			this._fetchDataWithLoading();
		})
		// this.getDynamicMsg();
		// this.listenerDynamicMsg();
	}
	
	componentWillUnmount() {
		this._isMounted = false;
		// DeviceEventEmitter.removeAllListeners('listenerDynamicMsg')
		DeviceEventEmitter.removeAllListeners('fetchDynamicWithRefreshing')
		DeviceEventEmitter.removeAllListeners('removeDynamicWithUserId')
	}
	
	removeDynamicWithUserId = userId => {
		if (this._isMounted) {
			let list = [...this.state.list];
			list = list.filter(item => item.user._id !== userId);
			this.setState({list})
		}
	};
	
	getDynamicMsg = () => {
		if (this.props.visibleType === 1) {
			config.getDynamicMsg()
				.then(list => {
					if (list.length > 0) {
						this.setState({
							dynamicMsgList: list
						})
					}
				});
		}
	};
	
	listenerDynamicMsg = () => {
		//获取新的动态消息
		imessage
			.onDynamicMsgReceive(res => {
				if (res.code !== 0) return;
				config.saveDynamicMsg(res.data)
					.then(list => {
						let tabs = this.props.tabs;
						tabs[2].badgeCount = list.length;
						this.props.updateTabs(tabs);
						TabNavBar.updateDynamicBadge(list.length);
						if (this._isMounted && this.props.visibleType === 1) {
							this.setState({
								dynamicMsgList: list
							});
						}
					})
			})
	};
	
	_itemSeparator = () => {
		return (
			<Separator/>
		)
	};
	
	goToDynamicDetail = (item) => {
		navigate.push(DynamicDetail, {
			item: item.dynamicVo
		})
	};
	
	_renderDynamicMsg = () => {
		let dynamicMsgList = this.state.dynamicMsgList;
		if (dynamicMsgList.length === 0) {
			return null;
		}
		return (
			<Button
				// size={'md'}
				style={{
					position: 'absolute',
					top: 5,
					right: 5,
					zIndex: 99,
					width: 130,
					borderColor: styleUtil.themeColor
				}}
				onPress={_ => {
					config.removeDynamicMsg();
					let list = [...dynamicMsgList];
					TabNavBar.updateDynamicBadge(0);
					let tabs = this.props.tabs;
					tabs[2].badgeCount = 0;
					this.props.updateTabs(tabs);
					this.setState({
						dynamicMsgList: []
					});
					navigate.pushNotNavBar(FriendDynamicMsgList, {
						list,
						onPress: this.goToDynamicDetail
					})
				}}
			>
				<View style={{
					flexDirection: 'row',
					justifyContent: 'center',
					alignItems: 'center'
				}}>
					<ImageCached
						source={config.defaultAvatar(dynamicMsgList[0].fromUser.avatar)}
						style={{
							width: 30,
							height: 30,
							marginRight: 5
						}}
					/>
					<Text style={{
						color: '#c30'
					}}>
						{dynamicMsgList.length > 99 ? '99+' : dynamicMsgList.length}条新消息
					</Text>
				</View>
			</Button>
		)
	};
	
	removeDynamic = (item, index, callback) => {
		Alert.alert('确认删除吗？', '', [
			{text: '取消'},
			{
				text: '确定', onPress: _ => {
					request.post(config.api.baseURI + config.api.removeDynamic, {
						dynamicId: item.id
					}).then(res => {
						if (res.code === 0) {
							toast.success('删除成功');
							this.deleteRow(index);
							callback && callback()
						}
					}).catch(e => {
						toast.fail('删除失败')
					})
				}
			},
		])
		
	};
	
	deleteRow = index => {
		let list = [...this.state.list];
		this.total -= 1;
		list.splice(index, 1);
		this.setState({list});
	};
	
	
	onReport = row => {
		let items = config.reportItems();
		PullPicker.show(
			'选择举报类型',
			items,
			undefined,
			(item, index) => {
				if (item === '其他') {
					navigate.pushNotNavBar(EditTextArea, {
						title: '举报内容',
						maxLength: 100,
						text: '',
						submit: text => this.reportUser({
							id: row.id,
							content: text,
							row
						}, _ => navigate.pop())
					})
				} else {
					this.reportUser({
						id: row.id,
						content: item,
						row
					})
				}
			}
		);
	};
	
	reportUser = (item, callback) => {
		request.post(config.api.baseURI + config.api.reportUser, {
			businessId: item.id,
			content: item.content,
			userId: item.row.user._id,
			reportType: 3
		}).then(res => {
			if (res.code === 0) {
				Alert.alert('举报成功，平台将会在24小时之内给出回复')
				imessage.sendSystemNotice({
					noticeId: res.data.id,
					toUserId: item.row.user._id,
					noticeType: EVENTS.SYSTEM_NOTICE
				}).then(res => {
					// console.warn(res)
				})
				callback && callback()
			}
		}).catch()
	};
	
	onShield = (row, index, callback) => {
		if (!config.user._id) {
			navigate.push(PhoneLogin);
			return;
		}
		request.post(config.api.baseURI + config.api.shieldDynamic, {
			dynamicId: row.id,
			isShield: true
		}).then(res => {
			if (res.code === 0) {
				this.deleteRow(index)
				callback && callback();
			}
		}).catch()
	};
	
	_renderRows = ({item, index}) => {
		return (
			<DynamicItem
				{...this.props}
				item={item}
				index={index}
				// separators={separators}
				onPress={(row, setItem) => {
					navigate.push(DynamicDetail, {
						item: row,
						setItem,
						removeDynamic: this.removeDynamic,
						deleteRow: this.deleteRow,
						onShield: this.onShield,
						index: index
					})
				}}
				isViewable={item.isViewable}
				// onLongPress={this._showPopover}
				onReport={_ => this.onReport(item)}
				removeDynamic={_ => this.removeDynamic(item, index)}
				deleteRow={_ => this.deleteRow(index)}
				onShield={_ => this.onShield(item, index)}
				avatarOnPress={_ => navigate.push(Profile, {_id: item.user._id})}
			/>
		)
	};
	
	_fetchDataWithLoading = () => {
		this.setState({
			isLoading: true
		});
		// console.warn('loading')
		setTimeout(() => {
			request.post(config.api.baseURI + config.api.dynamicList, {
				pageNum: this.page,
				pageSize: config.pageSize,
				visibleType: this.props.visibleType,
				userId: this.props.userId,
				dynamicType: this.props.dynamicType,
				subjectId: this.props.subjectId
			}).then(res => {
				let newState = {
					isLoading: false
				};
				if (res.code === 0) {
					this.total = res.data.total;
					this.page++;
					let list = this.state.list;
					newState.list = list.concat(res.data.list)
				}
				this.setState(
					newState,
					() => {
						let list = this.state.list;
						this.props.setLastCreatedAt && this.props.setLastCreatedAt(list)
					}
				);
			}).catch(error => {
				this.setState({
					isLoading: false
				})
				// console.warn(`requestError: ${error}`)
			})
		}, config.loadingTime)
		
	};
	
	fetchDataWithRefreshing = () => {
		if (!this._isMounted) {
			return;
		}
		else if (this.state.isLoading) {
			return;
		}
		this.setState({
			isRefreshing: true
		});
		// let list = this.state.list;
		// let lastTime = list.length > 0 ? utils.timeStampToStr(list[0].createdAt) : undefined;
		// console.log('loading')
		request.post(config.api.baseURI + config.api.dynamicList, {
			pageNum: 1,
			pageSize: config.pageSize,
			// createdAt: lastTime,
			visibleType: this.props.visibleType,
			userId: this.props.userId,
			dynamicType: this.props.dynamicType,
			subjectId: this.props.subjectId
		}).then(res => {
			if (res.code === 0) {
				// this.total = res.data.total;
				let newList = res.data.list;
				let list = this.state.list;
				this.compareList(list, newList);
				// 	if (this.props.activeIndex === 1) {
				// 		this.compareList(list, newList);
				// 		return;
				// 	}
				// 	if (newList.length === 0) {
				// 		this.setState({
				// 			isRefreshing: false
				// 		});
				// 	}
				// 	else {
				// 		this.setState({
				// 			isRefreshing: false,
				// 			list: newList.concat(list)
				// 		})
				// 	}
			} else {
				this.setState({
					isRefreshing: false
				})
			}
		}).catch(error => {
			this.setState({
				isRefreshing: false
			})
			// console.warn(`requestError: ${error}`)
		})
	};
	
	compareList = (oldList, newList) => {
		let obj = {};
		let arr = [];
		newList.forEach((v, i) => {
			if (!obj[v.id]) {
				obj[v.id] = v;
				arr.push(v);
			}
		});
		oldList.forEach((v, i) => {
			if (obj[v.id]) {
				oldList[i] = obj[v.id]
			}
			if (!obj[v.id]) {
				obj[v.id] = 1;
				arr.push(oldList[i]);
			}
		});
		arr.sort(function (a, b) {
			return b.createdAt - a.createdAt
		});
		// console.log(list.length, arr.length);
		if (oldList.length === arr.length) {
			// toast.message('没有更多了');
			this.setState({
				isRefreshing: false
			})
		} else {
			this.setState({
				isRefreshing: false,
				list: arr
			})
		}
	};
	
	_hasMore = () => {
		return this.state.list.length < this.total && this.total > 0
	}
	
	_fetchMoreData = () => {
		if (this._hasMore() && !this.state.isLoading) {
			this._fetchDataWithLoading()
		}
	}
	
	_renderFooter = () => {
		return <LoadingMore hasMore={this._hasMore()}/>
	};
	
	_onViewableItemsChanged = ({viewableItems, changed}) => {
		// console.log(viewableItems,changed);
		let list = [...this.state.list];
		viewableItems.forEach((v, i) => {
			// console.log(list[v.index], v.item)
			if (list[v.index].id === v.item.id) {
				list[v.index].isViewable = v.isViewable;
			}
		});
		this.setState({list})
	};
	
	renderPage() {
		const AnimatedView = this.props.animated ? AnimatedFlatList : FlatList;
		return (
			<View style={styleUtil.container}>
				<AnimatedView
					data={this.state.list}
					// extraData={this.state}
					renderItem={this._renderRows}
					initialNumToRender={config.pageSize}
					keyExtractor={(item, index) => index.toString()}
					ItemSeparatorComponent={this._itemSeparator}
					// ListEmptyComponent={<Loading/>}
					onEndReached={this._fetchMoreData}
					onEndReachedThreshold={0.3}
					onRefresh={this.props.isRefresh ? this.fetchDataWithRefreshing : undefined}
					refreshing={this.props.isRefresh ? this.state.isRefreshing : undefined}
					ListHeaderComponent={this.props.renderHeaderList}
					ListFooterComponent={this._renderFooter}
					onViewableItemsChanged={this._onViewableItemsChanged}
					{...this.props}
				/>
			</View>
		)
	}
}
