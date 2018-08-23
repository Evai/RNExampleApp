import React, {
	Component
} from 'react'

import {
	StyleSheet,
	Text,
	View,
	Image,
	Animated,
	ScrollView,
	findNodeHandle,
	TouchableOpacity,
	Alert,
	CameraRoll,
	SectionList,
	Platform
} from 'react-native'

import styleUtil from "../../common/styleUtil";

import navigate from "../../screens/navigate";
import {DEFAULT_WINDOW_MULTIPLIER, SCREEN_WIDTH} from "./profile/constants";
import {Avatar, Icon} from "react-native-elements";
import NavBar from "../../components/NavBar";
import {BlurView} from 'react-native-blur';
import Profile from "./Profile";
import {ListRow, NavigationBar, Button, PullPicker} from 'teaset'
import request from "../../common/request";
import ScrollPage from "../../components/ScrollPage";
import TopicDetail from "../home/TopicDetail";
import config from "../../common/config";
import toast from "../../common/toast";
import EditTopicLibrary from "./EditTopicLibrary";
import LoadingMore from "../../components/load/LoadingMore";
import TopicComment from "../home/TopicComment";
import ImageCached from "../../components/ImageCached";
import SectionHeader from "../../components/SectionHeader";
import EditTextArea from "./profile/EditTextArea";
import PhoneLogin from "./PhoneLogin";
import {EVENTS} from "../../common/IMessage";

export default class TopicLibraryDetail extends Component {
	static navigatorStyle = {
		navBarHidden: true
	};
	
	constructor(props) {
		super(props);
		this.page = 1
		this.total = 1
		this.state = {
			list: [],
			scrollY: new Animated.Value(0),
			item: props.item,
			isShowInfo: false,
			opacity: new Animated.Value(0),
			isLoaded: false,
			isLoading: false, //上拉加载
		}
	}
	
	componentDidMount() {
		config.loadData(this._fetchData)
		this._fetchDataWithLoading()
	}
	
	componentWillUnmount() {
	
	}
	
