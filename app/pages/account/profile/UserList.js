import React from 'react'
import {
	FlatList
} from 'react-native'
import NavigatorPage from "../../../components/NavigatorPage";
import LoadingMore from "../../../components/load/LoadingMore";
import UserListRow from "../../../components/UserListRow";
import SimilarText from "../../../components/SimilarText";

export default class UserList extends NavigatorPage {
	static defaultProps = {
		...NavigatorPage.navigatorStyle
	};
	
	constructor(props) {
		super(props)
		this.page = 1
		this.total = 1
		this.state = {
			list: [],
			isLoading: false
		}
	}
	
	componentDidMount() {
		this._fetchData()
	}
	
	componentWillUnmount() {
	
	}
	
	_fetchData = () => {
		this.setState({
			isLoading: true
		});
		config.loadData(_ => {
			request.post(this.props.uri, {
				pageNum: this.page,
				pageSize: config.pageSize,
				userId: this.props.userId,
				topicId: this.props.topicId,
				dynamicId: this.props.dynamicId,
				subjectId: this.props.subjectId,
				selectedOptions: this.props.selectedOptions,
			}).then(res => {
				if (res.code === 0) {
					this.page++
					this.total = res.data.total
					let list = this.state.list.concat(res.data.list)
					this.setState({
						list
					})
				}
				this.setState({
					isLoading: false
				})
			}).catch(e => {
				this.setState({
					isLoading: false
				})
			})
		})
	};
	
	_renderFooter = () => {
		return <LoadingMore hasMore={this._hasMore()} showText={false}/>
	}
	
	_hasMore = () => {
		return this.state.list.length < this.total && this.total > 0
	}
	
	_fetchMoreData = () => {
		if (this._hasMore() && !this.state.isLoading) {
			this._fetchData()
		}
	};
	
	_renderRows = ({item, separators, index}) => {
		return (
			<UserListRow
				item={item}
				index={index}
				list={this.state.list}
				detail={<SimilarText similar={item.similar}/>}
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
				onEndReached={this._fetchMoreData}
				onEndReachedThreshold={0.3}
				ListFooterComponent={this._renderFooter}
			/>
		)
	}
}