import React from 'react'

import {
	StyleSheet,
	View,
	Text,
	TouchableOpacity,
	TextInput,
	StatusBar,
	Image,
	Alert,
	Switch,
	ScrollView, Platform
} from 'react-native'

import {Icon} from 'react-native-elements'
import styleUtil from "../../common/styleUtil";
import ImageCropPicker from 'react-native-image-crop-picker';
import {ActionSheet, AlbumView, Overlay, Badge, Label, NavigationBar, Input, Button, ListRow} from 'teaset'
import navigate from "../../screens/navigate";
import toast from "../../common/toast";
import Emoticons from "../../components/emoticon/Emoticons";
import request from "../../common/request";
import OverlayModal from "../../components/OverlayModal";
import CategoryPicker from "../../components/CategoryPicker";
import SoundRecord from "./SoundRecord";
import NavBar from "../../components/NavBar";
import Sound from 'react-native-sound';
import VideoPage from "../../components/VideoPage";
import TopicList from "../home/TopicList";
import RNThumbnail from 'react-native-thumbnail'
import {ProcessingManager} from "react-native-video-processing";

const COMPOSER_HEIGHT = 200;
const MIN_OPTIONS = 2;
const MAX_OPTIONS = 20;
const MIN_FILES = 1;
const MAX_FILES = 1;
const THUMBS_ROW_NUM = 4;
const THUMBS_SPACE = 8;
const MAX_LENGTH = 500;
const MAX_SIZE = 1024 * 1024 * 5;
const THUMBS_SIZE = (styleUtil.window.width - 20 - 3 * THUMBS_SPACE) / THUMBS_ROW_NUM;
const OPTION_TYPES = ['点击选择', '单选', '多选'];
const LIMIT_TYPES = ['不限', '限男生', '限女生'];
const MEDIA_TYPE = ['video/mp4', 'video/quicktime', 'image/jpeg', 'image/png', 'audio/aac'];

export default class AddTopic extends React.Component {
	static navigatorStyle = {
		scene: navigate.sceneConfig.FloatFromBottom,
		navBarHidden: true,
	};
	
	constructor(props) {
		super(props);
		this.state = {
			text: '',
			selection: {start: 0, end: 0},
			selectedImage: null,
			selectedAudio: null,
			selectedVideo: null,
			remainLength: MAX_LENGTH,
			options: ['', ''],
			topicType: 1,
			optionType: 1,
			limitType: 0,
			categoryId: 0,
			categoryName: '点击选择',
			category: [],
			isHidden: false
		};
		this.sound = null;
		this.video = null;
	}
	
	componentWillMount() {
	
	}
	
	componentDidMount() {
		config.loadData(_ => {
			config.getTopicCategory()
				.then(list => {
					if (list.length > 0) {
						this.setState({
							category: list
						})
					}
					config.loadData(this.getCategory)
				})
		})
	}
	
	componentWillUnmount() {
		
	}
	
	renderNavBar = () => {
		return (
			<NavBar
				title={'出题'}
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
				rightTitle={'完成'}
				rightDisabled={!this.isSubmit()}
				rightStyle={{
					color: this.isSubmit() ? styleUtil.successColor : styleUtil.disabledColor
				}}
				rightOnPress={this.rightOnPress}
			/>
		)
	};
	
	isSubmit = () => {
		let {text, options, categoryId} = this.state;
		return !!(text && text.trim().length > 0 && categoryId > 0 && options.length >= 2);
	};
	
