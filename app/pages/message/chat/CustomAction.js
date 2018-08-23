import React from 'react';
import {
	StyleSheet,
	TouchableOpacity,
	View,
	Text,
	Platform,
	Alert,
	InteractionManager
} from 'react-native';

import PropTypes from 'prop-types';
import {Icon} from 'react-native-elements'
import styleUtil from "../../../common/styleUtil";
import ImageCropPicker from 'react-native-image-crop-picker'
import Geocoder from 'react-native-geocoder';
import toast from "../../../common/toast";
import navigate from "../../../screens/navigate";
import ImagePicker from 'react-native-image-picker';
// import MovToMp4 from "react-native-mov-to-mp4";
import RNThumbnail from "react-native-thumbnail";
import {ProcessingManager} from 'react-native-video-processing';
import {GeoLocation} from "../../../../App";
import config from "../../../common/config";
// import {GeoLocation} from "react-native-amap-geolocation"

const uploadSize = 1024 * 1024 * 5;

const ICONS = context => ([
	{
		name: 'md-camera', type: 'ionicon', size: 50, text: '拍摄', onPress: _ => {
			config.loadData(context.handleCameraPicker)
		}
	},
	// {name: 'video-camera', type: 'entypo', size: 50, text: '录制', onPress: context.handleRecordPicker},
	{name: 'ios-images', type: 'ionicon', size: 50, text: '相册', onPress: _ => config.loadData(context.handleImagePicker)},
	{name: 'location-on', type: 'material', size: 54, text: '位置', onPress: context.handleLocationClick},
]);

export default class CustomAction extends React.Component {
	static propTypes = {
		onSend: PropTypes.func,
		previousHandle: PropTypes.func
	};
	
	async componentDidMount() {
		if (GeoLocation) {
			GeoLocation.addLocationListener(location => {
				// console.warn(location)
				GeoLocation.stop();
				this.props.onSend({
					location: {
						latitude: location.latitude,
						longitude: location.longitude,
						address: location.address || '无法获知详细地址',
					}
				});
			})
		}
	}
	
	componentWillUnmount() {
		if (GeoLocation) {
			GeoLocation.removeLocationListener();
			GeoLocation.stop()
		}
	}
	
	onSendImage = (image) => {
		this.props.onSend && this.props.onSend({image})
	};
	
	handleRecordVideoClick = () => {
		// navigate.push(RecordVideo, {onSend: this.props.onSend})
	};
	
	checkMediaType = (source) => {
		// console.warn(source)
		//如果是视频格式
		if (source.path.lastIndexOf('.MOV') > -1) {
			// console.warn(source.path)
			// const filename = Date.now().toString();
			this.compressVideo(source.path, true, true);//npm install git+https://github.com/shahen94/react-native-video-processing.git
		} else if (source.path.lastIndexOf('.mp4') > -1) {
			// console.warn(source)
			// const compress = Platform.OS === 'ios';
			this.compressVideo(source.path, false, false);
		} else if (source.path.lastIndexOf('.jpg') > -1 || source.path.lastIndexOf('.png') > -1 || source.path.lastIndexOf('.gif') > -1) {
			toast.modalLoadingHide();
			this.onSendImage(source)
		} else {
			toast.modalLoadingHide();
			Alert.alert('文件格式不正确');
		}
	};
	
	compressVideo = (videoPath, isCompress, isSave) => {
		RNThumbnail.get(videoPath).then((result) => {
			const width = result.width;
			const height = result.height;
			// console.warn(result)
			if (!isCompress) {
				toast.modalLoadingHide();
				this.props.onSend && this.props.onSend({
					video: {
						width: width,
						height: height,
						thumb: result.path,
						path: videoPath,
					}
				})
			} else {
				const options = {
					width: width,
					height: height,
					bitrateMultiplier: 7,
					saveToCameraRoll: isSave, // default is false, iOS only
					saveWithCurrentDate: isSave, // default is false, iOS only
					minimumBitrate: 300000,
					removeAudio: false, // default is false
				};
				// console.warn(result)
				ProcessingManager.compress(videoPath, options).then((data) => {
					// console.warn(data)
					toast.modalLoadingHide();
					this.props.onSend && this.props.onSend({
						video: {
							width: width,
							height: height,
							thumb: result.path,
							path: data,
						}
					})
				}).catch(e => {
					console.log(e)
				})
			}
			
		}).catch(e => {
			Alert.alert('获取视频文件失败')
		});
	};
	
