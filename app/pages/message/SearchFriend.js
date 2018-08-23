import React from 'react'
import {
	View
} from 'react-native'

import {ListRow} from 'teaset'
import {Avatar, Icon} from 'react-native-elements'
import styleUtil from "../../common/styleUtil";
import ImageCached from "../../components/ImageCached";

const DEFAULT_MEMBER = 100;

export default class SearchFriend extends React.Component {
	disabled = false;
	
	checkedUser = row => {
		let {
			checkedList,
			updateCheckedList,
			memberTotal
		} = this.props;
		
		let index = checkedList.findIndex(v => v._id === row._id);
		if (index === -1) {
			if (checkedList.length >= (DEFAULT_MEMBER - memberTotal)) {
				toast.info('群聊成员最多不能超过' + DEFAULT_MEMBER + '人')
				return
			}
			checkedList.push(row)
		} else {
			checkedList.splice(index, 1)
		}
		updateCheckedList(checkedList, row)
	};
	
	showDetail = () => {
		let {
			row,
			checkedList = [],
			members = []
		} = this.props;
		if (members.findIndex(item => item._id === row._id) > -1) {
			this.disabled = true;
			return <Icon
				name={'check'}
				color={styleUtil.disabledColor}
			/>
		}
		else if (checkedList.findIndex(item => item._id === row._id) > -1) {
			return <Icon
				name={'check'}
				color={styleUtil.successColor}
			/>
		}
		return undefined
	};
	
	render() {
		let {
			row,
			i,
			arr,
		} = this.props
		return (
			<ListRow
				title={row.username}
				titleStyle={{marginLeft: 10}}
				onPress={this.disabled ? undefined : _ => this.checkedUser(row)}
				icon={
					<View style={{
						flexDirection: 'row',
						alignItems:'center'
						// marginLeft: 8
					}}>
						<ImageCached
							component={Avatar}
							medium
							rounded
							source={config.defaultAvatar(row.avatar)}
							containerStyle={{marginRight: 5}}
						/>
						<Icon
							name={row.gender === 1 ? 'gender-male' : row.gender === 2 ? 'gender-female' : 'gender-male-female'}
							type={'material-community'}
							size={20}
							color={row.gender === 1 ? '#009ad6' : row.gender === 2 ? '#f391a9' : '#7D26CD'}
						/>
					</View>
				}
				topSeparator={i === 0 ? 'full' : 'none'}
				bottomSeparator={i + 1 === arr.length ? 'full' : 'indent'}
				accessory={'none'}
				detail={this.showDetail()}
				activeOpacity={this.disabled ? 1 : undefined}
			/>
		)
	}
}