	_fetchDataWithLoading = () => {
		this.setState({
			isLoading: true
		});
		config.loadData(_ => {
			request.post(config.api.baseURI + config.api.getLibraryTopicList, {
				libraryId: this.props.item.id,
				userId: this.props.item.user._id,
				pageNum: this.page,
				pageSize: config.pageSize
			}).then(res => {
				let newState = {
					isLoading: false,
					isLoaded: true
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
					isLoading: false,
					isLoaded: true
				})
				// console.warn(`requestError: ${error}`)
			})
		})
	};
	
	_fetchData = () => {
		if (this.props.item.id <= 0) {
			return;
		}
		request.post(config.api.baseURI + config.api.getTopicLibraryDetail, {
			libraryId: this.props.item.id,
		}).then(res => {
			if (res.code === 0) {
				this.setState({item: res.data})
			}
		})
	};
	
	updateLibrary = (data = {}) => {
		request.post(config.api.baseURI + config.api.updateTopicLibrary, data)
			.then(res => {
				if (res.code === 0) {
					toast.success('更新成功');
					let item = this.state.item;
					if (data.isHidden) {
						item.isHidden = false;
					}
					this.setState({item})
					config.removeTopicLibraryList()
				}
			})
	};
	
	cancelTopic = (item, index) => {
		request.post(config.api.baseURI + config.api.topicCollect, {
			topicId: item.id,
			libraryId: this.props.item.id,
			isCollect: false
		}).then(res => {
			if (res.code === 0) {
				let list = [...this.state.list];
				list.splice(index, 1);
				this.setState({list})
				this.props.updateTotal && this.props.updateTotal()
				this.props.updateList && this.props.updateList(this.props.item)
			}
		}).catch()
	};
	
	removeTopic = topicId => {
		request.post(config.api.baseURI + config.api.removeTopic, {
			topicId
		}).then(res => {
			if (res.code === 0) {
				toast.success("删除成功");
				let list = [...this.state.list];
				let index = list.findIndex(item => item.id === topicId);
				if (index > -1) {
					list.splice(index, 1);
					this.setState({list})
				}
				navigate.pop();
			}
		}).catch()
	};
	
	_renderRows = ({item, index}) => {
		return (
			<ListRow
				key={index}
				onPress={_ => navigate.push(TopicDetail, {
					item,
					removeTopic: this.removeTopic
				})}
				title={
					<View style={{
						justifyContent: 'space-between',
						height: 36,
						width: styleUtil.window.width - 90
					}}>
						<Text
							numberOfLines={1}
							style={{
								fontSize: 14
							}}>{item.content}</Text>
						<Text style={{
							color: '#666',
							fontSize: 12
						}}>{item.user.username}</Text>
					</View>
				}
				icon={
					<Text style={{
						marginRight: 10,
						fontSize: 16,
						color: styleUtil.detailTextColor,
					}}>{index + 1}</Text>
				}
				detail={
					<Image
						source={
							item.image ? require('../../assets/image/image.png')
								: item.audio ? require('../../assets/image/audio.png')
								: item.video ? require('../../assets/image/video.png')
									: undefined
						}
						style={{
							width: 20,
							height: 20
						}}
					/>
				}
				swipeActions={[
					<ListRow.SwipeActionButton
						title='删除'
						type='danger'
						style={{width: 100}}
						onPress={_ => {
							Alert.alert('确定取消收藏此题？', '', [
								{text: '取消'},
								{text: '确定', onPress: _ => this.cancelTopic(item, index)},
							])
						}}/>
				]}
				topSeparator={index === 0 ? 'full' : 'none'}
				bottomSeparator={index + 1 === this.state.list.length ? 'full' : 'indent'}
			/>
		)
	}
	
	showInfo = status => {
		if (status) {
			this.setState({
				isShowInfo: status
			}, _ => {
				Animated.timing(this.state.opacity, {
					toValue: 1,
					duration: 300,
				}).start();
			})
		} else {
			Animated.timing(this.state.opacity, {
				toValue: 0,
				duration: 300,
			}).start();
			setTimeout(_ => {
				this.setState({
					isShowInfo: status
				})
			}, 300)
		}
		
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
		if (!this.state.isLoaded) {
			return <LoadingMore hasMore={true} showText={false}/>
		}
		if (this.state.list.length > 0) {
			return null;
		}
		let text = '该题库还没有题目';
		if (config.user._id === this.props.item.user._id) {
			text = '你可以收藏喜欢的题目到该题库';
		}
		return <Text style={{
			textAlign: 'center',
			marginTop: 30,
			color: '#c30'
		}}>{text}</Text>;
	};
	
	_renderHeader = () => {
		const {scrollY, item} = this.state;
		return (
			<LibraryHeader
				{...this.props}
				windowHeight={300}
				scrollY={scrollY}
				updateLibrary={this.updateLibrary}
				item={item}
				showInfo={this.showInfo}
			/>
		)
	};
	
	_sectionHeader = ({section}) => {
		if (this.state.list.length <= 0) {
			return null
		}
		return (
			<SectionHeader
				title={section.title}
				containerStyle={{paddingVertical: 10}}
				textStyle={{fontSize: 16}}
			/>
		)
	};
	
	render() {
		let {item, scrollY} = this.state;
		let {isShowHeader} = this.props;
		if (!isShowHeader) {
			return (
				<View style={styleUtil.container}>
					<NavBar title={'题库'} leftTitle={'back'}/>
					<View style={{
						flex: 1,
						backgroundColor: 'white',
						minHeight: styleUtil.window.height - 300
					}}>
						<SectionList
							sections={[
								{data: this.state.list, title: `共${this.total}道题`}
							]}
							// key={this.state.commentList}
							// extraData={this.state}
							renderItem={this._renderRows}
							renderSectionHeader={this._sectionHeader}
							initialNumToRender={config.pageSize}
							keyExtractor={(item, index) => index}
							// ItemSeparatorComponent={this._itemSeparator}
							onEndReached={this._fetchMoreData}
							onEndReachedThreshold={0.3}
							ListFooterComponent={this._renderFooter}
							// keyboardDismissMode={'on-drag'}
						/>
					</View>
				</View>
			)
		}
		return (
			<View style={styleUtil.container}>
				<LibraryBackground
					windowHeight={300}
					scrollY={scrollY}
					backgroundSource={item.cover ? {uri: item.cover} : require('../../assets/image/library_cover.jpg')}
					navBarTitle={item.title}
					updateLibrary={this.updateLibrary}
					item={item}
					{...this.props}
				/>
				<SectionList
					// contentContainerStyle={{flex:1}}
					sections={[
						{data: this.state.list, title: `共${this.total}道题`}
					]}
					// key={this.state.commentList}
					extraData={this.state}
					renderItem={this._renderRows}
					renderSectionHeader={this._sectionHeader}
					initialNumToRender={config.pageSize}
					keyExtractor={(item, index) => index}
					// ItemSeparatorComponent={this._itemSeparator}
					onEndReached={this._fetchMoreData}
					onEndReachedThreshold={0.3}
					ListFooterComponent={this._renderFooter}
					ListHeaderComponent={this._renderHeader}
					// keyboardDismissMode={'on-drag'}
					onScroll={Animated.event([{
						nativeEvent: {
							contentOffset: {
								y: this.state.scrollY
							}
						}
					}])}
					scrollEventThrottle={16}
				/>
				{this.state.isShowInfo && <LibraryInfo
					info={item}
					showInfo={this.showInfo}
					opacity={this.state.opacity}
				/>}
			</View>
		)
	}
	
	
}


