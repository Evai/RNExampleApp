import React from 'react'
import {
	View,
	Text,
	FlatList,
	StyleSheet,
	TouchableOpacity
} from 'react-native'
import styleUtil from "../../common/styleUtil";
import {SearchBar, Avatar} from 'react-native-elements'
import navigate from "../../screens/navigate";
import {NavigationBar} from 'teaset'
import UserListRow from "../../components/UserListRow";
import ContactList from "./ContactList";

export default class AddFriend extends React.Component {
	static navigatorStyle = {
		title: '添加好友',
		scene: navigate.sceneConfig.FloatFromBottom,
		leftView:<NavigationBar.LinkButton
			title={'关闭'}
			onPress={_ => navigate.pop()}
		/>,
		rightTitle:'手机通讯录',
		rightOnPress: _ => navigate.push(ContactList)
	};
	
	constructor(props) {
		super(props)
		this.page = 1
		this.total = 1
		this.searching = false
		this.state = {
			list: [],
			isLoading: false,
			text: ''
		}
	}
	
	fetchData = () => {
		this.setState({
			isLoading: true
		});
		return Promise.resolve(request.post(config.api.baseURI + config.api.searchUser, {
			username: this.state.text,
			pageNum: this.page,
			pageSize: config.pageSize
		}).catch(e => {
			this.setState({
				isLoading: false
			})
		})).then(res => {
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
		})
	}
	
	_hasMore = () => {
		return this.state.list.length < this.total && this.total > 0
	}
	
	_fetchMoreData = () => {
		if (!this.searching) return
		if (this._hasMore() && !this.state.isLoading) {
			toast.loadingShow()
			this.fetchData().then(_ => toast.loadingHide())
		}
	};
	
	_renderItem = ({item, separators, index}) => {
		return (
			<UserListRow
				key={index}
				item={item}
				list={this.state.list}
				index={index}
			/>
		)
	}
	
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
					onChangeText={val => this.setState({text: val})}
					// onClearText={onClearText && onClearText}
					placeholder='用户名/手机号'
					// onFocus={onFocus && onFocus}
				/>
			</View>
		)
	};
	
	search = () => {
		let val = this.state.text;
		if (!val) {
			return
		}
		this.page = 1;
		this.total = 1;
		this.setState({
			list:[]
		}, _ => {
			this.searching = true
			this._fetchMoreData()
		})
	}
	
	renderSearchButton = () => {
		let text = this.state.text.trim()
		return (
			<TouchableOpacity
				activeOpacity={text.length > 0 ? 0.5 : 1}
				onPress={this.search}
			>
				<Text style={[
					styles.sendText,
					{color: text.length > 0 ? '#0084ff' : styleUtil.disabledColor}
				]}>搜索</Text>
			</TouchableOpacity>
		)
	}
	
	render() {
		return (
			<View style={styleUtil.container}>
				<View style={{
					flexDirection: 'row',
					alignItems: 'center',
					borderBottomWidth: 1,
					borderBottomColor: '#ccc'
				}}>
					{this.renderSearchBar()}
					{this.renderSearchButton()}
				</View>
				<FlatList
					data={this.state.list}
					// extraData={this.state}
					renderItem={this._renderItem}
					initialNumToRender={config.pageSize}
					keyExtractor={(item, index) => index.toString()}
					// ListEmptyComponent={<Loading/>}
					// ListHeaderComponent={this._renderSearch}
					// ListFooterComponent={this._renderFooter}
					onEndReached={this._fetchMoreData}
					onEndReachedThreshold={0.3}
					returnKeyType={'search'}
					keyboardDismissMode={'on-drag'}
				/>
			</View>
		)
	}
}

const styles = StyleSheet.create({
	sendText: {
		fontWeight: '600',
		fontSize: 17,
		backgroundColor: 'transparent',
		marginLeft: 5,
		marginRight: 10,
	},
})