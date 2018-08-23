import React from 'react'
import {
	View,
	Text,
	StyleSheet,
	Image,
	SectionList,
	Alert,
	Platform
} from 'react-native'
import styleUtil from "../../common/styleUtil";
import request from "../../common/request";
import CommentItem from "./CommentItem";
import LoadingMore from "../../components/load/LoadingMore";
import SectionHeader from "../../components/SectionHeader";
import Separator from "../../components/Separator";
import TextInputBar from "../../components/TextInputBar";
import toast from "../../common/toast";
import Emoticons from "../../components/emoticon/Emoticons";
import config from "../../common/config";
import EditTextArea from "../account/profile/EditTextArea";
import navigate from "../../screens/navigate";
import {PullPicker} from "teaset";
import {EVENTS} from "../../common/IMessage";


export default class TopicComment extends React.Component {
	static navigatorStyle = {
		title: '评论',
		autoKeyboardInsets: Platform.OS === 'ios',
	};
	
	constructor(props) {
		super(props)
		this.page = 1
		this.total = 1
		this.state = {
			item: props.item,
			hotList: [],
			newList: [],
			isLoading: false,
			placeholder: '发表评论',
			replyCommentItem: {}
		}
		this.topicId = props.item.id;
	}
	
	componentDidMount() {
		if (this.props.isShowHotList) {
			config.loadData(this._fetchHotList);
		}
		// config.loadData(this._fetchNewList);
	}
	
	_fetchHotList = () => {
		request.post(config.api.baseURI + config.api.getHotCommentList, {
			topicId: this.topicId
		}).then(res => {
			if (res.code === 0) {
				this.setState({
					hotList: res.data
				})
			}
		}).catch(e => {
		
		})
	};
	
