import React from 'react'
import {
	View,
	Text,
	StyleSheet, Alert
} from 'react-native'
import NavigatorPage from "../../components/NavigatorPage";
import ScrollableTabView from 'react-native-scrollable-tab-view'
import styleUtil from "../../common/styleUtil";
import NavBar from "../../components/NavBar";
import TabBar from "../../components/tabbar/TabBar";
import SystemMessageList from "./SystemMessageList";
import config from "../../common/config";
import TopicDetail from "../home/TopicDetail";
import DynamicDetail from "./DynamicDetail";
import TopicLibraryDetail from "../account/TopicLibraryDetail";
import SystemNoticeList from "./SystemNoticeList";
import NoticeDetail from "./NoticeDetail";
import {EVENTS} from "../../common/IMessage";


export default class SystemNoticeIndex extends React.Component {
	static navigatorStyle = {
		title: '消息通知',
		autoKeyboardInsets: false,
	};
	
	constructor(props) {
		super(props);
		this.state = {
			tabs: [
				{
					name: '题目',
					component: TopicDetail,
					noticeType: EVENTS.TOPIC_NOTICE,
					badgeCount: 0,
					uri: config.api.baseURI + config.api.getTopicCommentNotice,
					addCommentUri: config.api.baseURI + config.api.addTopicComment,
					removeCommentUri: config.api.baseURI + config.api.removeTopicComment,
				},
				{
					name: '动态',
					component: DynamicDetail,
					noticeType: EVENTS.DYNAMIC_NOTICE,
					badgeCount: 0,
					uri: config.api.baseURI + config.api.getDynamicCommentNotice,
					addCommentUri: config.api.baseURI + config.api.addDynamicComment,
					removeCommentUri: config.api.baseURI + config.api.removeDynamicComment
				},
				{
					name: '题库',
					badgeCount: 0,
					noticeType: EVENTS.TOPIC_LIBRARY_NOTICE,
					component: TopicLibraryDetail,
					uri: config.api.baseURI + config.api.getTopicLibraryCommentNotice,
					addCommentUri: config.api.baseURI + config.api.addTopicLibraryComment,
					removeCommentUri: config.api.baseURI + config.api.removeTopicLibraryComment
				},
				{
					name: '通知',
					badgeCount: 0,
					noticeType: EVENTS.SYSTEM_NOTICE,
					component: NoticeDetail,
					uri: config.api.baseURI + config.api.getSystemNotice,
				},
			],
			activeIndex: 0,
			fromIndex: 0,
		}
	}
	
	componentDidMount() {
		const noticeList = this.props.noticeList;
		if (noticeList && noticeList.length > 0) {
			// noticeType
			const tabs = [...this.state.tabs];
			noticeList.forEach((v, i) => {
				tabs.forEach((item, index) => {
					if (item.noticeType === v.noticeType) {
						tabs[index].badgeCount += 1;
					}
				})
			});
			this.setState({
				tabs
			})
		}
	}
	
	componentWillUnmount() {
	}
	
	onChangeTab = ({i, ref, from}) => {
		const tabs = this.state.tabs;
		tabs[i].badgeCount = 0;
		this.setState({
			activeIndex: i,
			fromIndex: from,
			tabs
		});
	};
	
	renderTabBar = props => {
		return (
			<TabBar
				backgroundColor={'white'}
				textStyle={styles.label}
				activeTextColor={styleUtil.activeTextColor}
				inactiveTextColor={styleUtil.inactiveTextColor}
				underlineStyle={styleUtil.underlineStyle}
				fromIndex={this.state.fromIndex}
				tabContainerWidth={styleUtil.window.width}
				style={{
					paddingTop: 5,
					borderBottomWidth: styleUtil.borderSeparator,
					borderBottomColor: styleUtil.borderColor
				}}
				{...props}
				badgeStyle={{right: 5}}
				tabList={this.state.tabs}
			/>
		)
	};
	
	render() {
		return (
			<ScrollableTabView
				tabBarPosition={'top'}
				renderTabBar={this.renderTabBar}
				onChangeTab={this.onChangeTab}
				initialPage={0}
			>
				{this.state.tabs.map((v, i) => {
						if (i !== 3) {
							return <SystemMessageList
								{...this.props}
								key={v.name}
								tabLabel={v.name}
								activeIndex={this.state.activeIndex}
								uri={v.uri}
								component={v.component}
								addCommentUri={v.addCommentUri}
								removeCommentUri={v.removeCommentUri}
							/>
						} else {
							return <SystemNoticeList
								key={v.name}
								tabLabel={v.name}
								activeIndex={this.state.activeIndex}
								uri={v.uri}
								component={v.component}
							/>
						}
					}
				)}
			</ScrollableTabView>
		)
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: styleUtil.backgroundColor
	},
	label: {
		fontSize: 14,
		fontWeight: '700',
	}
});