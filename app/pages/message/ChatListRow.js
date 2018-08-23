import React from 'react'
import {
	View,
	Text,
	StyleSheet
} from 'react-native'

import {
	ListRow,
	ActionPopover,
	Badge
} from 'teaset'
import {
	Avatar
} from 'react-native-elements'
import styleUtil from "../../common/styleUtil";
import utils from "../../common/utils";
import ImageCached from "../../components/ImageCached";
import config from "../../common/config";
import Emoticons from "../../components/emoticon/Emoticons";
import {Icon} from 'react-native-elements'


export default class ChatListRow extends React.Component {
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
				return Emoticons.parse(item.text);
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
							source={config.defaultAvatar(this.props.isViewable || ImageCached.cache.get().cache[v] ? v : undefined)}
						/>
					))}
				</View> :
				<ImageCached
					component={Avatar}
					containerStyle={{marginRight: 12}}
					medium
					rounded
					source={config.defaultAvatar(this.props.isViewable || ImageCached.cache.get().cache[avatar[0]] ? avatar[0] : undefined)}
				/>
		)
	};
	
	_renderDetail = (item) => {
		return (
			<View style={styles.chatBox}>
				<View>
					{this.renderAvatar(item)}
					{item.unreadMsg > 0 && <Badge
						style={{
							position: 'absolute',
							top: 0,
							right: 3
						}}
						count={item.unreadMsg}
					/>}
				</View>
				<View style={{flex: 1}}>
					<View style={styles.chatTopRow}>
						<View style={{flexDirection: 'row', alignItems: 'flex-start'}}>
							{item.mutedUserId === config.user._id &&
							item.isMuted && <Icon
								name={'notifications-off'}
								size={16}
								color={'#666'}
							/>}
							<Text numberOfLines={1} style={styles.chatTextTopLeft}>{item.name}</Text>
						</View>
						<Text style={styles.chatTextTopRight}>
							{utils.showTime(item.createdAt)}
						</Text>
					</View>
					<View>
						<Text numberOfLines={1} style={styles.chatTextBottom}>
							{
								item.msgType !== 'notification' ? item.fromUserId === config.user._id ? '我: ' : item.chatType === 2 ? item.fromUser ? item.fromUser.username + ': ' : '' : '' : ''
							}
							{this.renderText(item)}
						</Text>
					</View>
				</View>
			</View>
		)
	};
	
	render() {
		let {
			item = {},
			index,
			list,
			onPress,
			onLongPress
		} = this.props;
		return (
			<ListRow
				ref={'chat' + item.toId}
				onPress={onPress}
				onLongPress={_ => {
					onLongPress && onLongPress(this.refs['chat' + item.toId], item, index)
				}}
				detail={this._renderDetail(item)}
				topSeparator={index === 0 ? 'indent' : 'none'}
				bottomSeparator={index + 1 === list.length ? 'full' : 'indent'}
				accessory={'none'}
			/>
		)
	}
}

const styles = StyleSheet.create({
	chatBox: {
		flexDirection: 'row',
		backgroundColor: '#fff',
		alignItems: 'center',
		flex: 1,
		// borderBottomColor: 'black',
		// borderBottomWidth: 1,
		width: styleUtil.window.width,
		// marginLeft: 5
	},
	avatar: {
		width: 50,
		height: 50,
		marginRight: 15,
		borderRadius: 5
	},
	chatTopRow: {
		flex: 1,
		// alignSelf:'flex-start',
		justifyContent: 'space-between',
		flexDirection: 'row'
	},
	chatTextTopLeft: {
		fontSize: 16,
		width: styleUtil.window.width - 180,
		fontWeight: '700'
	},
	chatTextTopRight: {
		fontSize: 14,
		color: '#A5A1A3',
		justifyContent: 'flex-end'
	},
	chatTextBottom: {
		color: styleUtil.detailTextColor,
		fontSize: 14
	}
});