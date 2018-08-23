import React from 'react'
import {
	Text,
	View,
	FlatList,
} from 'react-native'

import {ListRow} from 'teaset'
import styleUtil from "../../common/styleUtil";
import config from "../../common/config";
import LoadingMore from "../../components/load/LoadingMore";
import request from "../../common/request";
import utils from "../../common/utils";

export default class IntegralDetail extends React.Component {
	static navigatorStyle = {
		title: '积分明细'
	};
	
	constructor(props) {
		super(props);
		this.page = 1;
		this.total = 1;
		this.state = {
			list: [],
			isLoading: false, //上拉加载
		}
	}
	
	componentWillMount() {
		this._fetchDataWithLoading()
	}
	
	_fetchDataWithLoading = () => {
		this.setState({
			isLoading: true
		});
		config.loadData(_ => {
			request.post(config.api.baseURI + config.api.getIntegralDetailed, {
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
		
	}
	
	_hasMore = () => {
		return this.state.list.length < this.total && this.total > 0
	};
	
	_fetchMoreData = () => {
		if (this._hasMore() && !this.state.isLoading) {
			this._fetchDataWithLoading()
		}
	};
	
	_renderFooter = () => {
		return <LoadingMore hasMore={this._hasMore()} showText={this.state.list.length === 0}/>
	};
	
	_renderRows = ({item, separators, index}) => {
		return (
			<ListRow
				title={
					<View style={{
						justifyContent: 'space-between',
						width:styleUtil.window.width - 100
					}}>
						<Text
							numberOfLines={2}
							style={{
								fontSize: 16,
								lineHeight:20,
								paddingBottom:5
							}}>{item.content}</Text>
						<Text style={{
							color: styleUtil.detailTextColor,
							fontSize: 12,
						}}>{utils.timeStampToStr(item.createdAt)}</Text>
					</View>
				}
				detail={
					<Text style={{
						color: item.type === 1 ? styleUtil.successColor : 'red',
						fontSize: 20,
					}}>
						{(item.type === 1 ? '+' : '-') + item.integral}
					</Text>
				}
				topSeparator={index === 0 ? 'full' : 'none'}
				bottomSeparator={index + 1 === this.state.list.length ? 'full' : 'indent'}
			/>
		)
	};
	
	render() {
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
				/>
			</View>
		)
	}
}