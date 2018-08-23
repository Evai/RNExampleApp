import React from 'react'
import {
	View,
	StatusBar,
	Image,
	TouchableOpacity,
	CameraRoll,
} from 'react-native'
import {
	CustomCachedImage,
	ImageCache
} from 'react-native-img-cache';
import {Overlay, AlbumView} from "teaset";
import PropTypes from 'prop-types'
import styleUtil from "../common/styleUtil";
import toast from "../common/toast";

export default class ImageCached extends React.Component {
	
	static propTypes = {
		source: Image.propTypes.source.isRequired,
		style: Image.propTypes.style,
		images: PropTypes.array,
		index: PropTypes.number,
		isOnPress: PropTypes.bool,
	};
	
	static defaultProps = {
		images: [],
		index: 0,
		isOnPress: false,
	};
	
	state = {
		width: styleUtil.window.width,
		height: styleUtil.window.height
	};
	
	componentWillMount() {
		this._isMounted = true;
	}
	
	componentDidMount() {
		if (this._isMounted) {
			if (typeof this.props.source === 'object' && this.props.source.uri) {
				Image.getSize(this.props.source.uri,
					(width, height) => {
						this.setState({width, height})
					},
					(error) => {
					}
				);
			}
		}
	}
	
	componentWillUnmount() {
		this._isMounted = false;
	}
	
	static cache = ImageCache;
	
	static onImagePress = (pressView, images = [], index = 0) => {
		pressView.measure((x, y, width, height, pageX, pageY) => {
			let overlayView = (
				<Overlay.PopView
					style={{}}
					containerStyle={{flex: 1}}
					overlayOpacity={1}
					type='custom'
					customBounds={{x: pageX, y: pageY, width, height}}
					ref={v => this.fullImageView = v}
				>
					<AlbumView
						style={{flex: 1}}
						control={images.length > 1}
						images={images}
						maxScale={5}
						thumbs={images}
						defaultIndex={index || 0}
						onPress={_ => this.fullImageView && this.fullImageView.close()}
						onLongPress={_ => {
							let uri = '';
							if (React.isValidElement(images[index]) && images[index].props.source.uri) {
								uri = images[index].props.source.uri;
								
							} else if (images[index].source && images[index].source.uri) {
								uri = images[index].source.uri;
							}
							if (uri) {
								let items = [{
									title: '保存到相册',
									onPress: _ => {
										CameraRoll.saveToCameraRoll(uri, 'photo')
											.then(res => {
												toast.success('图片已保存在本地相册');
											}).catch(e=> {
												toast.fail('保存图片失败');
										});
										
									}
								}];
								config.showAction(items);
							}
						}}
					/>
					<StatusBar animated={false} hidden={true}/>
				</Overlay.PopView>
			);
			Overlay.show(overlayView);
		});
	};
	
	static generateCacheImages = (images, width, height) => {
		return images.map((item, i) => {
			let props = {
				key: 'img' + i,
				source: typeof item === 'string' ? {uri: item} : item,
				style: {
					width,
					height
				},
				resizeMode: 'contain'
			};
			return (
				<CustomCachedImage component={Image} {...props}/>
			)
		});
		
	};
	
	render() {
		let {
			viewStyle = {},
			isOnPress,
			onPress,
			images,
			index,
			component,
			onLongPress,
			...others
		} = this.props;
		const CustomView = isOnPress ? TouchableOpacity : View;
		component = component || Image;
		return (
			<CustomView
				ref={'image' + index}
				style={viewStyle}
				activeOpacity={1}
				onPress={() => {
					if (onPress) {
						onPress()
					} else {
						let pressView = this.refs['image' + index];
						ImageCached.onImagePress(pressView, ImageCached.generateCacheImages(images, this.state.width, this.state.height), index)
					}
				}}
				onLongPress={onLongPress}
			>
				<CustomCachedImage
					component={component}
					reziseMode={'cover'}
					// mutable
					{...others}>
					{this.props.children}
				</CustomCachedImage>
			</CustomView>
		)
	}
}