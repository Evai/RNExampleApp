import React from 'react';
import {
	View
} from 'react-native';

import MapView,{Marker} from 'react-native-maps';

export default class MapPage extends React.Component {
	static navigatorStyle = {
		navigationBarInsets: false,
		style:{backgroundColor:'transparent'}
	};
	render() {
		let message = this.props.message;
		return (
			<MapView
				style={{flex:1}}
				initialRegion={{
					latitude: message.location.latitude,
					longitude: message.location.longitude,
					latitudeDelta: 0.0922,
					longitudeDelta: 0.0421,
				}}
				scrollEnabled={true}
				zoomEnabled={true}
			>
				<Marker
					coordinate={message.location}
					title={message.location.address}
					description={message.location.address}
				/>
			</MapView>
		)
	}
}