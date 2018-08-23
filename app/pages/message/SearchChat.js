import React from 'react'
// import {
//
// } from 'react-native'

import {ListRow} from 'teaset'
import {Avatar} from 'react-native-elements'
import ImageCached from "../../components/ImageCached";


export default class SearchChat extends React.Component {
	constructor(props) {
		super(props)
	}
	
	render() {
		let {
			row,
			i,
			arr,
			onPress
		} = this.props
		return (
			<ListRow
				title={row.user.remarkName ? row.user.remarkName : row.user.username}
				titleStyle={{marginLeft: 10}}
				onPress={onPress && onPress}
				icon={
					<ImageCached
						component={Avatar}
						medium
						rounded
						source={{uri: row.user.avatar}}
					/>
				}
				topSeparator={i === 0 ? 'full' : 'none'}
				bottomSeparator={i + 1 === arr.length ? 'full' : 'indent'}
				accessory={'none'}
			/>
		)
	}
}