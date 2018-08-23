import React from 'react'

import {
	StyleSheet,
	View,
	Text,
	TouchableOpacity,
	ScrollView,
	TextInput,
	Image,
	Animated,
	Keyboard,
	Alert, Platform, InteractionManager,
} from 'react-native'

import {Icon} from 'react-native-elements'
import styleUtil from "../../common/styleUtil";
import ImageCropPicker from 'react-native-image-crop-picker';
import {Badge, ListRow, NavigationBar} from 'teaset'
import Emoticons from "../../components/emoticon/Emoticons";
import navigate from "../../screens/navigate";
import request from "../../common/request";
import toast from "../../common/toast";
import NavBar from "../../components/NavBar";
import FriendDynamic from "./FriendDynamic";
import VideoPage from "../../components/VideoPage";
import ImageCached from "../../components/ImageCached";
import RNThumbnail from 'react-native-thumbnail';
import SelectSubject from "../discovery/SelectSubject";
import config from "../../common/config";
import ImagePicker from "react-native-image-picker";
// import MovToMp4 from "react-native-mov-to-mp4";
import {ProcessingManager} from "react-native-video-processing";
import videoCompress from "react-native-fu-video-compress";

const COMPOSER_HEIGHT = 150;

const EMOTICONS_HEIGHT = 200;
const MIN_FILES = 1;
const MAX_FILES = 9;
const THUMBS_ROW_NUM = 4;
const THUMBS_SPACE = 8;
const MAX_LENGTH = 300;
const MAX_SIZE = 1024 * 1024 * 5;
const THUMBS_SIZE = (styleUtil.window.width - 20 - 3 * THUMBS_SPACE) / THUMBS_ROW_NUM;

const VISIBLE_TEXTS = ['所有人可见', '仅好友可见', '仅自己可见'];

export default class AddDynamic extends React.Component {
	static navigatorStyle = {
		scene: navigate.sceneConfig.FloatFromBottom,
		navBarHidden: true,
		// autoKeyboardInsets: false
	};
	
	constructor(props) {
		super(props);
		self = this;
		this.state = {
			text: '',
			selection: {start: 0, end: 0},
			selectedImages: [],
			selectedVideo: null,
			visibleType: this.props.visibleType || 0,
			bottom: new Animated.Value(0),
			subject: props.subject || {},
			emoticonBottom: new Animated.Value(-EMOTICONS_HEIGHT),
			showEmoticons: false, //是否弹出表情
			showKeyboard: false //是否弹出键盘
		};
		this.imageLimit = MAX_FILES
	}
	
	componentWillMount() {
		this.keyboardWillShowListener = Keyboard.addListener('keyboardWillShow', this._keyboardWillShow);
		this.keyboardwillHideListener = Keyboard.addListener('keyboardWillHide', this._keyboardWillHide);
	}
	
	componentWillUnmount() {
		this.keyboardWillShowListener.remove();
		this.keyboardwillHideListener.remove();
	}
	
	renderNavBar = () => {
		return (
			<NavBar
				title={'发布动态'}
				renderLeftView={<NavigationBar.LinkButton
					title={'关闭'}
					onPress={_ => {
						Alert.alert(
							'是否退出本次编辑?',
							'',
							[
								{
									text: '继续编辑', onPress: () => {
									}
								},
								{text: '退出', onPress: () => navigate.pop()},
							],
							{cancelable: false}
						)
					}}
				/>}
				rightTitle={'发布'}
				rightDisabled={this.isEmpty()}
				rightStyle={{
					color: this.isEmpty() ? styleUtil.disabledColor : styleUtil.successColor
				}}
				rightOnPress={this.rightOnPress}
			/>
		)
	};
	
	isEmpty = () => {
		return !this.state.text && this.state.selectedImages.length === 0 && !this.state.selectedVideo;
	};
	
	_keyboardWillShow = (e) => {
		this._keyboardHeight = e.endCoordinates ? e.endCoordinates.height : e.end.height
		this.setBottom(this._keyboardHeight);
	}
	
