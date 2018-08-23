import * as React from 'react';
import {
	View,
	StyleSheet,
	Dimensions,
	ImageBackground,
	Animated,
} from 'react-native';
// import {Constants} from 'expo';
import {TabViewAnimated, TabBar} from 'react-native-tab-view';
import styleUtil from "../common/styleUtil"; // 0.0.74
import FriendDynamic from './message/FriendDynamic'


const initialLayout = {
	height: 0,
	width: Dimensions.get('window').width,
};

const HEADER_HEIGHT = 240;
const COLLAPSED_HEIGHT = 52;
const SCROLLABLE_HEIGHT = HEADER_HEIGHT - COLLAPSED_HEIGHT;

export default class ScrollTabs extends React.Component {
	constructor(props: Props) {
		super(props);
		
		this.state = {
			index: 0,
			routes: [
				{key: '1', title: 'First'},
				{key: '2', title: 'Second'},
			],
			scroll: new Animated.Value(0),
		};
	}
	
	_handleIndexChange = index => {
		this.setState({index});
	};
	
	_renderHeader = props => {
		const translateY = this.state.scroll.interpolate({
			inputRange: [0, SCROLLABLE_HEIGHT],
			outputRange: [0, -SCROLLABLE_HEIGHT],
			extrapolate: 'clamp',
		});
		
		return (
			<Animated.View style={[styles.header, {transform: [{translateY}]}]}>
				<ImageBackground
					source={{uri: 'https://picsum.photos/900'}}
					style={styles.cover}>
					<View style={styles.overlay}/>
					<TabBar {...props} style={styles.tabbar}/>
				</ImageBackground>
			</Animated.View>
		);
	};
	
	_renderScene = () => {
		return (
			<FriendDynamic
				scrollEventThrottle={1}
				onScroll={Animated.event(
					[{nativeEvent: {contentOffset: {y: this.state.scroll}}}],
					{useNativeDriver: true}
				)}
				contentContainerStyle={{paddingTop: HEADER_HEIGHT}}
				dynamicType={'new'}
				activeIndex={this.state.activeIndex}
				visibleType={0}
				isShowSubject={true}
				// onScroll={this.onScroll}
				animated={true}
				isRefresh={false}
				navBarHidden={true}
				navigationBarInsets={false}
				// scrollEnabled={false}
				{...this.props}
			/>
		)
		// return (
		// 	<ContactsList
		// 		scrollEventThrottle={1}
		// 		onScroll={Animated.event(
		// 			[{ nativeEvent: { contentOffset: { y: this.state.scroll } } }],
		// 			{ useNativeDriver: true }
		// 		)}
		// 		contentContainerStyle={{ paddingTop: HEADER_HEIGHT }}
		// 	/>
		// );
	};
	
	render() {
		return (
			<TabViewAnimated
				style={styles.container}
				navigationState={this.state}
				renderScene={this._renderScene}
				renderHeader={this._renderHeader}
				onIndexChange={this._handleIndexChange}
				initialLayout={initialLayout}
			/>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	overlay: {
		flex: 1,
		backgroundColor: 'rgba(0, 0, 0, .32)',
	},
	cover: {
		height: HEADER_HEIGHT,
	},
	header: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		zIndex: 1,
	},
	tabbar: {
		backgroundColor: 'rgba(0, 0, 0, .32)',
		elevation: 0,
		shadowOpacity: 0,
	},
});
