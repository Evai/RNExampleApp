import React from 'react'

import {
	StyleSheet,
	TextInput,
	View,
	Text
} from 'react-native'
import navigate from "../../../screens/navigate";
import {NavigationBar} from 'teaset'
import styleUtil from "../../../common/styleUtil";
import ScrollPage from "../../../components/ScrollPage";
import NavigatorPage from "../../../components/NavigatorPage";
import NavBar from "../../../components/NavBar";

export default class EditTextArea extends NavigatorPage {
	static defaultProps = {
		...NavigatorPage.navigatorStyle,
		scene: navigate.sceneConfig.FloatFromBottom,
		maxLength: 100,
		text:''
	};
	
	constructor(props) {
		super(props)
		this.state = {
			text: props.text || '',
			remainLength: props.maxLength - props.text.length
		}
	}
	
	renderNavigationBar() {
		let {
			title,
			submit
		} = this.props;
		return (
			<NavBar
				title={title}
				style={{
					position: 'absolute'
				}}
				renderLeftView={<NavigationBar.LinkButton
					title={'关闭'}
					onPress={_ => navigate.pop()}
				/>}
				rightHidden={false}
				rightTitle={'完成'}
				rightStyle={{
					color: this.state.text ? styleUtil.successColor : styleUtil.disabledColor,
				}}
				rightDisabled={!this.state.text}
				rightOnPress={_ => {
					let text = this.state.text.trim();
					if (!text) {
						return
					}
					submit && submit(text)
				}}
			/>
		)
	}
	
	onChangeText = text => {
		let remainLength = this.props.maxLength - text.length;
		this.setState({
			text,
			remainLength
		})
	};
	
	renderPage() {
		return (
			<ScrollPage
				keyboardDismissMode={'none'}
			>
				<View style={{
					height: 150,
					marginTop: 10,
					padding: 10,
					backgroundColor: 'white',
					borderRadius: 0,
					borderTopWidth: 1,
					borderBottomWidth: 1,
					borderColor: styleUtil.borderColor
				}}>
					{
						!this.state.isFocused ? <TextInput
							style={styles.inputText}
							multiline
							value={this.state.text}
						/> : <View style={{flex: 1}}>
							<TextInput
								style={styles.inputText}
								onChangeText={this.onChangeText}
								value={this.state.text}
								// returnKeyType={'done'}
								// blurOnSubmit
								multiline
								autoFocus
								enablesReturnKeyAutomatically
								underlineColorAndroid="transparent"
								maxLength={this.props.maxLength}
								placeholder={this.props.placeholder}
							/>
							<Text style={{
								color: this.state.remainLength <= 0 ? 'red' : styleUtil.primaryColor,
								textAlign: 'right'
							}}>{this.state.remainLength}</Text>
						</View>
					}
				</View>
			</ScrollPage>
		)
	}
}

const styles = StyleSheet.create({
	inputText: {
		flex: 1,
		fontSize: 16,
		lineHeight: 16,
		textAlignVertical:'top'
	}
});
