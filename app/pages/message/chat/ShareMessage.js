import React from 'react'
import {
	View,
	Alert,
	SectionList
} from 'react-native'
import NavigatorPage from "../../../components/NavigatorPage";
import {Avatar} from 'react-native-elements'
import navigate from "../../../screens/navigate";
import {NavigationBar, ListRow} from 'teaset'
import config from "../../../common/config";
import ImageCached from "../../../components/ImageCached";
import SectionHeader from "../../../components/SectionHeader";
import toast from "../../../common/toast";

export default class ShareMessage extends NavigatorPage {
	static defaultProps = {
		...NavigatorPage.navigatorStyle,
		scene: navigate.sceneConfig.FloatFromBottom,
		title: '选择一个联系人',
	};
	
	constructor(props) {
		super(props);
		this.page = 0;
		this.total = 1;
		Object.assign(this.state, {
			chatList: [],
			friendList: config.friendList,
			isLoading: false
		});
		this.chatList = [];
	}
	
	componentDidMount() {
		this._getChatList()
	}
	
	_getChatList = () => {
		config.getChatList().then(list => {
			if (list) {
				this.setState({
					chatList: list
				});
				this._generateChatList(list);
			}
		})
	};
	
	_generateChatList = (list) => {
		for (let key in list) {
			this.chatList = this.chatList.concat(list[key])
		}
	}
	
	renderNavigationLeftView() {
		return (
			<NavigationBar.LinkButton
				title={'关闭'}
				onPress={_ => navigate.pop()}
			/>
		)
	}
	
	renderText = item => {
		switch (item.msgType) {
			case 'image':
				return '[图片]';
			case 'voice':
				return '[语音]';
			case 'video':
				return '[视频]';
			case 'location':
				return '[位置]';
			case 'notification':
				return item.notification;
			default:
				return item.text;
		}
	};
	
	renderAvatar = item => {
		let avatar = item.avatar;
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
	
	sendMessage = (item, section) => {
		let {onSend, message} = this.props;
		let text = this.renderText(message);
		Alert.alert(
			'发送给：' + item.name,
			'发送消息：' + text,
			[
				{text: '取消', style: 'cancel'},
				{
					text: '确定', onPress: _ => {
						let data = {
							text: message.text,
							image: message.image,
							location: message.location,
							avatar: message.avatar,
							voice: message.voice,
							video: message.video
						};
						if (section.title === '我的好友') {
							data.toId = item.toId;
							data.chatType = 1;
							data.avatar = item.avatar;
							data.name = item.name;
						} else {
							if (item.chatType === 1) {
								data.toId = item.toId;
								data.chatType = 1;
							} else {
								data.toId = item.toId;
								data.chatType = 2;
							}
						}
						toast.success('已发送');
						navigate.pop();
						onSend && onSend(data);
					}
				}
			]
		)
	};
	
	_renderRows = (obj) => {
		let {item, index, section, separators} = obj;
		item = Object.assign({}, item);
		if (section.title === '我的好友') {
			item.toId = item._id;
			item.name = item.username;
			item.avatar = [item.avatar];
		}
		return (
			<ListRow
				key={'list' + index}
				title={item.name}
				onPress={_ => this.sendMessage(item, section)}
				icon={this.renderAvatar(item)}
				topSeparator={index === 0 ? 'full' : 'none'}
				bottomSeparator={
					Number(index) + 1 === section.data.length ? 'full' : 'indent'
				}
				accessory={'none'}
			/>
		)
	};
	
	_sectionHeader = ({section}) => {
		return (
			<SectionHeader title={section.title}/>
		)
	};
	
	_hasMore = () => {
		return this.state.friendList.length < this.total
	}
	
	_fetchMoreData = () => {
		if (this._hasMore() && !this.state.isLoading) {
			this.getFriendList()
		}
	}
	
	renderPage() {
		return (
			<View style={{flex: 1}}>
				<SectionList
					sections={[
						{data: this.state.chatList, title: '最近联系人'},
						{data: this.state.friendList, title: '我的好友'}
					]}
					// key={this.state.newList}
					// extraData={this.state}
					renderItem={this._renderRows}
					renderSectionHeader={this._sectionHeader}
					initialNumToRender={30}
					keyExtractor={(item, index) => item.toId + index.toString()}
					// ItemSeparatorComponent={this._itemSeparator}
					// onEndReached={this._fetchMoreData}
					onEndReachedThreshold={0.2}
				/>
			</View>
		)
	}
}