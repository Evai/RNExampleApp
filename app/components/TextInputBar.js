import React from 'react'
import {
	View,
	Text,
	StyleSheet,
	TextInput,
	TouchableOpacity,
	Platform,
	Keyboard,
	Animated
} from 'react-native'
import PropTypes from 'prop-types'
import styleUtil from "../common/styleUtil";
import {
	Icon
} from 'react-native-elements'
import Emoticons, {EMOTICONS_HEIGHT} from "./emoticon/Emoticons";


const MIN_COMPOSER_HEIGHT = Platform.select({
	ios: 28,
	android: 35,
})

const MAX_COMPOSER_HEIGHT = 100;

export default class TextInputBar extends React.Component {
	
	constructor(props) {
		super(props)
		this.state = {
			text: props.text,
			bottom: new Animated.Value(0),
			emoticonBottom: new Animated.Value(-EMOTICONS_HEIGHT),
			selection: {start: 0, end: 0},
			showEmoticons: false, //是否弹出表情
			showKeyboard: false //是否弹出键盘
		}
		this._textInput = null
		this._keyboardHeight = 0
	}
	
	componentWillMount() {
		this.keyboardWillShowListener = Keyboard.addListener('keyboardWillShow', this._keyboardWillShow);
		this.keyboardwillHideListener = Keyboard.addListener('keyboardWillHide', this._keyboardWillHide);
	}
	
	componentWillUnmount() {
		this.keyboardWillShowListener.remove();
		this.keyboardwillHideListener.remove();
	}
	
	_keyboardWillShow = (e) => {
		this._keyboardHeight = e.endCoordinates ? e.endCoordinates.height : e.end.height
		this.setBottom(this._keyboardHeight);
	}
	
	_keyboardWillHide = (e) => {
		this.state.showEmoticons && this.setBottom(EMOTICONS_HEIGHT)
		!this.state.showEmoticons && this.setBottom(0)
	}
	
	setBottom = (height, duration) => {
		Animated.timing(this.state.bottom, {
			toValue: height,
			duration: duration || 0,
		}).start();
	}
	
	setEmoticonBottom = (height) => {
		Animated.timing(this.state.emoticonBottom, {
			toValue: height,
			duration: 210,
		}).start();
	}
	
	textInputFocus = () => {
		this._textInput.focus()
	}
	
	textInputBlur = () => {
		this._textInput.blur()
	}
	
	clearText = () => {
		this.setState({
			text: ''
		})
	}
	
	onTogglePress = (showEmoticons, showKeyboard) => {
		this.setState({
			showKeyboard,
			showEmoticons
		}, _ => {
			//如果显示表情，将键盘隐藏，表情弹出，反之亦然
			if (showEmoticons) {
				Keyboard.dismiss()
				this.setBottom(EMOTICONS_HEIGHT, 210)
			} else if (showKeyboard) {
				this.textInputFocus()
				this.setEmoticonBottom(-EMOTICONS_HEIGHT)
			} else {
				Keyboard.dismiss()
				this.setBottom(0)
			}
		})
	}
	
	renderActions = () => {
		let {
			showEmoticons
		} = this.state
		return (
			<View style={styles.actionContainer}>
				{
					showEmoticons ?
						<Icon
							name={'keyboard'}
							type={'entypo'}
							size={30}
							containerStyle={styles.iconBox}
							onPress={_ => this.onTogglePress(false, true)}
						/> :
						<Icon
							name={'insert-emoticon'}
							type={'material'}
							size={30}
							containerStyle={styles.iconBox}
							onPress={_ => this.onTogglePress(true, false)}
						/>
				}
			</View>
		)
	}
	
	renderSend = () => {
		let {
			onSend,
			sendContainer,
			sendLabel,
			sendTextStyle
		} = this.props
		let text = this.state.text.trim()
		return (
			<TouchableOpacity
				style={[styles.sendContainer, sendContainer]}
				onPress={() => onSend && onSend(text)}
			>
				<View>
					{this.props.children ||
					<Text
						style={[
							styles.sendText,
							sendTextStyle,
							{color: text.length > 0 ? '#0084ff' : styleUtil.disabledColor}
						]}>{sendLabel}</Text>}
				</View>
			</TouchableOpacity>
		)
	}
	
	onContentSizeChange = (e) => {
		const contentSize = e.nativeEvent.contentSize;
		
		// Support earlier versions of React Native on Android.
		if (!contentSize) return;
		
		if (!this.contentSize || this.contentSize.width !== contentSize.width || this.contentSize.height !== contentSize.height) {
			this.contentSize = contentSize;
			this.onInputSizeChanged(this.contentSize);
		}
	}
	
