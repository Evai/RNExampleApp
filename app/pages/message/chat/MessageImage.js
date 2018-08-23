import React from 'react';
import {
	Image,
	StyleSheet,
	View,
	Platform,
} from 'react-native';
import PropTypes from 'prop-types';
import ImageCached from "../../../components/ImageCached";

export default class MessageImage extends React.Component {
	
	render() {
		const {image} = this.props.currentMessage;
		const {height, width} = image;
		let ratio = 1;
		if (height && width) {
			ratio = height / width
		}
		let uri = image.path;
		return (
			<View style={[styles.container, this.props.containerStyle]}>
				<ImageCached
					source={{uri}}
					style={[styles.image, this.props.imageStyle, {width: 100, height: 100 * ratio}]}
				/>
			</View>
		);
	}
}

const styles = StyleSheet.create({
	container: {},
	image: {
		borderRadius: 5
	},
	imageActive: {
		flex: 1,
		resizeMode: 'contain',
	},
});

MessageImage.defaultProps = {
	currentMessage: {
		image: null,
	},
	containerStyle: {},
	imageStyle: {},
};

MessageImage.propTypes = {
	currentMessage: PropTypes.object,
	// containerStyle: View.propTypes.style,
	imageStyle: Image.propTypes.style,
};
