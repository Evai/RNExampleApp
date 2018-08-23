import React from 'react';
import {
	Linking,
	StyleSheet,
	Text,
	View,
	Clipboard
} from 'react-native';

import ParsedText from 'react-native-parsed-text';
import Communications from 'react-native-communications';
import PropTypes from 'prop-types';
import toast from "../../../common/toast";
import navigate from "../../../screens/navigate";
import WebPage from "../../../components/WebPage";
import config from "../../../common/config";
import Emoticons from "../../../components/emoticon/Emoticons";

export default class MessageText extends React.Component {
	constructor(props) {
		super(props);
		this.onUrlPress = this.onUrlPress.bind(this);
		this.onPhonePress = this.onPhonePress.bind(this);
		this.onEmailPress = this.onEmailPress.bind(this);
	}
	
	onUrlPress(url) {
		// console.warn(url)
		navigate.push(WebPage, {
			url
		})
		// Linking.openURL(url);
	}
	
	onPhonePress(phone) {
		const options = [
			{
				title: '复制', onPress: _ => {
					Clipboard.setString(phone);
					toast.success('已复制');
				}
			},
			{
				title: '拨打电话', onPress: _ => {
					Communications.phonecall(phone, true);
				}
			},
			{
				title: '发送短信', onPress: _ => {
					Communications.text(phone);
				}
			}
		];
		config.showAction(options);
	}
	
	onEmailPress(email) {
		Communications.email(email, null, null, null, null);
	}
	
	render() {
		return (
			<View style={[styles[this.props.position].container, this.props.containerStyle[this.props.position]]}>
				<ParsedText
					style={[styles[this.props.position].text, this.props.textStyle[this.props.position]]}
					parse={[
						{
							type: 'url',
							style: StyleSheet.flatten([styles[this.props.position].link, this.props.linkStyle[this.props.position]]),
							onPress: this.onUrlPress
						},
						{
							type: 'phone',
							style: StyleSheet.flatten([styles[this.props.position].link, this.props.linkStyle[this.props.position]]),
							onPress: this.onPhonePress
						},
						{
							type: 'email',
							style: StyleSheet.flatten([styles[this.props.position].link, this.props.linkStyle[this.props.position]]),
							onPress: this.onEmailPress
						},
					]}
				>
					{Emoticons.parse(this.props.currentMessage.text)}
				</ParsedText>
			</View>
		);
	}
}

const textStyle = {
	fontSize: 16,
	lineHeight: 20,
	marginTop: 5,
	marginBottom: 5,
	marginLeft: 10,
	marginRight: 10,
};

const styles = {
	left: StyleSheet.create({
		container: {},
		text: {
			color: 'black',
			...textStyle,
		},
		link: {
			color: 'black',
			textDecorationLine: 'underline',
		},
	}),
	right: StyleSheet.create({
		container: {},
		text: {
			color: 'white',
			...textStyle,
		},
		link: {
			color: 'white',
			textDecorationLine: 'underline',
		},
	}),
};

MessageText.contextTypes = {
	actionSheet: PropTypes.func,
};

MessageText.defaultProps = {
	position: 'left',
	currentMessage: {
		text: '',
	},
	containerStyle: {},
	textStyle: {},
	linkStyle: {},
};

MessageText.propTypes = {
	position: PropTypes.oneOf(['left', 'right']),
	currentMessage: PropTypes.object,
	// containerStyle: PropTypes.shape({
	//   left: View.propTypes.style,
	//   right: View.propTypes.style,
	// }),
	// textStyle: PropTypes.shape({
	//   left: Text.propTypes.style,
	//   right: Text.propTypes.style,
	// }),
	// linkStyle: PropTypes.shape({
	//   left: Text.propTypes.style,
	//   right: Text.propTypes.style,
	// }),
};
