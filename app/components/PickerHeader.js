import React from 'react'
import {
	View,
	Text,
	TouchableOpacity
} from 'react-native'
import styleUtil from "../common/styleUtil";


export default class PickerHeader extends React.Component {
	render() {
		const {
			onCancel = _ => {
			},
			onDone = _ => {
			}
		} = this.props
		return (
			<View style={{
				flexDirection: 'row',
				alignItems: 'center',
				justifyContent: 'space-between',
				padding: 10,
				borderBottomWidth: 0.5,
				borderBottomColor: styleUtil.borderColor
			}}>
				<TouchableOpacity
					onPress={onCancel}
				>
					<Text style={{fontSize: 16, color: '#333'}}>取消</Text>
				</TouchableOpacity>
				<TouchableOpacity
					onPress={onDone}
				>
					<Text style={{fontSize: 16, color: styleUtil.successColor}}>完成</Text>
				</TouchableOpacity>
			</View>
		)
	}
}