	onInputSizeChanged = (size) => {
		const newComposerHeight = Math.max(MIN_COMPOSER_HEIGHT, Math.min(MAX_COMPOSER_HEIGHT, size.height));
		this.setState({
			composerHeight: newComposerHeight,
		});
	}
	
	
	onSelectionChange = ({nativeEvent: {selection}}) => {
		this.setState({selection});
	};
	
	renderTextInput = () => {
		return (
			<TextInput
				ref={component => this._textInput = component}
				style={[
					styles.textInput,
					this.props.textInputStyle,
					{height: this.state.composerHeight}
				]}
				onChangeText={(text) => this.setState({text})}
				value={this.state.text}
				returnKeyType={'send'}
				blurOnSubmit={true}
				autoCapitalize={'none'}
				onSubmitEditing={_ => this.props.onSubmit(this.state.text)}
				onChange={this.onContentSizeChange}
				onContentSizeChange={this.onContentSizeChange}
				enablesReturnKeyAutomatically
				underlineColorAndroid="transparent"
				selection={this.state.selection}
				onSelectionChange={this.onSelectionChange}
				onFocus={_ => this.onTogglePress(false, true)}
				{...this.props}
			/>
		)
	}
	
	renderBottom = () => {
		// if (this.state.showEmoticons) {
		// 	return null;
		// }
		return (
			<Animated.View style={[{
				height: EMOTICONS_HEIGHT,
				width: styleUtil.window.width,
				flex: 1,
				backgroundColor: styleUtil.backgroundColor,
				display: this.state.showEmoticons ? 'flex' : 'none',
				// bottom: this.state.emoticonBottom
			}]}>
				<Emoticons
					show={this.state.showEmoticons}
					selection={this.state.selection}
					text={this.state.text}
					onEmoticon={({text}) => this.setState({text})}
					onBackspace={text => this.setState({text})}
					onTextSend={_ => this.props.onSend(this.state.text)}
					showButton={false}
				/>
			</Animated.View>
		)
	}
	
	render() {
		return (
			<Animated.View
				style={[
					styles.container,
					{
						// bottom: this.props.visible ? this.state.bottom : new Animated.Value(-50),
						bottom: 0,
					}
				]}
			>
				<View style={[styles.primary, this.props.primaryStyle]}>
					{this.props.renderActions && this.renderActions()}
					{this.renderTextInput()}
					{this.renderSend()}
				</View>
				{this.props.children || this.renderBottom()}
			</Animated.View>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		position: 'absolute',
		backgroundColor: '#fff',
		padding: 5,
		width: styleUtil.window.width,
		borderTopWidth: styleUtil.borderSeparator,
		borderTopColor: styleUtil.borderColor
	},
	actionContainer: {
		justifyContent: 'center',
	},
	iconBox: {
		marginLeft: 1,
	},
	textInput: {
		flex: 1,
		marginLeft: 10,
		fontSize: 16,
		lineHeight: 16,
		marginTop: Platform.select({
			ios: 6,
			android: 0,
		}),
		marginBottom: Platform.select({
			ios: 5,
			android: 3,
		}),
		borderWidth: 1,
		borderColor: '#ccc',
		borderRadius: 20,
		paddingLeft: 10
	},
	sendContainer: {
		justifyContent: 'flex-end',
		alignSelf: 'flex-end'
	},
	sendText: {
		fontWeight: '600',
		fontSize: 17,
		backgroundColor: 'transparent',
		marginBottom: 12,
		marginLeft: 10,
		marginRight: 10,
	},
	primary: {
		flexDirection: 'row',
		alignItems: 'center'
	},
})


TextInputBar.defaultProps = {
	composerHeight: MIN_COMPOSER_HEIGHT,
	text: '',
	placeholderTextColor: '#b2b2b2',
	multiline: true,
	visible: true,
	textInputStyle: {},
	textInputAutoFocus: false,
	sendLabel: '发送',
	onSend: _ => {
	},
	onSubmit: _ => {
	},
};

TextInputBar.propTypes = {
	composerHeight: PropTypes.number,
	text: PropTypes.string,
	placeholder: PropTypes.string,
	placeholderTextColor: PropTypes.string,
	multiline: PropTypes.bool,
	textInputStyle: TextInput.propTypes.style,
	autoFocus: PropTypes.bool,
	sendLabel: PropTypes.string,
	onSend: PropTypes.func,
	onSubmit: PropTypes.func,
	renderActions: PropTypes.bool,
	visible: PropTypes.bool,
};