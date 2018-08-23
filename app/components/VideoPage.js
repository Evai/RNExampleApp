import React from 'react'
import {
	View,
	Text,
	StyleSheet,
	Alert,
	TouchableOpacity,
	Animated,
	Platform,
	Image
} from 'react-native'
import Video from 'react-native-video'
import styleUtil from "../common/styleUtil";
import {Icon} from 'react-native-elements'
import {Bar} from 'react-native-progress'
import OverlayModal from "./OverlayModal";
import PropTypes from 'prop-types'
import utils from "../common/utils";
import LoadingMore from "./load/LoadingMore";
import ImageCached from "./ImageCached";
import FullScreenVideo from "./FullScreenVideo";
import {Overlay} from 'teaset'

export default class VideoPage extends React.Component {
	static defaultProps = {
		paused: true,
		muted: false,
		isShowIcon: true
	};
	
	static propTypes = {
		source: Video.propTypes.source,
		visible: PropTypes.bool,
		width: PropTypes.number,
		height: PropTypes.number,
		isSimple: PropTypes.bool,
		muted: PropTypes.bool,
		paused: PropTypes.bool,
		thumb: PropTypes.string,
	};
	
	constructor(props) {
		super(props)
		this.state = {
			paused: props.paused,
			rate: 1, // 0 is paused, 1 is normal.
			volume: 1.0, // 0 is muted, 1 is normal.
			muted: props.muted, //是否静音
			resizeMode: 'contain', //cover or contain.
			repeat: false, //Repeat forever
			progress: 0, //0-1
			loading: true,
			isEnd: false,
			isError: false,
			currentTime: 0,
			duration: 0,
			showHeader: false,
			showFooter: false,
			showThumb: true,
		};
		this.player = null;
		this.animations = {
			loader: {
				rotate: new Animated.Value(0),
				MAX_VALUE: 360,
			}
		}
	}
	
	componentDidMount() {
	
	}
	
	componentWillReceiveProps(nextProps) {
		if (this.state.paused !== nextProps.paused) {
			if (nextProps.paused) {
				this.stop()
			}
		}
	}
	
	componentWillUnmount() {
		this.timer && clearTimeout(this.timer)
	}
	
	_onLoadStart = () => {
		// console.log('_onLoadStart')
	}
	
	_onLoad = (data = {}) => {
		// this.player.seek(0);
		this.setState({
			duration: data.duration
		});
		// console.warn('_onLoad', data)
	}
	
	_onProgress = (data) => {
		// console.log('onProgress')
		let currentTime = data.currentTime
		let percent = Number((currentTime / this.state.duration).toFixed(2))
		let newState = {
			progress: percent,
			currentTime: Math.floor(currentTime)
		};
		if (this.state.isEnd) {
			newState.paused = true
		}
		this.setState(newState)
		// console.log('_onProgress')
	};
	
	_onEnd = () => {
		this.setState({
			isEnd: true,
			progress: 1,
			loading: false
		})
		// console.warn('_onEnd')
	};
	
	_onError = (e) => {
		// console.log(e)
		this.setState({
			isError: true
		})
		// Alert.alert('很抱歉！视频出错了哦！')
	};
	
	stop = () => {
		this.setState({
			paused: true
		})
	};
	
	_stopOrResume = () => {
		if (this.state.isEnd) {
			this._replay()
		} else {
			let paused = !this.state.paused;
			this.setState({
				paused
			})
		}
	};
	
	_onBuffer = (data) => {
		// console.log('onBuffer', data)
		this.setState({
			loading: data.isBuffering
		})
	};
	
	_replay = () => {
		this.setState({
			isEnd: false,
			paused: false,
			muted: false
		});
		this.player.seek(0)
	};
	
	renderHeader = () => {
		return (
			<View style={styles.header}>
				<Icon
					name={'md-close'}
					type={'ionicon'}
					onPress={_ => OverlayModal.hide()}
				/>
			</View>
		)
	};
	
	renderFooter = () => {
		return (
			<TouchableOpacity
				style={[styles.footer, {width: this.props.width}]}
				activeOpacity={1}
				onPress={_ => {
					this.setState({
						showFooter: true
					}, _ => {
						this.timer && clearTimeout(this.timer)
						this.timer = setTimeout(() => {
							this.setState({
								showFooter: false
							})
						}, 5000)
					})
				}}
			>
				<Icon
					name={this.state.paused ? 'play-arrow' : 'pause'}
					color={'white'}
					size={30}
					underlayColor={'transparent'}
					onPress={_ => this._stopOrResume()}
				/>
				<Bar
					progress={this.state.progress}
					width={styleUtil.window.width - 180}
					color={'white'}
					unfilledColor={'#888'}
					thickness={1}
					showsText={false}
					height={2}
					borderColor={'#888'}
					borderWidth={0}
					borderRadius={0}
				/>
				<Text style={{color: 'white'}}>
					-
					{utils.formatTimer(this.state.duration - this.state.currentTime)}
				</Text>
				<Icon
					name={'fullscreen'}
					color={'white'}
					size={30}
					underlayColor={'transparent'}
					onPress={_ => this.player.presentFullscreenPlayer()}
				/>
			</TouchableOpacity>
		)
	};
	
