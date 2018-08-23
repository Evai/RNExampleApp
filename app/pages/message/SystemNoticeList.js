import React from 'react'
import {
	Text,
	View,
	FlatList
} from 'react-native'
import config from "../../common/config";
import toast from "../../common/toast";
import request from "../../common/request";
import Separator from "../../components/Separator";
import LoadingMore from "../../components/load/LoadingMore";
import utils from "../../common/utils";
import {ListRow} from 'teaset'
import styleUtil from "../../common/styleUtil";
import navigate from "../../screens/navigate";

export default class SystemNoticeList extends React.Component {
	constructor(props) {
		super(props);
		this.page = 1
		this.total = 1
		this.state = {
			list: [],
			isLoading: false, //上拉加载
			isRefreshing: false, //下拉刷新
		}
	}
	
	componentDidMount() {
		this._fetchDataWithLoading();
	}
	
	_fetchDataWithLoading = () => {
		this.setState({
			isLoading: true
		});
		config.loadData(_ => {
			request.post(this.props.uri, {
				pageNum: this.page,
				pageSize: config.pageSize,
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
		
	};
	
	_fetchDataWithRefreshing = () => {
		this.setState({
			isRefreshing: true
		})
		let list = this.state.list;
		// let lastTime = list.length > 0 ? utils.timeStampToStr(list[0].createdAt) : undefined;
		let lastCreatedAt = list.length > 0 ? list[0].createdAt : undefined;
		// console.log('loading')
		setTimeout(() => {
			request.post(this.props.uri, {
				pageNum: 1,
				pageSize: config.pageSize,
				// createdAt: lastTime,
				lastCreatedAt
			}).then(res => {
				if (res.code === 0) {
					// this.total = res.data.total;
					let newList = res.data.list;
					if (newList.length === 0) {
						toast.message('没有更多了');
						this.setState({
							isRefreshing: false
						});
					}
					else {
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
	};
	
	renderContent = (item) => {
		let title = '';
		const username = item.user.username;
		switch (item.reportType) {
			case 2:
				title = `你有一篇题目被用户“${username}”举报`;
				break;
			case 3:
				title = `你有一篇动态被用户“${username}”举报`;
				break;
			case 4:
				title = `你有一段题目评论被用户“${username}”举报`;
				break;
			case 5:
				title = `你有一段动态评论被用户“${username}”举报`;
				break;
			case 6:
				title = `你有一段题库评论被用户“${username}”举报`;
				break;
			case 7:
				title = `用户“${username}”${item.content}`;
				break;
			case 8:
				title = title = `你有一个题库被用户“${username}”举报`;
				break;
			default:
				title = `用户“${username}”举报了你`;
				break;
		}
		let content = title + `，举报内容为：${item.content}`;
		if (item.reportType === 7) {
			content = title;
		}
		return (
			<Text
				numberOfLines={2}
				style={{
					width: styleUtil.window.width - 120,
					lineHeight: 22
				}}>
				{content}
			</Text>
		)
	};
	
	_renderRows = ({item, separators, index}) => {
		return (
			<ListRow
				title={this.renderContent(item)}
				detail={utils.showTime(item.createdAt)}
				onPress={_ => {
					navigate.push(this.props.component, {
						item
					})
				}}
				topSeparator={'none'}
				bottomSeparator={index + 1 === this.state.list.length ? 'full' : 'indent'}
			/>
		)
	}
	
	render() {
		return (
			<FlatList
				data={this.state.list}
				// extraData={this.state}
				renderItem={this._renderRows}
				initialNumToRender={config.pageSize}
				keyExtractor={(item, index) => index.toString()}
				// ItemSeparatorComponent={_ => <Separator/>}
				// ListEmptyComponent={}
				onEndReached={this._fetchMoreData}
				onEndReachedThreshold={0.3}
				onRefresh={this._fetchDataWithRefreshing}
				refreshing={this.state.isRefreshing}
				ListFooterComponent={this._renderFooter}
				// onViewableItemsChanged={this._onViewableItemsChanged}
			/>
		)
	}
}