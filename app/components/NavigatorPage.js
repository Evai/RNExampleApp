import React from 'react'
import {
	View,
	Text
} from 'react-native'
import PropTypes from 'prop-types'
import {NavigationPage, NavigationBar} from 'teaset'
import navigate from "../screens/navigate";

export default class NavigatorPage extends NavigationPage {
	static navigatorStyle = {
		...NavigationPage.defaultProps,
		title: null,
		showBackButton: true,
		leftTitle: '返回',
		navBarHidden: false,
		navigationBarInsets: true,
		scene: navigate.sceneConfig.PushFromRight,
		// autoKeyboardInsets:true,
		// keyboardTopInsets:0,
	};
	
	static defaultProps = {
		...NavigatorPage.navigatorStyle
	};
	
	static propTypes = {
		title: PropTypes.string,
		showBackButton: PropTypes.bool,
		leftTitle: PropTypes.string,
		leftView: PropTypes.element,
		rightView: PropTypes.element,
		leftOnPress: PropTypes.func,
		rightOnPress: PropTypes.func,
		rightTitle: PropTypes.string,
		rightTitleStyle: Text.propTypes.style,
		navBarHidden: PropTypes.bool,
		navigationBarInsets: PropTypes.bool,
		renderChild: PropTypes.func
	};
	
	renderNavigationTitle() {
		return this.props.title;
	}
	
	renderNavigationLeftView() {
		const {
			showBackButton,
			leftOnPress,
			leftStyle,
			leftTitleStyle,
			leftView
		} = this.props;
		if (!showBackButton) return null;
		let onPress = leftOnPress ? leftOnPress : () => this.navigator.pop();
		return (
			leftView || <NavigationBar.BackButton
				style={{
					marginLeft: 5,
					...leftStyle
				}}
				titleStyle={{
					opacity: 0,
					...leftTitleStyle
				}}
				title={this.props.leftTitle || '返回'}
				onPress={onPress}
			/>
		);
	}
	
	renderNavigationRightView() {
		const {
			rightTitle,
			rightView,
			rightOnPress,
			rightTitleStyle
		} = this.props
		if (!rightTitle && !rightView) return null;
		return (
			rightView || <NavigationBar.LinkButton
				onPress={rightOnPress}
				style={rightTitleStyle}
				title={rightTitle}/>
		)
	}
	
	renderNavigationBar() {
		return this.props.navBarHidden ? null : <NavigationBar
			// hidden={this.props.navBarHidden}
			style={this.props.style}
			title={this.renderNavigationTitle()}
			leftView={this.renderNavigationLeftView()}
			rightView={this.renderNavigationRightView()}
		/>
	}
	
	renderChild(Component) {
		return <Component
			{...this.props.passProps}
			isFocused={this.state.isFocused}
		/>
	}
	
	renderPage() {
		return this.renderChild(this.props.children);
	}
	
}