import React from 'react'

import {
	StyleSheet,
	ScrollView,
	View,
	Alert,
	Text,
	Platform
} from 'react-native'
import styleUtil from "../../../common/styleUtil";
import {ListRow} from 'teaset'
import {Avatar, Icon} from 'react-native-elements'
import utils from "../../../common/utils";
import ImageCropPicker from "react-native-image-crop-picker";
import TabNavBar from "../../../screens/TabNavBar";
import navigate from "../../../screens/navigate";
import EditName from "../../../components/EditName";
import AreaPicker from "../../../components/AreaPicker";
import OverlayModal from "../../../components/OverlayModal";
import DatePicker from "../../../components/DatePicker";
import EditTextArea from "./EditTextArea";
import UserQRCode from "./UserQRCode";
import toast from "../../../common/toast";
import {Circle} from 'react-native-progress';
import request from "../../../common/request";
import config from "../../../common/config";
import ImageCached from "../../../components/ImageCached";
import UpdatePhone from "../UpdatePhone";
import UpdatePassword from "../UpdatePassword";


export default class UserEdit extends React.Component {
	static navigatorStyle = {
		title: '我的资料'
	};
	
	constructor(props) {
		super(props)
		this.state = {
			user: config.user,
			uploadProgressAvatar: 0,
			uploadProgressBackground: 0,
			isUploadingAvatar: false,
			isUploadingBackground: false,
		}
		
	}
	
	componentWillMount() {
	
	}
	
	updateUser = (user, updateData = {}, callback) => {
		toast.modalLoading()
		request.post(config.api.baseURI + config.api.updateInfo, updateData)
			.then(res => {
				toast.modalLoadingHide()
				if (res.code === 0) {
					this.setState({user})
					TabNavBar.updateUser(user)
					this.props.updateUser(user)
					callback && callback()
				}
			}).catch(e => {
			toast.modalLoadingHide()
		})
	}
	
	_upload = (res, type) => {
		// console.warn(res)
		let newState = {}
		if (type === 'background') {
			newState.uploadProgressBackground = 0;
			newState.isUploadingBackground = true;
		} else {
			newState.uploadProgressAvatar = 0;
			newState.isUploadingAvatar = true;
		}
		this.setState(newState);
		request.upload(config.api.baseURI + config.api.uploadImage, {
			uri: res.path,
			ext: 'jpg'
		}, xhr => {
			if (xhr.upload) {
				xhr.upload.onprogress = (ev => {
					if (ev.lengthComputable) {
						let percent = Number((ev.loaded / ev.total).toFixed(2));
						if (type === 'background') {
							this.setState({
								uploadProgressBackground: percent
							})
						} else {
							this.setState({
								uploadProgressAvatar: percent
							})
						}
						
					}
				})
			}
		}).then(res => {
			// console.log(res)
			if (res.code === 0) {
				if (type === 'background') {
					newState.uploadProgressBackground = 0;
					newState.isUploadingBackground = false;
				} else {
					newState.uploadProgressAvatar = 0;
					newState.isUploadingAvatar = false;
				}
				this.setState(newState)
				let user = this.state.user
				user[type] = res.data;
				let obj;
				if (type === 'background') {
					obj = {background: res.data}
				} else {
					obj = {avatar: res.data}
				}
				this.updateUser(user, obj)
			} else {
				toast.fail(res.msg)
			}
		}).catch(err => {
			// console.warn(err)
			if (type === 'background') {
				newState.uploadProgressBackground = 0;
				newState.isUploadingBackground = false;
			} else {
				newState.uploadProgressAvatar = 0;
				newState.isUploadingAvatar = false;
			}
		})
	}
	
	openCamera = (type) => {
		ImageCropPicker.openCamera({
			cropping: true,
			// compressImageQuality: 1
		}).then(image => {
			// console.log(image.path);
			this._upload(image, type)
		});
	}
	
	selectLibrary = (type) => {
		ImageCropPicker.openPicker({
			multiple: false,
			// cropping: true,
			mediaType: 'photo',
			compressImageQuality: Platform.OS === 'ios' ? 0 : 1,
			minFiles: 1,
			maxFiles: 1,
		}).then(image => {
			this._upload(image, type)
		}).catch(err => {
			if (err.code === 'E_PICKER_CANCELLED') {
				return
			}
			alert('出错啦~')
		})
	}
	
