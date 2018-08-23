import React from 'react'

import {
	StyleSheet,
	Text,
	View,
	FlatList,
	DeviceEventEmitter
} from 'react-native'
import styleUtil from "../../common/styleUtil";
import LoadingMore from "../../components/load/LoadingMore";
import Separator from "../../components/Separator";
import NavigatorPage from "../../components/NavigatorPage";
import navigate from "../../screens/navigate";
import Profile from "../account/Profile";
import HeaderTitleButton from "../../components/HeaderTitleButton";
import TopicItem from "./TopicItem";
import toast from "../../common/toast";
import config from "../../common/config";
import request from "../../common/request";
import utils from "../../common/utils";

export default class TopicList extends NavigatorPage {
	static defaultProps = {
		...NavigatorPage.navigatorStyle,
		navBarHidden: true
	};
	
	static fetchNewTopicWithRefreshing = () => {
		DeviceEventEmitter.emit('fetchNewTopicWithRefreshing')
	};
	
	static removeTopicWithUserId = (val) => {
		DeviceEventEmitter.emit('removeTopicWithUserId', val)
	};
	
	constructor(props) {
		super(props)
		this.page = 1
		this.total = 1
		Object.assign(this.state, {
			user: props.user,
			list: [],
			isLoading: false, //上拉加载
			isRefreshing: false, //下拉刷新
		})
		this._isMounted = false;
	}
	
	componentDidMount() {
		// config.removeUser()
		this._isMounted = true;
		this._fetchDataWithLoading();
		DeviceEventEmitter.addListener('fetchNewTopicWithRefreshing', this.fetchNewTopicWithRefreshing)
		DeviceEventEmitter.addListener('removeTopicWithUserId', v => this.removeTopicWithUserId(v))
	}
	
	componentWillUnmount() {
		DeviceEventEmitter.removeAllListeners('fetchNewTopicWithRefreshing')
		DeviceEventEmitter.removeAllListeners('removeTopicWithUserId')
	}
	
	removeTopicWithUserId = userId => {
		if (this._isMounted) {
			let list = [...this.state.list];
			list = list.filter(item => item.user._id !== userId);
			this.setState({list})
		} 
	};
	
	_fetchDataWithLoading = () => {
		this.setState({
			isLoading: true
		});
		setTimeout(() => {
			this.setState({
				isLoading: false
			})
		}, config.timeout)
		let uri = this.props.uri;
		config.loadData(_ => {
			request.post(uri, {
				pageNum: this.page,
				pageSize: config.pageSize,
				userId: this.props.userId,
				categoryId: this.props.categoryId,
				type: this.props.getListType
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
				this.setState(newState)
			}).catch(error => {
				this.setState({
					isLoading: false
				})
				// console.warn(`requestError: ${error}`)
			})
		})
		
	}
	
	fetchNewTopicWithRefreshing = () => {
		if (this.props.activeIndex === 0 && this.props.leftHidden) {
			this._fetchDataWithRefreshing()
		}
	};
	
	_fetchDataWithRefreshing = () => {
		this.setState({
			isRefreshing: true
		})
		setTimeout(() => {
			this.setState({
				isRefreshing: false
			})
		}, config.timeout)
		let uri = this.props.uri;
		let list = this.state.list;
		let lastCreatedAt = list.length > 0 ? list[0].createdAt : undefined;
		// console.log('loading')
		setTimeout(() => {
			request.post(uri, {
				pageNum: 1,
				pageSize: config.pageSize,
				userId: this.props.userId,
				categoryId: this.props.categoryId,
				type: this.props.getListType,
				lastCreatedAt
			}).then(res => {
				if (res.code === 0) {
					// this.total = res.data.total;
					let newList = res.data.list;
					if (this.props.activeIndex === 1) {
						this.compareList(list, newList);
						return;
					}
					if (newList.length === 0) {
						toast.message('没有更多了');
						this.setState({
							isRefreshing: false
						});
					}
					else {
						// console.warn(list)
						this.setState({
							isRefreshing: false,
							list: newList.concat(list)
						})
					}
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
		}, config.loadingTime)
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
				arr.push(v);
			}
		});
		// console.log(list.length, arr.length);
		if (oldList.length === arr.length) {
			toast.message('没有更多了');
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
	};
	
	_fetchMoreData = () => {
		if (this._hasMore() && !this.state.isLoading) {
			this._fetchDataWithLoading()
		}
	};
	
	_renderFooter = () => {
		return <LoadingMore hasMore={this._hasMore()}/>
	}
	
	removeTopic = topicId => {
		this.deleteRow(topicId);
		request.post(config.api.baseURI + config.api.removeTopic, {
			topicId
		}).then(res => {
			if (res.code === 0) {
				toast.success("删除成功");
				navigate.pop();
			}
		}).catch()
	};
	
	deleteRow = (topicId) => {
		let list = [...this.state.list];
		let index = list.findIndex(item => item.id === topicId);
		if (index > -1) {
			this.total -= 1;
			list.splice(index, 1);
			this.setState({list})
		}
	};
	
	_renderRows = ({item, separators, index}) => {
		return (
			<TopicItem
				item={item}
				removeTopic={this.removeTopic}
				deleteRow={this.deleteRow}
				profileUser={this.props.profileUser}
				isViewable={item.isViewable}
			/>
		)
	};
	
	_onViewableItemsChanged = ({viewableItems, changed}) => {
		// console.log(viewableItems,changed);
		let list = [...this.state.list];
		viewableItems.forEach((v, i) => {
			if (list[v.index].id === v.item.id) {
				list[v.index].isViewable = v.isViewable;
			}
		});
		changed.forEach((v, i) => {
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
					// ItemSeparatorComponent={this._itemSeparator}
					// ListEmptyComponent={}
					onEndReached={this._fetchMoreData}
					onEndReachedThreshold={0.3}
					onRefresh={this._fetchDataWithRefreshing}
					refreshing={this.state.isRefreshing}
					ListFooterComponent={this._renderFooter}
					showsVerticalScrollIndicator={false}
					onViewableItemsChanged={this._onViewableItemsChanged}
				/>
			</View>
		)
	}
}

// const styles = StyleSheet.create({})