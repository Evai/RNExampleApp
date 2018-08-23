import React from 'react'
import {
	View,
	Text,
	StyleSheet
} from 'react-native'
import NavigatorPage from "../../components/NavigatorPage";
import ScrollableTabView from 'react-native-scrollable-tab-view'
import styleUtil from "../../common/styleUtil";
import UserListRow from "../../components/UserListRow";
import RankingUserList from "./RankingUserList";
import NavBar from "../../components/NavBar";
import TabBar from "../../components/tabbar/TabBar";


export default class Rankings extends NavigatorPage {
	static defaultProps = {
		...NavigatorPage.navigatorStyle,
		navBarHidden: true,
		navigationBarInsets: false,
	};
	
	constructor(props) {
		super(props);
		Object.assign(this.state, {
			tabs: [
				{name: '出题榜', uri: config.api.baseURI + config.api.getWriteTopicUsers},
				{name: '人气榜', uri: config.api.baseURI + config.api.getHotUsers},
				// {name: '参与榜', uri: config.api.baseURI + config.api.getHotList},
			],
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
					textStyle={styles.label}
					activeTextColor={styleUtil.activeTextColor}
					inactiveTextColor={styleUtil.inactiveTextColor}
					underlineStyle={styleUtil.underlineStyle}
					fromIndex={this.state.fromIndex}
					tabContainerWidth={210}
					style={{
						width: 210,
					}}
					{...props}
					tabs={this.state.tabs}
				/>}
				leftHidden={this.props.leftHidden}
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
					<RankingUserList
						key={v.name}
						tabLabel={v.name}
						uri={v.uri}
						tabIndex={i}
					/>
				))}
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