	_keyboardWillHide = (e) => {
		this.state.showEmoticons && this.setBottom(EMOTICONS_HEIGHT)
		!this.state.showEmoticons && this.setBottom(0)
	};
	
	setBottom = (height) => {
		Animated.timing(this.state.bottom, {
			toValue: height,
			duration: 210
		}).start();
	}
	
	setEmoticonBottom = (height) => {
		Animated.timing(this.state.emoticonBottom, {
			toValue: height,
			duration: 210
		}).start();
	}
	
	onTogglePress = (showEmoticons = this.state.showEmoticons, showKeyboard = this.state.showKeyboard) => {
		this.setState(pre => {
			const newState = {}
			if (pre.showEmoticons !== showEmoticons) {
				newState.showEmoticons = showEmoticons
			}
			if (pre.showKeyboard !== showKeyboard) {
				newState.showKeyboard = showKeyboard
			}
			return newState
		}, _ => {
			//如果显示表情，将键盘隐藏，表情弹出，反之亦然
			if (showEmoticons) {
				Keyboard.dismiss()
				this.setBottom(EMOTICONS_HEIGHT)
			} else if (showKeyboard) {
				this._textInput.focus();
				this.setEmoticonBottom(-EMOTICONS_HEIGHT)
			} else {
				Keyboard.dismiss()
				this.setBottom(0)
			}
		})
	};
	
	rightOnPress = () => {
		let data = {
			selectedImages: this.state.selectedImages,
			video: this.state.selectedVideo,
			content: undefined,
			visibleType: this.state.visibleType,
			subjectId: this.state.subject.id
		};
		if (this.state.text && this.state.text.trim().length > 0) {
			data.content = Emoticons.stringify(this.state.text);
		}
		
		if (!data.content && data.selectedImages.length === 0 && !data.video) {
			toast.info('请填写内容');
			return;
		}
		;
		toast.modalLoading();
		if (data.selectedImages.length > 0) {
			data.images = [];
			for (let item of data.selectedImages) {
				request.upload(config.api.baseURI + config.api.uploadImage, {
					uri: item.path,
					ext: 'jpg'
				}).then(res => {
					if (res.code === 0) {
						data.images.push(res.data);
						if (data.images.length === data.selectedImages.length) {
							delete data.selectedImages;
							this.submit(data)
						}
					}
				})
			}
		}
		else if (data.video) {
			request.upload(config.api.baseURI + config.api.uploadImage, {
				uri: data.video.thumb.path,
				ext: 'jpg'
			}).then(res => {
				return res.data
			}).then(thumb => {
				if (!thumb) {
					toast.fail('上传失败');
					return
				}
				// console.warn(data.video)
				return request.upload(config.api.baseURI + config.api.uploadVideo, {
					uri: data.video.path,
					ext: 'mp4'
				}).then(res => {
					// console.warn(res)
					if (res.code === 0) {
						let video = {
							thumb: thumb,
							width: data.video.thumb.width,
							height: data.video.thumb.height,
							path: res.data
						};
						data.video = JSON.stringify(video);
						this.submit(data)
					} else {
						toast.fail('上传视频文件失败')
					}
				}).catch(e => console.warn(e))
			}).catch(err => {
				console.warn(err)
			})
			
		}
		else {
			this.submit(data)
		}
	};
	
	submit = (data = {}) => {
		request.post(config.api.baseURI + config.api.addDynamic, data)
			.then(res => {
				toast.modalLoadingHide()
				if (res.code === 0) {
					toast.success('发布成功')
					FriendDynamic.fetchDynamicWithRefreshing()
					navigate.pop()
				}
			}).catch()
	};
	
