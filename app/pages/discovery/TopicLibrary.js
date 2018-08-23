import React from 'react'
import {
	View,
	FlatList,
	Text,
	Image,
	TouchableOpacity,
} from 'react-native'
import toast from "../../common/toast";
import NavigatorPage from "../../components/NavigatorPage";
import LoadingMore from "../../components/load/LoadingMore";
import styleUtil from "../../common/styleUtil";
import {Icon} from 'react-native-elements'
import navigate from "../../screens/navigate";
import TopicLibraryDetail from "../account/TopicLibraryDetail";
import ImageCached from "../../components/ImageCached";
import utils from "../../common/utils";
import request from "../../common/request";
import config from "../../common/config";


const THUMB_WIDTH = (styleUtil.window.width - 15) / 2;

export default class TopicLibrary extends NavigatorPage {
	static defaultProps = {
		...NavigatorPage.navigatorStyle,
		title: '题库'
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
	}
	
	componentDidMount() {
		// config.removeUser()
		this._fetchDataWithLoading()
	}
	
	componentWillUnmount() {
	}
	
	_fetchDataWithLoading = () => {
		this.setState({
			isLoading: true
		});
		let uri = config.api.baseURI + config.api.getTopicLibraryAllList;
		config.loadData(_ => {
			request.post(uri, {
				pageNum: this.page,
				pageSize: config.pageSize
			}).then(res => {
				let newState = {
					isLoading: false
				};
				// log(res)
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
	
	_fetchDataWithRefreshing = () => {
		this.setState({
			isRefreshing: true
		})
		let uri = config.api.baseURI + config.api.getTopicLibraryAllList;
		let list = this.state.list;
		// let lastTime = list.length > 0 ? utils.timeStampToStr(list[0].createdAt) : undefined;
		let lastCreatedAt = list.length > 0 ? list[0].createdAt : undefined;
		// console.log('loading')
		setTimeout(() => {
			request.post(uri, {
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
	}
	
	_hasMore = () => {
		return this.state.list.length < this.total && this.total > 0
	}
	
	_fetchMoreData = () => {
		if (this._hasMore() && !this.state.isLoading) {
			this._fetchDataWithLoading()
		}
	};
	
	_renderFooter = () => {
		return <LoadingMore hasMore={this._hasMore()} showText={false}/>
	};
	
	deleteRow = (index) => {
		let list = [...this.state.list];
		list.splice(index, 1);
		this.setState({list})
	}
	
	removeLibrary = (item, index, callback) => {
		request.post(config.api.baseURI + config.api.removeTopicLibrary, {
			libraryId: item.id
		}).then(res => {
			if (res.code === 0) {
				this.deleteRow(index)
				config.removeTopicLibraryList()
				callback && callback()
			}
		})
	}
	
	_renderRows = ({item, separators, index}) => {
		return (
			<TouchableOpacity
				activeOpacity={0.7}
				onPress={_ => navigate.push(TopicLibraryDetail, {
					item,
					isShowHeader: true,
					deleteRow: this.deleteRow,
					removeLibrary: this.removeLibrary,
					index
				})}
				style={{
					marginRight: (index + 1) % 2 === 0 ? 0 : 5,
					marginBottom: 5,
					width: THUMB_WIDTH,
				}}>
				<View style={{
					width: THUMB_WIDTH,
					height: THUMB_WIDTH,
				}}>
					<ImageCached
						source={item.cover ? {uri: item.cover} : require('../../assets/image/library_cover.jpg')}
						style={{
							width: THUMB_WIDTH,
							height: THUMB_WIDTH,
							borderRadius: 3
						}}
					/>
					<View style={{
						position: 'absolute',
						top: 2,
						right: 2,
						// backgroundColor: 'rgba(0,0,0,.5)',
					}}>
						<Text style={{
							color: 'white',
							textShadowOffset: {width: 1, height: 1},
							textShadowRadius: 3,
							textShadowColor: '#000'
						}}>{utils.numberToTenThousand(item.joins)}人参与</Text>
					</View>
					<View style={{
						flexDirection: 'row',
						height: 20,
						alignItems: 'center',
						bottom: 0,
						position: 'absolute',
						backgroundColor: 'rgba(0,0,0,.3)',
						width: THUMB_WIDTH,
						borderBottomLeftRadius: 3,
						borderBottomRightRadius: 3
					}}>
						<Icon
							name={'person'}
							color={'white'}
							size={20}
						/>
						<Text style={{
							color: 'white'
						}}>{item.user.username}</Text>
					</View>
				</View>
				<Text
					numberOfLines={2}
					style={{
						fontSize: 16,
						marginTop: 5,
						marginBottom: 5,
						lineHeight: 18
					}}
				>{item.title}</Text>
			</TouchableOpacity>
		)
	};
	
	renderPage() {
		return (
			<View style={{
				flex: 1,
				padding: 5
			}}>
				<FlatList
					data={this.state.list}
					// extraData={this.state}
					numColumns={2}
					renderItem={this._renderRows}
					initialNumToRender={config.pageSize}
					keyExtractor={(item, index) => 'library' + index}
					// ItemSeparatorComponent={this._itemSeparator}
					// ListEmptyComponent={}
					onEndReached={this._fetchMoreData}
					onEndReachedThreshold={0.3}
					onRefresh={this._fetchDataWithRefreshing}
					refreshing={this.state.isRefreshing}
					ListFooterComponent={this._renderFooter}
					showsVerticalScrollIndicator={false}
				/>
			</View>
		)
	}
}