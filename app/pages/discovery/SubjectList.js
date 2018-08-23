'use strict'

import React from 'react'
import {
	StyleSheet,
	Text,
	View,
	Image,
	FlatList
} from 'react-native'
import styleUtil from '../../common/styleUtil'
import NavigatorPage from "../../components/NavigatorPage";
import LoadingMore from "../../components/load/LoadingMore";
import config from "../../common/config";
import request from "../../common/request";
import utils from "../../common/utils";
import toast from "../../common/toast";
import {ListRow, Button} from 'teaset'
import navigate from "../../screens/navigate";
import SubjectDetail from "./SubjectDetail";

export default class SubjectList extends NavigatorPage {
	static defaultProps = {
		...NavigatorPage.navigatorStyle,
		title: '话题推荐',
		navBarHidden: true,
		navigationBarInsets: false,
	};
	
	constructor(props) {
		super(props)
		this.page = 1
		this.total = 1
		Object.assign(this.state, {
			list: [],
			isLoading: false, //上拉加载
			isRefreshing: false, //下拉刷新
		})
	}
	
	componentDidMount() {
		this._fetchDataWithLoading();
	}
	
	componentWillUnmount() {
	
	}
	
	_fetchDataWithLoading = () => {
		this.setState({
			isLoading: true
		});
		setTimeout(() => {
			this.setState({
				isLoading: false
			})
		}, config.timeout);
		config.loadData(_ => {
			request.post(config.api.baseURI + config.api.getSubjectList, {
				pageNum: this.page,
				pageSize: config.pageSize,
				type: this.props.type
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
		// if (this.props.activeIndex === 2) {
		// 	return;
		// }
		this.setState({
			isRefreshing: true
		})
		setTimeout(() => {
			this.setState({
				isRefreshing: false
			})
		}, config.timeout)
		// let list = this.state.list;
		// let lastTime = list.length > 0 ? utils.timeStampToStr(list[0].createdAt) : undefined;
		// console.log('loading')
		setTimeout(() => {
			request.post(config.api.baseURI + config.api.getSubjectList, {
				pageNum: 1,
				pageSize: config.pageSize,
				type: this.props.type,
				// createdAt: lastTime
			}).then(res => {
				if (res.code === 0) {
					// this.total = res.data.total;
					let newList = res.data.list;
					let list = this.state.list;
					this.compareList(list, newList);
					// if (this.props.activeIndex === 1) {
					// 	this.compareList(list, newList);
					// 	return;
					// }
					// if (newList.length === 0) {
					// 	toast.message('没有更多了');
					// 	this.setState({
					// 		isRefreshing: false
					// 	});
					// }
					// else {
					// 	this.setState({
					// 		isRefreshing: false,
					// 		list: newList.concat(list)
					// 	})
					// }
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
	};
	
	_fetchMoreData = () => {
		if (this._hasMore() && !this.state.isLoading) {
			this._fetchDataWithLoading()
		}
	};
	
	_renderFooter = () => {
		return <LoadingMore hasMore={this._hasMore()}/>
	}
	
	_onViewableItemsChanged = ({viewableItems, changed}) => {
		// console.log(viewableItems,changed);
		let list = [...this.state.list];
		viewableItems.forEach((v, i) => {
			if (list[v.index].id === v.item.id) {
				list[v.index].isViewable = v.isViewable;
			}
		});
		this.setState({list})
	};
	
	followSubject = (item, index) => {
		let list = [...this.state.list];
		list[index].isFollow = !item.isFollow;
		this.setState({list});
	};
	
	follow = (item, index) => {
		request.post(config.api.baseURI + config.api.followSubject, {
			subjectId: item.id,
			isFollow: !item.isFollow
		}).then(res => {
			if (res.code === 0) {
				let list = [...this.state.list];
				list[index].isFollow = !item.isFollow;
				this.setState({list});
			}
		}).catch()
	}
	
	_renderRows = ({item, separators, index}) => {
		return (
			<ListRow
				onPress={_ => navigate.push(SubjectDetail, {
					subject: item,
					subjectId: item.id,
					isShowSubject: false,
					followSubject: this.followSubject,
					index
				})}
				accessory={'none'}
				title={
					<View style={{
						justifyContent: 'space-between',
						height: 40
					}}>
						<Text numberOfLines={1} style={{fontWeight: 'bold', fontSize: 16}}>{item.subjectName}</Text>
						<Text numberOfLines={1} style={{color: styleUtil.detailTextColor}}>{utils.numberToTenThousand(item.joins)}人参与
							| {utils.numberToTenThousand(item.dynamics)}条动态</Text>
					</View>
				}
				detail={
					<Button
						type={'secondary'}
						title={item.isFollow ? '已关注' : '+ 关注'}
						onPress={_ => this.follow(item, index)}
						style={{
							backgroundColor: item.isFollow ? styleUtil.disabledColor : styleUtil.themeColor,
							borderColor: item.isFollow ? styleUtil.disabledColor : styleUtil.themeColor
						}}
					/>
				}
			/>
		)
	};
	
	renderPage() {
		return (
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
				onViewableItemsChanged={this._onViewableItemsChanged}
			/>
		)
	}
}


const styles = StyleSheet.create({
	thumbsBox: {
		flex: 1,
		flexDirection: 'row',
		flexWrap: 'wrap',
		padding: 15
	},
	thumbs: {
		width: (styleUtil.window.width - 50) / 3,
		height: (styleUtil.window.width - 50) / 3,
		borderRadius: 8
	},
	title: {
		fontSize: 15,
		textAlign: 'center',
		margin: 8
	}
});