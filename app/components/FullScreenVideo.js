import React from "react";
import {
	Platform,
	View,
	StatusBar
} from "react-native";
import styleUtil from "../common/styleUtil";
import VideoPlayer from 'react-native-true-sight'
import {Icon} from 'react-native-elements'
import RNFetchBlob from 'react-native-fetch-blob'
import uuid from 'uuid'

const BASE_DIR = RNFetchBlob.fs.dirs.CacheDir + "/react-native-video-cache/";
const FILE_PREFIX = Platform.OS === "ios" ? "" : "file://";
const VIDEO_CACHE = {};

export default class FullScreenVideo extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			uri: props.uri
		};
	}
	
	getPath = (path) => {
		const ext = path.indexOf(".") === -1 ? ".mp4" : path.substring(path.indexOf("."));
		return BASE_DIR + uuid.v4() + ext;
	};
	
	getWithCache = (cache) => {
		RNFetchBlob.fs.exists(cache.path).then((exists) => {
			if (exists) {
				this.setState({
					uri: cache.path
				});
			} else {
				this.download(this.props.uri);
			}
		});
	};
	
	download = (uri) => {
		if (uri.indexOf('http') === -1) {
			return;
		}
		VIDEO_CACHE[uri] = VIDEO_CACHE[uri] || {};
		const cache = VIDEO_CACHE[uri];
		const path = this.getPath(uri);
		cache.task = RNFetchBlob.config({
			// fileCache: true,
			path
		}).fetch('GET', uri);
		
		cache.task.then((res) => {
			cache.path = FILE_PREFIX + path;
			// console.warn(path)
		}).catch(e => {
			RNFetchBlob.fs.unlink(path);
		})
	}
	
	componentDidMount() {
		const uri = this.props.uri;
		const cache = VIDEO_CACHE[uri];
		if (cache) {
			this.getWithCache(cache);
		}
		else {
			this.download(uri);
		}
	}
	
	componentWillUnmount() {
	
	}
	
	onClose = () => {
		// VIDEO_CACHE[this.props.uri].task.cancel();
		this.props.onClose && this.props.onClose();
	};
	
	render() {
		return (
			<View style={{
				flex: 1,
				width: styleUtil.window.width,
				height: styleUtil.window.height,
				backgroundColor: 'black'
			}}>
				<Icon
					name={'close'}
					color={'white'}
					size={30}
					underlayColor={'transparent'}
					containerStyle={{
						position: 'absolute',
						top: 20,
						left: 20,
						zIndex: 99
					}}
					onPress={this.onClose}
				/>
				<VideoPlayer source={this.state.uri} />
			</View>
		)
	}
}