import React from 'react'
import {
	View,
	Text,
	Image,
	StyleSheet,
	Clipboard,
	TouchableHighlight,
	TouchableOpacity,
	TouchableWithoutFeedback,
} from 'react-native'
import {
	Button,
	Avatar,
	Icon
} from 'react-native-elements'
import styleUtil from "../../common/styleUtil";

import PropTypes from 'prop-types'
import {
	ActionPopover,
	Toast,
	PullPicker
} from 'teaset'
import utils from "../../common/utils";
import Emoticons from "../../components/emoticon/Emoticons";
import Profile from "../account/Profile";
import navigate from "../../screens/navigate";
import ImageCached from "../../components/ImageCached";


export default class CommentItem extends React.PureComponent {
	constructor(props) {
		super(props)
		let {
			like,
			likes
		} = props.item
		this.state = {
			like,
			likes
		}
	}
	
	componentWillUnmount() {
	
	}
	
	_thumbsUpOnPress = () => {
		let item = this.props.item
		let {
			like,
			likes
		} = this.state
		like = !like;
		let uri = this.props.likeCommentUri;
		request.post(uri, {
			commentId: item.id,
			isLike: like
		}).then(res => {
			if (res.code === 0) {
				this.setState({
					like,
					likes: like ? ++likes : --likes
				})
			}
		})
	}
	
	_avatarOnPress = (item) => {
		navigate.push(Profile, {_id: item.user._id})
	}
	
	renderReply = () => {
		let item = this.props.item;
		return (
			<View style={{
				borderColor: '#ddd',
				borderWidth: 1,
				padding: 10,
				flexDirection: 'row',
			}}>
				<Text style={{
					color: styleUtil.linkTextColor
				}}>
					<Text onPress={_ => navigate.push(Profile, {_id: item.replyUser._id})}>@{item.replyUser.username}：</Text>
					<Text
						style={{
							lineHeight: 20,
							color: '#666'
						}}>{item.replyIsDeleted ? '该评论已被删除' : Emoticons.parse(item.replyContent)}</Text>
				</Text>
			</View>
		)
	}
	
	showPopover(item, index) {
		let {replyOnPress, reportOnPress, removeOnPress} = this.props
		const items = [
			{title: '回复', onPress: () => replyOnPress && replyOnPress(item)},
			{
				title: '复制', onPress: () => {
					Clipboard.setString(Emoticons.parse(item.content));
					Toast.success('已复制');
				}
			}
		];
		
		const report = {
			title: '举报', onPress: () => {
				reportOnPress && reportOnPress(item, index)
			}
		}
		
		const remove = {
			title: '删除', onPress: () => {
				removeOnPress && removeOnPress(item, index)
			}
		};
		
		items.push(config.user._id === item.user._id ? remove : report)
		// items.push(report)
		this.refs[item.id].measure((ox, oy, width, height, px, py) => {
			ActionPopover.show({x: px, y: py, width, height}, items);
		});
	}
	
	closePopover() {
		// Overlay.hide(this._popover)
	}
	
	render() {
		const {
			separators,
			onPress,
			item,
			index
		} = this.props
		let {
			like,
			likes
		} = this.state
		return (
			<View>
				<TouchableHighlight
					ref={item.id}
					onPress={this.showPopover.bind(this, item, index)}
					onShowUnderlay={separators.highlight}
					onHideUnderlay={separators.unhighlight}>
					<View style={{
						backgroundColor: 'white',
						flex: 1,
						padding: 15,
					}}>
						<View style={{
							flexDirection: 'row'
						}}>
							<ImageCached
								component={Avatar}
								small
								rounded
								source={config.defaultAvatar(item.user.avatar)}
								isOnPress
								onPress={_ => this._avatarOnPress(item)}
								activeOpacity={0.7}
							/>
							<View style={{marginLeft: 10, flex: 1}}>
								<View style={{flexDirection: 'row', marginBottom: 10}}>
									<View style={{flex: 1}}>
										<View style={styles.chatTopRow}>
											<Text numberOfLines={1}
											      style={styles.username}>{item.user.username}</Text>
										</View>
										<View>
											<Text numberOfLines={1}
											      style={styles.createdAt}>{utils.showTime(item.createdAt)}</Text>
										</View>
									</View>
									<TouchableOpacity
										activeOpacity={1}
										onPress={this._thumbsUpOnPress}
										style={{
											flexDirection: 'row',
											// flex: 1,
											justifyContent: 'flex-end'
										}}
									>
										<Text style={{
											color: like ? '#EE4000' : '#666',
											marginRight: 3
										}}>
											{utils.numberToTenThousand(likes)}
										</Text>
										<Icon
											name='thumbs-o-up'
											type='font-awesome'
											size={16}
											color={like ? '#EE4000' : '#666'}
											containerStyle={{alignSelf: 'flex-start'}}
										/>
									</TouchableOpacity>
								</View>
								<Text style={{lineHeight: 20, marginBottom: 10}}>{Emoticons.parse(item.content)}</Text>
								{item.replyUser && this.renderReply()}
							</View>
						</View>
					</View>
				</TouchableHighlight>
			</View>
		)
	}
}

CommentItem.defaultProps = {
	item: {},
	onPress: _ => {
	},
	separators: {},
};

CommentItem.propTypes = {
	item: PropTypes.object.isRequired,
	onPress: PropTypes.func,
	separators: PropTypes.object,
	index: PropTypes.number
};


const styles = StyleSheet.create({
	chatTopRow: {
		flex: 1,
		// alignSelf:'flex-start',
		justifyContent: 'space-between',
		flexDirection: 'row'
	},
	username: {
		fontSize: 14,
		color: '#666',
		width: 150
	},
	createdAt: {
		color: '#aaa',
		fontSize:12
	},
	image: {
		width: 75,
		height: 75,
		marginRight: 5,
		marginBottom: 5,
		backgroundColor: '#CCC',
		resizeMode: 'cover',
	},
	imageActive: {
		flex: 1,
		resizeMode: 'contain',
	},
	footerText: {
		color: '#fff',
		fontSize: 14,
		textAlign: 'center',
		fontWeight: '700',
		marginBottom: 20
	}
})

