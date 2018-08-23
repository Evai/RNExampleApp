import React from 'react'
import styleUtil from "../common/styleUtil";
import {
	View,
	Text
} from "react-native";
import PropTypes from 'prop-types'

export default class SectionHeader extends React.Component {
	static propTypes = {
		title: PropTypes.string.isRequired
	}
	
	render() {
		let {
			title,
			containerStyle = {},
			textStyle = {}
		} = this.props
		return (
			<View style={[{
				backgroundColor: styleUtil.backgroundColor,
				paddingVertical: 5,
				paddingHorizontal: 10
			}, {...containerStyle}]}>
				<Text style={[
					{color: '#666'},
					{...textStyle}
				]}>{title}</Text>
			</View>
		)
	}
}