	renderIcon = () => {
		// console.warn(111)
		return (
			<TouchableOpacity
				onPress={_ => {
					this.setState({
						showThumb: false,
						muted: false,
					}, _ => {
						if (this.props.isSimple) {
							// console.warn(1)
							if (Platform.OS === 'ios') {
								this.player && this.player.presentFullscreenPlayer();
							} else {
								this.renderFullScreenVideo()
							}
							
						} else {
							this._stopOrResume()
						}
					});
					
				}}
				style={{
					position: 'absolute',
					zIndex: 99,
					left: this.props.width / 2 - 18,
					top: this.props.height / 2 - 18,
					borderColor: 'white',
					borderWidth: 1,
					borderRadius: 18,
					width: 36,
					height: 36,
					backgroundColor: 'rgba(0,0,0,.3)',
					alignItems: 'center',
					justifyContent: 'center'
				}}
			>
				<Icon
					name={this.state.paused ? 'play-arrow' : 'pause'}
					color={'white'}
					size={28}
					underlayColor={'transparent'}
				/>
			</TouchableOpacity>
		)
	};
	
	toggleFooter = () => {
		if (this.props.isSimple) {
			this.player.presentFullscreenPlayer();
			return
		}
		this.setState({
			showFooter: !this.state.showFooter
		}, _ => {
			if (this.state.showFooter) {
				this.timer && clearTimeout(this.timer)
				this.timer = setTimeout(() => {
					this.setState({
						showFooter: false
					})
				}, 5000)
			}
		})
	};
	
	renderError = () => {
		if (this.state.isError) {
			return (
				<View style={{
					backgroundColor: 'rgba( 0, 0, 0, 0.5 )',
					position: 'absolute',
					top: 0,
					right: 0,
					bottom: 0,
					left: 0,
					justifyContent: 'center',
					alignItems: 'center',
					zIndex: 99,
					flexDirection: 'row'
				}}>
					<Icon
						name={'error-outline'}
						color={'red'}
						size={20}
					/>
					<Text style={{
						backgroundColor: 'transparent',
						color: 'white',
						marginLeft: 5
					}}>
						视频出错了
					</Text>
				</View>
			);
		}
		return null;
	};
	
	renderLoader = () => {
		if (this.state.loading) {
			return (
				<View style={{
					position: 'absolute',
					top: 0,
					right: 0,
					bottom: 0,
					left: 0,
					alignItems: 'center',
					justifyContent: 'center',
					zIndex: 99,
					...this.props.loadingStyle
				}}>
					<LoadingMore
						hasMore={this.state.loading}
						showText={false}
						color={'white'}
					/>
				</View>
			);
		}
		return null;
	};
	
	onFullscreenPlayerDidDismiss = () => {
		this.setState({
			puased: true,
			showThumb:true
		})
	};
	
	renderFullScreenVideo = () => {
		if (!this.videoView) {
			this.videoView = <FullScreenVideo
				onClose={_ => {
					this.fullView && this.fullView.close();
					this.onFullscreenPlayerDidDismiss()
				}}
				uri={this.props.source.uri}/>;
		}
		if (!this.overlayView) {
			this.overlayView = <Overlay.PopView
				style={{}}
				containerStyle={{flex: 1}}
				overlayOpacity={1}
				ref={v => this.fullView = v}
			>
				{this.videoView}
			</Overlay.PopView>;
		}
		Overlay.show(this.overlayView);
	};
	
	render() {
		if (this.state.showThumb && this.props.thumb) {
			return (
				<View>
					{this.renderIcon()}
					<Image
						source={{uri: this.props.thumb}}
						style={{
							width: this.props.width,
							height: this.props.height
						}}
					/>
				</View>
			)
		}
		return (
			<TouchableOpacity
				activeOpacity={1}
				onPress={this.toggleFooter}
			>
				<View style={[
					{display: this.props.visible ? 'flex' : 'none'}
				]}>
					{this.renderError()}
					{this.renderLoader()}
					{this.state.showHeader && this.renderHeader()}
					{this.state.showFooter && this.renderFooter()}
					{this.props.isSimple && this.props.isShowIcon && this.renderIcon()}
					<Video
						ref={ele => this.player = ele}
						source={this.props.source}
						style={[
							styles.video,
							{
								width: this.props.width,
								height: this.props.height
							}
						]}
						volume={this.state.volume}
						paused={this.state.paused}
						rate={this.state.rate}
						muted={this.state.muted}
						resizeMode={this.state.resizeMode}
						repeat={this.state.repeat}
						onLoadStart={this._onLoadStart}
						onLoad={this._onLoad}
						onFullscreenPlayerDidDismiss={this.onFullscreenPlayerDidDismiss}
						onProgress={this._onProgress}
						onEnd={this._onEnd}
						onError={this._onError}
						onBuffer={this._onBuffer}
						progressUpdateInterval={250.0}
						ignoreSilentSwitch={"ignore"}
					/>
				</View>
			</TouchableOpacity>
		)
	}
}


const styles = StyleSheet.create({
	header: {
		width: styleUtil.window.width,
		height: 40,
		flexDirection: 'row',
		justifyContent: 'space-between',
		position: 'absolute',
		top: 0
	},
	footer: {
		height: 40,
		backgroundColor: 'rgba(0,0,0,.5)',
		flexDirection: 'row',
		justifyContent: 'space-around',
		alignItems: 'center',
		position: 'absolute',
		bottom: 0,
		zIndex: 99
	},
	video: {
		width: styleUtil.window.width,
		height: styleUtil.window.width * 0.618,
		backgroundColor: 'black'
	},
});