'use strict'

import React from 'react';
import {
	Text,
	View,
} from 'react-native';
import {
	Button
} from 'react-native-elements'
import styleUtil from "../common/styleUtil";
import PhoneLogin from "../pages/account/PhoneLogin";
import navigate from "../screens/navigate";
import NavigatorPage from "./NavigatorPage";

export default class NeedLogin extends NavigatorPage {
	static defaultProps = {
		...NavigatorPage.navigatorStyle,
		showBackButton:false,
		title:'好友'
	};
	
	renderPage() {
		return (
			<View style={{
				flex: 1,
				justifyContent: 'center',
				alignItems:'center',
				padding: 20,
				backgroundColor: styleUtil.backgroundColor
			}}>
				{this.props.isLoaded &&
				<View>
					<Text style={{
						fontSize: 18,
						color: '#000',
						textAlign: 'center'
					}}>
						亲~你还没有登录哦！登录后即可开始和你的好朋友畅聊啦~
					</Text>
					<Button
						onPress={_ => navigate.push(PhoneLogin)}
						title="登录"
						loadingProps={{
							size: "large",
							color: "rgba(111, 202, 186, 1)"
						}}
						fontSize={20}
						buttonStyle={{
							backgroundColor: styleUtil.themeColor,
							borderColor: "transparent",
							borderWidth: 0,
							borderRadius: 5,
							marginTop: 10
						}}
						textProps={{fontWeight: "700", color: '#fff'}}
						containerStyle={{marginTop: 20}}
					/>
				</View>
				}
			</View>
		)
	}
}