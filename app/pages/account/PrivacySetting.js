import React from 'react'
import {
	StyleSheet,
	Text,
	View,
	Switch,
	Picker,
	Platform
} from 'react-native'

import {ListRow} from 'teaset'
import ScrollPage from "../../components/ScrollPage";
import styleUtil from "../../common/styleUtil";
import OverlayModal from "../../components/OverlayModal";
import utils from "../../common/utils";
import PickerHeader from "../../components/PickerHeader";
import TabNavBar from "../../screens/TabNavBar";
import request from "../../common/request";
import {GeoLocation} from "../../../App";
// import {Geolocation} from "react-native-amap-geolocation";

const actionTitle = {
	all: '所有人',
	myFollow: '我关注的人',
	myFriend: '我的好友',
	mySelf: '仅自己'
};

export default class PrivacySetting extends React.Component {
	static navigatorStyle = {
		title: '隐私设置'
	};
	
	constructor(props) {
		super(props)
		this.actionItems = attr => ([
			{
				title: actionTitle.all, onPress: _ => {
					this.setShowAction(attr, 'all')
				}
			},
			{
				title: actionTitle.myFollow, onPress: _ => {
					this.setShowAction(attr, 'myFollow')
				}
			},
			{
				title: actionTitle.myFriend, onPress: _ => {
					this.setShowAction(attr, 'myFriend')
				}
			},
			{
				title: actionTitle.mySelf, onPress: _ => {
					this.setShowAction(attr, 'mySelf')
				}
			},
		]);
		this.state = {
			nearby: true,
			user: config.user
		}
	}
	
	componentDidMount() {
		this.getGeoLocation()
		if (GeoLocation) {
			GeoLocation.addLocationListener(location => {
				// console.warn(location)
				GeoLocation.stop();
				request.post(config.api.baseURI + config.api.addGeoLocation, {
					latitude:location.latitude,
					longitude:location.longitude
				}).then(res => {}).catch()
			})
		}
		
	}
	
	componentWillUnmount() {
		if (GeoLocation) {
			GeoLocation.removeLocationListener();
			GeoLocation.stop()
		}
	}
	
	getGeoLocation = () => {
		request.post(config.api.baseURI + config.api.getGeoLocation)
			.then(res => {
				if (res.code === 0) {
					this.setState({nearby:res.data})
				}
			}).catch()
	};
	
	showSimilar = () => {
		let user = this.state.user;
		OverlayModal.show(
			<SimilarPicker selected={user.verifySimilar}
			               onDone={this.updateUser}/>
		)
	};
	
	updateUser = selected => {
		let user = this.state.user;
		request.post(config.api.baseURI + config.api.updateInfo, {
			verifySimilar: selected
		}).then(res => {
			if (res.code === 0) {
				user.verifySimilar = selected;
				this.setState({
					user
				});
				TabNavBar.updateUser(user)
			}
		});
	};
	
	setShowAction = (attr, type) => {
		let user = config.user
		user[attr] = type
		this.setState({user})
		TabNavBar.updateUser(user)
	}
	
	showAction = (attr) => {
		config.showAction(this.actionItems(attr))
	};
	
	removeGeoLocation = (nearby) => {
		this.setState({nearby});
		if (nearby) {
			if (Platform.OS === 'ios') {
				this.getCurrentPosition()
			} else {
				GeoLocation.start();
			}
		} else {
			request.post(config.api.baseURI + config.api.removeGeoLocation)
				.then(res => {
				
				}).catch()
		}
	};
	
	getCurrentPosition = () => {
		navigator.geolocation.getCurrentPosition(
			(position) => {
				let latitude = Math.abs(position.coords.latitude);
				let longitude = Math.abs(position.coords.longitude);
				this.position = position;
				request.post(config.api.baseURI + config.api.addGeoLocation, {
						latitude,
						longitude
					}).then(res => {}).catch()
			},
			(error) => alert(error.message),
			{enableHighAccuracy: true, timeout: 20000, maximumAge: 1000}
		);
	};
	
	render() {
		let user = this.state.user
		return (
			<ScrollPage>
				<View style={styleUtil.listSpace}>
					<ListRow
						title={'加我为好友时需要满足多少相似度'}
						detail={(user.verifySimilar >= 0 ? user.verifySimilar : 80) + '%'}
						topSeparator={'full'}
						bottomSeparator={'full'}
						onPress={this.showSimilar}
					/>
				</View>
				<Text style={{
					paddingTop: 10,
					paddingBottom: 10,
					paddingLeft: 15,
					color: styleUtil.detailTextColor
				}}>附近</Text>
				{/*<ListRow*/}
					{/*title={'谁可以看到我的个人信息'}*/}
					{/*detail={actionTitle[user.showAbout]}*/}
					{/*topSeparator={'full'}*/}
					{/*onPress={_ => this.showAction('showAbout')}*/}
				{/*/>*/}
				{/*<ListRow*/}
					{/*title={'谁可以看到我出的题目'}*/}
					{/*detail={actionTitle[user.showTopic]}*/}
					{/*onPress={_ => this.showAction('showTopic')}*/}
				{/*/>*/}
				{/*<ListRow*/}
					{/*title={'谁可以看到我的动态'}*/}
					{/*detail={actionTitle[user.showDynamic]}*/}
					{/*onPress={_ => this.showAction('showDynamic')}*/}
				{/*/>*/}
				<ListRow
					title={'其他人可以在 "附近" 查看到我'}
					detail={<Switch value={this.state.nearby}
					                onValueChange={nearby => this.removeGeoLocation(nearby)}/>}
					topSeparator={'full'}
					bottomSeparator={'full'}
				/>
			</ScrollPage>
		)
	}
}

class SimilarPicker extends React.Component {
	constructor(props) {
		super(props)
		const similarArr = utils.generateSerialNumArray(50, 100)
		similarArr.unshift(0)
		this.state = {
			selected: props.selected >= 0 ? props.selected : 80,
			similarArr
		}
	}
	
	onChange = (selected) => {
		this.setState({selected}, _ => this.props.onChange && this.props.onChange(selected))
	};
	
	render() {
		const {
			selected,
			similarArr
		} = this.state
		return (
			<View style={{backgroundColor: 'white'}}>
				<PickerHeader
					onCancel={_ => OverlayModal.hide()}
					onDone={_ => {
						OverlayModal.hide()
						this.props.onDone && this.props.onDone(selected)
					}}
				/>
				<View style={{
					flexDirection: 'row'
				}}>
					<Picker
						style={{width: styleUtil.window.width}}
						selectedValue={selected}
						onValueChange={this.onChange}>
						{
							similarArr.map((v, i) => (
								<Picker.Item key={i}
								             label={v + '%'}
								             value={v}/>
							))
						}
					</Picker>
				</View>
			</View>
		)
	}
}