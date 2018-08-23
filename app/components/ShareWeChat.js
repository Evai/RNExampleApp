import React from 'react'
import {
	View,
	Text,
	TouchableOpacity,
	Alert
} from 'react-native'

import {Overlay} from 'teaset'
import ImageCached from "./ImageCached";
import styleUtil from "../common/styleUtil";
import * as WeChat from 'react-native-wechat';
import toast from "../common/toast";
WeChat.registerApp('wx5ea23b574b927adc');

export default class ShareWeChat extends React.Component {
	
	static show = (data, success) => {
		// let {
		// 	type = 'text',
		// 	title,
		// 	thumbImage,
		// 	description,
		// 	webpageUrl,
		// 	imageUrl,
		// 	videoUrl,
		// 	musicUrl,
		// 	filePath,
		// 	fileExtension,
		// 	messageAction,
		// 	messageExt,
		// 	mediaTagName
		// } = data;
		// console.log(data)
		let overlayView = (
			<Overlay.PullView
				side='bottom'
				modal={false}
				ref={v => this.customView = v}
			>
				<View>
					<View style={{
						flexDirection: 'row',
						justifyContent: 'space-around',
						alignItems: 'center',
						padding: 20,
						borderBottomWidth: styleUtil.borderSeparator,
						borderColor: styleUtil.borderColor
					}}>
						<TouchableOpacity
							onPress={() => {
								toast.modalLoading();
								WeChat.isWXAppInstalled()
									.then(res => {
										if (!res) {
											toast.modalLoadingHide();
											Alert.alert('你还没有安装微信，请您安装微信之后再进行尝试');
										} else {
											WeChat.shareToSession(data).then(res => {
												toast.modalLoadingHide();
												success && success(res);
											}).catch(e => {
												toast.modalLoadingHide();
												if (e instanceof WeChat.WechatError) {
													// console.log(e.stack);
												} else {
													Alert.alert('分享失败')
												}
											});
										}
									})
									.catch(e => Alert.alert('分享失败'))
								
							}}
							style={{
								width: 60,
								justifyContent: 'center',
								alignItems: 'center',
							}}>
							<ImageCached
								source={require('../assets/image/wechat_friend.png')}
								style={{width: 50, height: 50}}
							/>
							<Text style={{paddingTop: 10}}>微信好友</Text>
						</TouchableOpacity>
						<TouchableOpacity
							onPress={_ => {
								toast.modalLoading();
								WeChat.isWXAppInstalled()
									.then(res => {
										if (!res) {
											toast.modalLoadingHide();
											Alert.alert('你还没有安装微信，请您安装微信之后再进行尝试');
										} else {
											WeChat.shareToTimeline(data).then(res => {
												toast.modalLoadingHide();
												success && success(res);
											}).catch(e => {
												toast.modalLoadingHide();
												if (e instanceof WeChat.WechatError) {
													// console.log(e.stack);
												} else {
													Alert.alert('分享失败')
												}
											})
										}
										
									})
									.catch(e=>Alert.alert('分享失败'))
								
							}}
							style={{
								width: 60,
								justifyContent: 'center',
								alignItems: 'center',
							}}>
							<ImageCached
								source={require('../assets/image/wechat_circle.png')}
								style={{width: 50, height: 50}}
							/>
							<Text style={{paddingTop: 10}}>朋友圈</Text>
						</TouchableOpacity>
					</View>
					<TouchableOpacity
						onPress={() => this.customView && this.customView.close()}
						style={{
							padding: 15,
							justifyContent: 'center',
							alignItems: 'center',
						}}>
						<Text style={{
							fontSize: 16,
							textAlign: 'center',
						}}>取消</Text>
					</TouchableOpacity>
				</View>
			</Overlay.PullView>
		);
		Overlay.show(overlayView);
	};
	
	
	render() {
		return (
			<View style={{flex: 1}}>
				<Text>1111</Text>
			</View>
		)
	}
}