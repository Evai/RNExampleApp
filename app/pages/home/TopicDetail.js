import React from 'react'
import {
	View,
	Text,
	Image,
	TouchableOpacity,
	StyleSheet,
	Animated,
	Alert,
	Platform
} from 'react-native'
import utils from "../../common/utils";
import styleUtil from "../../common/styleUtil";
import {Avatar, Icon} from 'react-native-elements'
import {Label, Button, Theme, Badge, NavigationBar, ListRow, Overlay, PullPicker} from 'teaset'
import request from "../../common/request";
import ScrollPage from "../../components/ScrollPage";
import navigate from "../../screens/navigate";
import TopicComment from "./TopicComment";
import LoadingMore from "../../components/load/LoadingMore";
import config from "../../common/config";
import toast from "../../common/toast";
import Profile from "../account/Profile";
import Emoticons from "../../components/emoticon/Emoticons";
import AudioControl from "../../components/AudioControl";
import VideoPage from "../../components/VideoPage";
import HomeIndex from "./HomeIndex";
import PhoneLogin from "../account/PhoneLogin";
import NavBar from "../../components/NavBar";
import EditName from "../../components/EditName";
import UserList from "../account/profile/UserList";
import ImageCached from "../../components/ImageCached";
import ShareWeChat from "../../components/ShareWeChat";
import EditTextArea from "../account/profile/EditTextArea";
import UserIntegral from "../account/UserIntegral";
import {EVENTS} from "../../common/IMessage";

const likeLength = (styleUtil.window.width - 100) / 39;
const windowHeight = styleUtil.window.width * 0.618;
const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

const navIcons = (item, context) => (
	[
		{
			name: item.isLike ? 'ios-heart' : 'ios-heart-outline',
			color: item.isLike ? '#FF4500' : '#666',
			onPress: _ => {
				let isLike = item.isLike;
				if (isLike) {
					return
				}
				request.post(config.api.baseURI + config.api.topicLike, {
					topicId: item.id,
				}).then(res => {
					if (res.code === 0) {
						item.isLike = true;
						item.likes += 1;
						let likeList = [...context.state.likeList];
						likeList.push(config.user);
						context.setState({
							item,
							likeList
						});
						context.updateItem(item)
					}
				})
			}
		},
		{
			name: 'ios-star-outline',
			color: '#666',
			onPress: _ => {
				if (!config.user.accessToken) {
					toast.info("请先登录");
					navigate.push(PhoneLogin);
					return;
				}
				let data = [{
					title: '默认题库',
					id: 0,
					user: config.user
				}];
				config.getTopicLibraryList().then(list => {
					if (!list || list.length === 0) {
						return context.getTopicLibraryList()
					}
					return list
				}).then(list => {
					list = list || [];
					list = data.concat(list);
					PullPicker.show(
						'收藏到题库',
						list,
						undefined,
						(row, index) => {
							request.post(config.api.baseURI + config.api.topicCollect, {
								topicId: item.id,
								libraryId: row.id,
								isCollect: true
							}).then(res => {
								if (res.code === 0) {
									toast.success('收藏成功')
								}
							})
						},
						{getItemText: (row, index) => (row.title)}
					);
				});
			}
		},
		{
			name: item.comments > 0 ? 'ios-chatbubbles' : 'ios-chatbubbles-outline',
			color: item.comments > 0 ? styleUtil.themeColor : '#666',
			count: item.comments,
			onPress: _ => {
				// if (item.video || item.audio) {
				// 	context.refs[item.id] && context.refs[item.id].stop();
				// }
				navigate.push(TopicComment, {
					item,
					isShowHotList: true,
					getNewListUri: config.api.baseURI + config.api.getNewCommentList,
					addCommentUri: config.api.baseURI + config.api.addTopicComment,
					likeCommentUri: config.api.baseURI + config.api.likeTopicComment,
					removeCommentUri: config.api.baseURI + config.api.removeTopicComment,
					topicId: item.id,
					updateItem: context.updateItem
				})
			}
		},
		{
			name: 'ios-share-outline',
			count: item.shares,
			onPress: _ => {
				ShareWeChat.show({
					type: 'news',
					title: item.content,
					description: item.content,
					thumbImage: item.image || config.api.imageURI + 'uploads/image/app_icon.png',
					imageUrl: item.image || config.api.imageURI + 'uploads/image/app_icon.png',
					webpageUrl: config.api.imageURI + 'html/share_topic.html?topicId=' + context.topicId
				}, success => {
					request.post(config.api.baseURI + config.api.shareTopic, {
						topicId: item.id
					}).then(res => {
						if (res.code === 0) {
							toast.success('分享成功');
							let item = context.state.item;
							item.shares += 1;
							context.updateItem(item);
						}
					});
				})
			}
		},
	
	]
);