	rightOnPress = () => {
		let data = {
			content: this.state.text,
			options: this.state.options,
			topicType: this.state.topicType,
			optionType: this.state.optionType,
			limitType: this.state.limitType,
			image: this.state.selectedImage,
			audio: this.state.selectedAudio,
			video: this.state.selectedVideo,
			categoryId: this.state.categoryId,
			isHidden: this.state.isHidden
		};
		if (!data.content || data.content.trim().length <= 0) {
			toast.info('请填写题目内容');
			return;
		}
		// if (data.optionType !== 1 && data.optionType !== 2) {
		// 	toast.info('请选择选项类型');
		// 	return;
		// }
		if (data.categoryId <= 0) {
			toast.info('请选择题目分类');
			return;
		}
		if (data.options.length < 2) {
			toast.info('题目选项不能少于两个');
			return;
		}
		let isEmpty = false;
		data.options.forEach((v, i) => {
			if (!v || v.trim().length <= 0) {
				isEmpty = true;
			}
		});
		if (isEmpty) {
			toast.info('题目选项内容不能为空');
			return;
		}
		toast.modalLoading();
		if (data.topicType === 2) {//图片
			request.upload(config.api.baseURI + config.api.uploadImage, {
				uri: data.image.path,
				ext: 'jpg'
			}).then(res => {
				if (res.code === 0) {
					data.image = res.data;
					this.submitTopic(data)
				} else {
					toast.fail('上传失败')
				}
			}).catch()
		}
		else if (data.topicType === 3) {//音频
			request.upload(config.api.baseURI + config.api.uploadAudio, {
				uri: data.audio,
				ext: 'aac'
			}).then(res => {
				if (res.code === 0) {
					data.audio = res.data;
					this.submitTopic(data)
				} else {
					toast.fail('上传失败')
				}
			}).catch()
		}
		else if (data.topicType === 4) {//视频
			// console.log(data.video)
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
				return request.upload(config.api.baseURI + config.api.uploadVideo, {
					uri: data.video.path,
					ext: 'mp4'
				}).then(res => {
					if (res.code === 0) {
						let video = {
							thumb: thumb,
							width: data.video.thumb.width,
							height: data.video.thumb.height,
							path: res.data
						};
						data.video = JSON.stringify(video);
						this.submitTopic(data)
					} else {
						toast.fail('上传视频文件失败')
					}
				}).catch(e => {
					toast.fail('上传视频文件失败')
				})
			}).catch(e => toast.fail('上传视频文件失败'))
			
		}
		else {
			this.submitTopic(data)
		}
	};
	
	submitTopic = data => {
		data.content = Emoticons.stringify(data.content);
		request.post(config.api.baseURI + config.api.topicInsert, data)
			.then(res => {
				toast.modalLoadingHide()
				if (res.code === 0) {
					TopicList.fetchNewTopicWithRefreshing();
					toast.success('发布成功');
					navigate.pop();
				}
			}).catch()
	};
	
	getCategory = () => {
		request.post(config.api.baseURI + config.api.getCategory)
			.then(res => {
				if (res.code === 0) {
					this.setState({
						category: res.data
					})
					config.setTopicCategory(res.data)
				}
			}).catch()
	};
	
	onChangeText = text => {
		let remainLength = MAX_LENGTH - text.length;
		this.setState({
			text,
			remainLength
		})
	};
	
	renderInput = () => {
		return (
			<View style={{height: COMPOSER_HEIGHT}}>
				<TextInput
					ref={component => this._textInput = component}
					style={styles.textInput}
					onChangeText={this.onChangeText}
					value={this.state.text}
					autoCapitalize={'none'}
					returnKeyType={'done'}
					maxLength={MAX_LENGTH}
					blurOnSubmit={true}
					multiline={true}
					textInputAutoFocus={true}
					placeholder={'你希望了解对方什么？支持图文、音频和视频内容，脑洞有多大，舞台就有多大~'}
					// onSubmitEditing={this.props.onSubmitEditing}
					// onChange={this.onContentSizeChange}
					// onContentSizeChange={this.onContentSizeChange}
					enablesReturnKeyAutomatically
					underlineColorAndroid="transparent"
					selection={this.state.selection}
					onSelectionChange={({nativeEvent: {selection}}) => {
						this.setState({selection});
					}}
					// onFocus={_ => this.onTogglePress(false, true)}
					// onBlur={_ => this.onTogglePress(undefined, false)}
				/>
				<Text style={{
					color: this.state.remainLength <= 0 ? 'red' : styleUtil.primaryColor,
					textAlign: 'right'
				}}>{this.state.remainLength}</Text>
			</View>
		)
	}
	showAction = () => {
		let items = [
			{
				title: '图片',
				onPress: _ => config.loadData(_ => this.selectLibrary('photo'))
			},
			{
				title: '视频',
				onPress: _ => config.loadData(_ => this.selectLibrary('video'))
			},
			{
				title: '录音',
				onPress: _ => navigate.push(SoundRecord, {
					updateSelectedAudio: this.updateSelectedAudio,
					playAudio: this.playAudio,
					stopAudio: this.stopAudio
				})
			}
		];
		let cancelItem = {title: '取消'};
		ActionSheet.show(items, cancelItem);
	}
	
	updateSelectedImage = (media) => {
		let mimeIndex = MEDIA_TYPE.indexOf(media.mime);
		if (mimeIndex < 0) {
			Alert.alert('不是有效的文件格式');
			return;
		}
		this.setState({
			selectedImage: media,
			topicType: 2
		})
	};
	
	updateSelectedVideo = (media) => {
		let mimeIndex = MEDIA_TYPE.indexOf(media.mime);
		if (mimeIndex < 0) {
			Alert.alert('不是有效的文件格式');
			return;
		}
		
		this.setState({
			selectedVideo: media,
			topicType: 4
		})
	};
	
	updateSelectedAudio = (audioPath) => {
		this.setState({
			selectedAudio: audioPath,
			topicType: 3
		}, _ => {
			this.sound = null
		})
	};
	
	openCamera = () => {
		ImageCropPicker.openCamera({
			// cropping: true,
			// compressImageQuality: 0,
			loadingLabelText: '请稍等...'
		}).then(media => {
			// console.log(media.path);
			this.updateSelectedImage(media)
		}).catch(e => {
			if (e.code === 'E_PICKER_CANCELLED') {
				return
			}
			Alert.alert('出错啦')
		})
	};
	
	selectLibrary = (type = 'photo') => {
		ImageCropPicker.openPicker({
			multiple: false,
			// cropping: true,
			mediaType: type,
			// compressVideoPreset: 'HighestQuality',
			compressImageQuality: Platform.OS === 'ios' ? 0 : 1,
			minFiles: MIN_FILES,
			maxFiles: MAX_FILES,
			loadingLabelText: '请稍等...'
		}).then(media => {
			// console.log(media);
			if (media.size > MAX_SIZE) {
				Alert.alert('文件大小不超过5M，当前大小：' + (media.size / 1024 / 1024).toFixed(2) + 'M');
				return
			}
			if (type === 'video') {
				RNThumbnail.get(media.path).then((result) => {
					// console.warn(result); // thumbnail path
					media.thumb = result;
					this.updateSelectedVideo(media)
				}).catch(e => {
					Alert.alert('获取视频文件失败')
				});
			} else {
				this.updateSelectedImage(media)
			}
		}).catch(err => {
			if (err.code === 'E_PICKER_CANCELLED') {
				return
			}
			Alert.alert('出错啦')
		})
	};
	
	compressVideo = (videoPath) => {
		RNThumbnail.get(videoPath).then((result) => {
			const width = result.width;
			const height = result.height;
			const options = {
				width: width,
				height: height,
				bitrateMultiplier: 7,
				saveToCameraRoll: false, // default is false, iOS only
				saveWithCurrentDate: false, // default is false, iOS only
				minimumBitrate: 300000,
				removeAudio: false, // default is false
			};
			// console.warn(result)
			ProcessingManager.compress(videoPath, options).then((data) => {
				// console.warn(data)
				const media = {
					width: width,
					height: height,
					thumb: result,
					path: data,
					mime: 'video/mp4'
				};
				toast.modalLoadingHide();
				this.updateSelectedVideo(media)
			}).catch(e => {
				console.log(e)
			})
			
		}).catch(e => {
			Alert.alert('获取视频文件失败')
		});
	};
	
	onImagePress = (ref) => {
		let pressView = this.refs[ref];
		pressView.measure((x, y, width, height, pageX, pageY) => {
			let overlayView = (
				<Overlay.PopView
					style={{}}
					containerStyle={{flex: 1}}
					overlayOpacity={1}
					type='custom'
					customBounds={{x: pageX, y: pageY, width, height}}
					ref={v => this.fullImageView = v}
				>
					<AlbumView
						style={{flex: 1}}
						control={false}
						images={[{uri: this.state.selectedImage.path}]}
						thumbs={[{uri: this.state.selectedImage.path}]}
						defaultIndex={0}
						onPress={_ => this.fullImageView && this.fullImageView.close()}
					/>
					<StatusBar animated={false} hidden={true}/>
				</Overlay.PopView>
			);
			Overlay.show(overlayView);
		});
	};
	
	clearMedia = () => {
		if (this.state.selectedAudio) {
			if (this.sound) {
				setTimeout(_ => {
					this.sound.stop();
					this.sound = null;
				}, 100);
			}
		}
		else if (this.state.selectedVideo) {
			if (this.video) {
				this.video.stop();
				this.video = null;
			}
		}
		this.setState({
			selectedImage: null,
			selectedAudio: null,
			selectedVideo: null,
			topicType: 1
		})
	};
	
	renderBadge = () => (
		<TouchableOpacity
			style={{
				position: 'absolute',
				top: -8,
				right: -8,
				zIndex: 99,
			}}
			onPress={_ => this.clearMedia()}
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
	);
	
	renderAddButton = () => (
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
	);
	
	renderSelected = () => {
		let {
			selectedImage,
			selectedAudio,
			selectedVideo
		} = this.state;
		if (!this.state.selectedImage &&
			!this.state.selectedAudio &&
			!this.state.selectedVideo) {
			return this.renderAddButton()
		}
		return (
			<View style={styles.thumbs}>
				{this.renderBadge()}
				{selectedImage && this.renderSelectedImage(selectedImage)}
				{selectedAudio && this.renderSelectedAudio(selectedAudio)}
				{selectedVideo && this.renderSelectedVideo(selectedVideo)}
			</View>
		)
	};
	
	renderSelectedImage = (selectedImage) => {
		return (
			<TouchableOpacity
				ref={'selectedImage'}
				style={{flex: 1}}
				onPress={() => this.onImagePress('selectedImage')}>
				<Image style={{width: null, height: null, flex: 1}} source={{uri: selectedImage.path}} resizeMode='cover'/>
			</TouchableOpacity>
		)
	};
	
	stopAudio = () => {
		if (this.sound) {
			this.sound.stop();
		}
	};
	
	playAudio = (audio) => {
		if (!audio) {
			return;
		}
		this.sound = null;
		Sound.setCategory('Playback');
		// console.warn(audio)
		// These timeouts are a hacky workaround for some issues with react-native-sound.
		// See https://github.com/zmxv/react-native-sound/issues/89.
		setTimeout(() => {
			if (!this.sound) {
				this.sound = new Sound(audio, '', (error) => {
					if (error) {
						Alert.alert('发生错误');
					}
					// console.log('duration in seconds: ' + this.sound.getDuration() + 'number of channels: ' + this.sound.getNumberOfChannels());
				});
			}
			setTimeout(() => {
				// console.log(this.sound.isPlaying())
				this.sound.play((success) => {
					// console.warn(success)
					if (!success) {
						Alert.alert('播放失败');
						// this.sound.reset();
					}
				});
			}, 100)
		}, 100);
	};
	
	renderSelectedAudio = () => {
		return (
			<TouchableOpacity
				style={styles.button}
				onPress={_ => this.playAudio(this.state.selectedAudio)}
			>
				<Icon
					name={'file-music'}
					type={'material-community'}
					size={50}
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
	
	
	renderOptions = () => {
		return (
			<View style={{
				flexDirection: 'row',
				// justifyContent:'center',
				// alignItems:'center',
				padding: 10
			}}>
				<Label
					text={'选项 :'}
					style={{
						paddingRight: 15,
						paddingTop: 8
					}}/>
				<View>
					{
						this.state.options.map((v, i, arr) => (
							<View
								key={i}
								style={{
									flexDirection: 'row',
									alignItems: 'flex-start'
								}}>
								<Input
									style={{
										width: styleUtil.window.width - 120,
										marginBottom: 5,
										marginRight: 15
									}}
									maxLength={50}
									// multiline={true}
									blurOnSubmit={true}
									value={v}
									onChangeText={text => {
										arr[i] = text
										this.setState({options: arr})
									}}
									// onFocus={_ => this.onTogglePress(false, true)}
									// onBlur={_ => this.onTogglePress(undefined, false)}
								/>
								<Icon
									name={'delete-forever'}
									size={30}
									containerStyle={{paddingTop: 2}}
									underlayColor={'transparent'}
									onPress={_ => {
										if (arr.length > MIN_OPTIONS) {
											arr.splice(i, 1);
											this.setState({options: arr})
										} else {
											toast.message('选项不能少于两个')
										}
									}}
								/>
							</View>
						))
					}
					{
						this.state.options.length < MAX_OPTIONS && <Button
							size={'md'}
							style={{
								backgroundColor: styleUtil.themeColor,
								borderColor: styleUtil.themeColor,
								paddingTop: 0,
								paddingBottom: 0,
								paddingLeft: 0,
								paddingRight: 0,
								width: 70
							}}
							onPress={_ => {
								let options = this.state.options;
								if (options.length < MAX_OPTIONS) {
									options.push('');
									this.setState({options})
								}
							}}>
							<Icon
								name={'ios-add'}
								type={'ionicon'}
								color={'white'}
								size={22}
								containerStyle={{paddingTop: 2}}
							/>
							<Label style={{color: 'white', paddingLeft: 5}} text='新增'/>
						</Button>
					}
				</View>
			</View>
		)
	};
	
	selectOptionType = () => {
		let items = [
			{
				title: '单选',
				onPress: _ => this.setState({optionType: 1})
			},
			{
				title: '多选',
				onPress: _ => this.setState({optionType: 2})
			}
		];
		config.showAction(items)
	};
	
	selectLimitType = () => {
		let items = [
			{
				title: '不限',
				onPress: _ => this.setState({limitType: 0})
			},
			{
				title: '限男生',
				onPress: _ => this.setState({limitType: 1})
			},
			{
				title: '限女生',
				onPress: _ => this.setState({limitType: 2})
			},
		];
		config.showAction(items)
	};
	
	renderCategory = () => {
		OverlayModal.show(
			<CategoryPicker
				category={this.state.category}
				selectedId={this.state.categoryId}
				onDone={v => {
					this.setState({
						categoryId: v.id,
						categoryName: v.name
					})
				}}
			/>
		)
	};
	
	onContentSizeChange = (width, height) => {
		// console.log(width,height,styleUtil.window.height)
		if (!this.props.isFocused) {
			return;
		}
		let y = 0;
		if (height > styleUtil.window.height) {
			y = height - styleUtil.window.height + 70
		}
		this._scrollPage && this._scrollPage.scrollTo({y, animated: true})
	};
	
	render() {
		return (
			<View style={styleUtil.container}>
				{this.renderNavBar()}
				<ScrollView
					ref={ele => this._scrollPage = ele}
					scrollEventThrottle={16}
					keyboardDismissMode={Platform.OS === 'ios' ? 'on-drag' : 'none'}
					keyboardShouldPersistTaps={'handled'}
					onContentSizeChange={this.onContentSizeChange}
					// onTouchStart={_ => this.onTogglePress(false, undefined)}
					style={styleUtil.container}>
					<View style={styles.header}>
						<View style={styles.inputContainer}>
							{this.renderInput()}
						</View>
					</View>
					<View style={{marginTop: 10}}>
						<ListRow
							title={'选项类型'}
							detail={OPTION_TYPES[this.state.optionType]}
							onPress={this.selectOptionType}
							topSeparator={'full'}
						/>
						<ListRow
							title={'分类'}
							detail={this.state.categoryName}
							onPress={this.renderCategory}
						/>
						<ListRow
							title={'限制作答'}
							detail={LIMIT_TYPES[this.state.limitType]}
							onPress={this.selectLimitType}
						/>
						<ListRow
							title={'是否匿名发布'}
							detail={
								<Switch
									value={this.state.isHidden}
									onValueChange={isHidden => this.setState({isHidden})}
								/>
							}
							bottomSeparator={'full'}
						/>
					</View>
					<View style={{
						flexDirection: 'row',
						alignItems: 'center',
						padding: 10
					}}>
						<Label text={'多媒体(可选) '} style={{marginRight: 10}}/>
						{this.renderSelected()}
					</View>
					{this.renderOptions()}
				</ScrollView>
			</View>
		)
	}
}

const styles = StyleSheet.create({
	header: {
		backgroundColor: 'white',
		paddingLeft: 10,
		paddingRight: 10,
		borderBottomWidth: styleUtil.borderSeparator,
		borderBottomColor: '#ccc',
	},
	inputContainer: {
		// borderBottomWidth: 0.5,
		// borderBottomColor: '#ccc',
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
	},
	button: {
		flex: 1,
		borderWidth: 0,
		width: THUMBS_SIZE,
		height: THUMBS_SIZE,
		borderColor: styleUtil.themeColor,
		backgroundColor: 'transparent',
		justifyContent: 'center',
		alignItems: 'center'
	}
});