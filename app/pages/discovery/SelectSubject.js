import React from 'react'
import {
	View,
	Text,
	FlatList,
	TouchableOpacity
} from 'react-native'

import NavigatorPage from "../../components/NavigatorPage";
import styleUtil from "../../common/styleUtil";
import config from "../../common/config";
import request from "../../common/request";
import {ListRow} from 'teaset'
import LoadingMore from "../../components/load/LoadingMore";
import {SearchBar} from 'react-native-elements'
import EditName from "../../components/EditName";
import navigate from "../../screens/navigate";

export default class SelectSubject extends React.Component {
	static navigatorStyle = props => ({
		...NavigatorPage.navigatorStyle,
		title: '选择已有话题',
		rightTitle: '新增',
		rightOnPress: _ => navigate.push(EditName, {
			title: '添加新话题',
			text: '',
			submit: props.addSubject,
			maxLength: 30
		})
	});
	
	constructor(props) {
		super(props);
		this.page = 1;
		this.total = 1;
		this.state = {
			isSearch: false,
			isLoading: false,
			list: [],
			text: ''
		}
	}
	
	componentDidMount() {
	
	}
	
	_fetchDataWithLoading = () => {
		this.setState({
			isLoading: true
		});
		// console.log('loading')
		setTimeout(() => {
			request.post(config.api.baseURI + config.api.getSubjectList, {
				pageNum: this.page,
				pageSize: config.pageSize,
				subjectName: this.state.text
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
			})
		}, config.loadingTime)
		
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
		return <LoadingMore hasMore={this._hasMore()} showText={false}/>
	};
	
	_renderRows = ({item, index}) => {
		return (
			<ListRow
				title={item.subjectName}
				topSeparator={'none'}
				bottomSeparator={index + 1 === this.state.list.length ? 'full' : 'indent'}
				onPress={_ => {
					this.props.updateSubject && this.props.updateSubject(item)
					navigate.pop();
				}}
			/>
		)
	};
	
	renderSearchBar = () => {
		return (
			<View style={{flex: 1}}>
				<SearchBar
					lightTheme
					containerStyle={{
						backgroundColor: 'transparent',
						borderBottomWidth: 0
					}}
					inputStyle={{
						backgroundColor: '#fff'
					}}
					onSubmitEditing={this.search}
					icon={{type: 'font-awesome', name: 'search'}}
					onChangeText={text => this.setState({text})}
				/>
			</View>
		)
	};
	
	search = () => {
		let val = this.state.text;
		if (!val) {
			return;
		}
		else if (val === this.oldText) {
			return;
		}
		this.page = 1;
		this.total = 1;
		this.setState({
			list: []
		}, _ => {
			// this.searching = true
			this.oldText = val;
			this._fetchDataWithLoading()
		})
	}
	
	renderSearchButton = () => {
		let text = this.state.text.trim();
		return (
			<TouchableOpacity
				activeOpacity={text.length > 0 ? 0.5 : 1}
				onPress={this.search}
			>
				<Text style={{
					fontWeight: '600',
					fontSize: 17,
					backgroundColor: 'transparent',
					marginLeft: 5,
					marginRight: 10,
					color: text.length > 0 ? '#0084ff' : styleUtil.disabledColor
				}}>搜索</Text>
			</TouchableOpacity>
		)
	}
	
	render() {
		return (
			<View style={styleUtil.container}>
				<View style={{
					flexDirection: 'row',
					alignItems: 'center',
					borderBottomWidth: styleUtil.borderSeparator,
					borderBottomColor: '#ccc'
				}}>
					{this.renderSearchBar()}
					{this.renderSearchButton()}
				</View>
				<FlatList
					data={this.state.list}
					// extraData={this.state}
					renderItem={this._renderRows}
					initialNumToRender={config.pageSize}
					keyExtractor={(item, index) => index.toString()}
					// ItemSeparatorComponent={this._itemSeparator}
					// ListEmptyComponent={<Loading/>}
					onEndReached={this._fetchMoreData}
					onEndReachedThreshold={0.3}
					ListFooterComponent={this._renderFooter}
				/>
			</View>
		)
	}
}