	handleCameraPicker = () => {
		ImagePicker.launchCamera({
			mediaType: Platform.OS === 'ios' ? 'mixed' : 'photo',
			durationLimit: 10,
			videoQuality: 'high',
			quality: 0,
			noData: true
		}, (response) => {
			if (response.didCancel) {
				console.log('User cancelled image picker');
			}
			else if (response.error) {
				console.warn('ImagePicker Error: ', response.error);
				Alert.alert("出错啦~")
			} else {
				// console.warn(response)
				let source = {
					width: response.width,
					height: response.height,
					size: response.fileSize,
					path: response.uri,
				};
				InteractionManager.runAfterInteractions(() => {
					toast.modalLoading('请稍等');
					this.checkMediaType(source)
				})
			}
		});
	};
	
	handleRecordPicker = () => {
		ImagePicker.launchCamera({
			mediaType: 'video',
			durationLimit: 10,
			videoQuality: 'high',
			quality: 0,
			noData: true
		}, (response) => {
			if (response.didCancel) {
				console.log('User cancelled image picker');
			}
			else if (response.error) {
				console.warn('ImagePicker Error: ', response.error);
				Alert.alert("出错啦~")
			} else {
				// console.warn(response)
				let source = {
					width: response.width,
					height: response.height,
					size: response.fileSize,
					path: Platform.OS === 'ios' ? response.uri : response.path,
				};
				InteractionManager.runAfterInteractions(() => {
					toast.modalLoading('请稍等');
					this.checkMediaType(source)
				})
			}
		});
	}
	
	handleImagePicker = () => {
		ImageCropPicker.openPicker({
			mediaType: 'any',
			// cropping: true,
			multiple: true,
			minFiles: 1,
			maxFiles: 5,
			// compressVideoPreset: 'HighestQuality',
			// compressImageQuality: 1,
			loadingLabelText: '请稍等...'
		}).then(medias => {
			// console.warn(medias)
			medias.forEach((v, i) => {
				if (v.size > uploadSize) {
					Alert.alert(v.filename + '文件过大，大小不超过5M，当前大小：' + (v.size / 1024 / 1024).toFixed(2) + 'M');
					return;
				}
				let source = {
					width: v.width,
					height: v.height,
					size: v.size,
					path: v.path,
					filename: v.filename
				};
				this.checkMediaType(source)
			})
		}).catch(e => {
			console.warn(e)
		})
	};
	
	handleLocationClick = () => {
		if (Platform.OS !== 'ios') {
			GeoLocation.start();
		} else {
			navigator.geolocation.getCurrentPosition(position => {
					// console.log(position.coords)
					Geocoder.fallbackToGoogle('abcdelkajwq');
					Geocoder.geocodePosition({
						lat: position.coords.latitude,
						lng: position.coords.longitude
					}).then((res) => {
						// console.log(res[0]);
						if (res.length > 0) {
							let locality = res[0].locality ? res[0].locality : '';
							let subLocality = res[0].subLocality ? res[0].subLocality : '';
							let feature = res[0].feature ? res[0].feature : '';
							let streetName = res[0].streetName ? res[0].streetName : '';
							this.props.onSend({
								location: {
									latitude: position.coords.latitude,
									longitude: position.coords.longitude,
									address: locality + subLocality + feature + streetName,
								}
							});
						} else {
							toast.fail('定位失败');
						}
					}).catch(err => {
						toast.fail('定位失败');
						console.warn("geocode error:", err);
					})
				},
				(error) => Alert.alert(error.message),
				{enableHighAccuracy: true, timeout: 20000, maximumAge: 1000}
			);
		}
		
	}
	
	render() {
		return (
			<View style={styles.iconView}>
				{
					ICONS(this).map((v, i) => (
						<View key={i} style={[styles.iconBox, {
							marginRight: (i + 1) % 4 === 0 ? 0 : 20
						}]}>
							<TouchableOpacity style={styles.iconTouch} onPress={_ => {
								this.props.previousHandle && this.props.previousHandle();
								v.onPress()
							}}>
								<Icon
									name={v.name}
									type={v.type}
									size={v.size}
									color={'#666'}
								/>
							</TouchableOpacity>
							<Text style={styles.iconText}>{v.text}</Text>
						</View>
					))
				}
			</View>
		)
	}
}

const styles = StyleSheet.create({
	iconView: {
		flexDirection: 'row',
		paddingLeft: 15,
		paddingRight: 15,
		paddingTop: 10,
		paddingBottom: 10,
		flexWrap: 'wrap'
	},
	iconBox: {
		alignItems: "center",
		marginTop: 6
	},
	iconText: {
		marginTop: 6,
		fontSize: 12
	},
	iconTouch: {
		justifyContent: 'center',
		alignItems: 'center',
		borderWidth: styleUtil.borderSeparator,
		borderColor: styleUtil.borderColor,
		borderRadius: 10,
		width: (styleUtil.window.width - 90) / 4,
		height: (styleUtil.window.width - 90) / 4
	}
});