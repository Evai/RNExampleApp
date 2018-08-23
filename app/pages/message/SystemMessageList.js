'use strict'

import React from 'react'
import {
	StyleSheet,
	Text,
	View,
	Image,
	FlatList,
	TouchableHighlight,
	TouchableOpacity,
	Clipboard,
	AlertIOS,
	Alert,
	Platform
} from 'react-native'
import styleUtil from '../../common/styleUtil'
import LoadingMore from "../../components/load/LoadingMore";
import config from "../../common/config";
import request from "../../common/request";
import utils from "../../common/utils";
import toast from "../../common/toast";
import {ActionPopover, PullPicker} from 'teaset'
import navigate from "../../screens/navigate";
import {Avatar} from "react-native-elements/src/index";
import ImageCached from "../../components/ImageCached";
import Profile from "../account/Profile";
import Separator from "../../components/Separator";
import Emoticons from "../../components/emoticon/Emoticons";
import TopicDetail from "../home/TopicDetail";
import EditTextArea from "../account/profile/EditTextArea";
import prompt from 'react-native-prompt-android';
import {EVENTS} from "../../common/IMessage";

export default class SystemMessageList extends React.Component {
	static navigatorStyle = {
		navBarHidden: true,
		navigationBarInsets: false,
		autoKeyboardInsets: false,
		// title: '话题推荐'
	};
	
	constructor(props) {
		super(props)
		this.page = 1
		this.total = 1
		this.state = {
			list: [],
			showInput: false,
			placeholder: '发表评论',
			replyCommentItem: {},
			isLoading: false, //上拉加载
			isRefreshing: false, //下拉刷新
		}
	}
	
	componentDidMount() {
		this._fetchDataWithLoading();
	}
	
	componentWillUnmount() {
	
	}
	
