import React from 'react'
import {
	StyleSheet,
	View,
	Text,
	SectionList,
	Image,
	TouchableOpacity,
	Alert,
	Platform
} from 'react-native'
import styleUtil from "../../common/styleUtil";
import LoadingMore from "../../components/load/LoadingMore";
import DynamicItem from "./DynamicItem";

import {
	Button,
	Icon,
	Avatar
} from 'react-native-elements'
import CommentItem from "../home/CommentItem";
import Separator from "../../components/Separator";
import SectionHeader from "../../components/SectionHeader";
import TextInputBar from "../../components/TextInputBar";
import navigate from "../../screens/navigate";
import Profile from "../account/Profile";
import Emoticons from "../../components/emoticon/Emoticons";
import ImageCached from "../../components/ImageCached";
import NavBar from "../../components/NavBar";
import config from "../../common/config";
import request from "../../common/request";
import {PullPicker} from "teaset";
import toast from "../../common/toast";
import EditName from "../../components/EditName";
import EditTextArea from "../account/profile/EditTextArea";
import UserList from "../account/profile/UserList";
import {EVENTS} from "../../common/IMessage";

export default class DynamicDetail extends React.Component {
	static navigatorStyle = {
		title: '详情',
		navBarHidden: true,
		navigationBarInsets: false,
		autoKeyboardInsets: Platform.OS === 'ios',
	};
	
	constructor(props) {
		super(props)
		this.dynamicId = props.item.id
		this.page = 1
		this.state = {
			likeList: [],
			commentList: [],
			isLoading: false,
			placeholder: '发表评论',
			replyCommentItem: {},
			item: props.item,
			total: 1
		}
		this.likes = 0;
	}
	
	componentDidMount() {
		config.loadData(this._fetchData)
		config.loadData(this._fetchLikeList)
		config.loadData(_ => this._fetchCommentList)
	}
	
	componentWillUnmount() {
	
	}
	
	_fetchData = () => {
		request.post(config.api.baseURI + config.api.dynamicDetail, {
			dynamicId: this.dynamicId,
		}).then(res => {
			if (res.code === 0) {
				this.setState({
					item: res.data
				})
			}
		})
	}
	
	renderRightView = () => {
		if (config.user._id !== this.props.item.user._id) {
			return undefined;
		}
		return (
			<TouchableOpacity
				onPress={this.showAction}
			>
				<Icon
					name={'ios-more'}
					type={'ionicon'}
					color={'white'}
					size={34}
					containerStyle={{paddingRight: 8}}
				/>
			</TouchableOpacity>
		)
	};
	
	renderNavBar = () => {
		return (
			<NavBar
				title={'动态详情'}
				// renderRightView={this.renderRightView()}
			/>
		)
	};
	
	removeDynamic = () => {
		this.props.removeDynamic && this.props.removeDynamic(this.props.item, this.props.index, _ => navigate.pop());
	};
	
	_fetchLikeList = () => {
		request.post(config.api.baseURI + config.api.dynamicLikeList, {
			dynamicId: this.dynamicId,
			pageNum: 1,
			pageSize: 10
		}).then(res => {
			if (res.code === 0) {
				this.likes = res.data.total;
				this.setState({
					likeList: res.data.list
				})
			}
		})
	}
	
	_fetchCommentList = () => {
		this.setState({
			isLoading: true
		});
		setTimeout(() => {
			request.post(config.api.baseURI + config.api.dynamicCommentList, {
					dynamicId: this.dynamicId,
					pageNum: this.page,
					pageSize: config.pageSize
				})
				.then(res => {
					if (res.code === 0) {
						this.page++
						this.setState(preState => {
							return {
								commentList: preState.commentList.concat(res.data.list),
								total: res.data.total
							}
						})
					}
					this.setState({
						isLoading: false
					})
				})
				.catch(e => {
					this.setState({
						isLoading: false
					})
				})
		}, config.loadingTime)
	}
	
	_replyOnPress = (item) => {
		this._textInputBar.textInputFocus()
		this.setState({
			placeholder: `回复 ${item.user.username}：`,
			replyCommentItem: item
		})
	}
	
