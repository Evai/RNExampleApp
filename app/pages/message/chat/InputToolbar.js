import React from 'react';
import {
	StyleSheet,
	View,
	Platform,
	Text,
	Dimensions,
	TextInput,
	Image,
	ActivityIndicator,
	Keyboard,
	LayoutAnimation,
	TouchableOpacity,
	TouchableWithoutFeedback,
	Animated,
	TouchableHighlight
	
} from 'react-native';
import {Icon} from 'react-native-elements';
import {Fonts, Colors} from './Themes'
import Styles from './Styles/MessageScreenStyle'

import Emoticons, {EMOTICONS_HEIGHT} from "../../../components/emoticon/Emoticons";
import styleUtil from "../../../common/styleUtil";
import CustomAction from "./CustomAction";
import Audio from "./Audio";
import toast from "../../../common/toast";

const MODE_TEXT = "mode_text";
const MODE_RECORD = "mode_record";

//输入框初始高度
const MIN_COMPOSER_HEIGHT = Platform.select({
	ios: 34,
	android: 41,
});
const MAX_COMPOSER_HEIGHT = 100;

export const MIN_INPUT_TOOLBAR_HEIGHT = Platform.select({
	ios: 44,
	android: 54,
});

const ACTION_BUTTON_HEIGHT = 220;

export default class InputToolbar extends React.Component {
	// static navigatotS
	constructor(props) {
		super(props);
		this.state = {
			mode: MODE_TEXT,
			opacity: "#fff",
			focused: false,
			isEmoji: false,
			value: '',
			selection: {start: 0, end: 0},
			actionVisible: false,
			actionAnim: new Animated.Value(0),
			composerHeight: MIN_COMPOSER_HEIGHT
		};
		this.actionBarHeight = 0;
		this.isInit = false;
	}
	
	
	getToolbarHeight() {
		return this.state.composerHeight + (MIN_INPUT_TOOLBAR_HEIGHT - MIN_COMPOSER_HEIGHT) + this.actionBarHeight;
	}
	
	dismiss() {
		const {isEmoji, actionVisible} = this.state;
		this.setState({
			isEmoji: false,
			actionVisible: false,
		});
		Animated.timing(
			this.state.actionAnim,
			{toValue: 0,useNativeDriver: true,},
		).start();
		
		if (isEmoji || actionVisible) {
			this.actionBarHeight = 0;
			this.onHeightChange();
		}
	}
	
	updateText = value => {
		this.setState({
			value
		})
	};
	
	handleSend() {
		let value = this.state.value.trim();
		if (!value) {
			this.onSubmit = false;
			return;
		}
		// this.onHeightChange();
		// if (this.state.composerHeight !== MIN_COMPOSER_HEIGHT) {
		// 	this.onHeightChange();
		// }
		this.setState({
			value: ''
		}, _ => {
			setTimeout(_ => {
				this.onSubmit = false;
				this.props.onSend({text: value, msgType: 'text'});
			}, 50);
		});
	}
	
	handleChangeText(v) {
		if (this.onSubmit) {
			this.handleSend();
			return;
		}
		this.setState({
			value: v
		});
		// if (v.length > 0 && v[v.length - 1] === '\n') {
		// 	this.handleSend()
		// } else {
		// 	this.setState({
		// 		value: v
		// 	});
		// }
	}
	
	onActionsPress() {
		let actionVisible = this.state.actionVisible;
		if (actionVisible) {
			if (this.search) {
				this.search.focus();
			}
			Animated.timing(
				this.state.actionAnim,
				{toValue: 0,useNativeDriver: true,}
			).start();
			return;
		}
		if (this.search) {
			this.search.blur();
		}
		actionVisible = !actionVisible;
		this.setState({actionVisible: actionVisible, isEmoji: false});
		if (actionVisible) {
			this.actionBarHeight = ACTION_BUTTON_HEIGHT;
			this.onHeightChange();
		}
		Animated.timing(
			this.state.actionAnim,
			{toValue: 1,useNativeDriver: true,}
		).start();
	}
	