export default class TopicDetail extends React.Component {
	static navigatorStyle = {
		title: '详情',
		navBarHidden: true,
		navigationBarInsets: false
	};
	
	constructor(props) {
		super(props)
		this.state = {
			item: {
				user: {}
			},
			selectedOptions: [],
			selectedIndex: 0,
			checked: [],
			scrollY: new Animated.Value(0),
			disabled: true,
			likeList: [],
			joinList: []
		};
		this.topicId = props.item.id;
		// this.randomColor()
	}
	
	componentDidMount() {
		this.fetchData()
		this.fetchLikeList()
		this.fetchJoinList()
	}
	
	updateItem = item => {
		this.setState({item})
		this.props.updateItem && this.props.updateItem(item)
	};
	
	renderNavBar = () => {
		return (
			<NavBar
				title={'详情'}
				renderRightView={
					this.state.item.id && <TouchableOpacity
						onPress={this.showAction}
					>
						<Icon
							name={'ios-more'}
							type={'ionicon'}
							color={'black'}
							size={34}
							containerStyle={{paddingRight: 8}}
						/>
					</TouchableOpacity>
				}
			/>
		)
	};
	
	addTopicOptions = text => {
		if (!text || !text.trim()) {
			return;
		}
		text = text.trim();
		toast.modalLoading()
		request.post(config.api.baseURI + config.api.addTopicOptions, {
			topicId: this.topicId,
			content: text
		}).then(res => {
			toast.modalLoadingHide()
			if (res.code === 0) {
				let item = this.state.item;
				item.options.push({name: text, percent: 0});
				this.setState({
					item
				});
				navigate.pop();
			}
		}).catch(e => {
			toast.modalLoadingHide()
		})
	};
	
	reportUser = (item, callback) => {
		if (!config.user._id) {
			navigate.push(PhoneLogin);
			return;
		}
		request.post(config.api.baseURI + config.api.reportUser, {
			businessId: this.topicId,
			content: item,
			userId: this.state.item.userId,
			reportType: 2
		}).then(res => {
			if (res.code === 0) {
				Alert.alert('举报成功，平台将会在24小时之内给出回复')
				imessage.sendSystemNotice({
					noticeId: res.data.id,
					toUserId: this.state.item.userId,
					noticeType: EVENTS.SYSTEM_NOTICE
				}).then(res => {
					// console.warn(res)
				})
				callback && callback()
			}
		}).catch()
	};
	
	shield = () => {
		if (!config.user._id) {
			navigate.push(PhoneLogin);
			return;
		}
		request.post(config.api.baseURI + config.api.shieldTopic, {
			topicId: this.topicId,
			isShield: true
		}).then(res => {
			if (res.code === 0) {
				this.props.deleteRow && this.props.deleteRow(this.topicId)
				navigate.pop();
			}
		}).catch()
	};
	
