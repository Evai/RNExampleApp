import React from 'react'
import {
	View,
	Text,
	ActivityIndicator,
	StyleSheet,
	Image
} from 'react-native'
import PropTypes from 'prop-types'
import ImageCached from "../ImageCached";
import Spinkit from 'react-native-spinkit'
import styleUtil from "../../common/styleUtil";

export default class LoadingMore extends React.Component {
	static propTypes = {
		hasMore: PropTypes.bool,
		showText: PropTypes.bool,
		showSimple: PropTypes.bool,
		text: PropTypes.string,
		type: PropTypes.string,
		icon: Image.propTypes.source
	};
	
	static defaultProps = {
		hasMore: true,
		showText: true,
		text: '——  我是有底线的  ——',
		icon: require('../../assets/image/blank.png'),
		type: 'Wave',
		showSimple: false
	};
	
	render() {
		let {hasMore, showText, text, icon} = this.props;
		if (hasMore) {
			return (
				<View style={{
					justifyContent: 'center',
					alignItems: 'center'
				}}>
					{!this.props.showSimple ? <Spinkit
						type={this.props.type}
						color={styleUtil.themeColor}
					/> : <ActivityIndicator
						color={'#666'}
						style={styles.loadingMore}
						size="small"
						{...this.props}
					/>}
				
				</View>
			)
		}
		if (!hasMore && showText) {
			return <View style={{
				justifyContent: 'center',
				alignItems: 'center',
				flexDirection: 'row',
				marginTop: 10,
				marginBottom: 10
			}}>
				{/*<ImageCached*/}
					{/*style={{*/}
						{/*width: 24,*/}
						{/*height: 24,*/}
						{/*marginRight: 10*/}
					{/*}}*/}
					{/*source={icon}/>*/}
				<Text style={{fontSize: 14, color:'#666'}}>{text}</Text>
			</View>
		}
		return <View/>;
	}
}

const styles = StyleSheet.create({
	loadingMore: {
		marginVertical: 10
	},
	loadingText: {
		fontSize: 18,
		textAlign: 'center',
		backgroundColor: '#fff',
		paddingTop: 10,
		paddingBottom: 10
	}
});
