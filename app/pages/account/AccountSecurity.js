import React from 'react'
import {
	StyleSheet,
	Text,
	View,
	Image,
	TouchableOpacity,
	Alert,
} from 'react-native'

import {ListRow, Button} from 'teaset'
import ScrollPage from "../../components/ScrollPage";
import styleUtil from "../../common/styleUtil";
import {Icon} from 'react-native-elements'

export default class AccountSecurity extends React.Component {
	static navigatorStyle = {
		title:'账号安全'
	};
	render() {
		const user = config.user;
		return (
			<ScrollPage>
				<View style={styleUtil.listSpace}>
					<ListRow
						style={{marginLeft: 5}}
						title={'手机号'}
						detail={user.phone}
						icon={<Icon
							containerStyle={{marginRight: 10}}
							name={'mobile'}
							type={'font-awesome'}
							size={26}
							color={styleUtil.primaryColor}
						/>}
						topSeparator={'full'}
						bottomSeparator={'full'}
					/>
				</View>
				<Text style={{
					paddingTop: 10,
					paddingBottom: 10,
					paddingLeft: 15,
					color: styleUtil.detailTextColor
				}}>绑定设置</Text>
				<ListRow
					title={'邮箱'}
					detail={<Button type='primary'
					                size='sm'
					                disabled
					                title='已绑定'/>}
					icon={<Icon containerStyle={{marginRight: 10}}
					            name={'email'}
					            size={20}
					            color={'orange'}/>}
					topSeparator={'full'}
				/>
				<ListRow
					title={'QQ'}
					detail={<Button type='primary'
					                size='sm'
					                disabled
					                title='已绑定'/>}
					icon={<Icon containerStyle={{marginRight: 10}}
					            name={'qq'}
					            size={20}
					            type={'font-awesome'}
					            color={'#4495D3'}/>}
				/>
				<ListRow
					title={'微信'}
					detail={<Button type='primary'
					                size='sm'
					                disabled
					                title='已绑定'/>}
					icon={<Icon containerStyle={{marginRight: 10}}
					            name={'wechat'}
					            size={20}
					            type={'font-awesome'}
					            color={'#61951A'}/>}
				/>
				<ListRow
					title={'微博'}
					detail={<Button type='primary'
					                size='sm'
					                disabled
					                title='已绑定'/>}
					icon={<Icon containerStyle={{marginRight: 10}}
					            name={'weibo'}
					            size={20}
					            type={'font-awesome'}
					            color={'#E31C34'}/>}
					bottomSeparator={'full'}
				/>
			</ScrollPage>
		)
	}
}