	renderInput = () => {
		return (
			<View style={{height: COMPOSER_HEIGHT}}>
				<TextInput
					ref={component => this._textInput = component}
					style={styles.textInput}
					onChangeText={(text) => this.setState({text})}
					value={this.state.text}
					returnKeyType={'done'}
					maxLength={MAX_LENGTH}
					autoCapitalize={'none'}
					blurOnSubmit={true}
					multiline={true}
					textInputAutoFocus={true}
					placeholder={'分享你的故事~'}
					// onSubmitEditing={this.props.onSubmitEditing}
					// onChange={this.onContentSizeChange}
					// onContentSizeChange={this.onContentSizeChange}
					// enablesReturnKeyAutomatically
					underlineColorAndroid="transparent"
					selection={this.state.selection}
					onSelectionChange={({nativeEvent: {selection}}) => {
						this.setState({selection});
					}}
					onFocus={_ => this.onTogglePress(false, true)}
					onBlur={_ => this.onTogglePress(undefined, false)}
				/>
			</View>
		)
	}
	
	showAction = () => {
		Keyboard.dismiss();
		let items = [
			{
				title: '拍摄',
				onPress: _ => {
					config.loadData(this.openCamera)
				}
			},
			{
				title: '从相册中选取', onPress: _ => {
					config.loadData(this.selectLibrary)
				}
			},
			{
				title: '视频',
				onPress: _ => {
					config.loadData(this.selectVideo)
				}
			},
		];
		if (this.state.selectedImages.length > 0) {
			items.splice(2, 1)
		}
		config.showAction(items);
	}
	
	updateSelectedImages = (thumbs) => {
		if (!Array.isArray(thumbs)) {
			thumbs = [thumbs]
		}
		let selectedImages = this.state.selectedImages
		if (thumbs.length > this.imageLimit || thumbs.length + selectedImages.length > MAX_FILES) {
			alert('最多选择9张图片');
			return
		}
		this.imageLimit -= thumbs.length;
		selectedImages = selectedImages.concat(thumbs);
		selectedImages.forEach((item, i) => {
			selectedImages[i].uri = item.path;
		})
		this.setState({selectedImages})
	};
	
