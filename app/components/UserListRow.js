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
import ImageCached from "./ImageCached";


export default class UserListRow extends React.Component {
	static propTypes = {
		item: PropTypes.object,
		list: PropTypes.array,
		index: PropTypes.number,
		detail: PropTypes.oneOfType([PropTypes.element, PropTypes.string, PropTypes.number])
	};
	
	render() {
		const {
			item,
			list,
			index,
			detail,
			onPress
		} = this.props
		return (
			<ListRow
				title={
					<View style={{
						flexDirection: 'row',
						marginLeft: 8,
						alignItems:'center'
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
				detail={detail} // <SimilarText similar={item.similar}/>
				onPress={_ => {
					if (onPress) {
						onPress()
					} else {
						navigate.push(Profile, {
							_id: item._id
						})
					}
				}}
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

