'use strict'

import React from 'react'
import {
	StyleSheet,
	Text,
	View,
	Alert
} from 'react-native'
import styleUtil from '../../common/styleUtil'
import NavigatorPage from "../../components/NavigatorPage";
import ScrollPage from "../../components/ScrollPage";
import {ListRow} from 'teaset'
import QRScanner from "../message/QRScanner";
import navigate from "../../screens/navigate";
import TopicCategory from "./TopicCategory";
import Search from "./Search";
import NearbyPeople from "./NearbyPeople";
import Rankings from "./Rankings";
import TopicLibrary from "./TopicLibrary";
import UserDynamicIndex from "./UserDynamicIndex";
import SubjectIndex from "./SubjectIndex";
import config from "../../common/config";
import PhoneLogin from "../account/PhoneLogin";

export default class DiscoveryIndex extends NavigatorPage {
	static defaultProps = {
		...NavigatorPage.navigatorStyle,
		title: '发现',
		showBackButton: false
	};
	
	constructor(props) {
		super(props)
		Object.assign(this.state, {})
	}
	
	componentDidMount() {
	
	}
	
	componentWillUnmount() {
	
	}
	
	
	renderPage() {
		return (
			<ScrollPage>
				<View style={{marginTop: 20}}>
					<ListRow
						title={'附近的人'}
						onPress={_ => {
							if (!config.user._id) {
								navigate.push(PhoneLogin)
							} else {
								config.getNearbyAlert().then(data => {
									if (!data) {
										Alert.alert(
											'',
											'该功能会获取你当前的地理位置，如果你之后不想让其他人查看到你的位置，可以前往 “我的” -> “隐私设置” 中关闭',
											[{
												text: '确认', onPress: _ => {
													config.setNearbyAlert();
													navigate.pushNotNavBar(NearbyPeople)
												}
											}]
										);
									} else {
										navigate.pushNotNavBar(NearbyPeople)
									}
								})
							}
						}}
						icon={require('../../assets/image/nearby.png')}
						topSeparator={'full'}
						bottomSeparator={'full'}
					/>
				</View>
				<View style={{marginTop: 20}}>
					<ListRow
						title={'新鲜事'}
						onPress={_ => navigate.pushNotNavBar(UserDynamicIndex)}
						icon={require('../../assets/image/news.png')}
						topSeparator={'full'}
						bottomSeparator={'indent'}
					/>
					<ListRow
						title={'话题'}
						onPress={_ => navigate.push(SubjectIndex)}
						icon={require('../../assets/image/topic.png')}
						bottomSeparator={'full'}
					/>
				</View>
				<View style={{marginTop: 20}}>
					<ListRow
						title={'每日推荐'}
						detail={'开发中，敬请期待'}
						// onPress={_ => {}}
						icon={require('../../assets/image/recommend.png')}
						topSeparator={'full'}
					/>
					<ListRow
						title={'题库'}
						onPress={_ => {
							navigate.pushNotNavBar(TopicLibrary)
						}}
						icon={require('../../assets/image/title.png')}
						bottomSeparator={'full'}
					/>
				</View>
				<View style={{marginTop: 20}}>
					<ListRow
						title={'周排行榜'}
						onPress={_ => navigate.pushNotNavBar(Rankings)}
						icon={require('../../assets/image/rankings.png')}
						topSeparator={'full'}
						bottomSeparator={'indent'}
					/>
					<ListRow
						title={'题目分类'}
						onPress={_ => navigate.pushNotNavBar(TopicCategory)}
						icon={require('../../assets/image/category.png')}
						bottomSeparator={'full'}
					/>
				</View>
				<View style={{marginTop: 20}}>
					<ListRow
						title={'扫一扫'}
						onPress={_ => navigate.push(QRScanner)}
						icon={require('../../assets/image/scan.png')}
						topSeparator={'full'}
						bottomSeparator={'indent'}
					/>
					<ListRow
						title={'搜一搜'}
						onPress={_ => navigate.pushNotNavBar(Search)}
						icon={require('../../assets/image/search.png')}
						bottomSeparator={'full'}
					/>
				</View>
			</ScrollPage>
		)
	}
}


const styles = StyleSheet.create({
	thumbsBox: {
		flex: 1,
		flexDirection: 'row',
		flexWrap: 'wrap',
		padding: 15
	},
	thumbs: {
		width: (styleUtil.window.width - 30 - 20) / 3,
		height: (styleUtil.window.width - 30 - 20) / 3,
		borderRadius: 8
	},
	title: {
		fontSize: 15,
		textAlign: 'center',
		margin: 8
	}
});