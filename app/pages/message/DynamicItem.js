import React from 'react'
import {
	View,
	Text,
	Image,
	StyleSheet,
	Alert,
	TouchableOpacity
} from 'react-native'
import {
	Button,
	Avatar,
	Icon
} from 'react-native-elements'
import styleUtil from "../../common/styleUtil";

import PropTypes from 'prop-types'
import _ from 'lodash'
import utils from "../../common/utils";
import Emoticons from "../../components/emoticon/Emoticons";
import VideoPage from "../../components/VideoPage";
import ImageCached from "../../components/ImageCached";
import config from "../../common/config";
import Profile from "../account/Profile";
import navigate from "../../screens/navigate";
import SubjectDetail from "../discovery/SubjectDetail";
import request from "../../common/request";

export default class DynamicItem extends React.Component {
	
	constructor(props) {
		super(props)
		// let item = props.item
		let {
			isLike,
			isFollow,
			followLoading,
			likes,
			comments
		} = props.item;
		this.state = {
			// item,
			isLike,
			isFollow,
			followLoading,
			likes,
			comments,
			/** 文本是否展开 */
			expanded: true,
			numberOfLines: null,
			/** 展开收起文字是否处于显示状态 */
			showExpandText: false,
			expandText: '展开',
			/** 是否处于测量阶段 */
			measureFlag: true
		}
		this.numberOfLines = props.numberOfLines !== null ? 10 : null;
		this.measureFlag = true;
		
	}
	
	_onTextLayout(event) {
		if (this.measureFlag) {
			if (this.state.expanded) {
				this.maxHeight = event.nativeEvent.layout.height;
				this.setState({expanded: false, numberOfLines: this.numberOfLines});
			} else {
				this.mixHeight = event.nativeEvent.layout.height;
				if (this.mixHeight === this.maxHeight) {
					this.setState({showExpandText: false})
				} else {
					this.setState({showExpandText: true})
				}
				this.measureFlag = false;
			}
		}
		
	}
	
	_onPressExpand() {
		if (!this.state.expanded) {
			this.setState({numberOfLines: null, expandText: '收起', expanded: true})
		} else {
			this.setState({numberOfLines: this.numberOfLines, expandText: '展开', expanded: false})
		}
	}
	
	
	componentWillReceiveProps(nextProps) {
		if (this.props.item !== nextProps.item) {
			this.setItem(nextProps.item)
		}
	}
	
	componentDidMount() {
	
	}
	
	componentWillUnmount() {
		//更新动态列表中的子组件，也就是this.setItem方法
		this.props.setItem && this.props.setItem(this.state)
	}
	
	setItem = (obj) => {
		let {isLike, isFollow, likes, comments, isViewable} = obj;
		this.setState(preState => {
			return {
				isLike: isLike !== undefined ? isLike : preState.isLike,
				isFollow: isFollow !== undefined ? isFollow : preState.isFollow,
				likes: likes !== undefined ? likes : preState.likes,
				comments: comments !== undefined ? comments : preState.comments,
				isViewable: isViewable !== undefined ? isViewable : preState.isViewable
			}
			
		})
	};
	
	_thumbsUpOnPress = () => {
		let item = this.props.item
		let {
			isLike,
			likes
		} = this.state
		if (isLike) {
			return
		}
		request.post(config.api.baseURI + config.api.dynamicLike, {
			dynamicId: item.id
		}).then(res => {
			if (res.code === 0) {
				this.setState({
					isLike: true,
					likes: ++likes
				});
			}
		}).catch()
		
	};
	
	_renderLightBoxFooter = (index) => {
		return (
			<Text style={styles.footerText}>{index + 1}/{this.props.item.images.length}</Text>
		)
	};
	
	_renderLightBox = () => {
		let item = this.props.item;
		if (!item.images || item.images.length === 0) {
			return null;
		}
		let width = (styleUtil.window.width - 33) / 3;
		let height = (styleUtil.window.width - 33) / 3;
		let rowNum = 3;
		if (item.images.length === 1) {
			width = styleUtil.window.width - 30;
			height = (styleUtil.window.width - 30) * 0.618;
			rowNum = 1;
		}
		else if (item.images.length % 3 === 0) {
			width = (styleUtil.window.width - 33) / 3;
			height = (styleUtil.window.width - 33) / 3;
			rowNum = 3;
		}
		else if (item.images.length % 2 === 0) {
			width = (styleUtil.window.width - 32) / 2;
			height = (styleUtil.window.width - 32) / 2;
			rowNum = 2;
		}
		return (
			<View style={{
				flexDirection: 'row',
				flex: 1,
				width: styleUtil.window.width - 30,
				flexWrap: 'wrap'
			}}>
				{item.images.map((uri, i, arr) => {
					return <ImageCached
						key={i}
						images={arr}
						isOnPress
						style={[styles.image, {
							width,
							height,
							marginRight: (i + 1) % rowNum === 0 ? 0 : 1,
						}]}
						source={{uri: this.props.isViewable || ImageCached.cache.get().cache[uri] ? uri : undefined}}
						index={i}
						isViewable={this.props.isViewable}
					/>
				})}
			</View>
		)
	}
	
