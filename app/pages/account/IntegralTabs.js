import React from 'react'
import {
	View,
	Text,
	StyleSheet
} from 'react-native'
import ScrollableTabView from 'react-native-scrollable-tab-view'
import styleUtil from "../../common/styleUtil";
import NavBar from "../../components/NavBar";
import TabBar from "../../components/tabbar/TabBar";
import IntegralDetail from "./IntegralDetail";


export default class IntegralTabs extends React.Component {
	static navigatorStyle = {
		title: '积分明细',
		navBarHidden: true,
		navigationBarInsets: false,
	};
	
	constructor(props) {
		super(props);
		this.state = {
			tabs: [
				{name: '收入', type: 1},
				{name: '支出', type: 2},
			],
			activeIndex: 0
		};
	}
	
	componentDidMount() {
	}
	
	componentWillUnmount() {
	}
	
	onChangeTab = ({i, ref, from}) => {
		if (this.state.activeIndex !== i) {
			this.setState({
				activeIndex: i
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
					tabContainerWidth={210}
					style={{
						width: 210
					}}
					{...props}
					tabs={this.state.tabs}
				/>}
				leftHidden={this.props.leftHidden}
			/>
		)
	};
	
	render() {
		return (
			<ScrollableTabView
				tabBarPosition={'top'}
				renderTabBar={this.renderNavBar}
				onChangeTab={this.onChangeTab}
				initialPage={0}
			>
				{this.state.tabs.map((v, i) => (
					<IntegralDetail
						key={v.name}
						tabLabel={v.name}
						type={v.type}
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
		fontSize: 16,
		fontWeight: '700',
	},
	activeColor: {
		backgroundColor: 'white',
		bottom: 5,
		height: 2,
		// width: 50,
		// left: 10
	}
});