import React from 'react'
import {
	View,
	Text,
	FlatList, Alert
} from 'react-native'

import {
	Avatar
} from 'react-native-elements'
import styleUtil from "../../common/styleUtil";
import {ListRow, Badge} from 'teaset'
import navigate from "../../screens/navigate";
import Profile from "../account/Profile";
import utils from "../../common/utils";
import AddFriend from "./AddFriend";
import ScrollPage from "../../components/ScrollPage";
import config from "../../common/config";
import ImageCached from "../../components/ImageCached";
import request from "../../common/request";

export default class RequestAddFriendList extends React.PureComponent {
	static navigatorStyle = {
		title: '新的好友',
		rightTitle: '添加好友',
		rightOnPress: _ => navigate.push(AddFriend)
	};
	
	constructor(props) {
		super(props)
		this.state = {
			list: [],
			isLoading: false
		}
	}
	
	componentDidMount() {
		// config.removeRequestAddFriendList()
		this._fetchData()
	}
	
	componentWillUnmount() {
	
	}
	
	_fetchData = () => {
		config.getRequestAddFriendList()
			.then(list => {
				// console.warn(list)
				if (list.length > 0) {
					list.sort((a, b) => {
						return b.createdAt - a.createdAt
					});
					this.setState({list})
				}
			})
	};
	
	removeRow = (item, index) => {
		request.post(config.api.baseURI + config.api.removeRequestAddFriend, {
			userId: item._id
		}).then(res => {
			if (res.code === 0) {
				let list = [...this.state.list];
				list.splice(index, 1);
				this.setState({list});
				config.setRequestAddFriendList(list);
			}
		}).catch()
	};
	
	_renderRows = (item, index) => {
		return (
			<ListRow
				key={index}
				title={
					<View style={{
						marginLeft: 10,
						justifyContent: 'space-between'
					}}>
						<Text>{item.username}</Text>
						<Text style={{
							color: styleUtil.detailTextColor,
							fontSize: 14,
							marginTop: 5
						}}>{item.text}</Text>
					</View>
				}
				titleStyle={{marginLeft: 10}}
				detail={utils.showTime(item.createdAt)}
				onPress={_ => {
					let list = [...this.state.list];
					list[index].unreadMsg = 0;
					this.setState({list});
					config.setRequestAddFriendList(list);
					navigate.push(Profile, {
						_id: item._id,
						verifyFriend: true
					})
				}}
				icon={
					<View>
						<ImageCached
							component={Avatar}
							medium
							rounded
							source={config.defaultAvatar(item.avatar)}
						/>
						{item.unreadMsg > 0 && <Badge
							style={{
								position: 'absolute',
								top: 0,
								right: -5
							}}
							count={1}
						/>}
					</View>
				}
				swipeActions={[
					<ListRow.SwipeActionButton
						title='删除'
						type='danger'
						style={{width: 100}}
						onPress={_ => {
							Alert.alert('确定删除吗？', '', [
								{text: '取消'},
								{
									text: '删除', onPress: _ => {
										this.removeRow(item, index)
									}
								},
							])
						}}/>
				]}
				topSeparator={index === 0 ? 'full' : 'none'}
				bottomSeparator={index + 1 === this.state.list.length ? 'full' : 'indent'}
				accessory={'none'}
			/>
		)
	};
	
	render() {
		return (
			<View style={styleUtil.container}>
				<ScrollPage>
					{this.state.list.map((item, i) => {
						return this._renderRows(item, i)
					})}
				</ScrollPage>
			</View>
		)
	}
}