	showAction = (type = 'avatar') => {
		let items = [
			{title: '拍照', onPress: _ => config.loadData(_ => this.openCamera(type))},
			{title: '从相册中选取', onPress: _ => config.loadData(_ => this.selectLibrary(type))}
		];
		config.showAction(items)
	}
	
	showDatePicker = () => {
		let user = this.state.user
		let arr = user.birth.split('-')
		OverlayModal.show(
			<DatePicker
				selectedYear={arr[0]}
				selectedMonth={arr[1]}
				selectedDate={arr[2]}
				onDone={arr => {
					user.birth = arr.join('-')
					this.updateUser(user, {birth: utils.formatBirth(arr)})
				}}
			/>
		)
	}
	
	showAreaPicker = () => {
		let user = this.state.user
		let arr = user.region ? user.region.split(',') : [,];
		OverlayModal.show(
			<AreaPicker
				selectedProvince={arr[0]}
				selectedCity={arr[1]}
				onDone={arr => {
					user.region = arr.join(',');
					this.updateUser(user, {region: user.region})
				}}
			/>
		)
	}
	
	formatRegion = (region) => {
		if (!region) {
			return '未填写'
		}
		const arr = region.split(',')
		if (arr[0] === '直辖市' || arr[0] === '特别行政区') {
			return arr[1]
		}
		return arr[0] + ' ' + arr[1]
	};
	
	submit = (text) => {
		if (!text || !text.trim()) {
			return;
		}
		let user = {...config.user};
		text = text.trim()
		user.username = text
		this.updateUser(user, {username: text.trim()}, _ => {
			navigate.pop()
		});
	};
	
	submitOccupation = text => {
		if (!text || !text.trim()) {
			return;
		}
		let user = {...config.user};
		text = text.trim()
		user.occupation = text
		this.updateUser(user, {occupation: text.trim()}, _ => {
			navigate.pop()
		});
	};
	
	submitSummary = text => {
		let user = {...config.user};
		user.summary = text
		this.updateUser(user, {summary: text})
		navigate.pop()
	};
	
	updateGender = user => {
		{
			let items = [
				{
					title: '男', onPress: _ => {
						user.gender = 1;
						Alert.alert('你当前选择的性别是：男', '性别修改后无法再次修改', [
							{text: '取消'},
							{
								text: '确定', onPress: _ => {
									this.updateUser(user, {gender: 1})
								}
							},
						])
					}
				},
				{
					title: '女', onPress: _ => {
						user.gender = 2;
						Alert.alert('你当前选择的性别是：女', '性别修改后无法再次修改', [
							{text: '取消'},
							{
								text: '确定', onPress: _ => {
									this.updateUser(user, {gender: 2})
								}
							},
						])
					}
				}
			];
			config.showAction(items)
		}
	};
	
	updatePhone = (body) => {
		toast.modalLoading();
		request.post(config.api.baseURI + config.api.updatePhone, body)
			.then(res => {
				toast.modalLoadingHide()
				if (res.code === 0) {
					let user = {...config.user};
					user.phone = body.phone;
					this.setState({user})
					TabNavBar.updateUser(user);
					toast.success('更换手机号成功');
					navigate.pop()
				}
			})
			.catch(err => {
				// console.warn(err)
				toast.modalLoadingHide()
				toast.fail('更换失败')
			})
	};
	
	updateAccount = (text) => {
		if (!text || !text.trim()) {
			Alert.alert('请填写账号');
			return;
		}
		text = text.trim();
		if (text.length < 4) {
			Alert.alert('账号长度必须大于4个字符');
			return;
		}
		if (utils.checkIsSymbol(text)) {
			Alert.alert('账号不能含有特殊字符');
			return;
		}
		if (utils.checkIsChinese(text)) {
			Alert.alert('账号不能含有中文汉字');
			return;
		}
		Alert.alert('账号一旦设置后不允许再修改，是否继续？', '', [
			{text: '取消'},
			{
				text: '确定', onPress: _ => {
					let user = {...config.user};
					user.account = text;
					this.updateUser(user, {account: text}, _ => {
						toast.success('修改成功');
						navigate.pop()
					});
				}
			},
		]);
	};
	
	updatePassword = (text) => {
		if (!text || !text.trim()) {
			return;
		}
		let user = {...config.user};
		text = text.trim();
		user.password = true;
		this.updateUser(user, {password: text.trim()}, _ => {
			toast.success('修改成功');
			navigate.pop()
		});
	}
	