class LibraryBackground extends React.Component {
	state = {
		viewRef: null
	}
	
	imageLoaded = () => {
		this.setState({viewRef: findNodeHandle(this.backgroundImage)});
	};
	
	renderBackground() {
		let {windowHeight, backgroundSource, scrollY} = this.props;
		return (
			<View>
				<Animated.Image
					style={[
						{
							position: 'absolute',
							backgroundColor: '#2e2f31',
							width: styleUtil.window.width,
							resizeMode: 'cover',
							height: windowHeight,
							transform: [
								{
									translateY: scrollY.interpolate({
										inputRange: [-windowHeight, 0, windowHeight, windowHeight],
										outputRange: [windowHeight / 2, 0, -windowHeight / 3, -windowHeight / 3]
									})
								},
								{
									scale: scrollY.interpolate({
										inputRange: [-windowHeight, 0, windowHeight],
										outputRange: [2, 1, 1]
									})
								}
							]
						}
					]}
					ref={(img) => {
						this.backgroundImage = img;
					}}
					source={backgroundSource}
					onLoadEnd={this.imageLoaded}
				/>
				<BlurView
					blurType='light'
					blurAmount={50}
					viewRef={this.state.viewRef}
					style={{
						position: "absolute",
						width: styleUtil.window.width,
						height: styleUtil.window.height
					}}
				/>
			</View>
		);
	}
	
	reportUser = (item, callback) => {
		if (!config.user._id) {
			navigate.push(PhoneLogin);
			return;
		}
		request.post(config.api.baseURI + config.api.reportUser, {
			businessId: this.props.item.id,
			content: item,
			userId: this.props.item.userId,
			reportType: 8
		}).then(res => {
			if (res.code === 0) {
				Alert.alert('举报成功，平台将会在24小时之内给出回复');
				imessage.sendSystemNotice({
					noticeId: res.data.id,
					toUserId: this.props.item.userId,
					noticeType: EVENTS.SYSTEM_NOTICE
				}).then(res => {
					// console.warn(res)
				});
				callback && callback()
			}
		}).catch()
	};
	
	shield = () => {
		if (!config.user._id) {
			navigate.push(PhoneLogin);
			return;
		}
		request.post(config.api.baseURI + config.api.shieldTopicLibrary, {
			libraryId: this.props.item.id,
			isShield: true
		}).then(res => {
			if (res.code === 0) {
				this.props.deleteRow && this.props.deleteRow(this.props.index)
				navigate.pop();
			}
		}).catch()
	};
	
