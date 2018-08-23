import React from 'react'
import {
	View,
	Text
} from 'react-native'
import navigate from "../screens/navigate";
import Profile from "../pages/account/Profile";
import {Avatar, Icon} from 'react-native-elements'
import {ListRow} from 'teaset'
import config from "../common/config";
import PropTypes from 'prop-types'
import styleUtil from "../common/styleUtil";
import ImageCached from "./ImageCached";


export default class UserListRowCheck extends React.Component {
	static propTypes = {
		item: PropTypes.object.isRequired,
		list: PropTypes.array.isRequired,
		checkedList: PropTypes.array,
		index: PropTypes.number,
		detail: PropTypes.oneOfType([PropTypes.element, PropTypes.string, PropTypes.number]),
		type: PropTypes.oneOf(['radio', 'checked'])
	};
	
	static defaultProps = {
		type: 'radio'
	};
	
	selected = (item) => {
		let {checkedList, type} = this.props;
		if (type === 'radio') {
			if (checkedList.length > 0 && checkedList[0]._id === item._id) {
				return
			}
			checkedList = [item]
		} else {
			let index = checkedList.findIndex(row => row._id === item._id);
			if (index > -1) {
				checkedList.splice(index, 1)
			} else {
				checkedList.push(item)
			}
		}
		this.props.updateCheckedList(checkedList)
	};
	
	renderDetail = (item) => {
		let checkedList = this.props.checkedList;
		if (checkedList.findIndex(row => row._id === item._id) > -1) {
			return <Icon
				name={'check'}
				color={styleUtil.successColor}
			/>
		}
		return undefined
	};
	
	render() {
		const {
			item,
			list,
			index
		} = this.props;
		return (
			<ListRow
				title={
					<View style={{
						flexDirection: 'row',
						alignItems:'center',
						marginLeft: 8
					}}>
						<Icon
							name={item.gender === 1 ? 'gender-male' : item.gender === 2 ?  'gender-female' : 'gender-male-female'}
							type={'material-community'}
							size={20}
							color={item.gender === 1 ? '#009ad6' : item.gender === 2 ?  '#f391a9' : '#7D26CD'}
							containerStyle={{marginRight: 5}}
						/>
						<Text>{item.username}</Text>
					</View>
				}
				titleStyle={{marginLeft: 10}}
				detail={this.renderDetail(item)} // <SimilarText similar={item.similar}/>
				onPress={_ => this.selected(item)}
				icon={<ImageCached
					component={Avatar}
					medium
					rounded
					source={config.defaultAvatar(item.avatar)}
				/>}
				topSeparator={index === 0 ? 'full' : 'none'}
				bottomSeparator={index + 1 === list.length ? 'full' : 'indent'}
				accessory={'none'}
			/>
		)
	}
}

