import React from 'react'
import {
	View,
	Image,
	Switch
} from 'react-native'
import NavigatorPage from "../../components/NavigatorPage";
import ScrollPage from "../../components/ScrollPage";
import {ListRow} from 'teaset'
import config from "../../common/config";
import request from "../../common/request";
import navigate from "../../screens/navigate";
import EditName from "../../components/EditName";
import EditTextArea from "./profile/EditTextArea";
import ImageCropPicker from "react-native-image-crop-picker";
import {Circle} from 'react-native-progress';
import ImageCached from "../../components/ImageCached";

export default class EditTopicLibrary extends NavigatorPage {
	static defaultProps = {
		...NavigatorPage.navigatorStyle,
		title: '编辑歌单信息'
	};
	
	constructor(props) {
		super(props);
		Object.assign(this.state, {
			uploadProgressBackground: 0,
			isUploadingBackground: false,
			info: props.info
		})
	}
	
	_upload = (res) => {
		// console.log(res)
		let newState = {}
		newState.uploadProgressBackground = 0;
		newState.isUploadingBackground = true;
		this.setState(newState)
		request.upload(config.api.baseURI + config.api.uploadImage, {
			uri: res.path,
			ext: 'jpg'
		}, xhr => {
			if (xhr.upload) {
				xhr.upload.onprogress = (ev => {
					if (ev.lengthComputable) {
						let percent = Number((ev.loaded / ev.total).toFixed(2));
						this.setState({
							uploadProgressBackground: percent
						})
					}
				})
			}
		}).then(res => {
			// console.log(res)
			if (res.code === 0) {
				newState.uploadProgressBackground = 0;
				newState.isUploadingBackground = false;
				newState.cover = res.data;
				this.setState(newState)
				this.submit(res.data, 'cover')
			}
		}).catch(err => {
			// console.warn(err)
			newState.uploadProgressBackground = 0;
			newState.isUploadingBackground = false;
			this.setState(newState)
		})
	}
	
	openCamera = () => {
		ImageCropPicker.openCamera({
			// cropping: true,
			// compressImageQuality: 1
		}).then(image => {
			// console.log(image.path);
			this._upload(image)
		});
	}
	
	selectLibrary = () => {
		ImageCropPicker.openPicker({
			multiple: false,
			// cropping: true,
			mediaType: 'photo',
			// compressImageQuality: 0,
			minFiles: 1,
			maxFiles: 1,
		}).then(image => {
			this._upload(image)
		}).catch(err => {
			if (err.code === 'E_PICKER_CANCELLED') {
				return
			}
			alert('出错啦~')
		})
	}
	
	showAction = () => {
		let items = [
			{title: '拍照', onPress: _ => this.openCamera()},
			{title: '从相册中选取', onPress: _ => this.selectLibrary()}
		];
		config.showAction(items)
	};
	
	submit = (text, type) => {
		if (!text || !text.trim()) {
			return;
		}
		let info = this.state.info;
		text = text.trim();
		let data = {libraryId: info.id};
		data[type] = text;
		request.post(config.api.baseURI + config.api.updateTopicLibrary, data)
			.then(res => {
				if (res.code === 0) {
					config.removeTopicLibraryList();
					info[type] = text;
					this.setState({info})
					if (type !== 'cover') {
						navigate.pop();
					}
				}
			})
	};
	
	renderPage() {
		let {isUploadingBackground, uploadProgressBackground, info} = this.state;
		return (
			<ScrollPage>
				<View style={{marginTop: 20}}>
					<ListRow
						title={'更换封面'}
						detail={isUploadingBackground ?
							<Circle
								size={45}
								showsText={true}
								progress={uploadProgressBackground}
							/> :
							!info.cover ? '未设置' :
								<ImageCached
									style={{width: 50, height: 50}}
									source={{uri: info.cover}}
								/>
						}
						topSeparator={'full'}
						bottomSeparator={'full'}
						onPress={_ => this.showAction('background')}
					/>
				</View>
				<View style={{marginTop: 20}}>
					<ListRow
						title={'标题'}
						detail={info.title}
						topSeparator={'full'}
						onPress={_ => navigate.push(EditName, {
							text: info.title || '',
							title: '题库标题',
							submit: text => this.submit(text, 'title')
						})}
					/>
					<ListRow
						title={'介绍'}
						detail={info.description}
						bottomSeparator={'full'}
						onPress={_ => navigate.pushNotNavBar(EditTextArea, {
							text: info.description || '',
							title: '题库介绍',
							maxLength: 500,
							submit: text => this.submit(text, 'description')
						})}
					/>
				</View>
			</ScrollPage>
		)
	}
}