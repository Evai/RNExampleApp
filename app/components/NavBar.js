import React from 'react'
import {
	View
} from 'react-native'
import styleUtil from "../common/styleUtil";
import navigate from "../screens/navigate";
import {NavigationBar} from 'teaset'
import PropTypes from 'prop-types'


export default class NavBar extends React.Component {
	
	static propTypes = {
		renderLeftView: PropTypes.element,
		renderRightView: PropTypes.element,
		renderTitleView: PropTypes.element,
		title: PropTypes.string,
		leftTitle: PropTypes.string,
		rightTitle: PropTypes.string,
		leftOnPress: PropTypes.func,
		rightOnPress: PropTypes.func,
		leftHidden: PropTypes.bool,
		rightHidden: PropTypes.bool,
		rightDisabled: PropTypes.bool
	};
	
	renderTitle = () => {
		if (this.props.renderTitleView) {
			return this.props.renderTitleView;
		}
		return this.props.title;
	};
	
	renderLeftView = () => {
		let {
			leftHidden,
			leftOnPress,
			renderLeftView,
			leftTitle,
			leftStyle,
			leftTitleStyle,
			leftIconStyle
		} = this.props;
		if (renderLeftView) {
			return renderLeftView
		}
		else if (leftHidden) {
			return <View/>
		}
		leftOnPress = leftOnPress ? leftOnPress : _ => navigate.pop()
		return (
			<NavigationBar.BackButton
				style={{
					marginLeft: 5,
					...leftStyle
				}}
				titleStyle={{
					opacity: 0,
					color:'black',
					...leftTitleStyle
				}}
				title={leftTitle || '返回'}
				onPress={leftOnPress}
				iconStyle={leftIconStyle}
			/>
		)
	};
	
	renderRightView = () => {
		const {
			rightHidden,
			rightTitle,
			rightOnPress,
			renderRightView,
			rightStyle,
			rightDisabled
		} = this.props;
		if (renderRightView) {
			return renderRightView;
		}
		else if (rightHidden) {
			return <View/>
		}
		return (
			<NavigationBar.LinkButton
				onPress={rightDisabled ? undefined : rightOnPress}
				style={rightStyle}
				title={rightTitle}
				activeOpacity={rightDisabled ? 1 : undefined}
			/>
		)
	};
	
	render() {
		return (
			<NavigationBar
				title={this.renderTitle()}
				style={{
					position: 'relative',
					backgroundColor: this.props.backgroundColor || 'white',
					borderBottomWidth: styleUtil.borderSeparator,
					borderBottomColor: styleUtil.borderColor,
					...this.props.style
				}}
				titleStyle={this.props.titleStyle}
				leftView={this.renderLeftView()}
				rightView={this.renderRightView()}
			/>
		)
	}
}