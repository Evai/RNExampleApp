'use strict'

import React from 'react';
import {
	View,
	StyleSheet,
} from 'react-native';
import styleUtil from "../../common/styleUtil";
import ScrollableTabView from 'react-native-scrollable-tab-view'
import TabBar from '../../components/tabbar/TabBar'
import NavigatorPage from "../../components/NavigatorPage";
import NavBar from "../../components/NavBar";
import {NavigationBar} from 'teaset'
import {Icon} from 'react-native-elements'

import TopicList from "./TopicList";
import navigate from "../../screens/navigate";
import Search from "../discovery/Search";

export default class HomeIndex extends NavigatorPage {
	static defaultProps = {
		...NavigatorPage.navigatorStyle,
		title: '首页',
		showBackButton: false,
		navBarHidden: true,
		navigationBarInsets: false,
		leftHidden: true
	};
	
	constructor(props) {
		super(props);
		let tabs = [
			{name: '最新', uri: config.api.baseURI + config.api.topicList},
			{name: '热门', uri: config.api.baseURI + config.api.getHotList},
		];
		if (props.leftHidden) {
			tabs.push({name: '关注', uri: config.api.baseURI + config.api.getFollowList})
		}
		Object.assign(this.state, {
			tabs,
			activeIndex: 0,
			fromIndex:0
		});
	}
	
	componentDidMount() {
	
	}
	
	componentWillUnmount() {
	}
	
	onChangeTab = ({i, ref, from}) => {
		if (this.state.activeIndex !== i) {
			this.setState({
				activeIndex: i,
				fromIndex:from
			});
		}
	};
	
	renderNavBar = props => {
		return (
			<NavBar
				renderTitleView={<TabBar
					backgroundColor={null}
					activeTextColor={styleUtil.activeTextColor}
					fromIndex={this.state.fromIndex}
					inactiveTextColor={styleUtil.inactiveTextColor}
					underlineStyle={styleUtil.underlineStyle}
					tabContainerWidth={210}
					style={{
						width: 210,
						paddingTop:10,
						borderBottomWidth:0
					}}
					{...props}
					tabs={this.state.tabs}
				/>}
				leftHidden={this.props.leftHidden}
				renderLeftView={this.props.renderLeftView}
				renderRightView={this.props.renderRightView}
			/>
		)
	};
	
	renderPage() {
		return (
			<ScrollableTabView
				tabBarPosition={'top'}
				renderTabBar={this.renderNavBar}
				onChangeTab={this.onChangeTab}
				initialPage={0}
			>
				{this.state.tabs.map((v, i) => (
					<TopicList
						key={v.name}
						{...this.props}
						tabLabel={v.name}
						uri={v.uri}
						activeIndex={this.state.activeIndex}
						leftHidden={this.props.leftHidden}
						getListType={this.props.getListType}
					/>
				))}
			</ScrollableTabView>
		);
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
	},
});