	openCamera = () => {
		// let mediaType = 'mixed';
		// if (this.state.selectedImages.length > 0) {
		// 	mediaType = 'photo';
		// }
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
	
	checkMediaType = (source) => {
		//如果是视频格式
		if (source.path.lastIndexOf('.MOV') > -1) {
			// const filename = Date.now().toString();
			RNThumbnail.get(source.path).then((result) => {
				source.thumb = result;
				source.mime = 'video/mp4';
				const options = {
					width: result.width,
					height: result.height,
					bitrateMultiplier: 7,
					saveToCameraRoll: true, // default is false, iOS only
					saveWithCurrentDate: true, // default is false, iOS only
					minimumBitrate: 300000,
					removeAudio: false, // default is false
				};
				ProcessingManager.compress(source.path, options).then((data) => {
					toast.modalLoadingHide();
					source.path = data;
					this.updateSelectedVideo(source)
				}).catch()
				
			}).catch(e => {
				Alert.alert('获取视频文件失败')
			});
		} else if (source.path.lastIndexOf('.mp4') > -1) {
			const compress = false;
			RNThumbnail.get(source.path).then((result) => {
				source.thumb = result;
				source.mime = 'video/mp4';
				if (!compress) {
					toast.modalLoadingHide();
					this.updateSelectedVideo(source)
				} else {
					// this._compress(source)
					// const options = {
					// 	width: result.width,
					// 	height: result.height,
					// 	bitrateMultiplier: 7,
					// 	saveToCameraRoll: false, // default is false, iOS only
					// 	saveWithCurrentDate: false, // default is false, iOS only
					// 	minimumBitrate: 300000,
					// 	removeAudio: false, // default is false
					// };
					// ProcessingManager.compress(source.path, options).then((data) => {
					// 	toast.modalLoadingHide();
					// 	source.path = data;
					// 	this.updateSelectedVideo(source)
					// }).catch(e => {})
				}
				
			}).catch(e => {
				console.warn(e)
				Alert.alert('获取视频文件失败')
			});
		} else if (source.path.lastIndexOf('.jpg') > -1 || source.path.lastIndexOf('.png') > -1 || source.path.lastIndexOf('.gif') > -1) {
			toast.modalLoadingHide();
			this.updateSelectedImages(source)
		} else {
			toast.modalLoadingHide();
			Alert.alert('文件格式不正确');
		}
	};
	
	_compress = (source) => {
		const InputVideoPath = source.path.substring(7);
		
		// console.warn(InputVideoPath)
		const OutputVideoPath = "/storage/emulated/0/DCIM/Camera/temp_" + InputVideoPath.substring(InputVideoPath.lastIndexOf('/') + 1);
		const cmd = "-y -i " + InputVideoPath + " -s 960x540 -strict -2 -vcodec libx264 -preset faster " +
			"-crf 24 -acodec aac -ar 44100 -ac 2 -b:a 96k -vf transpose=1 -aspect 16:9 " + OutputVideoPath;
		videoCompress.compress(InputVideoPath, OutputVideoPath, cmd, (status, outPath, size) => {
			if (status && size <= 5) {
				source.path = 'file://' + outPath;
				// this.updateSelectedVideo(source)
				// console.warn(outPath, size)
			} else if (status && size > 5) {
				Alert.alert('压缩后大于2M，请重新选择视频');
			} else {
				Alert.alert('压缩失败');
			}
		});
	};
	
	selectLibrary = () => {
		let selectedImages = this.state.selectedImages
		if (selectedImages.length >= MAX_FILES) {
			alert('最多选择9张图片');
			return
		}
		ImageCropPicker.openPicker({
			multiple: true,
			// cropping: true,
			mediaType: 'photo',
			// compressImageQuality: Platform.OS === 'ios' ? 0 : 1,
			minFiles: MIN_FILES,
			maxFiles: this.imageLimit,
			loadingLabelText: '请稍等...'
		}).then(images => {
			// console.log(images);
			this.updateSelectedImages(images)
		}).catch(err => {
			if (err.code === 'E_PICKER_CANCELLED') {
				return
			}
			alert('出错啦~')
		})
	};
	
	updateSelectedVideo = (media) => {
		if (media.mime !== 'video/mp4' && media.mime !== 'video/quicktime') {
			alert('不是有效的文件格式');
			return;
		}
		this.setState({
			selectedVideo: media,
		})
	};
	
	selectVideo = () => {
		ImageCropPicker.openPicker({
			multiple: false,
			// cropping: true,
			mediaType: 'video',
			// compressVideoPreset: 'HighestQuality',
			// compressImageQuality: 0,
			minFiles: 1,
			maxFiles: 1,
			loadingLabelText: '请稍等...'
		}).then(media => {
			// console.log(media);
			if (media.size > MAX_SIZE) {
				Alert.alert('文件大小不超过5M，当前大小：' + (media.size / 1024 / 1024).toFixed(2) + 'M');
				return
			}
			// toast.modalLoading('请稍等...');
			this.checkMediaType(media);
		}).catch(err => {
			if (err.code === 'E_PICKER_CANCELLED') {
				return
			}
			Alert.alert('获取视频文件失败')
		})
	}
	
	removeImages = (index) => {
		const selectedImages = [...this.state.selectedImages];
		selectedImages.splice(index, 1);
		this.setState({selectedImages}, _ => this.imageLimit += 1)
	}
	
	renderBadge = (index) => (
		<TouchableOpacity
			style={{
				position: 'absolute',
				top: -8,
				right: -8,
				zIndex: 99,
			}}
			onPress={_ => this.removeImages(index)}
			activeOpacity={1}>
			<Badge style={{
				backgroundColor: 'rgba(0,0,0,.5)',
				width: 24,
				height: 24,
				borderRadius: 12,
				paddingLeft: 2.5
			}}>
				<Icon name={'close'} size={20} color={'#fff'}
				/>
			</Badge>
		</TouchableOpacity>
	)
	
	renderAddButton = () => {
		if (this.state.selectedImages.length >= MAX_FILES) {
			return null;
		}
		else if (this.state.selectedVideo) {
			return null;
		}
		return (
			<TouchableOpacity
				style={styles.addButton}
				activeOpacity={0.5}
				onPress={this.showAction}
			>
				<Icon
					name={'ios-add'}
					type={'ionicon'}
					size={50}
					color={'#ccc'}
				/>
			</TouchableOpacity>
		)
		
	};
	
	renderSelectedVideo = () => {
		const thumb = this.state.selectedVideo.thumb.path;
		return (
			<View style={styles.thumbs}>
				<VideoPage
					ref={ele => this.video = ele}
					thumb={thumb}
					source={{uri: this.state.selectedVideo.path}}
					visible={true}
					width={THUMBS_SIZE}
					height={THUMBS_SIZE}
					isSimple={true}
				/>
			</View>
		)
	};
	
	renderMedia = () => {
		if (this.state.selectedVideo) {
			return <View style={styles.thumbs}>
				<TouchableOpacity
					style={{
						position: 'absolute',
						top: -8,
						right: -8,
						zIndex: 99,
					}}
					onPress={_ => this.setState({selectedVideo: null})}
					activeOpacity={1}>
					<Badge style={{
						backgroundColor: 'rgba(0,0,0,.5)',
						width: 24,
						height: 24,
						borderRadius: 12,
						paddingLeft: 2.5
					}}>
						<Icon name={'close'} size={20} color={'#fff'}
						/>
					</Badge>
				</TouchableOpacity>
				{this.renderSelectedVideo(this.state.selectedVideo)}
			</View>
		}
		return this.state.selectedImages.map((item, index) => (
			<View style={[styles.thumbs, {
				marginRight: (index + 1) % THUMBS_ROW_NUM === 0 ? 0 : THUMBS_SPACE
			}]} key={index}>
				{this.renderBadge(index)}
				<TouchableOpacity
					ref={'image' + index}
					style={{flex: 1}}
					activeOpacity={1}
					onPress={() => {
						let pressView = this.refs['image' + index];
						ImageCached.onImagePress(pressView, this.state.selectedImages, index)
					}}
				>
					<Image
						style={{width: null, height: null, flex: 1}}
						source={{uri: item.path}}
						reziseMode={'cover'}
					/>
				</TouchableOpacity>
			</View>
		))
	}
	
	renderThumbs = () => {
		return (
			<View style={styles.imageBox}>
				{this.renderMedia()}
				{this.renderAddButton()}
			</View>
		)
	}
	
	renderActions = () => {
		let {
			showEmoticons
		} = this.state
		return (
			<View style={{
				alignSelf: 'center',
				justifyContent: 'center'
			}}>
				{
					showEmoticons ?
						<Icon
							name={'keyboard'}
							type={'entypo'}
							size={30}
							containerStyle={styles.iconBox}
							onPress={_ => this.onTogglePress(false, true)}
						/> :
						<Icon
							name={'insert-emoticon'}
							type={'material'}
							size={30}
							containerStyle={styles.iconBox}
							onPress={_ => this.onTogglePress(true, false)}
						/>
				}
			</View>
		)
	}
	
	renderBottom = () => {
		return (
			<Animated.View style={[{
				height: EMOTICONS_HEIGHT,
				width: styleUtil.window.width,
				flex: 1,
				backgroundColor: styleUtil.backgroundColor,
				display: this.state.showEmoticons ? 'flex' : 'none',
			}]}>
				<Emoticons
					showsPagination={this.state.showEmoticons}
					onEmoticon={({text}) => this.setState({text})}
					onBackspace={text => this.setState({text})}
					selection={this.state.selection}
					text={this.state.text}
					showButton={false}
				/>
			</Animated.View>
		)
	}
	
	renderCountText = () => {
		let text = this.state.text.trim()
		return (
			<View style={{
				alignSelf: 'center',
				justifyContent: 'center'
			}}>
				<Text style={[
					styles.sendText,
					{color: text.length >= MAX_LENGTH ? 'red' : '#3CB371'}
				]}>{text.length}/{MAX_LENGTH}</Text>
			</View>
		)
	};
	
	selectVisible = () => {
		let items = [
			{title: VISIBLE_TEXTS[0], onPress: _ => this.setState({visibleType: 0})},
			{title: VISIBLE_TEXTS[1], onPress: _ => this.setState({visibleType: 1})},
			{title: VISIBLE_TEXTS[2], onPress: _ => this.setState({visibleType: 2})},
		];
		config.showAction(items);
	};
	
	addSubject = (text) => {
		if (!text) {
			return;
		}
		request.post(config.api.baseURI + config.api.addSubject, {
			subjectName: text
		}).then(res => {
			if (res.code === 0) {
				let subject = {
					id: res.data,
					subjectName: text
				};
				this.updateSubject(subject);
				navigate.popN(2);
			}
		}).catch()
	};
	
	updateSubject = (subject) => {
		this.setState({subject})
	};
	
	subjectAction = () => {
		if (!this.state.subject.id) {
			navigate.push(SelectSubject, {
				addSubject: this.addSubject,
				updateSubject: this.updateSubject
			})
		} else {
			let items = [
				{
					title: '重新选择话题', onPress: _ => {
						navigate.push(SelectSubject, {
							addSubject: this.addSubject,
							updateSubject: this.updateSubject
						})
					}
				},
				{title: '取消话题', onPress: _ => this.setState({subject: {}})}
			];
			config.showAction(items)
		}
	};
	
	render() {
		return (
			<View style={styleUtil.container}>
				{this.renderNavBar()}
				<ScrollView
					style={styleUtil.container}
					keyboardDismissMode={'none'}
					keyboardShouldPersistTaps={'handled'}
					onTouchStart={_ => this.onTogglePress(false)}
				>
					<View style={styles.header}>
						<View style={styles.inputContainer}>
							{this.renderInput()}
							{this.renderThumbs()}
						</View>
					</View>
					<View style={{backgroundColor: 'white'}}>
						<ListRow
							title={'谁可以看到'}
							detail={VISIBLE_TEXTS[this.state.visibleType]}
							icon={require('../../assets/image/lock.png')}
							// bottomSeparator={'full'}
							onPress={this.selectVisible}
						/>
						<ListRow
							title={'添加话题'}
							detail={this.state.subject.subjectName}
							icon={require('../../assets/image/topic.png')}
							bottomSeparator={'full'}
							onPress={this.subjectAction}
						/>
					</View>
					<View style={{paddingLeft: 10, paddingTop: 20}}>
						{/*<Text style={{*/}
						{/*fontSize: 15,*/}
						{/*color: '#666'*/}
						{/*}}>同时分享到：</Text>*/}
					</View>
				</ScrollView>
				<Animated.View
					style={[styles.container, {bottom: 0}]}
				>
					<View style={{
						flexDirection: 'row',
						alignItems: 'center',
						flexWrap: 'wrap',
						justifyContent: 'space-between',
						// flex: 1,
					}}>
						{this.renderActions()}
						{this.renderCountText()}
					</View>
					{this.renderBottom()}
				</Animated.View>
			</View>
		)
	}
}

const styles = StyleSheet.create({
	sendText: {
		fontWeight: '600',
		fontSize: 17,
		backgroundColor: 'transparent',
	},
	container: {
		flex: 1,
		position: 'absolute',
		backgroundColor: '#fff',
		padding: 5,
		width: styleUtil.window.width,
		borderTopWidth: 1,
		borderTopColor: styleUtil.borderColor,
	},
	header: {
		backgroundColor: 'white',
		paddingLeft: 10,
		paddingRight: 10
	},
	inputContainer: {
		borderBottomWidth: 0.5,
		borderBottomColor: '#ccc',
	},
	textInput: {
		flex: 1,
		fontSize: 16,
		lineHeight: 16,
		textAlignVertical: 'top'
	},
	addButton: {
		width: THUMBS_SIZE,
		height: THUMBS_SIZE,
		borderWidth: 1,
		borderStyle: 'dotted',
		borderColor: '#ccc',
		justifyContent: 'center',
		alignItems: 'center',
		marginBottom: THUMBS_SPACE
	},
	imageBox: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		marginTop: 10
	},
	thumbs: {
		width: THUMBS_SIZE,
		height: THUMBS_SIZE,
		marginBottom: THUMBS_SPACE
	}
});