	showAction = () => {
		const sameTitle = this.state.item.sameCount > 0 ? '有' + this.state.item.sameCount + '人此题答案和你一样':'查看此题和我选相同的答案的人';
		let items = [{
			title: sameTitle,
			onPress: _ => {
				if (!this.state.item.isJoin) {
					Alert.alert('请先作答此题');
					return;
				}
				navigate.pushNotNavBar(UserList, {
					uri: config.api.baseURI + config.api.getSameAnswerList,
					topicId: this.topicId,
					selectedOptions: this.state.item.selectedOptions,
					title: sameTitle
				})
			}
		}];
		if (this.state.item.isJoin) {
			let isProduct = this.state.item.isProduct;
			if (!isProduct) {
				items.push({
					title: '开启答案保护(消耗50积分)', onPress: _ => {
						Alert.alert('开启答案保护后，其他用户无法查看此题你所选的答案，确定要开启吗？', '', [
							{text: '取消'},
							{
								text: '开启', onPress: _ => {
									this.productAnswer(true)
								}
							}
						])
					}
				})
			} else {
				items.push({
					title: '取消答案保护', onPress: _ => {
						Alert.alert('取消答案保护后，其他用户可以消耗一定的积分查看此题你所选的答案，确定要取消吗？', '', [
							{text: '取消'},
							{
								text: '确定', onPress: _ => {
									this.productAnswer(false)
								}
							}
						])
					}
				})
			}
			
		}
		
		if (this.props.profileUser && config.user._id !== this.props.profileUser._id) {
			let isSeeAnswer = this.state.item.isSeeAnswer;
			let text = '查看 ' + this.props.profileUser.username + ' 的答案';
			if (!isSeeAnswer) {
				let alertText = '查看用户答案将消耗100积分，确认继续吗？';
				let detailText = '';
				if (this.state.item.beUserAnswerIsUpdated) {
					let beUserAnswer = this.state.item.beUserAnswer;
					beUserAnswer = beUserAnswer.map((v, i) => {
						return CHARS[parseInt(v)]
					});
					beUserAnswer.sort((a, b) => {
						return a > b
					});
					alertText = '该用户已经重新做了此题，答案已变更，是否重新消耗100积分来查看？'
					detailText = '之前该用户的答案为：' + beUserAnswer.join(',');
				}
				text += '(消耗100积分)';
				items.push({
					title: text, onPress: _ => {
						if (this.state.item.limitType === 1 && config.user.gender !== 2 && !this.state.item.isJoin) {
							Alert.alert('你还没有做过此题，请先做完此题');
							return;
						}
						else if (this.state.item.limitType === 2 && config.user.gender !== 1 && !this.state.item.isJoin) {
							Alert.alert('你还没有做过此题，请先做完此题');
							return;
						}
						else if (this.state.item.limitType === 0 && !this.state.item.isJoin) {
							Alert.alert('你还没有做过此题，请先做完此题');
							return;
						}
						Alert.alert(alertText, detailText, [
							{text: '取消'},
							{
								text: '确定', onPress: _ => {
									request.post(config.api.baseURI + config.api.seeUserAnswer, {
										topicId: this.topicId,
										userId: this.props.profileUser._id
									}).then(res => {
										if (res.code === 0) {
											let beUserAnswer = res.data;
											let item = this.state.item;
											item.isSeeAnswer = true;
											item.beUserAnswer = beUserAnswer;
											this.setState({
												item
											});
											beUserAnswer = beUserAnswer.map((v, i) => {
												return CHARS[parseInt(v)]
											});
											beUserAnswer.sort((a, b) => {
												return a > b
											});
											Alert.alert('该用户选择了' + beUserAnswer.join(',') + '项');
										} else if (res.code === 10) {
											Alert.alert(res.msg)
										}
									}).catch()
								}
							}
						])
					}
				})
			} else {
				let beUserAnswer = this.state.item.beUserAnswer;
				beUserAnswer = beUserAnswer.map((v, i) => {
					return CHARS[parseInt(v)]
				});
				beUserAnswer.sort((a, b) => {
					return a > b
				});
				items.push({
					title: text,
					onPress: _ => {
						Alert.alert('该用户选择了' + beUserAnswer.join(',') + '项');
					}
				})
			}
			
		}
		
		if (config.user._id === this.state.item.userId) {
			let item = this.state.item;
			let isHidden = item.isHidden;
			let text = '将该题匿名';
			if (isHidden) {
				text = '将该题公开';
			}
			items.push({
				title: text, onPress: () => {
					request.post(config.api.baseURI + config.api.setTopicIsHidden, {
						topicId: this.topicId,
						isHidden: !isHidden
					}).then(res => {
						if (res.code === 0) {
							toast.success("修改成功");
							item.user = config.user;
							item.isHidden = !isHidden;
							this.updateItem(item)
						}
					}).catch()
				}
			});
			items.push({
				title: '添加题目选项', onPress: () => {
					navigate.push(EditName, {
						text: '',
						title: '添加题目选项',
						submit: this.addTopicOptions
					})
				}
			});
			items.push({
				title: '删除', onPress: () => {
					Alert.alert('确定删除吗？', '', [
						{text: '取消'},
						{
							text: '确定', onPress: _ => {
								this.props.removeTopic && this.props.removeTopic(this.topicId)
							}
						},
					])
				}
			})
		} else {
			items.push({
					title: '赞赏给作者',
					onPress: _ => {
						navigate.push(EditName, {
							title: '赞赏给作者',
							text: '',
							submit: this.appreciateUser,
							maxLength: 5,
							keyboardType: Platform.OS === 'ios' ? 'number-pad' : 'numeric',
							placeholder: '请输入积分（5-99999）'
						})
					}
				}, {
					title: '屏蔽',
					onPress: () => {
						Alert.alert('屏蔽后此题将不会再显示，是否继续？', '', [
							{text: '取消'},
							{text: '确定', onPress: this.shield},
						])
					}
				},
				{
					title: '举报', onPress: _ => {
						let items = config.reportItems();
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
										submit: text => this.reportUser(text, navigate.pop())
									})
								} else {
									this.reportUser(item)
								}
							}
						);
					}
				})
		}
		config.showAction(items)
	};
	
	productAnswer = isProduct => {
		request.post(config.api.baseURI + config.api.productAnswer, {
			topicId: this.topicId,
			isProduct
		}).then(res => {
			if (res.code === 0) {
				let item = this.state.item;
				item.isProduct = isProduct;
				this.setState({
					item
				});
				if (isProduct) {
					toast.success('开启答案保护成功');
				} else {
					toast.success('取消成功');
				}
				
			}
		}).catch()
	};
	
	appreciateUser = value => {
		let total = parseInt(value);
		if (isNaN(total)) {
			Alert.alert('请输入正确的数字');
			return;
		}
		if (total < 5) {
			Alert.alert('至少赞赏5积分起');
			return;
		}
		Alert.alert('你将要赞赏作者' + total + '积分，确认继续吗？', '', [
			{text: '取消'},
			{
				text: '确认', onPress: _ => {
					request.post(config.api.baseURI + config.api.appreciateUser, {
						topicId: this.topicId,
						integral: value
					}).then(res => {
						if (res.code === 0) {
							toast.success('赞赏作者成功，感谢您的支持！');
							imessage.sendSystemNotice({
								noticeId: res.data.id,
								toUserId: this.state.item.userId,
								noticeType: EVENTS.SYSTEM_NOTICE
							}).then(res => {
								// console.warn(res)
							})
							navigate.pop();
						}
						else if (res.code === 10) {
							Alert.alert(res.msg, '是否前往充值积分页面', [
								{text: '取消'},
								{
									text: '去充值', onPress: _ => {
										navigate.push(UserIntegral)
									}
								},
							])
						}
					}).catch()
				}
			},
		])
	};
	
	randomColor = () => {
		const colors = [
			'#CD5C5C',
			'#DAA520',
			'#FF8C00',
			'#D2691E',
			'#008B8B',
			'#337AB7',
			'#6A5ACD',
			'#000000'
		];
		this.colors = [];
		for (let i = 0; i < colors.length; i++) {
			let r = Math.floor(Math.random() * colors.length);
			let color = colors[r];
			colors.splice(r, 1);
			this.colors.push(color);
			i--;
			// console.log(r,colors)
		}
	};
	
	getTopicLibraryList = () => {
		let uri = config.api.baseURI + config.api.getTopicLibrary;
		return request.post(uri, {
			userId: config.user._id
		}).then(res => {
			if (res.code === 0) {
				config.setTopicLibraryList(res.data.list)
				return res.data.list
			}
		})
	};
	
	fetchLikeList = () => {
		request.post(config.api.baseURI + config.api.topicLikeList, {
			topicId: this.topicId,
			pageNum: 1,
			pageSize: 10
		}).then(res => {
			if (res.code === 0) {
				this.setState({likeList: res.data.list})
			}
		}).catch()
	}
	
	fetchJoinList = () => {
		request.post(config.api.baseURI + config.api.getTopicJoinUserList, {
			topicId: this.topicId,
			pageNum: 1,
			pageSize: 10
		}).then(res => {
			if (res.code === 0) {
				this.setState({joinList: res.data.list})
			}
		}).catch()
	}
	
	fetchData = (getAt = 'current') => {
		let profileUser = this.props.profileUser || {};
		config.loadData(_ => {
			request.post(config.api.baseURI + config.api.topicDetail, {
				topicId: this.topicId,
				userId: profileUser._id,
				getAt
			}).then(res => {
				if (res.code === 0) {
					this.topicId = res.data.id;
					this.setState({
						item: res.data,
						selectedOptions: res.data.selectedOptions || []
					})
				} else if (res.code === 10) {
					toast.fail('该题目不存在')
					this.props.deleteRow && this.props.deleteRow(this.topicId)
				}
			}).catch(e => {
				console.warn(e)
			})
		})
	};
	
	renderBottom = (item) => {
		let {bottom: bottomInset} = Theme.screenInset;
		let barStyle = [styles.tabBarStyle, {
			height: Theme.tvBarHeight + bottomInset,
			paddingBottom: Theme.tvBarPaddingBottom + bottomInset,
		}];
		barStyle = StyleSheet.flatten(barStyle);
		let {height, paddingTop, paddingBottom} = barStyle;
		let buttonContainerStyle = {
			position: 'absolute',
			left: 0,
			bottom: 0,
			right: 0,
			paddingTop,
			paddingBottom,
			flexDirection: 'row',
			alignItems: 'flex-end',
			justifyContent: 'space-around',
		};
		let buttonStyle = {
			minHeight: height - paddingTop - paddingBottom,
		};
		return (
			<View pointerEvents='box-none'>
				<View style={barStyle}/>
				<View style={buttonContainerStyle} pointerEvents='box-none'>
					{/*<Icon*/}
					{/*name={'arrow-up'}*/}
					{/*type={'simple-line-icon'}*/}
					{/*size={20}*/}
					{/*containerStyle={buttonStyle}*/}
					{/*onPress={_ => {*/}
					{/*if (item.hasPrevious) {*/}
					{/*this.fetchData('previous')*/}
					{/*} else {*/}
					{/*toast.info("已经是第一篇了")*/}
					{/*}*/}
					{/*}}*/}
					{/*/>*/}
					{/*<Icon*/}
					{/*name={'arrow-down'}*/}
					{/*type={'simple-line-icon'}*/}
					{/*size={20}*/}
					{/*containerStyle={buttonStyle}*/}
					{/*onPress={_ => {*/}
					{/*if (item.hasNext) {*/}
					{/*this.fetchData('next')*/}
					{/*} else {*/}
					{/*toast.info("已经是最后一篇了")*/}
					{/*}*/}
					{/*}}*/}
					{/*/>*/}
					{navIcons(item, this).map((v, i) => (
						<TouchableOpacity
							key={i}
							onPress={v.onPress}
							activeOpacity={0.3}
						>
							<Icon
								name={v.name}
								type={'ionicon'}
								color={v.color}
								size={30}
								containerStyle={buttonStyle}
							/>
							{v.count > 0 &&
							<Badge
								style={{
									position: 'absolute',
									top: 0,
									right: v.count > 99 ? -20 : -15,
									paddingTop: 0,
									paddingBottom: 0,
									paddingLeft: 2,
									paddingRight: 2,
									backgroundColor: 'transparent'
								}}
								countStyle={{fontSize: 10, color: v.color}}
								count={v.count}/>}
						</TouchableOpacity>
					))}
				</View>
			</View>
		)
	};
	
	postSelected = selectedOptions => {
		toast.modalLoading();
		request.post(config.api.baseURI + config.api.selectOptions, {
			topicId: this.topicId,
			indexArr: selectedOptions
		}).then(res => {
			toast.modalLoadingHide();
			if (res.code === 0) {
				let item = res.data;
				this.updateItem(item);
				let joinList = [...this.state.joinList];
				joinList.push(config.user);
				if (item.sameCount > 0) {
					Alert.alert('有' + item.sameCount + '人此题答案和你一样哦！是否去看看？', null, [
						{text:'取消'},
						{text:'去看看', onPress: _=>{
								navigate.pushNotNavBar(UserList, {
									uri: config.api.baseURI + config.api.getSameAnswerList,
									topicId: this.topicId,
									selectedOptions: item.selectedOptions,
									title: '有' + item.sameCount + '人此题答案和你一样'
								})
							}},
					])
				} else if ((joinList.length < 3)) {
					Alert.alert("参与成功，参与人数大于3人时显示选项百分比");
				} else {
					Alert.alert('参与成功')
				}
				this.setState({
					selectedOptions: res.data.selectedOptions || [],
					checked: [],
					joinList
				});
			} else {
				toast.fail(res.msg)
			}
		}).catch(e => {
			toast.modalLoadingHide()
		})
	};
	
	selectedOption = i => {
		let {item, checked, selectedOptions} = this.state;
		if (selectedOptions.length > 0) {
			return;
		}
		if (item.optionType === 1) {
			checked = [];
			checked.push(i.toString());
		} else {
			let index = checked.indexOf(i.toString())
			if (index > -1) {
				checked.splice(index, 1)
			} else {
				checked.push(i.toString());
			}
		}
		this.setState({
			checked,
			disabled: checked.length === 0
		})
	};
	
	submitSelected = () => {
		if (!config.user._id) {
			toast.fail('请先登录');
			navigate.push(PhoneLogin);
			return;
		}
		let item = this.state.item;
		if (item.limitType !== 0) {
			if (item.limitType === 1 && config.user.gender !== 1) {
				Alert.alert('该题目只限男生作答！');
				return;
			}
			else if (item.limitType === 2 && config.user.gender !== 2) {
				Alert.alert('该题目只限女生作答！');
				return;
			}
		}
		let checked = this.state.checked;
		if (checked.length === 0) {
			toast.info('请先选择选项');
			return;
		}
		let selected = checked.map((v, i) => {
			return CHARS[parseInt(v)]
		});
		selected.sort((a, b) => {
			return a > b
		});
		Alert.alert(
			'你选择了' + selected.join(', ') + '项',
			'确认后将不可修改',
			[
				{
					text: '确认', onPress: () => {
						this.postSelected(checked)
					}
				},
				{
					text: '取消', onPress: () => {
					}, style: 'cancel'
				},
			],
			{cancelable: true}
		)
	};
	
	renderPercent = (item, v, i) => {
		if (this.state.selectedOptions.length > 0 && item.joins > 2) {
			let isSelected = this.state.selectedOptions.indexOf(i.toString());
			return (
				<View style={{
					position: 'absolute',
					right: 0
				}}>
					<Text
						style={{
							fontSize: 12,
							color: isSelected > -1 ? 'white' : '#CD5C5C'
						}}
					>{utils.formatSimilar(v.percent)}%</Text>
				</View>
			)
		}
		return <View/>
	};
	
	resetSelected = () => {
		Alert.alert('重做题目将会重置你目前所选的答案，并消耗50积分，确认重置吗？', '', [
			{text: '取消'},
			{
				text: '确定', onPress: _ => {
					request.post(config.api.baseURI + config.api.redoTopic, {
						topicId: this.topicId
					}).then(res => {
						if (res.code === 0) {
							toast.success("重置题目成功");
							let item = this.state.item;
							item.joins -= 1;
							item.isJoin = false;
							this.updateItem(item);
							this.setState({
								selectedOptions: [],
								checked: []
							});
						}
					}).catch()
				}
			}
		])
	};
	
	renderContent = (item) => {
		return (
			<ScrollPage>
				{item.image && <ImageCached
					source={{uri: item.image}}
					images={[{uri: item.image}]}
					isOnPress
					style={{
						width: styleUtil.window.width,
						height: windowHeight,
						backgroundColor: '#ccc'
					}}/>}
				{item.audio && <AudioControl
					ref={item.id}
					paused={false}
					uri={item.audio}/>}
				{item.video && <VideoPage
					ref={item.id}
					thumb={item.video.thumb}
					source={{uri: item.video.path}}
					visible={true}
					width={styleUtil.window.width}
					height={styleUtil.window.width * 0.618}
					paused={true}
				/>}
				<View style={{
					padding: 20,
					backgroundColor: 'white',
				}}>
					<View style={{
						flexDirection: 'row',
						justifyContent: 'space-between',
						alignItems: 'center',
						marginBottom: 20
					}}>
						<View style={{
							flexDirection: 'row',
							alignItems: 'center'
						}}>
							<ImageCached
								component={Avatar}
								rounded
								medium
								overlayContainerStyle={{
									backgroundColor: 'white'
								}}
								containerStyle={{
									marginRight: 10,
									borderColor: styleUtil.borderColor,
									borderWidth: styleUtil.borderSeparator
								}}
								source={item.isHidden ? require('../../assets/image/anonymous.png') : config.defaultAvatar(item.user.avatar)}
								isOnPress
								color={'white'}
								onPress={_ => {
									if (!item.isHidden) {
										if (item.video || item.audio) {
											this.refs[item.id] && this.refs[item.id].stop();
										}
										navigate.push(Profile, {
											_id: item.user._id
										})
									}
								}}
							/>
							<View>
								<Label style={{marginBottom: 5}} text={item.isHidden ? '匿名用户' : item.user.username}/>
								<Label type={'detail'}
								       text={utils.showTime(item.createdAt)}/>
							</View>
						</View>
						<View style={{
							justifyContent: 'space-between',
							alignItems: 'flex-end',
							height: 34
						}}>
							<View style={{
								justifyContent: 'space-between',
								alignItems: 'center',
								flexDirection: 'row',
							}}>
								<TouchableOpacity
									style={{
										flexDirection: 'row',
										alignItems: 'center',
										marginRight: 3
									}}
									activeOpacity={1}
									onPress={_ => {
										if (item.video || item.audio) {
											this.refs[item.id] && this.refs[item.id].stop();
										}
										navigate.pushNotNavBar(HomeIndex, {
											categoryId: item.categoryId,
											leftHidden: false
										})
									}}
								>
									<Image
										style={{
											width: 16,
											height: 16
										}}
										source={require('../../assets/image/label.png')}/>
									<Text style={{
										color: '#666',
										fontSize: 14
									}}>{item.categoryName}</Text>
								</TouchableOpacity>
								<View style={{
									flexDirection: 'row',
									alignItems: 'center',
									marginRight: 3
								}}>
									<Image
										source={item.optionType === 1 ? require('../../assets/image/radio.png') : require('../../assets/image/checked.png')}
										style={{
											width: 16,
											height: 16,
											tintColor: 'black',
										}}
									/>
									<Text style={{color: '#666'}}>{item.optionType === 1 ? '单选' : '多选'}</Text>
								</View>
								{item.limitType > 0 && <Image
									source={item.limitType === 1 ? require('../../assets/image/limit_male.png') : require('../../assets/image/limit_female.png')}
									style={{width: 18, height: 18}}
								/>}
							</View>
							<Text style={{
								color: item.isJoin ? styleUtil.successColor : 'red',
								fontSize: 12
							}}>{item.isJoin ? '已参与' : '未参与'}</Text>
						</View>
					</View>
					<Text style={{
						fontSize: 16,
						lineHeight: 28,
						color: '#333'
					}}>{Emoticons.parse(item.content)}</Text>
					<View style={{
						// height: styleUtil.borderSeparator,
						// backgroundColor: styleUtil.borderColor,
						marginTop: 10,
						marginBottom: 20
					}}/>
					{
						item.options.map((v, i) => (
							(
								<ListRow
									key={i}
									style={{
										borderWidth: styleUtil.borderSeparator,
										borderColor: '#CD5C5C',
										borderRadius: 50,
										marginBottom: 20,
										padding: 10,
										backgroundColor: this.state.selectedOptions.indexOf(i.toString()) > -1 ? '#CD5C5C' : 'transparent'
									}}
									activeOpacity={0.3}
									onPress={_ => this.selectedOption(i)}
									topSeparator={'none'}
									bottomSeparator={'none'}
									accessory={'none'}
									title={<Text numberOfLines={3}
									             style={{
										             fontSize: 15,
										             lineHeight: 22,
										             width: styleUtil.window.width - 110,
										             color: this.state.selectedOptions.indexOf(i.toString()) > -1 ? 'white' : '#CD5C5C'
									             }}
									>{CHARS[i]}. {v.name}</Text>}
									detail={
										this.state.checked.indexOf(i.toString()) > -1 ?
											<Icon
												name={'check'}
												size={20}
												color={'#CD5C5C'}
											/> : this.renderPercent(item, v, i)
									}
								>
								</ListRow>
							)
						))
					}
					{!this.state.item.isJoin &&
					<Button title='提交'
					        onPress={this.submitSelected}
					        disabled={this.state.disabled}
					        titleStyle={{color: 'white'}}
					        style={{
						        height: 40,
						        backgroundColor: styleUtil.themeColor,
						        borderColor: styleUtil.themeColor,
					        }}
					/>}
					{this.state.item.isJoin &&
					<Button title='重做题目(消耗50积分)'
					        onPress={this.resetSelected}
					        titleStyle={{color: 'white'}}
					        style={{
						        height: 40,
						        backgroundColor: styleUtil.themeColor,
						        borderColor: styleUtil.themeColor,
					        }}
					/>}
					<View style={{
						height: styleUtil.borderSeparator,
						backgroundColor: styleUtil.borderColor,
						marginTop: 10,
						marginBottom: 10
					}}/>
					{this.renderLikeList()}
					{this.renderJoinList()}
					{this.renderAppreciateList(item)}
				</View>
			</ScrollPage>
		)
	}
	
	renderLikeList = () => {
		const {likeList, item} = this.state
		if (likeList.length === 0) {
			return null;
		}
		return (
			<TouchableOpacity
				onPress={() => {
					if (item.video || item.audio) {
						this.refs[item.id] && this.refs[item.id].stop();
					}
					navigate.pushNotNavBar(UserList, {
						uri: config.api.baseURI + config.api.topicLikeList,
						topicId: this.topicId,
						title: '点赞人数（' + item.likes + '）'
					})
				}}
				style={{
					flexDirection: 'row',
					// justifyContent:'center',
					alignItems: 'center',
					paddingTop: 5,
					paddingBottom: 5,
					overflow: 'hidden'
				}}>
				{likeList.length > 0 && <ImageCached style={{
					width: 28,
					height: 28
				}} source={require('../../assets/image/like.png')}/>}
				{
					likeList.map((v, i) => (
						<ImageCached
							component={Avatar}
							key={i}
							small
							rounded
							source={config.defaultAvatar(v.avatar)}
							containerStyle={{
								marginLeft: 5
							}}
						/>
					))
				}
				{/*<Text> 等{item.likes}人点赞</Text>*/}
			</TouchableOpacity>
		)
	}
	
	renderJoinList = () => {
		const {joinList, item} = this.state
		if (joinList.length === 0) {
			return null;
		}
		return (
			<TouchableOpacity
				onPress={() => {
					if (item.video || item.audio) {
						this.refs[item.id] && this.refs[item.id].stop();
					}
					navigate.pushNotNavBar(UserList, {
						uri: config.api.baseURI + config.api.getTopicJoinUserList,
						topicId: this.topicId,
						title: '参与人数（' + item.joins + '）'
					})
				}}
				style={{
					flexDirection: 'row',
					// justifyContent:'center',
					alignItems: 'center',
					paddingTop: 5,
					paddingBottom: 5,
					overflow: 'hidden'
				}}>
				{joinList.length > 0 && <ImageCached style={{
					width: 28,
					height: 28
				}} source={require('../../assets/image/join_list.png')}/>}
				{
					joinList.map((v, i) => (
						<ImageCached
							component={Avatar}
							key={i}
							small
							rounded
							source={config.defaultAvatar(v.avatar)}
							containerStyle={{
								marginLeft: 5
							}}
						/>
					))
				}
				{/*<Text> 等{item.joins}人参与</Text>*/}
			</TouchableOpacity>
		)
	};
	
	renderAppreciateList = (item) => {
		if (item.appreciateList.length === 0) {
			return null;
		}
		return (
			<View
				style={{
					flexDirection: 'row',
					// justifyContent:'center',
					alignItems: 'center',
					paddingTop: 5,
					paddingBottom: 5,
					overflow: 'hidden'
				}}>
				<ImageCached style={{
					width: 28,
					height: 28
				}} source={require('../../assets/image/appreciate.png')}/>
				{
					item.appreciateList.map((v, i) => (
						<ImageCached
							component={Avatar}
							key={i}
							small
							rounded
							source={config.defaultAvatar(v.avatar)}
							containerStyle={{
								marginLeft: 5
							}}
						/>
					))
				}
			</View>
		)
	};
	
	render() {
		let item = this.state.item;
		return (
			<View style={styleUtil.container}>
				{this.renderNavBar()}
				{!item.id ? <LoadingMore/> : this.renderContent(item)}
				{item.id && this.renderBottom(item)}
			</View>
		)
	}
}

const styles = StyleSheet.create({
	tabBarStyle: {
		backgroundColor: 'white',
		position: 'relative',
		left: 0,
		bottom: 0,
		right: 0,
		paddingTop: Theme.tvBarPaddingTop,
		borderTopWidth: Theme.tvBarSeparatorWidth,
		borderColor: Theme.tvBarSeparatorColor
	}
});