	reportComment = (item, callback) => {
		request.post(config.api.baseURI + config.api.reportUser, {
			businessId: item.id,
			content: item.content,
			userId: item.row.user._id,
			reportType: 5
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
		const id = row.id;
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
						submit: text => this.reportComment({
							id: id,
							content: text,
							row
						}, _ => navigate.pop())
					})
				} else {
					this.reportComment({
						id: id,
						content: item,
						row
					})
				}
			}
		);
	};
	
	_removeOnPress = (item, index) => {
		request.post(config.api.baseURI + config.api.removeDynamicComment, {
			commentId: item.id
		}).then(res => {
			if (res.code === 0) {
				const newData = [...this.state.commentList];
				const item = {...this.state.item};
				item.comments -= 1;
				newData.splice(index, 1);
				this.setState({
					commentList: newData,
					total: this.state.total - 1,
					item
				});
				toast.success('删除成功')
			}
		}).catch()
	}
	
	_renderRows = ({item, separators, index}) => {
		return (
			<CommentItem
				dynamicId={this.dynamicId}
				item={item}
				index={index}
				separators={separators}
				replyOnPress={this._replyOnPress}
				reportOnPress={this._reportOnPress}
				removeOnPress={this._removeOnPress}
				likeCommentUri={config.api.baseURI + config.api.likeDynamicComment}
			/>
		)
	}
	_renderBottom = () => {
		return (
			<TouchableOpacity
				onPress={_ => {
					navigate.pushNotNavBar(UserList, {
						uri: config.api.baseURI + config.api.dynamicLikeList,
						dynamicId: this.dynamicId,
						title: '点赞人数（' + this.likes + '）'
					})
				}}
				style={{
					flexDirection: 'row',
					flex: 1,
					marginTop: 15,
				}}>
				<Image style={{
					width: 28,
					height: 28
				}} source={require('../../assets/image/like.png')}/>
				{
					this.state.likeList.map((v, i) => (
						<ImageCached
							component={Avatar}
							key={i}
							small
							rounded
							// isOnPress
							source={config.defaultAvatar(v.avatar)}
							// onPress={_ => navigate.push(Profile, {_id: v._id})}
							activeOpacity={0.7}
							containerStyle={{
								marginHorizontal: 1
							}}
						/>
					))
				}
			</TouchableOpacity>
		)
	};
	
	onReport = () => {
		let items = config.reportItems();
		let row = this.props.item;
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
							id: row.id,
							content: text,
							row
						}, navigate.pop())
					})
				} else {
					this.reportUser({
						id: row.id,
						content: item,
						row
					})
				}
			}
		);
	};
	
	reportUser = (item, callback) => {
		request.post(config.api.baseURI + config.api.reportUser, {
			businessId: item.id,
			content: item.content,
			userId: item.row.user._id,
			reportType: 3
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
	
	onShield = () => {
		this.props.onShield && this.props.onShield(this.props.item, this.props.index, _ => navigate.pop());
	};
	
	_renderHeader = () => {
		return (
			<DynamicItem
				item={this.state.item}
				setItem={this.props.setItem}
				renderBottom={this._renderBottom}
				onReport={this.onReport}
				avatarOnPress={_ => navigate.push(Profile, {_id: this.props.item.user._id})}
				onShield={this.onShield}
				removeDynamic={this.removeDynamic}
				numberOfLines={null}
			/>
		)
	}
	
	_hasMore = () => {
		return this.state.commentList.length < this.state.total
	}
	
	_fetchMoreData = () => {
		if (this._hasMore() && !this.state.isLoading) {
			this._fetchCommentList()
		}
	}
	
	_renderFooter = () => {
		return <LoadingMore hasMore={this._hasMore()} icon={require('../../assets/image/comment.png')}/>
	}
	
	_itemSeparator = ({highlighted}) => {
		return (
			<Separator style={{left: 59}}/>
		)
	}
	
	_sectionHeader = ({section}) => {
		if (this.state.commentList.length <= 0) {
			return null
		}
		return (
			<SectionHeader title={`${section.title}（${this.state.total}）`}/>
		)
	};
	
	_appendComment = (list) => {
		if (!Array.isArray(list)) {
			list = [list]
		}
		const item = {...this.state.item};
		item.comments += 1;
		this.setState(preState => {
			return {
				commentList: list.concat(preState.commentList),
				total: preState.total + 1,
				item
			}
		})
		this.props.setItem && this.props.setItem(item)
	};
	
	_onSend = (text) => {
		if (!text || !text.trim()) {
			return;
		}
		let data = {
			dynamicId: this.dynamicId,
			content: Emoticons.stringify(text),
			toUserId: this.props.item.user._id
		};
		if (this.state.replyCommentItem.id > 0) {
			data.replyCommentId = this.state.replyCommentItem.id;
			data.toUserId = this.state.replyCommentItem.user._id;
		}
		this._textInputBar.onTogglePress(false, false)
		toast.modalLoading();
		request.post(config.api.baseURI + config.api.addDynamicComment, data)
			.then(res => {
				toast.modalLoadingHide();
				if (res.code === 0) {
					this._textInputBar.clearText();
					this._appendComment(res.data);
					toast.success('评论成功');
					imessage.sendSystemNotice({
						noticeId: res.data.id,
						toUserId: data.toUserId,
						noticeType: EVENTS.DYNAMIC_NOTICE
					}).then(res => {
						// console.warn(res)
					})
				}
			}).catch(e => {
			toast.modalLoadingHide();
		})
	};
	
	_renderTextInputBar = () => {
		return (
			<TextInputBar
				ref={component => this._textInputBar = component}
				sendLabel={'评论'}
				placeholder={this.state.placeholder}
				renderActions
				onSend={this._onSend}
				onSubmit={this._onSend}
			/>
		)
	}
	
	_onTouchStart = () => {
		this.setState({
			placeholder: '发表评论',
			replyCommentItem: {}
		}, _ => this._textInputBar.onTogglePress(false, false))
	}
	
	render() {
		return (
			<View style={styleUtil.container}>
				{this.renderNavBar()}
				{this.props.isFocused && <SectionList
					style={{marginBottom: 52}}
					sections={[
						{data: this.state.commentList, title: '动态评论'}
					]}
					// key={this.state.commentList}
					extraData={this.state}
					renderItem={this._renderRows}
					renderSectionHeader={this._sectionHeader}
					initialNumToRender={config.pageSize}
					keyExtractor={(item, index) => item + index}
					ItemSeparatorComponent={this._itemSeparator}
					onEndReached={this._fetchMoreData}
					onEndReachedThreshold={0.3}
					ListFooterComponent={this._renderFooter}
					ListHeaderComponent={this._renderHeader}
					// keyboardDismissMode={'on-drag'}
					onTouchStart={this._onTouchStart}
				/>}
				{this._renderTextInputBar()}
			</View>
		)
	}
}

const styles = StyleSheet.create({})