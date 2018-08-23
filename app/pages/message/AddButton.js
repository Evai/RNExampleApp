import React from 'react'

import {
	StyleSheet,
	View,
	Text,
	TouchableOpacity
} from 'react-native'

import {Icon} from 'react-native-elements'
import {Menu, ActionSheet} from "teaset";
import CreateChat from "./CreateChat";
import navigate from "../../screens/navigate";
import AddFriend from "./AddFriend";
import AddDynamic from "./AddDynamic";
import QRScanner from "./QRScanner";
import styleUtil from "../../common/styleUtil";

export const getItems = () => {
	return [
		{
			title: '发起群聊',
			icon: <Icon
				name={'ios-chatbubbles'}
				type={'ionicon'}
				color={'#fff'}
				size={18}
				containerStyle={{marginRight: 12}}
			/>,
			onPress: () => navigate.push(CreateChat)
		},
		{
			title: '发布动态',
			icon: <Icon
				name={'mode-edit'}
				color={'#fff'}
				size={18}
				containerStyle={{marginRight: 10}}
			/>,
			onPress: () => navigate.push(AddDynamic,{visibleType:1})
		},
		{
			title: '添加好友',
			icon: <Icon
				name={'person-add'}
				color={'#fff'}
				size={18}
				containerStyle={{marginRight: 10}}
			/>,
			onPress: () => navigate.push(AddFriend)
		},
		{
			title: '扫一扫',
			icon: <Icon
				name={'qrcode'}
				type={'material-community'}
				color={'#fff'}
				size={18}
				containerStyle={{marginRight: 10}}
			/>,
			onPress: () => navigate.push(QRScanner)
		},
	];
}

export default class AddButton extends React.Component {
	_onPress = () => {
		this._component.measureInWindow((x, y, width, height) => {
			Menu.show({x, y, width, height}, getItems(), {showArrow: true, align: 'end', animated: true});
		});
	}
	
	render() {
		return (
			<TouchableOpacity
				style={this.props.style}
				ref={ele => this._component = ele}
				onPress={this._onPress}
			>
				<Icon
					name={'add'}
					size={32}
					color={styleUtil.navIconColor}
				/>
			</TouchableOpacity>
		)
	}
}
//
// const styles = StyleSheet.create({
//     button: {
//         overflow: 'hidden',
//         width: 34,
//         height: 34,
//         borderRadius: 34 / 2,
//         justifyContent: 'center',
//         alignItems: 'center',
//     },
// });