	renderRightView = () => {
		const userId = this.props.item.user._id;
		return (
			<NavigationBar.Button
				onPress={_ => {
					let items = [];
					if (userId === config.user._id) {
						items.push({
							title: '编辑题库信息', onPress: _ => {
								navigate.pushNotNavBar(EditTopicLibrary, {
									info: this.props.item
								})
							}
						}, {
							title: '删除', onPress: _ => {
								Alert.alert('确认要删除该题库吗？', '', [
									{text: '取消'},
									{
										text: '确定', onPress: _ => {
											this.props.removeLibrary && this.props.removeLibrary(this.props.item, this.props.index, _ => navigate.pop())
										}
									},
								])
							}
						})
						if (this.props.item.isHidden) {
							items.push({
								title: '公开题库', onPress: _ => {
									Alert.alert(
										'确定要公开此题库？',
										'公开后将无法重新取消公开',
										[
											{
												text: '公开', onPress: _ => {
													this.props.updateLibrary({
														libraryId: this.props.item.id,
														isHidden: 1
													})
												}
											},
											{text: '取消'},
										]
									)
								}
							})
						}
					} else {
						items.push({
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
							},
							{
								title: '屏蔽', onPress: _ => {
									Alert.alert('屏蔽后此题库将不会再显示，是否继续？', '', [
										{text: '取消'},
										{text: '确定', onPress: this.shield},
									])
								}
							})
					}
					config.showAction(items)
				}}
			>
				<Icon
					name={'ios-more'}
					type={'ionicon'}
					color={'white'}
					size={34}
					containerStyle={{paddingRight: 8}}
				/>
			</NavigationBar.Button>
		)
	}
	
	renderNavBar() {
		return (
			<View>
				<NavBar
					renderTitleView={<Text style={{color: 'white', fontSize: 17}}>{this.props.navBarTitle}</Text>}
					style={{
						position: 'relative',
						backgroundColor: 'transparent',
						borderBottomWidth: 0
					}}
					leftTitle={'返回'}
					leftIconStyle={{tintColor: 'white'}}
					leftOnPress={_ => navigate.pop()}
					renderRightView={this.renderRightView()}
				/>
			</View>
		)
	}
	
	render() {
		return (
			<View>
				{this.renderBackground()}
				{this.renderNavBar()}
			</View>
		)
	}
}

class LibraryHeader extends React.Component {
	static defaultProps = {
		windowHeight: 300,
	};
	
	state = {
		item: this.props.item
	};
	
	componentWillReceiveProps(props) {
		if (props.item !== this.state.item) {
			this.setState({item: props.item})
		}
	}
	
	updateItem = item => {
		this.setState({item});
	}
	
	likeLibrary = () => {
		let item = this.state.item;
		let isLike = item.isLike;
		if (isLike) {
			return;
		}
		request.post(config.api.baseURI + config.api.likeTopicLibrary, {
			libraryId: item.id
		}).then(res => {
			if (res.code === 0) {
				item.isLike = true;
				item.likes += 1;
				this.setState({
					item
				});
				
			}
		})
	};
	
	collectLibrary = () => {
		let item = this.state.item;
		if (item.user._id === config.user._id) {
			Alert.alert('无需收藏自己的题库');
			return;
		}
		let isCollect = !item.isCollect;
		request.post(config.api.baseURI + config.api.collectLibrary, {
			libraryId: item.id,
			isCollect
		}).then(res => {
			if (res.code === 0) {
				item.isCollect = isCollect;
				item.collects = isCollect ? item.collects + 1 : item.collects - 1;
				this.setState({
					item
				});
				if (isCollect) {
					toast.success('题库已收藏')
				} else {
					toast.success('已取消收藏')
				}
			}
		})
	};
	
