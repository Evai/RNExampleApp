import React from 'react'
import {
	View,
	Text,
	StyleSheet
} from 'react-native'
import NavigatorPage from "../../components/NavigatorPage";
import ScrollableTabView from 'react-native-scrollable-tab-view'
import styleUtil from "../../common/styleUtil";
import NavBar from "../../components/NavBar";
import TabBar from "../../components/tabbar/TabBar";
import SubjectList from "./SubjectList";


export default class SubjectIndex extends React.Component {
	static navigatorStyle = {
		title: '话题推荐',
	};
	
	constructor(props) {
		super(props);
		this.state = {
			tabs: [
				{name: '最新', type: 'new'},
				{name: '热门', type: 'hot'},
				{name: '关注', type: 'follow'},
			],
			activeIndex: 0,
			fromIndex: 0,
		}
	}
	
	componentDidMount() {
	}
	
	componentWillUnmount() {
	}
	
	onChangeTab = ({i, ref, from}) => {
		if (this.state.activeIndex !== i) {
			this.setState({
				activeIndex: i,
				fromIndex: from
			});
		}
	};
	
	renderTabBar = props => {
		return (
			<View style={{backgroundColor:'white'}}>
				<TabBar
					backgroundColor={'white'}
					textStyle={styles.label}
					activeTextColor={styleUtil.activeTextColor}
					inactiveTextColor={styleUtil.inactiveTextColor}
					underlineStyle={styleUtil.underlineStyle}
					fromIndex={this.state.fromIndex}
					tabContainerWidth={210}
					style={{
						width: 210,
						paddingTop: 10
					}}
					{...props}
					tabs={this.state.tabs}
				/>
			</View>
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
				{this.state.tabs.map((v, i) => (
					<SubjectList
						key={v.name}
						tabLabel={v.name}
						type={v.type}
						activeIndex={this.state.activeIndex}
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