	render() {
		let {user, isUploadingAvatar, uploadProgressAvatar, isUploadingBackground, uploadProgressBackground} = this.state;
		return (
			<ScrollView
				scrollEventThrottle={16}
			>
				<View style={styles.listRow}>
					<ListRow
						title={'头像'}
						detail={isUploadingAvatar ?
							<Circle
								size={45}
								showsText={true}
								progress={uploadProgressAvatar}
							/> :
							!user.avatar ? '未设置' :
								<ImageCached
									component={Avatar}
									medium
									rounded
									source={{uri: user.avatar}}
								/>
						}
						topSeparator={'full'}
						onPress={_ => this.showAction('avatar')}
					/>
					<ListRow
						title={'个人主页背景'}
						detail={isUploadingBackground ?
							<Circle
								size={45}
								showsText={true}
								progress={uploadProgressBackground}
							/> :
							!user.background ? '未设置' :
								<ImageCached
									onPress={false}
									// images={[user.background]}
									style={{width: 50, height: 50}}
									source={{uri: user.background}}
								/>
						}
						bottomSeparator={'full'}
						onPress={_ => this.showAction('background')}
					/>
				</View>
				<View style={styles.listRow}>
					<ListRow
						title={'账号'}
						detail={user.account ? user.account : '未设置'}
						topSeparator={'full'}
						onPress={user.account ? undefined : () => navigate.push(EditName, {
							text: config.user.account || '',
							title: '设置账号',
							maxLength: 30,
							explain: '4~30个字母和数字组成，不能含有特殊字符',
							submit: this.updateAccount
						})}
					/>
					<ListRow
						title={'密码'}
						detail={user.password ? '已设置' : '未设置'}
						onPress={_ => navigate.push(UpdatePassword, {
							submit: this.updatePassword
						})}
					/>
				</View>
				<View style={styles.listRow}>
					<ListRow
						title={'用户名'}
						detail={user.username}
						topSeparator={'full'}
						onPress={() => navigate.push(EditName, {
							text: config.user.username || '',
							title: '修改用户名',
							submit: this.submit
						})}
					/>
					<ListRow
						title={'性别'}
						detail={utils.getGender(user.gender)}
						onPress={user.gender !== 0 ? undefined : _ => this.updateGender(user)}
					/>
					<ListRow
						title={'手机号'}
						detail={user.phone}
						onPress={_ => navigate.push(UpdatePhone, {
							submit: this.updatePhone
						})}
					/>
					<ListRow
						title={'二维码'}
						detail={<Icon
							name={'qrcode'}
							type={'material-community'}
							color={styleUtil.detailTextColor}
							size={18}
						/>}
						bottomSeparator={'full'}
						onPress={() => navigate.push(UserQRCode, {
							uri: config.constant.qrUserIdUri + config.user._id,
							text: '扫一扫上面的二维码，加我好友',
							title: '我的二维码',
							avatar: [config.user.avatar],
							name: config.user.username || ''
						})}
					/>
				</View>
				<View style={[styles.listRow, {marginBottom: 10}]}>
					<ListRow
						title={'职业'}
						detail={<Text style={{
							color: styleUtil.detailTextColor
						}}>{user.occupation}</Text>}
						topSeparator={'full'}
						onPress={() => navigate.push(EditName, {
							text: config.user.occupation || '',
							title: '修改职业',
							submit: this.submitOccupation,
							placeholder: '如：律师、医生、会计等',
							maxLength: 20
						})}
					/>
					<ListRow
						title={'生日'}
						detail={<Text style={{
							color: styleUtil.detailTextColor
						}}>{utils.formatBirth(user.birth.split('-'))}</Text>}
						onPress={this.showDatePicker}
					/>
					<ListRow
						title={'地区'}
						detail={<Text style={{
							color: styleUtil.detailTextColor
						}}>{this.formatRegion(user.region)}</Text>}
						onPress={this.showAreaPicker}
					/>
					<ListRow
						title={'个人介绍'}
						detail={user.summary || '未填写'}
						bottomSeparator={'full'}
						onPress={() => navigate.pushNotNavBar(EditTextArea, {
							title: '修改个人介绍',
							submit: this.submitSummary,
							text: user.summary || ''
						})}
					/>
				</View>
			</ScrollView>
		)
	}
}


const styles = StyleSheet.create({
	listRow: {
		backgroundColor: 'white',
		marginTop: 20
	}
});