import React from 'react';
import {
	Image,
	StyleSheet,
	View,
	Platform,
} from 'react-native';
import PropTypes from 'prop-types';
import VideoPage from "../../../components/VideoPage";

export default class MessageVideo extends React.Component {
	
	static defaultProps = {
		currentMessage: {
			image: null,
		},
		containerStyle: {},
		imageStyle: {},
	};
	
	static propTypes = {
		currentMessage: PropTypes.object,
		// containerStyle: View.propTypes.style,
		imageStyle: Image.propTypes.style,
	};
	
	render() {
		const {video} = this.props.currentMessage;
		const {height, width} = video;
		let ratio = 1;
		if (height && width) {
			ratio = height / width
		}
		let uri = video.thumb;
		return (
			<VideoPage
				ref={ele => this.video = ele}
				thumb={uri}
				source={{uri: video.path}}
				visible={true}
				width={100}
				height={100 * ratio}
				isSimple={true}
				isShowIcon={false}
				loadingStyle={{
					left: 0,
					top: 30,
				}}
			/>
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
