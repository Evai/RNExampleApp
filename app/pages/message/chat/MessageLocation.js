import React from 'react';
import {
	Image,
	View,
	Linking,
	Platform,
	StyleSheet,
	TouchableOpacity,
	Text
} from 'react-native';

//import MapView from 'react-native-maps';
//import AMap from 'react-native-smart-amap';
import {Icon} from 'react-native-elements'

export default class MessageLocation extends React.Component {
	
	render() {
		const {location} = this.props.currentMessage;
		return (
			<View  style={styles.container}>
				<Icon name={'location-on'} size={20} color={'red'}/>
				<View style={styles.title}>
					<Text
						style={{
							fontSize: 12,
							color: this.props.currentMessage.fromUserId === this.props.user._id ? 'white' : 'black'
						}}
						numberOfLines={2}>
						{location.address}
					</Text>
				</View>
				{/*<Image style={styles.mapView}*/}
				       {/*source={require("./Images/location.png")}>*/}
				
				{/*</Image>*/}
			</View>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		maxWidth: 200,
		padding:5,
		flexDirection:'row'
	},
	title: {
		backgroundColor: 'transparent',
		// flex: 1,
		padding: 5,
		borderTopRightRadius: 5,
		borderTopLeftRadius: 5,
	},
	mapView: {
		width: 200,
		height: 100,
		borderBottomRightRadius: 5,
		borderBottomLeftRadius: 5
	}
});


