import React from 'react'
import {
	View,
	Text,
	StyleSheet,
	TouchableOpacity, Clipboard, Alert
} from 'react-native'
import styleUtil from "../../common/styleUtil";
import utils from "../../common/utils";
import Separator from "../../components/Separator";
import ScrollPage from "../../components/ScrollPage";
import request from "../../common/request";
import navigate from "../../screens/navigate";
import TopicDetail from "../home/TopicDetail";
import DynamicDetail from "./DynamicDetail";
import {ActionPopover} from "teaset";
import toast from "../../common/toast";
import Emoticons from "../../components/emoticon/Emoticons";
import config from "../../common/config";
import TopicLibraryDetail from "../account/TopicLibraryDetail";

export default class NoticeDetail extends React.Component {
	static navigatorStyle = {
		title: '详情'
	};
	
	constructor(props) {
		super(props);
		this.state = {
			item: props.item
		}
	}
	
	componentDidMount() {
	
	}
	
	renderType = (item) => {
		let type = '';
		switch (item.reportType) {
			case 2:
				type = '题目';
				break;
			case 3:
				type = '动态';
				break;
			case 4:
				type = '题目评论';
				break;
			case 5:
				type = '动态评论';
				break;
			case 6:
				type = '题库评论';
				break;
			case 7:
				type = '题目赞赏';
				break;
			case 8:
				type = '题库';
				break;
			default:
				type = '用户';
				break;
		}
		return type;
	};
	
	_removeOnPress = (item, removeCommentUri) => {
		request.post(removeCommentUri, {
			commentId: item.businessId,
			topicId: item.topicId,
			dynamicId: item.dynamicId,
			libraryId: item.libraryId
		}).then(res => {
			if (res.code === 0) {
				toast.success("删除评论成功")
			}
		}).catch(e => {
			toast.fail("删除评论失败")
		})
	};
	
	showPopover = (item, removeCommentUri) => {
		const items = [
			{
				title: '删除', onPress: () => {
					this._removeOnPress(item, removeCommentUri)
				}
			}
		];
		
		this.refs['commentId'].measure((ox, oy, width, height, px, py) => {
			ActionPopover.show({x: px, y: py, width, height}, items);
		});
	};
	
	removeLibrary = (item, index, callback) => {
		request.post(config.api.baseURI + config.api.removeTopicLibrary, {
			libraryId: item.id
		}).then(res => {
			if (res.code === 0) {
				let item = this.state.item;
				item.isDeleted = 1;
				this.setState({item});
				config.removeTopicLibraryList()
				callback && callback()
			}
		})
	}
	
	_onPress = item => {
		const reportType = item.reportType;
		const businessId = item.businessId;
		if (reportType === 1) {
			return;
		}
		if (item.isDeleted === 1) {
			return;
		}
		if (reportType === 2 || reportType === 7) {
			navigate.push(TopicDetail, {
				item: {
					id: businessId,
				},
				removeTopic: this.removeTopic
			})
		}
		else if (reportType === 3) {
			navigate.push(DynamicDetail, {
				item: {
					id: businessId,
					user: config.user
				},
				removeDynamic: this.removeDynamic
			})
		}
		else if (reportType === 8) {
			navigate.push(TopicLibraryDetail, {
				item: {
					id: businessId,
					user: config.user
				},
				removeLibrary: this.removeLibrary,
				isShowHeader:true
			})
		}
		else {
			let removeCommentUri = '';
			if (reportType === 4) {
				removeCommentUri = config.api.baseURI + config.api.removeTopicComment
			}
			else if (reportType === 5) {
				removeCommentUri = config.api.baseURI + config.api.removeDynamicComment
			}
			else if (reportType === 6) {
				removeCommentUri = config.api.baseURI + config.api.removeTopicLibraryComment
			}
			this.showPopover(item, removeCommentUri)
			
		}
	};
	
	removeTopic = topicId => {
		request.post(config.api.baseURI + config.api.removeTopic, {
			topicId
		}).then(res => {
			if (res.code === 0) {
				toast.success("删除成功");
				let item = this.state.item;
				item.isDeleted = 1;
				this.setState({item});
				navigate.pop();
			}
		}).catch()
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
							let item = this.state.item;
							item.isDeleted = 1;
							this.setState({item});
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
		const item = this.props.item;
		const type = this.renderType(item);
		return (
			<ScrollPage style={styles.container}>
				<Text style={styles.text}>用户：{item.user.username}</Text>
				<Text style={styles.text}>内容：{item.content}</Text>
				<Text style={styles.text}>时间：{utils.timeStampToStr(item.createdAt)}</Text>
				<Text style={styles.text}>类型：{type}</Text>
				<Separator/>
				{item.reportType !== 1 && <TouchableOpacity
					activeOpacity={1}
					ref={'commentId'}
					onPress={_ => this._onPress(item)}
					style={{
						borderWidth: styleUtil.borderSeparator,
						borderColor: styleUtil.borderColor,
						padding: 10,
						backgroundColor: styleUtil.backgroundColor
					}}>
					<Text numberOfLines={2}
					      style={{lineHeight: 22,}}>{Emoticons.parse(item.title)}{item.isDeleted === 1 ? '（已删除）' : null}</Text>
				</TouchableOpacity>}
				<View>
				
				</View>
			</ScrollPage>
		)
	}
}

const styles = StyleSheet.create({
	container: {
		backgroundColor: '#fff',
		padding: 15,
		flex: 1
	},
	title: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 10
	},
	h5: {
		fontSize: 16,
		color: '#000',
		fontWeight: '700',
		marginLeft: 5
	},
	text: {
		marginBottom: 10,
		color: '#575757',
		fontSize: 16
	}
})