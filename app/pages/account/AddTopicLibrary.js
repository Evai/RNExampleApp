import React from 'react'

import {
	StyleSheet,
	View,
	Switch
} from 'react-native'
import {Input, NavigationBar, ListRow} from 'teaset'
import NavBar from "../../components/NavBar";
import ScrollPage from "../../components/ScrollPage";
import styleUtil from "../../common/styleUtil";
import navigate from "../../screens/navigate";

export default class AddTopicLibrary extends React.Component {
	static navigatorStyle = {
		scene: navigate.sceneConfig.FloatFromBottom,
		navBarHidden: true,
	};
	
	constructor(props) {
		super(props)
		this.state = {
			text: props.text || '',
			isHidden: true
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
					color: this.state.text ? styleUtil.successColor : styleUtil.disabledColor,
				}}
				rightDisabled={!this.state.text}
				rightOnPress={_ => {
					let text = this.state.text.trim();
					if (!this.state.text) {
						return
					}
					submit && submit(text, this.state.isHidden)
				}}
			/>
		)
	};
	
	updateUsername = text => {
		text = text.trim();
		this.setState({text})
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
				<View style={{marginTop: 20}}>
					<ListRow
						title={'是否公开可见'}
						detail={
							<Switch
								value={this.state.isHidden}
								onValueChange={isHidden => this.setState({isHidden})}
							/>
						}
						topSeparator={'full'}
						bottomSeparator={'full'}
					/>
				</View>
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
						returnKeyType={'done'}
						clearButtonMode={'while-editing'}
						placeholder={'题库标题'}
						maxLength={20}
						enablesReturnKeyAutomatically={true}
					/>
					<View style={{marginTop: 20}}>
						<ListRow
							title={'是否公开可见'}
							detail={
								<Switch
									value={this.state.isHidden}
									onValueChange={isHidden => this.setState({isHidden})}
								/>
							}
							topSeparator={'full'}
							bottomSeparator={'full'}
						/>
					</View>
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
		fontSize:16
	}
});
