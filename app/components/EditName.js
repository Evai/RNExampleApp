import React from 'react'

import {
	StyleSheet,
	View,
	Text
} from 'react-native'
import navigate from "../screens/navigate";
import {Input, NavigationBar} from 'teaset'
import styleUtil from "../common/styleUtil";
import ScrollPage from "./ScrollPage";
import NavBar from "./NavBar";

export default class EditName extends React.Component {
	static navigatorStyle = {
		scene: navigate.sceneConfig.FloatFromBottom,
		navBarHidden: true
	};
	
	constructor(props) {
		super(props)
		this.state = {
			text: props.text || '',
			isEdit: false
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
					onPress={_ => navigate.pop()}
				/>}
				rightHidden={false}
				rightTitle={'完成'}
				rightStyle={{
					color: this.state.isEdit ? styleUtil.successColor : styleUtil.disabledColor,
				}}
				rightDisabled={!this.state.isEdit}
				rightOnPress={_ => {
					let text = this.state.text.trim();
					if (!this.state.isEdit) {
						return
					}
					else if (this.props.text === text) {
						navigate.pop();
						return
					}
					submit && submit(text)
				}}
			/>
		)
	};
	
	updateUsername = text => {
		let newState = {text}
		if (!this.state.isEdit) {
			newState.isEdit = true;
		}
		this.setState(newState)
	};
	
	render() {
		if (!this.props.isFocused) {
			return <View>
				{this.renderNavBar()}
				<Input
					style={styles.input}
					size={'lg'}
					value={this.state.text}
				/>
			</View>
		}
		return (
			<View>
				{this.renderNavBar()}
				<ScrollPage
					keyboardDismissMode={'none'}
				>
					<Input
						style={styles.input}
						size={'lg'}
						value={this.state.text}
						onChangeText={this.updateUsername}
						autoFocus={true}
						autoCorrect={false}
						returnKeyType={'done'}
						clearButtonMode={'while-editing'}
						maxLength={this.props.maxLength || 20}
						keyboardType={this.props.keyboardType}
						placeholder={this.props.placeholder}
						enablesReturnKeyAutomatically={true}
					/>
					{this.props.explain &&
						<Text style={{
							color:styleUtil.detailTextColor,
							padding:8
						}}>{this.props.explain}</Text>
					}
				</ScrollPage>
			</View>
		)
	}
}

const styles = StyleSheet.create({
	input: {
		backgroundColor: 'white',
		borderRadius: 0,
		borderLeftWidth: 0,
		borderRightWidth: 0,
		marginTop: 10,
		fontSize:14
	}
});
