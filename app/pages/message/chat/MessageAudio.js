import React from 'react';
import {
	StyleSheet,
	Image,
	View,
	Text,
	TouchableOpacity,
	Alert
} from 'react-native';
import Audio from "./Audio";
import styleUtil from "../../../common/styleUtil";
import Sound from 'react-native-sound';

export default class MessageAudio extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			currentMessage: this.props.currentMessage,
			playing: false,
			currentTime: 0,
			duration: this.props.currentMessage.voice.duration || 0
		};
		this.sound = null;
		this._isMounted = false;
	}
	
	componentWillReceiveProps(nextProps) {
		if (nextProps.currentMessage !== this.state.currentMessage) {
			this.setState({
				duration: nextProps.duration
			})
		}
	}
	
	componentDidMount() {
		this._isMounted = true;
	}
	
	componentWillUnmount() {
		this._isMounted = false;
	}
	
	tick = () => {
		if (!this._isMounted) {
			return
		}
		this.sound.getCurrentTime((seconds) => {
			if (this.tickInterval) {
				let currentTime = Math.floor(seconds);
				if (currentTime >= this.state.duration) {
					currentTime = this.state.duration;
				}
				this.setState({
					currentTime: currentTime,
				}, _ => {
					if (this.state.currentTime >= this.state.duration) {
						this.setState({
							playing: false
						})
					}
				});
			}
		});
	};
	
	play = () => {
		if (!this._isMounted) {
			return
		}
		if (this.state.playing) {
			this.stop();
			return;
		}
		this.tickInterval = setInterval(() => {
			this.tick()
		}, 250);
		Sound.setCategory('Playback');
		this.setState({
			playing: true
		});
		if (!this.props.currentMessage.isOutgoing) {
			let msg = this.props.currentMessage;
			msg.flags = true;
			this.props.updateMessages && this.props.updateMessages(msg);
		}
		setTimeout(() => {
			this.sound = new Sound(this.props.currentMessage.voice.path, '', (error) => {
				if (error) {
					console.warn(error)
				} else {
					this.sound.play((success) => {
						// console.warn(success)
						if (this.tickInterval) {
							clearInterval(this.tickInterval);
							this.tickInterval = null;
						}
						if (!success) {
							Alert.alert('播放失败');
						}
					});
					if (!this.state.duration) {
						this.setState({
							duration: Math.floor(this.sound.getDuration())
						});
					}
				}
			});
		}, 100)
	};
	
	stop = () => {
		if (!this._isMounted) {
			return
		}
		if (this.sound) {
			if (this.tickInterval) {
				clearInterval(this.tickInterval);
				this.tickInterval = null;
			}
			this.sound.stop(() => {
				this.setState({playing: false});
			});
		}
	};
	
	onLongPress() {
		if (this.props.onMessageLongPress) {
			this._root.measureInWindow((x, y, width, height) => {
				this.props.onMessageLongPress({
					x: x,
					y: y,
					width: width,
					height: height
				}, this.props.currentMessage);
				
			})
			
		}
	}
	
	render() {
		let msg = this.props.currentMessage;
		let image = "";
		if (this.state.playing) {
			image = msg.isOutgoing ? require("./Images/senderVoicePlaying.gif") :
				require("./Images/receiverVoicePlaying.gif");
		} else {
			image = msg.isOutgoing ? require("./Images/senderVoice.png") :
				require("./Images/receiverVoice.png");
		}
		
		//max 180
		let margin = (parseFloat(msg.voice.duration) / 1000) * 3;
		margin = Math.min(180, margin) + 10;
		return (
			<TouchableOpacity
				ref={component => this._root = component}
				onPress={this.play}
				onLongPress={this.onLongPress.bind(this)}
				style={[styles.container, {
				width: 40 + (msg.voice.duration) * 2
			}]}>
				
				<Image
					style={[styles.image, msg.isOutgoing ? {marginLeft: margin} : {marginRight: margin}, {tintColor: msg.isOutgoing ? 'white' : '#999'}]}
					source={image}
				/>
			
			</TouchableOpacity>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		flex: 1,
		alignItems: 'center',
		maxWidth: 120
	},
	image: {
		marginTop: 5,
		marginBottom: 5,
		marginLeft: 10,
		marginRight: 10,
		width: 20,
		height: 20,
		tintColor: 'white'
	}
});