	render() {
		let {windowHeight, scrollY} = this.props;
		let item = this.state.item;
		let user = item.user;
		const newWindowHeight = windowHeight - styleUtil.navBarHeight;
		return (
			<Animated.View
				style={{
					opacity: scrollY.interpolate({
						inputRange: [-windowHeight, 0, windowHeight * DEFAULT_WINDOW_MULTIPLIER + styleUtil.navBarHeight],
						outputRange: [1, 1, 0]
					})
				}}
			>
				<TouchableOpacity
					activeOpacity={1}
					onPress={_ => {
					}}
					style={[{
						justifyContent: 'space-around',
						padding: 12
					}, {height: newWindowHeight}]}>
					<TouchableOpacity
						activeOpacity={1}
						onPress={_ => this.props.showInfo(true)}
						style={{
							flexDirection: 'row',
							alignItems: 'center'
						}}>
						<View style={{
							width: styleUtil.window.width / 3,
							height: styleUtil.window.width / 3,
							marginRight: 12
						}}>
							<ImageCached
								source={item.cover ? {uri: item.cover} : require('../../assets/image/library_cover.jpg')}
								style={{
									width: styleUtil.window.width / 3,
									height: styleUtil.window.width / 3,
									borderRadius: 3,
								}}
							/>
							<Icon
								name={'ios-information-circle-outline'}
								type={'ionicon'}
								size={26}
								color={'white'}
								containerStyle={{
									backgroundColor: 'rgba(0,0,0,.5)',
									position: 'absolute',
									bottom: 2,
									right: 2,
									width: 24,
									height: 24,
									borderRadius: 12
								}}
							/>
						</View>
						<View style={{
							justifyContent: 'space-around',
							height: styleUtil.window.width / 3,
							flex: 1
						}}>
							<Text
								numberOfLines={2}
								style={{
									color: 'white',
									fontSize: 18
								}}>{item.title}</Text>
							<TouchableOpacity
								onPress={_ => navigate.push(Profile, {_id: user._id})}
								style={{
									flexDirection: 'row',
									alignItems: 'center'
								}}>
								<ImageCached
									component={Avatar}
									source={config.defaultAvatar(user.avatar)}
									small
									rounded
									containerStyle={{marginRight: 8}}
								/>
								<Text style={{color: 'rgba(255,255,255,.9)'}}>{user.username}</Text>
							</TouchableOpacity>
						</View>
					</TouchableOpacity>
					
					<View style={{
						flexDirection: 'row',
						justifyContent: 'space-around',
						alignItems: 'center'
					}}>
						<TouchableOpacity
							style={{
								alignItems: 'center'
							}}
							onPress={this.likeLibrary}
						>
							<Icon
								name={item.isLike ? 'heart' : 'heart-outline'}
								color={item.isLike ? '#FF4500' : 'rgba(255,255,255,.9)'}
								type={'material-community'}
							/>
							<Text style={{color: 'rgba(255,255,255,.9)'}}>{item.likes || 0}</Text>
						</TouchableOpacity>
						<TouchableOpacity
							style={{
								alignItems: 'center'
							}}
							onPress={_ => {
								navigate.push(TopicComment, {
									item,
									isShowHotList: false,
									getNewListUri: config.api.baseURI + config.api.getTopicLibraryCommentList,
									addCommentUri: config.api.baseURI + config.api.addTopicLibraryComment,
									likeCommentUri: config.api.baseURI + config.api.likeTopicLibraryComment,
									removeCommentUri: config.api.baseURI + config.api.removeTopicLibraryComment,
									updateItem: this.updateItem,
									reportType: 6,
									noticeType: EVENTS.TOPIC_LIBRARY_NOTICE
								})
							}}
						>
							<Icon
								name={'comment'}
								color={'rgba(255,255,255,.9)'}
							/>
							<Text style={{color: 'rgba(255,255,255,.9)'}}>{item.comments || 0}</Text>
						</TouchableOpacity>
						{item.userId !== config.user._id && <TouchableOpacity
							style={{
								alignItems: 'center'
							}}
							onPress={this.collectLibrary}
						>
							<Icon
								name={item.isCollect ? 'star' : 'star-border'}
								color={item.isCollect ? '#FFD700' : 'rgba(255,255,255,.9)'}
							/>
							<Text style={{color: 'rgba(255,255,255,.9)'}}>{item.collects || 0}</Text>
						</TouchableOpacity>}
					</View>
				</TouchableOpacity>
			</Animated.View>
		);
	}
}