	handleEmojiOpen() {
		let isEmoji = this.state.isEmoji;
		isEmoji = !isEmoji;
		if (this.search) {
			this.search.blur();
		}
		this.setState({
			isEmoji: isEmoji,
			actionVisible: false,
			mode: MODE_TEXT
		}, _ => {
			if (isEmoji) {
				this.actionBarHeight = EMOTICONS_HEIGHT;
				this.onHeightChange();
			} else {
				this.actionBarHeight = 0;
				if (this.search) {
					this.search.focus();
				}
			}
			Animated.timing(          // Uses easing functions
				this.state.actionAnim,    // The value to drive
				{toValue: 1,useNativeDriver: true,}           // Configuration
			).start();
		});
	}
	
	handleFocusSearch() {
		this.setState({
			isEmoji: false,
			actionVisible: false,
			focused: true,
		});
		Animated.timing(
			this.state.actionAnim,
			{toValue: 1,useNativeDriver: true,}
		).start();
	}
	
	handleBlurSearch() {
		this.setState({focused: false});
	}
	
	previousHandle() {
		this.setState({
			isEmoji: false,
			actionVisible: false
		});
		this.actionBarHeight = 0;
		this.onHeightChange();
	}
	
	handleRecordMode() {
		const {isEmoji, actionVisible} = this.state;
		if (this.state.mode === MODE_RECORD) {
			return;
		}
		this.setState({
			isEmoji: false,
			actionVisible: false,
			focused: false,
			mode: MODE_RECORD
		});
		if (isEmoji || actionVisible) {
			this.actionBarHeight = 0;
			this.onHeightChange();
		}
		// NimUtils.onTouchVoice();
	}
	
	handleTextMode() {
		if (this.state.mode === MODE_TEXT) {
			return;
		}
		this.setState({mode: MODE_TEXT, focused: true,});
	}
	
	_renderEmoji() {
		return <Animated.View style={[Styles.emojiRow, {width: styleUtil.window.width, height: EMOTICONS_HEIGHT,display:this.state.isEmoji ? 'flex' : 'none'}]}>
			<Emoticons show={this.state.isEmoji}
			           text={this.state.value}
			           selection={this.state.selection}
			           onEmoticon={({text}) => this.setState({value: text})}
			           onBackspace={text => this.setState({value: text})}
			           onTextSend={this.handleSend.bind(this)}
			           onSend={this.props.onSend}
			           collectList={this.props.collectList}
			           updateCollectList={this.props.updateCollectList}
			           showsPagination={true}/>
		</Animated.View>
	}
	
	_renderActions() {
		if (this.state.isEmoji) {
			return null;
		}
		return (
			<Animated.View style={{
				height: ACTION_BUTTON_HEIGHT,
				opacity: this.state.actionAnim, transform: [{
					translateY: this.state.actionAnim.interpolate({
						inputRange: [0, 1],
						outputRange: [150, 0]  // 0 : 150, 0.5 : 75, 1 : 0
					})
				}]
			}}>
				<CustomAction onSend={this.props.onSend}/>
			</Animated.View>
		);
	}
	
	onHeightChange() {
		let h = this.state.composerHeight + (MIN_INPUT_TOOLBAR_HEIGHT - MIN_COMPOSER_HEIGHT) + this.actionBarHeight;
		this.props.onHeightChange(h);
	}
	
	onContentSizeChange = (e) => {
		const contentSize = e.nativeEvent.contentSize;
		// Support earlier versions of React Native on Android.
		if (!contentSize) return;
		
		if (!this.contentSize || this.contentSize.width !== contentSize.width || this.contentSize.height !== contentSize.height) {
			this.contentSize = contentSize;
			this.onInputSizeChanged(this.contentSize);
		}
	};
	
