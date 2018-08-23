import React from 'react'
import {
	StyleSheet,
	View,
	Text
} from 'react-native';

import QRCode from 'react-native-qrcode';
import styleUtil from "../../../common/styleUtil";
import {Avatar, Icon} from 'react-native-elements'
import config from "../../../common/config";
import navigate from "../../../screens/navigate";
import NavBar from "../../../components/NavBar";
import ImageCached from "../../../components/ImageCached";
import IntegralTabs from "../IntegralTabs";

export default class UserQRCode extends React.Component {
	static navigatorStyle = {
		navBarHidden: true
	};
	
	renderAvatar = avatar => {
		if (!Array.isArray(avatar)) {
			avatar = [avatar];
		}
		return (
			avatar.length !== 1 ?
				<View style={{
					flexDirection: 'row',
					flexWrap: 'wrap',
					width: 50,
					height: 50,
					marginRight: 12,
					justifyContent: 'space-around',
					alignItems: 'center'
				}}>
					{avatar.map((v, i) => (
						<ImageCached
							component={Avatar}
							key={i}
							containerStyle={{
								width: 23,
								height: 23
							}}
							avatarStyle={{
								width: 23,
								height: 23,
								borderRadius: 12
							}}
							rounded
							source={config.defaultAvatar(v)}
						/>
					))}
				</View> :
				<ImageCached
					component={Avatar}
					containerStyle={{marginRight: 10}}
					medium
					rounded
					source={config.defaultAvatar(avatar[0])}
				/>
		)
	};
	
	renderNavBar = () => {
		return (
			<NavBar
				renderTitleView={
					<Text style={{color:'white',fontSize:17}}>{this.props.title}</Text>
				}
				leftIconStyle={{tintColor:'white'}}
				style={{
					backgroundColor:styleUtil.themeColor,
					borderBottomWidth:0
				}}
			/>
		)
	};
	
	render() {
		const user = config.user;
		return (
			<View style={styleUtil.container}>
				{this.renderNavBar()}
				<View style={styles.container}>
					<View style={styles.QRBox}>
						<View style={{
							marginBottom: 20,
							flexDirection: 'row',
							alignItems: 'center'
						}}>
							{this.renderAvatar(this.props.avatar)}
							<Text
								style={{
									marginRight: 5,
									fontSize: 14,
									lineHeight: 18,
									maxWidth: 130
								}}
								numberOfLines={2}
							>{this.props.name}</Text>
							{!this.props.isGroup && <Icon
								name={user.gender === 2 ? 'md-female' : 'md-male'}
								type={'ionicon'}
								size={14}
								color={user.gender === 2 ? '#f391a9' : '#009ad6'}
							/>}
						</View>
						<QRCode
							value={this.props.uri}
							size={200}
							bgColor='black'
							fgColor='white'
						/>
						<Text style={{
							color: '#666',
							textAlign: 'center',
							marginTop: 20,
							fontSize: 13
						}}>{this.props.text}</Text>
					</View>
				</View>
			</View>
		);
	};
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: styleUtil.themeColor,
		alignItems: 'center',
		justifyContent: 'center'
	},
	QRBox: {
		backgroundColor: 'white',
		paddingLeft: 36,
		paddingRight: 36,
		paddingTop: 24,
		paddingBottom: 24,
		borderRadius: 5
	}
});