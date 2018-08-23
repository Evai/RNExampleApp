import React from 'react'
import {
	View,
	Text
} from 'react-native'
import ScrollPage from "../../components/ScrollPage";
import {ListRow} from 'teaset'
import utils from "../../common/utils";
import styleUtil from "../../common/styleUtil";
import navigate from "../../screens/navigate";
import DynamicDetail from "./DynamicDetail";
import {Avatar} from 'react-native-elements'
import NavigatorPage from "../../components/NavigatorPage";
import Emoticons from "../../components/emoticon/Emoticons";
import ImageCached from "../../components/ImageCached";

export default class FriendDynamicMsgList extends NavigatorPage {
	
	static defaultProps = {
		...NavigatorPage.navigatorStyle,
		title: '消息详情'
	};
	
	constructor(props) {
		super(props);
		Object.assign(this.state, {
			list: props.list || []
		})
	}
	
	componentDidMount() {
	
	}
	
	_renderRows = (item, index) => {
		return (
			<ListRow
				key={index}
				title={
					<View style={{
						marginLeft: 10,
						justifyContent: 'space-between',
						width:styleUtil.window.width - 150
					}}>
						<Text>{item.fromUser.username}</Text>
						<Text style={{
							color: styleUtil.detailTextColor,
							fontSize: 14,
							marginTop: 5
						}}>{Emoticons.parse(item.text)}</Text>
					</View>
				}
				titleStyle={{marginLeft: 10}}
				detail={utils.showTime(item.createdAt)}
				onPress={_ => {
					this.props.onPress && this.props.onPress(item)
				}}
				icon={<ImageCached
					component={Avatar}
					medium
					rounded
					source={config.defaultAvatar(item.fromUser.avatar)}
				/>}
				topSeparator={index === 0 ? 'full' : 'none'}
				bottomSeparator={index + 1 === this.props.list.length ? 'full' : 'indent'}
				accessory={'none'}
			/>
		)
	};
	
	renderPage() {
		return (
			<ScrollPage>
				{this.state.list.length === 0 && <Text style={{
					textAlign:'center',
					marginTop:15,
					color:'#C30'
				}}>
					暂无消息
				</Text>}
				{this.state.list.map((item, i) => (
					this._renderRows(item, i)
				))}
			</ScrollPage>
		)
	}
}