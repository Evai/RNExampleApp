import React from 'react'
import {
	View,
	Text,
	StyleSheet,
	Image,
	TouchableOpacity,
	Animated,
	InteractionManager,
	Dimensions,
	ImageBackground,
	Platform
} from 'react-native'
import styleUtil from "../../common/styleUtil";
import NavBar from "../../components/NavBar";
import FriendDynamic from '../message/FriendDynamic'
import navigate from "../../screens/navigate";
import AddDynamic from "../message/AddDynamic";
import utils from "../../common/utils";
import request from "../../common/request";
import ImageCached from "../../components/ImageCached";
import {Avatar, Icon} from 'react-native-elements'
import {Button} from 'teaset'
import Profile from "../account/Profile";
import UserList from "../account/profile/UserList";
import config from "../../common/config";
import {TabViewAnimated} from 'react-native-tab-view';
import TabBar from "../../components/tabbar/TabBar";
import PhoneLogin from "../account/PhoneLogin";

const initialLayout = {
	height: 0,
	width: Dimensions.get('window').width,
};

const HEADER_HEIGHT = 240;
const statusHeight = Platform.OS === 'ios' ? styleUtil.navBarHeight : styleUtil.navBarHeight + styleUtil.navBarStatusHeight + 20;
const COLLAPSED_HEIGHT = statusHeight + 52;
const SCROLLABLE_HEIGHT = HEADER_HEIGHT - COLLAPSED_HEIGHT;

export default class SubjectDetail extends React.Component {
	static navigatorStyle = {
		navBarHidden: true,
	};
	
	constructor(props) {
		super(props);
		let tabs = [
			{title: '最新', type: 'new', key: 'new', name: '最新'},
			{title: '热门', type: 'hot', key: 'hot', name: '热门'},
		];
		this.state = {
			index: 0,
			fromIndex: 0,
			routes: tabs,
			userList: [],
			headerHeight: 0,
			containerHeight: 0,
			subject: props.subject,
		};
		this.scrollY = new Animated.Value(0);
	}
	
	componentDidMount() {
		this.onScroll = Animated.event([{
				nativeEvent: {
					contentOffset: {
						y: this.scrollY
					}
				}
			}],
			{useNativeDriver: true});
		InteractionManager.runAfterInteractions(() => {
			this.getUserJoinList()
		})
	}
	
	componentWillUnmount() {
		this.scrollY = null;
	}
	
	getUserJoinList = () => {
		request.post(config.api.baseURI + config.api.getUserJoinList, {
			subjectId: this.props.subject.id,
			pageNum: 1,
			pageSize: config.pageSize
		}).then(res => {
			if (res.code === 0) {
				this.setState({userList: res.data.list})
			}
		}).catch()
	};
	
	onLayout = (e) => {
		const {height} = e.nativeEvent.layout;
		this.setState({
			headerHeight: height
		})
	};
	
	followSubject = (subject, callback) => {
		let item = {...subject};
		request.post(config.api.baseURI + config.api.followSubject, {
			subjectId: item.id,
			isFollow: !item.isFollow
		}).then(res => {
			if (res.code === 0) {
				item.isFollow = !item.isFollow;
				this.setState({subject: item});
				callback && callback()
			}
		}).catch()
	};
	
	_handleIndexChange = index => {
		if (this.state.index !== index) {
			this.setState(pre => {
				return {
					index: index,
					fromIndex: pre.index
				}
			});
		}
	};
	
	_renderHeader = props => {
		const {headerHeight} = this.state;
		const scrollHeight = headerHeight - COLLAPSED_HEIGHT > 0 ? headerHeight - COLLAPSED_HEIGHT : SCROLLABLE_HEIGHT;
		const translateY = this.scrollY.interpolate({
			inputRange: [0, scrollHeight],
			outputRange: [0, -scrollHeight],
			extrapolate: 'clamp',
		});
		return (
			<Animated.View
				onLayout={this.onLayout}
				style={[styles.header, {transform: [{translateY}]}]}>
				{this.renderImageHeader(scrollHeight)}
				{this.renderAvatarHeader()}
				{this.renderTabBar(props)}
			</Animated.View>
		);
	};
	
