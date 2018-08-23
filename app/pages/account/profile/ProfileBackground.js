import React from 'react'
import {
	View,
	Text,
	Animated,
	Image,
	findNodeHandle,
	TouchableOpacity,
	StyleSheet
} from 'react-native'

import {
	DEFAULT_NAVBAR_HEIGHT, DEFAULT_WINDOW_MULTIPLIER, SCREEN_HEIGHT,
	SCREEN_WIDTH
} from "./constants";

import {BlurView} from 'react-native-blur';

import PropTypes from 'prop-types'
import styleUtil from "../../../common/styleUtil";
import {NavigationBar} from 'teaset'
import ImageCached from "../../../components/ImageCached";


export default class ProfileBackground extends React.Component {
	
	static defaultProps = {
		windowHeight: SCREEN_HEIGHT * DEFAULT_WINDOW_MULTIPLIER,
		leftIconOnPress: () => {
		},
		rightIconOnPress: () => {
		}
	};
	
	static propTypes = {
		backgroundSource: Image.propTypes.source,
		windowHeight: PropTypes.number,
		leftIcon: PropTypes.object,
		rightIcon: PropTypes.object,
		navBarTitle: PropTypes.string,
		navBarTitleColor: PropTypes.string,
		navBarColor: PropTypes.string,
		scrollY: PropTypes.object.isRequired
	};
	
	constructor(props) {
		super(props)
		this.state = {
			viewRef: null
		}
	}
	
	imageLoaded() {
		if (!this.props.backgroundSource) {
			this.setState({viewRef: findNodeHandle(this.backgroundImage)});
		}
	}
	
	renderBackground() {
		let {windowHeight, backgroundSource, scrollY, avatar} = this.props;
		// let isBlur = false;
		// if (!backgroundSource && typeof avatar === 'string') {
		// 	backgroundSource = {uri:avatar};
		// 	isBlur = true
		// }
		return (
			<View>
				{!backgroundSource ? <Animated.View
					style={[
						styles.background,
						{
							height: windowHeight,
							transform: [
								{
									translateY: scrollY.interpolate({
										inputRange: [-windowHeight, 0, windowHeight, windowHeight],
										outputRange: [windowHeight / 2, 0, -windowHeight / 3, -windowHeight / 3]
									})
								},
								{
									scale: scrollY.interpolate({
										inputRange: [-windowHeight, 0, windowHeight],
										outputRange: [2, 1, 1]
									})
								}
							]
						}
					]}
				/> : <ImageCached
					component={Animated.Image}
					style={[
						styles.background,
						{
							resizeMode: 'cover',
							height: windowHeight,
							transform: [
								{
									translateY: scrollY.interpolate({
										inputRange: [-windowHeight, 0, windowHeight, windowHeight],
										outputRange: [windowHeight / 2, 0, -windowHeight / 3, -windowHeight / 3]
									})
								},
								{
									scale: scrollY.interpolate({
										inputRange: [-windowHeight, 0, windowHeight],
										outputRange: [2, 1, 1]
									})
								}
							]
						}
					]}
					ref={(img) => {
						this.backgroundImage = img;
					}}
					source={backgroundSource}
					onLoadEnd={this.imageLoaded.bind(this)}
					// defaultSource={require('../../../assets/image/profileBackground.jpg')}
				/>}
				{/*{*/}
					{/*isBlur &&*/}
					{/*<BlurView blurType='light'*/}
					          {/*blurAmount={25}*/}
					          {/*viewRef={this.state.viewRef}*/}
					          {/*style={{*/}
						          {/*position: "absolute",*/}
						          {/*width: styleUtil.window.width,*/}
						          {/*height: styleUtil.window.height*/}
					          {/*}}*/}
					{/*/>*/}
				{/*}*/}
			</View>
		);
	}
	
	renderNavBarTitle() {
		let {windowHeight, navBarTitleColor, scrollY} = this.props;
		return (
			<Animated.View
				style={{
					opacity: scrollY.interpolate({
						inputRange: [-windowHeight, windowHeight * DEFAULT_WINDOW_MULTIPLIER, windowHeight * 0.8],
						outputRange: [0, 0, 1]
					})
				}}
			>
				<Text
					numberOfLines={1}
					style={[styleUtil.shadowText, {textAlign: 'center', fontSize: 17, fontWeight: '600', color: navBarTitleColor || 'white'}]}>
					{this.props.navBarTitle}
				</Text>
			</Animated.View>
		);
	}
	
	renderNavBar() {
		let {
			windowHeight, leftIconOnPress, rightIconOnPress, navBarColor, scrollY, backTitle
		} = this.props;
		return (
			<View style={{
				// backgroundColor: scrollY.interpolate({
				//     inputRange: [-windowHeight, windowHeight * DEFAULT_WINDOW_MULTIPLIER, windowHeight * 0.8, windowHeight],
				//     outputRange: ['transparent', 'transparent', navBarColor, navBarColor]
				// })
			}}>
				<NavigationBar
					title={this.renderNavBarTitle()}
					style={{
						position: 'relative',
						backgroundColor: 'transparent',
						borderBottomWidth: 0
					}}
					leftView={<NavigationBar.BackButton
						style={{marginLeft:5}}
						title={'Back'}
						iconStyle={{tintColor:'white'}}
						titleStyle={{opacity: 0}}
						onPress={leftIconOnPress}
					/>}
				/>
			</View>
		)
	}
	
	render() {
		return (
			<View>
				{this.renderBackground()}
				{this.renderNavBar()}
			</View>
		)
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		borderColor: 'transparent'
	},
	scrollView: {
		backgroundColor: 'transparent'
	},
	background: {
		position: 'absolute',
		backgroundColor: '#2e2f31',
		width: SCREEN_WIDTH
	},
	content: {
		shadowColor: '#222',
		shadowOpacity: 0.3,
		shadowRadius: 2,
		backgroundColor: '#fff',
		flex: 1,
		flexDirection: 'column'
	},
	headerView: {
		justifyContent: 'center',
		alignItems: 'center',
	},
	avatarView: {
		justifyContent: 'center',
		alignItems: 'center',
	},
	listView: {
		backgroundColor: 'rgba(247,247, 250, 1)'
	},
	logoutText: {
		color: 'red',
		textAlign: 'center',
		fontWeight: 'bold'
	}
});