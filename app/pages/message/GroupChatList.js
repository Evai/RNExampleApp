import React from 'react'
import {
	View,
	Text
} from 'react-native'
import NavigatorPage from "../../components/NavigatorPage";
import navigate from "../../screens/navigate";
import request from "../../common/request";
import {Avatar} from "react-native-elements/src/index";
import config from "../../common/config";
import {ListRow} from 'teaset'
import ImageCached from "../../components/ImageCached";
import styleUtil from "../../common/styleUtil";
import Chat from "./Chat";
import ScrollPage from "../../components/ScrollPage";
import ChatList from "./ChatList";
import utils from "../../common/utils";

export default class GroupChatList extends NavigatorPage {
	static defaultProps = {
		...NavigatorPage.navigatorStyle,
		title: '群聊'
	};
	
	constructor(props) {
		super(props);
		Object.assign(this.state, {
			list: [],
			isLoaded:false
		});
	}
	
	componentDidMount() {
		config.getGroupChatList().then(list => {
			if (list.length > 0) {
				this.setState({
					list
				})
			}
			config.loadData(this.fetchData)
		});
	}
	
	fetchData = () => {
		request.post(config.api.baseURI + config.api.getGroupList)
			.then(res => {
				if (res.code === 0) {
					let list = res.data;
					this.setState({
						list: list,
						isLoaded:true
					})
					config.setGroupChatList(res.data);
					config.getChatList().then(arr => {
						list.forEach((v, i) => {
							let index = arr.findIndex(item => item.gid === v.id);
							if (index > -1) {
								arr[index].avatar = v.avatar
							}
						})
						ChatList.updateList(arr)
						config.setChatList(arr)
					})
				}
			}).catch()
	};
	
	renderAvatar = avatar => {
		if (!Array.isArray(avatar)) {
			avatar = [avatar];
		}
		return (
			Array.isArray(avatar) && avatar.length !== 1 ?
				<View style={{
					flexDirection: 'row',
					flexWrap: 'wrap',
					width: 50,
					height: 50,
					marginRight: 12,
					justifyContent: 'space-around',
					alignItems: 'center'
				}}>
					{avatar.map((v, i) => (
						<ImageCached
							key={i}
							component={Avatar}
							containerStyle={{
								width: 23,
								height: 23
							}}
							avatarStyle={{
								width: 23,
								height: 23,
								borderRadius: 12
							}}
							index={i}
							images={avatar}
							rounded
							source={config.defaultAvatar(v)}
						/>
					))}
				</View> :
				<ImageCached
					component={Avatar}
					containerStyle={{marginRight: 12}}
					medium
					rounded
					source={config.defaultAvatar(avatar[0])}
				/>
		)
	};
	
	goChat = item => {
		config.getConversationWithKey(item.id).then(map => {
			let list = [];
			Object.keys(map).forEach((key) => {
				list.push(map[key])
			});
			utils.formatData(list)
			let total = list.length;
			list = list.slice(0, config.pageSize);
			let canLoadMore = list.length >= config.pageSize;
			navigate.pushNotNavBar(Chat, {
				item: {
					name: item.name,
					avatar: item.avatar,
					toId: item.id,
					chatType: 2
				},
				messages: list,
				total,
				canLoadMore
			})
		});
	};
	
	_renderRow = (item, index, arr) => {
		return (
			<ListRow
				key={'list' + index}
				title={item.name}
				onPress={_ => this.goChat(item)}
				icon={this.renderAvatar(item.avatar)}
				topSeparator={index === 0 ? 'full' : 'none'}
				bottomSeparator={arr.length === index + 1 ? 'full' : 'indent'}
				accessory={'none'}
			/>
		)
	};
	
	renderPage() {
		return (
			<ScrollPage style={styleUtil.container}>
				{this.state.list.length === 0 && this.state.isLoaded ? <Text style={{
					textAlign: 'center',
					fontSize: 16,
					paddingVertical: 10
				}}>暂无群聊列表</Text> : this.state.list.map((item, index, arr) => this._renderRow(item, index, arr))}
			</ScrollPage>
		)
	}
}