	renderAvatarHeader = () => {
		const {index} = this.props;
		const {subject, userList} = this.state;
		if (subject.subjectCover) {
			return null;
		}
		return (
			<View style={{
				paddingTop: styleUtil.navBarHeight + (Platform.OS === 'ios' ? 15 : 35),
				paddingHorizontal: 15
			}}>
				<Text style={{
					fontSize: 22,
					fontWeight: 'bold',
					color: 'black'
					// textAlign: 'center'
				}}>{subject.subjectName}</Text>
				<View style={{
					justifyContent: 'space-between',
					alignItems: 'center',
					flexDirection: 'row',
					marginVertical: 10,
				}}>
					<Text numberOfLines={1}
					      style={{color: 'black'}}>{utils.numberToTenThousand(subject.joins)}人参与
						| {utils.numberToTenThousand(subject.dynamics)}条动态</Text>
					<Button
						type={'secondary'}
						title={subject.isFollow ? '已关注' : '关注'}
						style={{
							backgroundColor: subject.isFollow ? styleUtil.disabledColor : styleUtil.themeColor,
							borderColor: subject.isFollow ? styleUtil.disabledColor : styleUtil.themeColor
						}}
						onPress={_ => {
							this.followSubject(subject, () => {
								this.props.followSubject && this.props.followSubject(subject, index);
							});
						}}
					/>
				</View>
				<View style={{
					flexDirection: 'row',
					justifyContent: 'space-between',
					alignItems: 'center',
					marginVertical: 10,
				}}>
					<View style={{
						width: styleUtil.window.width - 60,
						flexDirection: 'row',
						overflow: 'hidden'
					}}>
						{userList.map((item, i, arr) => (
							<ImageCached
								key={item._id + i}
								component={Avatar}
								source={config.defaultAvatar(item.avatar)}
								small
								rounded
								index={i}
								images={arr}
								isOnPress
								onPress={_ => navigate.push(Profile, {_id: item._id})}
								containerStyle={{
									marginHorizontal: 1
								}}
							/>
						))}
					</View>
					{userList.length > 0 && <Icon
						name={'arrow-right'}
						type={'simple-line-icon'}
						color={styleUtil.navIconColor}
						onPress={_ => navigate.pushNotNavBar(UserList, {
							uri: config.api.baseURI + config.api.getUserJoinList,
							subjectId: subject.id,
							title: '参与人数（' + subject.joins + '）'
						})}
					/>}
				</View>
			</View>
		)
	};
	
	renderImageHeader = (scrollHeight) => {
		const {index} = this.props;
		const {subject, userList} = this.state;
		if (!subject.subjectCover) {
			return null;
		}
		return (
			<ImageCached
				component={ImageBackground}
				source={{uri: subject.subjectCover}}
				images={[{uri: subject.subjectCover}]}
				isOnPress
				style={{
					height: styleUtil.window.width * 0.618,
				}}>
				<Animated.View style={{
					paddingTop: styleUtil.navBarHeight + (Platform.OS === 'ios' ? 0 : 15),
					paddingHorizontal: 15,
					opacity: this.scrollY.interpolate({
						inputRange: [0, scrollHeight],
						outputRange: [1, 0]
					})
				}}>
					<Text style={[styles.shadowText,{
						fontSize: 22,
						fontWeight: 'bold',
						color: 'white',
					}]}>{subject.subjectName}</Text>
					<View style={{
						justifyContent: 'space-between',
						alignItems: 'center',
						flexDirection: 'row',
						marginVertical: 10,
					}}>
						<Text numberOfLines={1}
						      style={[styles.shadowText,{
						      	color: 'white'
						      }]}>{utils.numberToTenThousand(subject.joins)}人参与
							| {utils.numberToTenThousand(subject.dynamics)}条动态</Text>
						<Button
							type={'secondary'}
							title={subject.isFollow ? '已关注' : '关注'}
							style={{
								backgroundColor: subject.isFollow ? styleUtil.disabledColor : styleUtil.themeColor,
								borderColor: subject.isFollow ? styleUtil.disabledColor : styleUtil.themeColor
							}}
							onPress={_ => {
								this.followSubject(subject, () => {
									this.props.followSubject && this.props.followSubject(subject, index);
								});
							}}
						/>
					</View>
					<View style={{
						flexDirection: 'row',
						justifyContent: 'space-between',
						alignItems: 'center',
						marginVertical: 10,
					}}>
						<View style={{
							width: styleUtil.window.width - 60,
							flexDirection: 'row',
							overflow: 'hidden'
						}}>
							{userList.map((item, i, arr) => (
								<ImageCached
									key={item._id + i}
									component={Avatar}
									source={config.defaultAvatar(item.avatar)}
									small
									rounded
									index={i}
									images={arr}
									isOnPress
									onPress={_ => navigate.push(Profile, {_id: item._id})}
									containerStyle={{
										marginHorizontal: 1
									}}
								/>
							))}
						</View>
						{userList.length > 0 && <Icon
							name={'arrow-right'}
							type={'simple-line-icon'}
							color={'white'}
							iconStyle={styles.shadowText}
							onPress={_ => navigate.pushNotNavBar(UserList, {
								uri: config.api.baseURI + config.api.getUserJoinList,
								subjectId: subject.id,
								title: '参与人数（' + subject.joins + '）'
							})}
						/>}
					</View>
				</Animated.View>
			</ImageCached>
		)
	};
	
