import React from 'react'
import {
	View,
	Text,
	StyleSheet,
	Image,
	TouchableOpacity
} from 'react-native'
import NavigatorPage from "../../components/NavigatorPage";
import ScrollableTabView from 'react-native-scrollable-tab-view'
import styleUtil from "../../common/styleUtil";
import NavBar from "../../components/NavBar";
import TabBar from "../../components/tabbar/TabBar";
import FriendDynamic from '../message/FriendDynamic'
import {Icon} from 'react-native-elements'
import navigate from "../../screens/navigate";
import AddDynamic from "../message/AddDynamic";
import PhoneLogin from "../account/PhoneLogin";

export default class UserDynamicIndex extends NavigatorPage {
	static defaultProps = {
		...NavigatorPage.navigatorStyle,
		navBarHidden: true,
		navigationBarInsets: false,
	};
	
	constructor(props) {
		super(props);
		let tabs = props.tabs || [
			{name: '最新', type:'new'},
			{name: '热门', type: 'hot'},
			{name: '关注', type:'follow'},
		];
		Object.assign(this.state, {
			tabs,
			activeIndex: 0,
			fromIndex: 0,
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
	
	renderNavBar = () => {
		return (
			<NavBar
				title={'新鲜事'}
				renderRightView={
					<TouchableOpacity
						onPress={_ => {
							if (config.user._id) {
								navigate.push(AddDynamic,{visibleType:0})
							} else {
								navigate.push(PhoneLogin)
							}
						}}
					>
						<Image
							source={require('../../assets/image/edit_dynamic.png')}
							style={{
								width:30,
								height:30,
								marginRight:10
							}}
						/>
					</TouchableOpacity>
				}
			/>
		)
	};
	
	renderTabBar = (props) => {
		return (
			<View style={{backgroundColor:'white'}}>
				<TabBar
					backgroundColor={'white'}
					textStyle={styles.label}
					activeTextColor={styleUtil.activeTextColor}
					inactiveTextColor={styleUtil.inactiveTextColor}
					underlineStyle={styleUtil.underlineStyle}
					tabUnderlineDefaultWidth={this.props.tabUnderlineDefaultWidth}
					fromIndex={this.state.fromIndex}
					tabContainerWidth={this.props.tabContainerWidth || 210}
					style={{
						width: this.props.tabContainerWidth || 210,
						paddingTop: 10
					}}
					{...props}
					tabs={this.state.tabs}
				/>
			</View>
		)
	}
	
	renderPage() {
		return (
			<View style={styleUtil.container}>
				{this.renderNavBar()}
				<ScrollableTabView
					tabBarPosition={'top'}
					renderTabBar={this.renderTabBar}
					onChangeTab={this.onChangeTab}
					initialPage={0}
				>
					{this.state.tabs.map((v, i) => (
						<FriendDynamic
							key={v.name}
							tabLabel={v.name}
							dynamicType={v.type}
							activeIndex={this.state.activeIndex}
							visibleType={0}//0公开
							isShowSubject={true}//是否显示#话题#
							{...this.props}
						/>
					))}
				</ScrollableTabView>
			</View>
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