	_renderBottomIcon = () => {
		let {
			likes,
			comments,
			isLike
		} = this.state;
		const items = [
			// {name: 'ios-heart-outline', count: item.likes},
			// {name: 'ios-chatbubbles-outline', count: item.comments},
			// {name: 'ios-share-outline', count: item.shares},
			{
				name: isLike ? 'ios-heart' : 'ios-heart-outline',
				type: 'ionicon',
				text: utils.numberToTenThousand(likes) + '次点赞',
				color: isLike ? '#EE4000' : '#666',
				onPress: this._thumbsUpOnPress
			},
			{
				name: comments > 0 ? 'ios-chatbubbles' : 'ios-chatbubbles-outline',
				type: 'ionicon',
				color: comments > 0 ? styleUtil.themeColor : '#666',
				text: utils.numberToTenThousand(comments) + '条评论',
				onPress: () => {
					if (this.props.onPress) {
						let obj = _.extend(Object.assign({}, this.props.item), this.state);
						this.props.onPress(obj, this.setItem)
					}
				}
			}
		];
		return items;
	}
	
	renderBottom = () => {
		return (
			<View style={{
				flexDirection: 'row',
				flex: 1,
				marginTop: 15
			}}>
				{
					this._renderBottomIcon().map((v, i) => (
						<TouchableOpacity
							key={i}
							activeOpacity={0.5}
							onPress={v.onPress && v.onPress}
							style={{
								marginRight: 10
							}}
						>
							<View style={{
								flexDirection: 'row',
								justifyContent: 'center',
								alignItems: 'center'
							}}>
								<Icon
									name={v.name}
									type={v.type}
									size={v.size || 24}
									color={v.color || '#666'}
								/>
								<Text style={{
									color: v.color || '#666',
									fontSize: 16,
									marginBottom: 2
								}}> {v.text}</Text>
							</View>
						</TouchableOpacity>
					))
				}
			</View>
		)
	};
	
	renderVideo = () => {
		let video = this.props.item.video;
		if (!video) {
			return null;
		}
		return (
			<VideoPage
				ref={ele => this.video = ele}
				thumb={video.thumb}
				source={{uri: video.path}}
				visible={true}
				width={styleUtil.window.width - 30}
				height={(styleUtil.window.width - 30) * 0.618}
				isSimple={true}
				isShowIcon={false}
				loadingStyle={{
					left: 0,
					top: 35,
				}}
			/>
		)
	};
	
	renderText = (item) => {
		// const expandText = this.state.showExpandText ? (
		// 	<Text
		// 		style={{
		// 			lineHeight: 22,
		// 			marginBottom: 5,
		// 			fontSize: 18,
		// 			color:styleUtil.detailTextColor
		// 		}}
		// 		onPress={this._onPressExpand.bind(this)}>
		// 		{this.state.expandText}</Text>
		// ): null;
		return (
			<View>
				<Text
					// numberOfLines={this.state.numberOfLines}
					// onLayout={this._onTextLayout.bind(this)}
					style={{
						lineHeight: 22,
						marginVertical: 10,
						fontSize: 16
					}}>
					{this.props.isShowSubject && <Text
						style={{
							color: styleUtil.linkTextColor,
							fontWeight: 'bold'
						}}
						onPress={_ => navigate.pushNotNavBar(SubjectDetail, {
							subject: item.subject,
							subjectId: item.subject.id,
							isShowSubject: false
						})}
					>
						{item.subject ? '#' + item.subject.subjectName + ' ' : null}
					</Text>}
					{Emoticons.parse(item.content)}
				</Text>
				{/*{expandText}*/}
			</View>
		)
	}
	
	render() {
		const {
			separators,
			onPress,
			item,
			index,
			renderBottom,
			avatarOnPress,
			onLongPress
		} = this.props
		const Component = onPress ? TouchableOpacity : View;
		return (
			<Component
				ref={'dynamic' + item.id}
				activeOpacity={0.3}
				onPress={() => {
					//拷贝一份新的子数据
					let obj = _.extend(Object.assign({}, item), this.state);
					onPress(obj, this.setItem)
				}}
				onLongPress={_ => {
					onLongPress && onLongPress(this.refs['dynamic' + item.id], item, index)
				}}
			>
				<View style={{
					backgroundColor: 'white',
					flex: 1,
					padding: 15,
				}}>
					<View style={{
						flexDirection: 'row',
						justifyContent: 'center',
						alignItems: 'center'
					}}>
						<ImageCached
							component={Avatar}
							medium
							rounded
							source={config.defaultAvatar(item.user.avatar)}
							isOnPress
							onPress={avatarOnPress}
							images={[config.defaultAvatar(item.user.avatar)]}
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
						<Icon
							name={'arrow-down'}
							type={'simple-line-icon'}
							color={'#666'}
							size={20}
							onPress={_ => {
								const items = [];
								if (config.user._id === this.props.item.user._id) {
									items.push({
										title: '删除',
										onPress: this.props.removeDynamic
									})
								} else {
									items.push({
											title: '屏蔽', onPress: _ => {
												Alert.alert('屏蔽后将不会再显示该条动态，是否继续？', '', [
													{text: '取消'},
													{text: '确定', onPress: this.props.onShield},
												])
											}
										},
										{title: '举报', onPress: this.props.onReport})
								}
								config.showAction(items);
							}}
						/>
					</View>
					{this.renderText(item)}
					{this._renderLightBox()}
					{this.renderVideo()}
					{this.renderBottom()}
					{renderBottom && renderBottom()}
				</View>
			</Component>
		)
	}
}

DynamicItem.defaultProps = {
	item: {},
	onPress: null,
	separators: {},
	avatarOnPress: _ => {
	}
};

DynamicItem.propTypes = {
	item: PropTypes.object.isRequired,
	onPress: PropTypes.func,
	renderBottom: PropTypes.func,
	separators: PropTypes.object,
	avatarOnPress: PropTypes.func,
};


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
})

