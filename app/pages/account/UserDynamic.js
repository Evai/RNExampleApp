import React from 'react'

import {
	StyleSheet,
	Text,
	View,
	FlatList,
	Image,
	Alert
} from 'react-native'
import styleUtil from "../../common/styleUtil";
import DynamicItem from "../message/DynamicItem";
import LoadingMore from "../../components/load/LoadingMore";
import Separator from "../../components/Separator";
import NavigatorPage from "../../components/NavigatorPage";
import config from "../../common/config";
import navigate from "../../screens/navigate";
import DynamicDetail from "../message/DynamicDetail";
import request from "../../common/request";
import toast from "../../common/toast";
import {ActionPopover, PullPicker} from "teaset";
import Profile from "./Profile";
import EditTextArea from "./profile/EditTextArea";
import PhoneLogin from "./PhoneLogin";


export default class UserDynamic extends NavigatorPage {
	static defaultProps = {
		...NavigatorPage.navigatorStyle
	};
	
	constructor(props) {
		super(props)
		this.page = 1
		this.total = 1
		Object.assign(this.state, {
			// scrollY: new Animated.Value(0),
			// _id: props.route._id,
			user: props.user || {},
			list: [],
			isLoading: false, //上拉加载
			isRefreshing: false, //下拉刷新
		})
	}
	
	componentDidMount() {
		// this.props.route.fetchUserProfile(this)
		this._fetchDataWithLoading()
	}
	
	componentWillUnmount() {
	
	}
	
	_itemSeparator = () => {
		return (
			<Separator/>
		)
	};
	
	deleteRow = (item, index, callback) => {
		Alert.alert('确认删除吗？', '', [
			{text: '取消'},
			{
				text: '确定', onPress: _ => {
					request.post(config.api.baseURI + config.api.removeDynamic, {
						dynamicId: item.id
					}).then(res => {
						if (res.code === 0) {
							let list = [...this.state.list];
							list.splice(index, 1);
							this.setState({list});
							toast.success('删除成功');
							callback && callback()
						}
					}).catch(e => {
						toast.fail('删除失败')
					})
				}
			},
		])
		
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
				let list = [...this.state.list];
				list.splice(index, 1);
				this.setState({list});
				callback && callback();
			}
		}).catch()
	}
	
	onReport = row => {
		if (!config.user._id) {
			navigate.push(PhoneLogin);
			return;
		}
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
			userId:item.row.user._id,
			reportType: 3
		}).then(res => {
			if (res.code === 0) {
				Alert.alert('举报成功，平台将会在24小时之内给出回复');
				imessage.sendSystemNotice({
					noticeId: res.data.id,
					toUserId: item.row.user._id,
					noticeType: EVENTS.SYSTEM_NOTICE
				}).then(res => {
					// console.warn(res)
				})
				callback && callback();
			}
		}).catch()
	};
	
	_renderRows = ({item, separators, index}) => {
		return (
			<DynamicItem
				{...this.props}
				item={item}
				// separators={separators}
				onPress={(row, setItem) => {
					navigate.push(DynamicDetail, {
						item: row,
						setItem,
						removeDynamic: this.deleteRow,
						onShield: this.onShield,
						index: index
					})
				}}
				isViewable={item.isViewable}
				// onLongPress={this._showPopover}
				onReport={_ => this.onReport(item)}
				removeDynamic={_ => this.deleteRow(item, index)}
				onShield={_ => this.onShield(item, index)}
				avatarOnPress={_ => navigate.push(Profile, {_id: item.user._id})}
			/>
		)
	};
	
	_fetchDataWithLoading = () => {
		this.setState({
			isLoading: true
		})
		// console.log('loading')
		setTimeout(() => {
			request.post(config.api.baseURI + config.api.dynamicList, {
				pageNum: this.page,
				pageSize: config.pageSize,
				userId: this.props.userId
			}).then(res => {
				let newState = {
					isLoading: false
				};
				if (res.code === 0) {
					this.total = res.data.total
					this.page++
					let list = this.state.list
					newState.list = list.concat(res.data.list)
				}
				this.setState(newState)
			}).catch(error => {
				this.setState({
					isLoading: false
				})
				// console.warn(`requestError: ${error}`)
			})
		}, config.loadingTime)
		
	}
	
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
		return (
			<View style={styleUtil.container}>
				<FlatList
					data={this.state.list}
					// extraData={this.state}
					renderItem={this._renderRows}
					initialNumToRender={config.pageSize}
					keyExtractor={(item, index) => index.toString()}
					ItemSeparatorComponent={this._itemSeparator}
					// ListEmptyComponent={this.renderEmpty}
					onEndReached={this._fetchMoreData}
					onEndReachedThreshold={0.3}
					// onRefresh={this._fetchDataWithRefreshing}
					refreshing={this.state.isRefreshing}
					ListFooterComponent={this._renderFooter}
					// showsVerticalScrollIndicator={false}
					onViewableItemsChanged={this._onViewableItemsChanged}
				/>
			</View>
		)
	}
}

const styles = StyleSheet.create({});