	_renderScene = (props) => {
		// console.warn(props.route.key)
		return (
			<FriendDynamic
				scrollEventThrottle={16}
				onScroll={this.onScroll}
				contentContainerStyle={{paddingTop: this.state.headerHeight}}
				dynamicType={props.route.type}
				activeTab={this.state.index}
				visibleType={0}
				isShowSubject={true}
				animated={true}
				isRefresh={false}
				navBarHidden={true}
				navigationBarInsets={false}
				{...this.props}
			/>
		)
	};
	
	renderNavBar = () => {
		const {headerHeight, subject} = this.state;
		let color = 'black';
		if (subject.subjectCover) {
			color = 'white';
		}
		return (
			<NavBar
				style={{
					position: 'absolute',
					zIndex:99,
					backgroundColor: color === 'white' ? 'transparent' : 'white',
					borderBottomWidth: color === 'white' ? 0 : styleUtil.borderSeparator
				}}
				renderTitleView={
					<Text style={[[subject.subjectCover ? styles.shadowText : {}],{
						color,
						fontSize: 17,
						fontWeight:'bold',
					}]}>{subject.subjectName}</Text>
				}
				leftIconStyle={{
					tintColor:color
				}}
				renderRightView={
					<TouchableOpacity
						onPress={_ => {
							if (config.user._id) {
								navigate.push(AddDynamic, {
									visibleType: 0,
									subject
								})
							} else {
								navigate.push(PhoneLogin)
							}
						}}
					>
						<Image
							source={require('../../assets/image/edit_dynamic.png')}
							style={{
								width: 30,
								height: 30,
								marginRight: 10
							}}
						/>
					</TouchableOpacity>
				}
			/>
		)
	};
	
	renderTabBar = props => {
		// console.log(props)
		return (
			<TabBar
				{...props}
				goToPage={this._handleIndexChange}
				activeTab={this.state.index}
				backgroundColor={'white'}
				textStyle={styles.label}
				activeTextColor={styleUtil.activeTextColor}
				inactiveTextColor={styleUtil.inactiveTextColor}
				underlineStyle={styleUtil.underlineStyle}
				fromIndex={this.state.fromIndex}
				tabUnderlineDefaultWidth={40}
				tabContainerWidth={180}
				style={{
					justifyContent: 'flex-start',
					width: 180
				}}
				tabs={this.state.routes}
			/>
		)
	};
	
	
	render() {
		return (
			<View style={{flex:1}}>
				{this.renderNavBar()}
				<TabViewAnimated
					style={styles.container}
					navigationState={this.state}
					renderScene={this._renderScene}
					renderHeader={this._renderHeader}
					onIndexChange={this._handleIndexChange}
					initialLayout={initialLayout}
					useNativeDriver
				/>
			</View>
		)
	}
	
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	overlay: {
		flex: 1,
		backgroundColor: 'rgba(0, 0, 0, .32)',
	},
	cover: {
		height: HEADER_HEIGHT,
	},
	header: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		zIndex: 1,
		backgroundColor: styleUtil.navBackgroundColor,
	},
	tabbar: {
		backgroundColor: 'white',
		elevation: 0,
		shadowOpacity: 0,
	},
	shadowText: {
		textShadowOffset: {width: 1, height: 1},
		textShadowRadius: 3,
		textShadowColor: '#000'
	}
});