import React, {
	Component
} from 'react'

import {
	StyleSheet,
	ScrollView,
	View,
	Animated
} from 'react-native'
import styleUtil from "../../common/styleUtil";
import Icon from 'react-native-vector-icons/Ionicons'
import {Text} from 'react-native-elements'
import utils from "../../common/utils";
import NavigatorPage from "../../components/NavigatorPage";

export default class UserAbout extends NavigatorPage {
	static defaultProps = {
		...NavigatorPage.navigatorStyle
	};
	
	constructor(props) {
		super(props)
		Object.assign(this.state,  {
			user: props.user || {},
			scrollY: new Animated.Value(0),
		})
	}
	
	renderPage() {
		let {user} = this.state
		return (
			<View style={styles.container}>
				<ScrollView
					scrollEventThrottle={16}
				>
					<View style={styles.title}>
						<Icon
							name={'md-information'}
							size={32}
							color={styleUtil.themeColor}
							style={{paddingTop: 3}}
						/>
						<Text style={styles.h5}>个人信息</Text>
					</View>
					<Text style={styles.text}>用户名：{user.username}</Text>
					<Text style={styles.text}>性别：{user.gender === 2 ? '女' : '男'}</Text>
					<Text style={styles.text}>职业：{user.occupation || '未填写'}</Text>
					<Text style={styles.text}>生日：{utils.formatBirth(user.birth.split('-'))}</Text>
					<Text style={styles.text}>地区：{!user.region ? '未填写' : user.region.replace(',', ' ')}</Text>
					<View style={styles.title}>
						<Icon
							name={'md-information'}
							size={32}
							color={styleUtil.themeColor}
							style={{paddingTop: 3}}
						/>
						<Text style={styles.h5}>个人简介</Text>
					</View>
					<Text>{user.summary}</Text>
				</ScrollView>
			</View>
		)
	}
}

const styles = StyleSheet.create({
	container: {
		backgroundColor: '#fff',
		// paddingTop: 10,
		paddingBottom: 10,
		paddingLeft: 15,
		flex: 1
	},
	title: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 10
	},
	h5: {
		fontSize: 16,
		color: '#000',
		fontWeight: '700',
		marginLeft: 5
	},
	text: {
		marginBottom: 10,
		color: '#575757',
		fontSize: 16
	}
})