class LibraryInfo extends React.Component {
	state = {
		viewRef: null
	};
	
	imageLoaded = () => {
		this.setState({viewRef: findNodeHandle(this.backgroundImage)});
	};
	
	renderBlur = (info, showInfo) => {
		return (
			<View style={{flex:1}}>
				<BlurView
					blurType='light'
					blurAmount={100}
					viewRef={this.state.viewRef}
					style={{
						position: "absolute",
						width: styleUtil.window.width,
						height: styleUtil.window.height
					}}
				/>
				<TouchableOpacity
					activeOpacity={1}
					onPress={_ => showInfo(false)}
				>
					<Icon
						name={'ios-close'}
						type={'ionicon'}
						size={50}
						color={'white'}
						containerStyle={{
							alignSelf: 'flex-end',
							marginRight: 10,
							marginTop: 15
						}}
					/>
				</TouchableOpacity>
				<ScrollPage
					keyboardShouldPersistTaps={'never'}
					onTouchStart={_ => this.isShow = false}
					onTouchEnd={_ => !this.isShow && showInfo(false)}
					onTouchMove={_ => this.isShow = true}
					contentContainerStyle={{
						paddingTop: 20,
						paddingLeft: 15,
						paddingRight: 15,
						paddingBottom: 20,
						alignItems: 'center',
					}}>
					<ImageCached
						source={info.cover ? {uri: info.cover} : require('../../assets/image/library_cover.jpg')}
						style={{
							width: styleUtil.window.width * 0.5,
							height: styleUtil.window.width * 0.5,
							borderRadius: 3,
							marginBottom: 30,
						}}
					/>
					<Text style={{
						color: 'white',
						fontSize: 17,
						marginBottom: 30,
						lineHeight: 22
					}}>{info.title}</Text>
					<View style={{
						backgroundColor: 'rgba(255,255,255,.7)',
						width: styleUtil.window.width - 30,
						height: styleUtil.borderSeparator,
						marginBottom: 30
					}}/>
					<Text
						style={{
							color: 'white',
							lineHeight: 22,
							// alignSelf:'flex-start'
						}}>{info.description ? info.description : '暂无描述'}</Text>
				</ScrollPage>
				{<View style={{
					height: 50,
					justifyContent: 'center',
					alignItems: 'center',
					flexDirection: 'row'
				}}>
					{info.user._id === config.user._id && <Button
						title={'编辑'}
						onPress={_ => {
							showInfo(false);
							navigate.pushNotNavBar(EditTopicLibrary, {
								info
							})
						}}
						titleStyle={{color: 'white'}}
						style={{
							width: 90,
							borderColor: 'white',
							backgroundColor: 'transparent',
						}}
					/>}
					{info.cover && <Button
						title={'保存封面'}
						onPress={_ => {
							CameraRoll.saveToCameraRoll(info.cover, 'photo')
								.then(res => {
									toast.success('图片已保存在本地相册');
								}).catch(e => {
								toast.fail('保存图片失败');
							});
							
						}}
						titleStyle={{color: 'white'}}
						style={{
							borderColor: 'white',
							backgroundColor: 'transparent',
							marginLeft: info.user._id === config.user._id ? 20 : 0
						}}
					/>}
				
				</View>}
			</View>
		)
	}
	
	render() {
		let {info, showInfo} = this.props;
		return (
			<Animated.View style={{
				position: 'absolute',
				width: styleUtil.window.width,
				height: styleUtil.window.height,
				opacity: this.props.opacity
			}}>
				<Image
					source={info.cover ? {uri: info.cover} : require('../../assets/image/library_cover.jpg')}
					ref={(img) => {
						this.backgroundImage = img;
					}}
					style={{
						position: "absolute",
						width: styleUtil.window.width,
						height: styleUtil.window.height,
						backgroundColor: 'rgba(0,0,0,.5)'
					}}
					onLoadEnd={_ => this.imageLoaded()}/>
				{this.renderBlur(info, showInfo)}
			</Animated.View>
		)
	}
}
