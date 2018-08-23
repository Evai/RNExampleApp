import React from 'react'
import {
	StyleSheet,
	Text,
	View,
	Switch,
} from 'react-native'

import {ListRow} from 'teaset'
import ScrollPage from "../../components/ScrollPage";
import styleUtil from "../../common/styleUtil";
import JPushModule from 'jpush-react-native';
import request from "../../common/request";
import TabNavBar from "../../screens/TabNavBar";

export default class MessageSetting extends React.Component {
	static navigatorStyle = {
		title: '消息设置'
	};
	
	constructor(props) {
		super(props);
		this.state = {
			notify: config.user.isNotify,
			showDetail: config.user.notifyShowDetail,
			sound: true,
			vibration: true
		}
	}
	
	componentWillMount() {
		if (config.user.vibration) {
			this.setState({vibration: true})
		} else {
			this.setState({vibration: false})
		}
	}
	
	setVibration = (vibration) => {
		this.setState({vibration});
		let user = config.user;
		user.vibration = vibration;
		TabNavBar.updateUser(user);
	};
	
	setMessageNotify = (value, type) => {
		if (!type) {
			return;
		}
		let data = {};
		let user = config.user;
		if (type === 'notify') {
			data.isNotify = value;
			this.setState({
				notify: value
			});
			user.isNotify = value;
			if (value) {
				JPushModule.resumePush();
			} else {
				JPushModule.stopPush();
			}
		} else if (type === 'showDetail') {
			data.notifyShowDetail = value;
			this.setState({
				showDetail: value
			});
			user.notifyShowDetail = value;
		} else {
			return;
		}
		
		request.post(config.api.baseURI + config.api.updateInfo, data)
			.then(res => {
					if (res.code === 0) {
						TabNavBar.updateUser(user);
					}
			}).catch()
	};
	
	render() {
		const user = config.user;
		return (
			<ScrollPage>
				<View style={styleUtil.listSpace}>
					<ListRow
						style={{marginLeft: 5}}
						title={'新消息通知'}
						detail={<Switch value={this.state.notify}
						                onValueChange={notify => this.setMessageNotify(notify, 'notify')}/>}
						topSeparator={'full'}
					/>
					<ListRow
						style={{marginLeft: 5}}
						title={'通知消息是否显示详情'}
						detail={<Switch value={this.state.showDetail}
						                onValueChange={showDetail => this.setMessageNotify(showDetail, 'showDetail')}/>}
						bottomSeparator={'full'}
					/>
				</View>
				<Text style={{
					paddingTop: 10,
					paddingBottom: 10,
					paddingLeft: 15,
					color: styleUtil.detailTextColor
				}}>应用打开时</Text>
				{/*<ListRow*/}
				{/*style={{marginLeft: 5}}*/}
				{/*title={'声音'}*/}
				{/*detail={<Switch value={this.state.sound}*/}
				{/*onValueChange={sound => this.setState({sound})}/>}*/}
				{/*topSeparator={'full'}*/}
				{/*/>*/}
				<ListRow
					style={{marginLeft: 5}}
					title={'振动'}
					detail={<Switch value={this.state.vibration}
					                onValueChange={vibration => this.setVibration(vibration)}/>}
					topSeparator={'full'}
					bottomSeparator={'full'}
				/>
			</ScrollPage>
		)
	}
}