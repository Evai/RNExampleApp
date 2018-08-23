import React from 'react'

import {
	StyleSheet,
	TextInput,
	View,
	Text,
	Alert
} from 'react-native'
import navigate from "../../../screens/navigate";
import styleUtil from "../../../common/styleUtil";
import ScrollPage from "../../../components/ScrollPage";
import NavBar from "../../../components/NavBar";
import {NavigationBar} from 'teaset'
import {Avatar} from 'react-native-elements'
import utils from "../../../common/utils";
import ImageCached from "../../../components/ImageCached";

const MAX_LENGTH = 300;

export default class GroupDescription extends React.Component {
	static navigatorStyle = {
		scene: navigate.sceneConfig.FloatFromBottom,
		navBarHidden: true
	};
	
	constructor(props) {
		super(props);
		this.state = {
			text: props.text || '',
			remainLength: MAX_LENGTH - props.text.length,
			disabled: !props.text,
			isEdit: false,
			inputHeight: 300
		}
	}
	
	renderNavBar = () => {
		let {
			title,
			submit
		} = this.props;
		return (
			<NavBar
				title={title}
				renderLeftView={<NavigationBar.LinkButton
					title={'关闭'}
					onPress={_ => {
						if (this.state.isEdit) {
							Alert.alert(
								'是否退出本次编辑?',
								'',
								[
									{text: '继续编辑', onPress: () => {}},
									{text: '退出', onPress: () => navigate.pop()},
								],
								{ cancelable: false }
							)
						} else {
							navigate.pop()
						}
					}}
				/>}
				rightHidden={config.user._id !== this.props.master._id}
				rightTitle={this.state.disabled ? '完成' : '编辑'}
				rightStyle={{
					color: this.state.disabled && !this.state.isEdit ? '#999' : styleUtil.successColor
				}}
				rightOnPress={_ => {
					let text = this.state.text.trim();
					if (this.state.disabled && !this.state.isEdit) {
						return;
					}
					if (!this.state.disabled) {
						this.setState({
							disabled: true
						}, _ => this.textInput && this.textInput.focus())
						return
					}
					else if (this.props.text === text) {
						navigate.pop();
						return
					}
					if (text) {
						Alert.alert(
							'该公告会通知全部群成员，是否发布?',
							'',
							[
								{text: '取消', onPress: () => {}},
								{text: '发布', onPress: () => submit && submit(text)},
							],
							{ cancelable: false }
						)
					} else {
						submit && submit(text)
					}
				}}
			/>
		)
	};
	
	onChangeText = text => {
		text = text || '';
		let newState = {
			text,
			remainLength: MAX_LENGTH - text.length
		};
		if (!this.state.isEdit) {
			newState.isEdit = true
		}
		this.setState(newState)
	};
	
	renderInput = () => {
		return (
			<View style={{
				height: this.state.inputHeight,
				marginTop: 15,
				backgroundColor: 'white',
				borderRadius: 0,
				borderColor: styleUtil.borderColor
			}}>
				{
					!this.props.isFocused ? <TextInput
						style={styles.inputText}
						multiline
						value={this.state.text}
					/> : <View style={{flex: 1}}>
						<TextInput
							ref={ele => this.textInput = ele}
							style={styles.inputText}
							onChangeText={this.onChangeText}
							value={this.state.text}
							// returnKeyType={'done'}
							multiline
							autoFocus={this.state.disabled}
							editable={this.state.disabled}
							enablesReturnKeyAutomatically
							underlineColorAndroid="transparent"
							maxLength={MAX_LENGTH}
						/>
						{this.state.disabled && <Text style={{
							color: this.state.remainLength <= 0 ? 'red' : styleUtil.primaryColor,
							textAlign: 'right'
						}}>{this.state.remainLength}</Text>}
					</View>
				}
			</View>
		)
	};
	
	renderHeader = () => {
		return (
			<View style={{
				flexDirection: 'row',
				borderBottomWidth: 1,
				borderColor: styleUtil.borderColor,
				paddingBottom: 15
			}}>
				<ImageCached
					component={Avatar}
					medium
					rounded
					source={config.defaultAvatar(this.props.master.avatar)}
				/>
				<View style={{
					justifyContent: 'space-around',
					marginLeft: 15
				}}>
					<Text>{this.props.master.username}</Text>
					<Text style={{
						color: styleUtil.detailTextColor,
						fontSize: 12
					}}>修改于 {utils.timeStampToStr(this.props.updatedAt, 'Y年m月d日 H:i')}</Text>
				</View>
			</View>
		)
	};
	
	render() {
		return (
			<View style={{flex: 1, backgroundColor: 'white'}}>
				{this.renderNavBar()}
				<ScrollPage
					keyboardDismissMode={'none'}
					style={{padding: 15}}
				>
					{!this.state.disabled && this.renderHeader()}
					{this.renderInput()}
				</ScrollPage>
			</View>
		)
	}
}

const styles = StyleSheet.create({
	inputText: {
		flex: 1,
		fontSize: 16,
		lineHeight: 20,
		textAlignVertical:'top'
	}
});
