import React from 'react'
import {
	View,
	Text,
	Image,
	TouchableOpacity
} from 'react-native'
import utils from "../../common/utils";
import styleUtil from "../../common/styleUtil";
import {Avatar, Icon} from 'react-native-elements'
import {Label, Button} from 'teaset'
import navigate from "../../screens/navigate";
import TopicDetail from "./TopicDetail";
import Profile from "../account/Profile";
import Emoticons from "../../components/emoticon/Emoticons";
import AudioControl from "../../components/AudioControl";
import VideoPage from "../../components/VideoPage";
import ImageCached from "../../components/ImageCached";
import {ImageCache} from "react-native-img-cache/build/index";

const icons = item => (
	[
		{
			name: item.isLike ? 'ios-heart' : 'ios-heart-outline',
			color: item.isLike ? '#FF4500' : 'black',
			count: item.likes
		},
		{name: 'ios-chatbubbles-outline', count: item.comments},
		{name: 'ios-share-outline', count: item.shares},
	]
);

export default class TopicItem extends React.Component {
	state = {
		item: this.props.item
	};
	
	updateItem = item => {
		this.setState({item})
	};
	
	componentWillReceiveProps(nextProps) {
		if (this.props.item !== nextProps.item) {
			this.setState({item: nextProps.item})
		}
	}
	
	render() {
		const {item} = this.state;
		return (
			<TouchableOpacity
				style={{
					borderColor: styleUtil.borderColor,
					shadowColor: 'black',
					shadowRadius: 3,
					shadowOpacity: 0.2,
					shadowOffset: {height: 1, width: 0}
				}}
				activeOpacity={0.5}
				onPress={_ => {
					if (item.video || item.audio) {
						this.refs[item.id] && this.refs[item.id].stop();
					}
					navigate.push(TopicDetail, {
						item,
						updateItem: this.updateItem,
						removeTopic: this.props.removeTopic,
						profileUser: this.props.profileUser,
						deleteRow: this.props.deleteRow
					})
				}}
			>
				<View style={{
					backgroundColor: 'white',
					margin: 10,
					borderRadius: 5,
					overflow: 'hidden',
					// borderWidth:1,
				}}>
					{item.image && <ImageCached
						source={{uri: item.isViewable || ImageCached.cache.get().cache[item.image] ? item.image : undefined}}
						images={[{uri: item.image}]}
						style={{
							width: styleUtil.window.width - 20,
							height: (styleUtil.window.width - 20) * 0.618,
							backgroundColor: '#ccc',
							// borderRadius:5
						}}/>}
					{item.audio && <AudioControl
						ref={item.id}
						uri={item.audio}
						paused={true}//!this.props.isViewable
					/>}
					{item.video && <VideoPage
						ref={item.id}
						thumb={item.video.thumb}
						source={{uri: item.video.path}}
						visible={true}
						width={styleUtil.window.width - 20}
						height={(styleUtil.window.width - 20) * 0.618}
						paused={!this.props.isViewable}
						muted={false}
					/>}
					<View style={{
						padding: 20
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
									onPress={_ => {
										if (!item.isHidden) {
											navigate.push(Profile, {_id: item.user._id})
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
									flexDirection: 'row',
									alignItems: 'center',
								}}>
									<View style={{
										flexDirection: 'row',
										alignItems: 'center',
										marginRight: 3
									}}>
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
									</View>
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
						<Text
							numberOfLines={5}
							style={{
								fontSize: 16,
								lineHeight: 20,
								color: '#333',
							}}>{Emoticons.parse(item.content)}</Text>
						<View style={{
							height: styleUtil.borderSeparator,
							backgroundColor: styleUtil.borderColor,
							marginTop: 8,
							marginBottom: 8
						}}/>
						<View style={{
							flexDirection: 'row',
							justifyContent: 'space-between',
							marginTop: 8
						}}>
							
							<View style={{flexDirection: 'row'}}>
								{icons(item).map((v, i) => (
									<View key={i} style={{
										flexDirection: 'row',
										marginRight: 12
									}}>
										<Icon
											name={v.name}
											type={'ionicon'}
											size={18}
											color={v.color || 'black'}
										/>
										<Text style={{
											color: '#666',
											fontSize: 14
										}}> {utils.numberToTenThousand(v.count)}</Text>
									</View>
								))}
							</View>
							
							<Text style={{
								textAlign: 'right',
								color: '#666',
								fontSize: 14
							}}>参与人数 {utils.numberToTenThousand(item.joins)}</Text>
						
						</View>
					</View>
				</View>
			
			</TouchableOpacity>
		)
	}
}