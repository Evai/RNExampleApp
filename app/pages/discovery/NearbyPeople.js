'use strict'

import React from 'react'
import {
	StyleSheet,
	Text,
	View,
	Image,
	Platform
} from 'react-native'
import styleUtil from '../../common/styleUtil'
import NavigatorPage from "../../components/NavigatorPage";
import ScrollPage from "../../components/ScrollPage";
import UserListRow from "../../components/UserListRow";
import LoadingMore from "../../components/load/LoadingMore";
import request from "../../common/request";
import {GeoLocation} from "../../../App";
// import {GeoLocation} from "react-native-amap-geolocation/lib/js/index";

export default class NearbyPeople extends NavigatorPage {
	static defaultProps = {
		...NavigatorPage.navigatorStyle,
		title: '附近的人'
	};
	
	constructor(props) {
		super(props)
		this.position = null;
		Object.assign(this.state, {
			list: [],
			isLoad: true
		})
	}
	
	componentDidMount() {
		if (Platform.OS === 'ios') {
			this.getCurrentPosition();
		} else {
			if (GeoLocation) {
				GeoLocation.addLocationListener(location => {
					// console.warn(location)
					GeoLocation.stop();
					const {latitude, longitude} = location;
					this.fetchNearbyUser(latitude, longitude)
				})
				setTimeout(() => {
					GeoLocation.start();
				}, 200)
			} 
		}
	}
	
	componentWillUnmount() {
		if (GeoLocation) {
			GeoLocation.removeLocationListener();
			GeoLocation.stop()
		}
	}
	
	getCurrentPosition = () => {
		navigator.geolocation.getCurrentPosition(
			(position) => {
				let latitude = Math.abs(position.coords.latitude);
				let longitude = Math.abs(position.coords.longitude);
				this.position = position;
				this.page = 1;
				this.fetchNearbyUser(latitude, longitude)
			},
			(error) => alert(error.message),
			{enableHighAccuracy: true, timeout: 20000, maximumAge: 1000}
		);
	};
	
	fetchNearbyUser = (latitude, longitude) => {
		setTimeout(_ => {
			request.post(config.api.baseURI + config.api.getNearByUser, {
				latitude,
				longitude
			}).then(res => {
				if (res.code === 0) {
					this.setState({
						list: res.data,
						isLoad: false
					})
				}
			}).catch(e => {
			
			})
		}, config.loadingTime)
	};
	
	renderPage() {
		if (this.state.list.length === 0) {
			return <LoadingMore hasMore={this.state.isLoad} text={'附近暂时没有人哦！'}/>
		}
		return (
			<ScrollPage>
				{this.state.list.map((v, i, arr) => (
					<UserListRow
						key={i}
						item={v}
						index={i}
						list={arr}
						detail={(v.distance).toFixed(2) + 'km'}
					/>
				))}
			</ScrollPage>
		)
	}
}


const styles = StyleSheet.create({
	thumbsBox: {
		flex: 1,
		flexDirection: 'row',
		flexWrap: 'wrap',
		padding: 15
	},
	thumbs: {
		width: (styleUtil.window.width - 30 - 20) / 3,
		height: (styleUtil.window.width - 30 - 20) / 3,
		borderRadius: 8
	},
	title: {
		fontSize: 15,
		textAlign: 'center',
		margin: 8
	}
});