	_fetchNewList = () => {
		this.setState({
			isLoading: true
		});
		let getNewListUri = this.props.getNewListUri;
		request.post(getNewListUri, {
			pageNum: this.page,
			pageSize: config.pageSize,
			topicId: this.topicId,
			libraryId: this.topicId,
		}).then(res => {
			if (res.code === 0) {
				this.page++;
				this.total = res.data.total
				let list = this.state.newList;
				this.setState({
					newList: list.concat(res.data.list)
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
	};
	
	_replyOnPress = (item) => {
		this._textInputBar.textInputFocus()
		this.setState({
			placeholder: `回复 ${item.user.username}：`,
			replyCommentItem: item
		})
	}
	
	reportUser = (item, callback) => {
		request.post(config.api.baseURI + config.api.reportUser, {
			businessId: item.id,
			content: item.content,
			userId: item.row.user._id,
			reportType: this.props.reportType || 4
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
			commentId: item.id,
			topicId: this.props.topicId
		}).then(res => {
			if (res.code === 0) {
				toast.success("删除评论成功")
				this.total -= 1;
				const newData = [...this.state.newList];
				const hotData = [...this.state.hotList];
				let hotIndex = hotData.findIndex(v => v.id === item.id);
				let newState = {
					newList: newData
				};
				if (hotIndex > -1) {
					hotData.splice(hotIndex, 1);
					newState.hotList = hotData;
					let newIndex = newData.findIndex(v => v.id === item.id);
					if (newIndex > -1) {
						newData.splice(newIndex, 1);
					}
				} else {
					newData.splice(index, 1);
				}
				
				this.setState(newState);
				let row = this.props.item;
				row.comments -= 1;
				this.props.updateItem && this.props.updateItem(row)
			}
		}).catch(e => {
			toast.fail("删除评论失败")
		})
	};
	
	_renderRows = ({item, separators, index}) => {
		return (
			<CommentItem
				topicId={this.topicId}
				item={item}
				index={index}
				separators={separators}
				replyOnPress={this._replyOnPress}
				reportOnPress={this._reportOnPress}
				removeOnPress={this._removeOnPress}
				likeCommentUri={this.props.likeCommentUri}
			/>
		)
	};
	
	_hasMore = () => {
		return this.state.newList.length < this.total
	}
	
	_fetchMoreData = () => {
		if (this._hasMore() && !this.state.isLoading) {
			this._fetchNewList()
		}
	}
	
	_renderFooter = () => {
		return <LoadingMore hasMore={this._hasMore()} icon={require('../../assets/image/comment.png')}/>
	};
	
	_sectionHeader = ({section}) => {
		if (!section.data || section.data.length <= 0) {
			return null;
		}
		if (!section.total) {
			return (
				<SectionHeader title={section.title}/>
			)
		}
		return (
			<SectionHeader title={`${section.title}（${section.total}）`}/>
		)
	}
	
	_itemSeparator = ({highlighted}) => {
		return (
			<Separator style={{left: 59}}/>
		)
	}
	_appendComment = (list) => {
		if (!Array.isArray(list)) {
			list = [list]
		}
		this.setState(preState => {
			return {
				newList: list.concat(preState.newList)
			}
		})
	}
	
	_onSend = (text) => {
		// console.log(text)
		if (!text || !text.trim()) {
			return;
		}
		let data = {
			topicId: this.topicId,
			libraryId: this.topicId,
			content: Emoticons.stringify(text),
			toUserId: this.props.item.userId
		};
		if (this.state.replyCommentItem.id > 0) {
			data.replyCommentId = this.state.replyCommentItem.id;
			data.toUserId = this.state.replyCommentItem.user._id;
		}
		this._textInputBar.onTogglePress(false, false)
		toast.modalLoading()
		setTimeout(_ => {
			toast.modalLoadingHide()
		}, config.timeout)
		request.post(this.props.addCommentUri, data).then(res => {
			toast.modalLoadingHide()
			if (res.code === 0) {
				this._textInputBar.clearText();
				this._appendComment(res.data)
				toast.success('评论成功')
				this.total += 1;
				data.text = data.content;
				// console.warn(data)
				imessage.sendSystemNotice({
					noticeId: res.data.id,
					toUserId: data.toUserId,
					noticeType: this.props.noticeType || EVENTS.TOPIC_NOTICE
				}).then(res => {
					// console.warn(res)
				})
				let row = this.props.item;
				row.comments += 1;
				this.props.updateItem && this.props.updateItem(row)
			}
		}).catch(e => {
			// console.warn(e)
			toast.modalLoadingHide()
		})
	}
	
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
				{this.props.isFocused && <SectionList
					style={{marginBottom: 50}}
					sections={[
						{data: this.state.hotList, title: '热门评论'},
						{data: this.state.newList, title: '最新评论', total: this.total}
					]}
					// key={this.state.newList}
					// extraData={this.state}
					renderItem={this._renderRows}
					renderSectionHeader={this._sectionHeader}
					initialNumToRender={config.pageSize}
					keyExtractor={(item, index) => index.toString()}
					ItemSeparatorComponent={this._itemSeparator}
					onEndReached={this._fetchMoreData}
					onEndReachedThreshold={0.3}
					ListFooterComponent={this._renderFooter}
					// ListEmptyComponent={
					// 	<Image source={require('../../assets/image/comment.png')}/>
					// }
					// ListHeaderComponent={this.renderHeader}
					keyboardDismissMode={'on-drag'}
					onTouchStart={this._onTouchStart}
				/>}
				{this._renderTextInputBar()}
			</View>
		)
	}
}

// const styles = StyleSheet.create({
// 	tabBarStyle: {
// 		backgroundColor: 'white',
// 		position: 'relative',
// 		left: 0,
// 		bottom: 0,
// 		right: 0,
// 		paddingTop: Theme.tvBarPaddingTop,
// 		borderTopWidth: Theme.tvBarSeparatorWidth,
// 		borderColor: Theme.tvBarSeparatorColor,
// 	}
// });