	onInputSizeChanged = (size) => {
		const newComposerHeight = Math.max(MIN_COMPOSER_HEIGHT, Math.min(MAX_COMPOSER_HEIGHT, size.height));
		this.setState({
			composerHeight: newComposerHeight,
		}, _ => {
			if (this.isInit) {
				this.onHeightChange()
			}
			this.isInit = true;
		});
	};
	
	renderTextInput() {
		return (
			<View style={{flex: 1}}>
				<View style={Styles.searchRow}>
					<TextInput
						ref={(search) => {
							this.search = search
						}}
						style={[Styles.searchInput, {height: this.state.composerHeight}]}
						value={this.state.value}
						autoFocus={this.state.focused}
						editable={true}
						maxLength={500}
						// caretHidden={true}
						keyboardType='default'
						returnKeyType={'send'}
						autoCapitalize='none'
						autoCorrect={false}
						multiline={true}
						onChange={this.onContentSizeChange}
						onContentSizeChange={this.onContentSizeChange}
						onFocus={this.handleFocusSearch.bind(this)}
						onBlur={this.handleBlurSearch.bind(this)}
						onChangeText={this.handleChangeText.bind(this)}
						underlineColorAndroid='transparent'
						onSelectionChange={({nativeEvent: {selection}}) => this.setState({selection})}
						enablesReturnKeyAutomatically={true}
						onSubmitEditing={_ => this.onSubmit = true}
					/>
				</View>
			</View>
		);
	}
	
	renderRecordInput() {
		return <Audio onSend={this.props.onSend}/>
	}
	
	_renderEmojiButton() {
		const {isEmoji} = this.state;
		return (
			<TouchableOpacity style={{
				paddingLeft: 5,
				paddingRight: 5,
				alignSelf: "stretch",
				justifyContent: "center"
			}}
			                  onPress={this.handleEmojiOpen.bind(this)}>
				{
					isEmoji ? <Icon name={'keyboard'} size={30} color={'#666'}/>
						: <Icon name="insert-emoticon" size={30} color={'#666'}/>
				}
			</TouchableOpacity>
		)
	}
	
	_renderSendButton() {
		const {focused, value} = this.state;
		
		return ((focused && value.length > 0) && Platform.OS === 'android') ? (
			<TouchableOpacity style={{alignSelf: "stretch", justifyContent: "center", paddingRight: 8}}
			                  onPress={this.handleSend.bind(this)}>
				<Text style={Styles.sendText}>{'发送'}</Text>
			</TouchableOpacity>
		
		) : (
			<TouchableOpacity style={{alignSelf: "stretch", justifyContent: "center", paddingRight: 8}}
			                  onPress={this.onActionsPress.bind(this)}>
				<Icon name="add-circle-outline" size={30} color={'#666'}/>
			</TouchableOpacity>
		);
	}
	
	
	render() {
		const {value = '', isEmoji, mode} = this.state;
		let height = this.state.composerHeight + (MIN_INPUT_TOOLBAR_HEIGHT - MIN_COMPOSER_HEIGHT);
		return (
			<View style={Styles.search}>
				<View style={[Styles.inputRow, {height}]}>
					{mode === MODE_TEXT ?
					<TouchableOpacity style={{alignSelf: "stretch", justifyContent: "center", paddingLeft: 8}}
					onPress={this.handleRecordMode.bind(this)}>
					<Icon name={'keyboard-voice'} size={30} color={'#666'}/>
					</TouchableOpacity> :
					<TouchableOpacity style={{alignSelf: "stretch", justifyContent: "center", paddingLeft: 8}}
					onPress={this.handleTextMode.bind(this)}>
					<Icon name={'keyboard'} size={30} color={'#666'}/>
					</TouchableOpacity>}
					{mode === MODE_TEXT ? this.renderTextInput() : this.renderRecordInput()}
					{this._renderEmojiButton()}
					{this._renderSendButton()}
				</View>
				<View style={{flexGrow: 1, height: 1, backgroundColor: "lightgray"}}/>
				{this._renderEmoji()}
				{this._renderActions()}
			</View>
		)
	}
}