	_fetchDataWithLoading = () => {
		this.setState({
			isLoading: true
		});
		config.loadData(_ => {
			request.post(this.props.uri, {
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
		
	};
	
	_fetchDataWithRefreshing = () => {
		this.setState({
			isRefreshing: true
		})
		setTimeout(() => {
			this.setState({
				isRefreshing: false
			})
		}, config.timeout)
		let list = this.state.list;
		// let lastTime = list.length > 0 ? utils.timeStampToStr(list[0].createdAt) : undefined;
		let lastCreatedAt = list.length > 0 ? list[0].createdAt : undefined;
		// console.log('loading')
		setTimeout(() => {
			request.post(this.props.uri, {
				pageNum: 1,
				pageSize: config.pageSize,
				type: this.props.getListType,
				// createdAt: lastTime,
				lastCreatedAt
			}).then(res => {
				if (res.code === 0) {
					// this.total = res.data.total;
					let newList = res.data.list;
					// let list = this.state.list;
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
	};
	
	_hasMore = () => {
		return this.state.list.length < this.total && this.total > 0
	};
	
	_fetchMoreData = () => {
		if (this._hasMore() && !this.state.isLoading) {
			this._fetchDataWithLoading()
		}
	};
	
	_renderFooter = () => {
		return <LoadingMore hasMore={this._hasMore()}/>
	}
	
	_onViewableItemsChanged = ({viewableItems, changed}) => {
		// console.log(viewableItems,changed);
		let list = [...this.state.list];
		viewableItems.forEach((v, i) => {
			if (list[v.index].id === v.item.id) {
				list[v.index].isViewable = v.isViewable;
			}
		});
		this.setState({list})
	};
	
	_replyOnPress = (item) => {
		// this._textInputBar.textInputFocus()
		if (Platform.OS === 'ios') {
			AlertIOS.prompt(`回复 ${item.user.username}：`, null, text => {
				this._onSend(text)
			});
			
		} else {
			prompt(
				`回复 ${item.user.username}：`,
				null,
				[
					{text: '取消', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
					{text: '确定', onPress: text => this._onSend(text)},
				],
				{
					cancelable: false,
				}
			);
		}
		this.item = item;
		this.setState({
			placeholder: `回复 ${item.user.username}：`,
			replyCommentItem: item,
			showInput: true
		})
	};
	
	reportUser = (item, callback) => {
		let reportType;
		if (this.props.activeIndex === 0) {
			reportType = 4;
		}
		else if (this.props.activeIndex === 1) {
			reportType = 5;
		}
		else if (this.props.activeIndex === 2) {
			reportType = 6;
		}
		request.post(config.api.baseURI + config.api.reportUser, {
			businessId: item.id,
			content: item.content,
			userId:item.row.user._id,
			reportType: reportType
		}).then(res => {
			if (res.code === 0) {
				Alert.alert('举报成功，平台将会在24小时之内给出回复')
				imessage.sendSystemNotice({
					noticeId: res.data.id,
					toUserId: item.row.user._id,
					noticeType: EVENTS.SYSTEM_NOTICE
				}).then(res => {
					// console.warn(res)
				})
				callback && callback()
			}
		}).catch()
	};
	
	_reportOnPress = (row, index) => {
		let items = config.reportItems();
		const id = row.commentId;
		PullPicker.show(
			'选择举报类型',
			items,
			undefined,
			(item, index) => {
				if (item === '其他') {
					navigate.pushNotNavBar(EditTextArea, {
						title: '举报内容',
						maxLength: 100,
						text: '',
						submit: text => this.reportUser({
							id: id,
							content: text,
							row
						}, _ => navigate.pop())
					})
				} else {
					this.reportUser({
						id: id,
						content: item,
						row
					})
				}
			}
		);
	};
	
	_removeOnPress = (item, index) => {
		request.post(this.props.removeCommentUri, {
			commentId: item.commentId,
			topicId: item.topicId,
			dynamicId: item.dynamicId,
			libraryId: item.libraryId
		}).then(res => {
			if (res.code === 0) {
				toast.success("删除评论成功")
				let list = this.state.list
				list.splice(index, 1);
				this.setState({list});
			}
		}).catch(e => {
			toast.fail("删除评论失败")
		})
	};
	
	_renderRows = ({item, separators, index}) => {
		return (
			<MessageItem
				component={this.props.component}
				item={item}
				index={index}
				replyOnPress={this._replyOnPress}
				reportOnPress={this._reportOnPress}
				removeOnPress={this._removeOnPress}
				removeDynamic={this.removeDynamic}
			/>
		)
	};
	
	
	_onSend = (text) => {
		// console.log(text)
		if (!text || !text.trim()) {
			return;
		}
		if (!this.state.replyCommentItem.commentId) {
			toast.fail('请选择要回复的用户');
			return;
		}
		let data = {
			topicId: this.item.topicId,
			libraryId: this.item.libraryId,
			dynamicId: this.item.dynamicId,
			content: Emoticons.stringify(text),
			replyCommentId: this.state.replyCommentItem.commentId,
			toUserId: this.state.replyCommentItem.user._id,
		};
		// this._textInputBar.onTogglePress(false, false)
		toast.modalLoading()
		request.post(this.props.addCommentUri, data).then(res => {
			toast.modalLoadingHide()
			if (res.code === 0) {
				// const data = {
				// 	...res.data,
				// 	commentId: res.data.id,
				// 	title: this.item.title
				// };
				// this._appendComment(data);
				toast.success('评论成功');
				let noticeType;
				if (this.props.activeIndex === 0) {
					noticeType = EVENTS.TOPIC_NOTICE;
				}
				else if (this.props.activeIndex === 1) {
					noticeType = EVENTS.DYNAMIC_NOTICE;
				}
				else if (this.props.activeIndex === 2) {
					noticeType = EVENTS.TOPIC_LIBRARY_NOTICE;
				}
				if (noticeType) {
					imessage.sendSystemNotice({
						noticeId: res.data.id,
						toUserId: data.toUserId,
						noticeType: noticeType
					}).then(res => {
						// console.warn(res)
					})
				}
			}
		}).catch(e => {
			console.warn(e)
			toast.modalLoadingHide()
		})
	}
	
	_appendComment = (list) => {
		if (!Array.isArray(list)) {
			list = [list]
		}
		this.setState(preState => {
			return {
				list: list.concat(preState.list)
			}
		})
	};
	
	deleteRow = index => {
		let list = [...this.state.list];
		list.splice(index, 1);
		if (list.length === 0) {
			this.total = 0;
		}
		this.setState({list});
	};
	
	removeDynamic = (item, index, callback) => {
		Alert.alert('确认删除吗？', '', [
			{text: '取消'},
			{
				text: '确定', onPress: _ => {
					request.post(config.api.baseURI + config.api.removeDynamic, {
						dynamicId: item.id
					}).then(res => {
						if (res.code === 0) {
							toast.success('删除成功');
							this.deleteRow(index);
							callback && callback()
						}
					}).catch(e => {
						toast.fail('删除失败')
					})
				}
			},
		])
		
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
					ItemSeparatorComponent={_ => <Separator/>}
					// ListEmptyComponent={}
					onEndReached={this._fetchMoreData}
					onEndReachedThreshold={0.3}
					onRefresh={this._fetchDataWithRefreshing}
					refreshing={this.state.isRefreshing}
					ListFooterComponent={this._renderFooter}
					onViewableItemsChanged={this._onViewableItemsChanged}
				/>
			</View>
		)
	}
}


class MessageItem extends React.Component {
	
	showPopover = (item, index) => {
		let {replyOnPress, reportOnPress, removeOnPress} = this.props
		const items = [
			{title: '回复', onPress: () => replyOnPress && replyOnPress(item)},
			{
				title: '复制', onPress: () => {
					Clipboard.setString(Emoticons.parse(item.content));
					toast.success('已复制');
				}
			}
		];
		
		const report = {
			title: '举报', onPress: () => {
				reportOnPress && reportOnPress(item, index)
			}
		};
		
		const remove = {
			title: '删除', onPress: () => {
				removeOnPress && removeOnPress(item, index)
			}
		};
		
		items.push(config.user._id === item.user._id ? remove : report);
		this.refs[item.commentId].measure((ox, oy, width, height, px, py) => {
			ActionPopover.show({x: px, y: py, width, height}, items);
		});
	};
	
	renderReply = (item) => {
		return (
			<View style={{
				borderColor: '#ddd',
				borderWidth: styleUtil.borderSeparator,
				padding: 10,
				flexDirection: 'row',
				marginBottom: 10
			}}>
				<Text style={{
					color: styleUtil.linkTextColor
				}}>
					<Text
						// activeOpacity={1}
						onPress={_ => navigate.push(Profile, {_id: item.replyUser._id})}
					>
						@{item.replyUser.username}：
					</Text>
					<Text
						style={{
							lineHeight: 20,
							color: '#666'
						}}>{item.replyIsDeleted ? item.replyContent : Emoticons.parse(item.replyContent)}</Text>
				</Text>
			</View>
		)
	}
	
	render() {
		const {item, index} = this.props;
		return (
			<TouchableHighlight
				ref={item.commentId}
				onPress={() => this.showPopover(item, index)}
			>
				<View
					style={{
						paddingVertical: 10,
						paddingHorizontal: 15,
						backgroundColor: 'white'
					}}>
					<View style={{
						flexDirection: 'row',
						justifyContent: 'space-between',
						alignItems: 'center'
					}}>
						<ImageCached
							component={Avatar}
							medium
							rounded
							source={config.defaultAvatar(item.isViewable || ImageCached.cache.get().cache[item.user.avatar] ? item.user.avatar : undefined)}
							isOnPress
							onPress={_ => navigate.push(Profile, {_id: item.user._id})}
							activeOpacity={0.7}
						/>
						<View style={{marginLeft: 10, flex: 1}}>
							<View style={{flexDirection: 'row'}}>
								<View style={{flex: 1}}>
									<View style={styles.chatTopRow}>
										<Text numberOfLines={1}
										      style={styles.username}>{item.user.username}</Text>
									</View>
									<View>
										<Text numberOfLines={1} style={styles.createdAt}>{utils.showTime(item.createdAt)}</Text>
									</View>
								</View>
							</View>
						</View>
					</View>
					<Text style={{
						lineHeight: 22,
						marginVertical: 10,
						fontSize: 16
					}}>
						{Emoticons.parse(item.content)}
					</Text>
					{item.replyUser && this.renderReply(item)}
					<TouchableOpacity
						activeOpacity={1}
						onPress={_ => {
							if (this.props.component) {
								let id = item.topicId || item.dynamicId || item.libraryId;
								let user = item.master ? item.master : item.user;
								navigate.push(this.props.component, {
									item: {
										...item,
										id,
										content: item.title,
										user,
									},
									removeDynamic: this.props.removeDynamic,
									isShowHeader: true,
								})
							}
						}}
						style={{
							borderWidth: styleUtil.borderSeparator,
							borderColor: styleUtil.borderColor,
							padding: 10,
							backgroundColor: styleUtil.backgroundColor
						}}>
						<Text numberOfLines={2} style={{lineHeight: 22,}}>{Emoticons.parse(item.title)}</Text>
					</TouchableOpacity>
				</View>
			</TouchableHighlight>
		)
	}
}


const styles = StyleSheet.create({
	chatTopRow: {
		flex: 1,
		// alignSelf:'flex-start',
		justifyContent: 'space-between',
		flexDirection: 'row'
	},
	username: {
		fontSize: 16,
		color: 'black',
		width: styleUtil.window.width - 120,
		fontWeight: '600',
		marginBottom: 5
	},
	createdAt: {
		color: '#666'
	},
	image: {
		marginBottom: 1,
		backgroundColor: '#CCC',
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
});