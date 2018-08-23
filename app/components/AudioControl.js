import React from 'react'
import {
	View,
	Text,
	Alert,
} from 'react-native'

import styleUtil from "../common/styleUtil";
import {Icon} from 'react-native-elements'
import {Bar} from 'react-native-progress'
import Sound from 'react-native-sound';
import utils from "../common/utils";
import PropTypes from 'prop-types'

export default class AudioControl extends React.Component {
	static defaultProps = {
		paused: true
	};
	
	static propTypes = {
		paused: PropTypes.bool
	};
	
	constructor(props) {
		super(props);
		this.state = {
			currentTime: 0,
			paused: props.paused,
			duration: 0
		};
		this.sound = null;
		this._isMounted = false;
	}
	
	// componentWillReceiveProps(nextProps) {
	// 	if (nextProps.paused !== this.state.paused) {
	// 		if (nextProps.paused) {
	// 			this.stop()
	// 		}
	// 	}
	// }
	
	componentDidMount() {
		this._isMounted = true;
		this.sound = new Sound(this.props.uri, '', (error) => {
			if (error) {
				console.warn(error)
			} else {
				this.setState({
					duration: Math.floor(this.sound.getDuration())
				});
				if (!this.state.paused) {
					this.play()
				}
			}
		});
	}
	
	componentWillUnmount() {
		this._isMounted = false;
		this.sound && this.sound.stop()
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
							paused: true
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
		Sound.setCategory('Playback');
		this.tickInterval = setInterval(() => {
			this.tick()
		}, 250);
		this.setState({
			paused: false
		});
		setTimeout(() => {
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
			this.sound.pause(() => {
				this.setState({
					paused: true
				});
			});
		}
	};
	
	render() {
		return (
			<View style={{
				padding: 20,
				borderBottomWidth: styleUtil.borderSeparator,
				borderColor: styleUtil.borderColor,
				backgroundColor: 'white'
			}}>
				<View style={{
					flexDirection: 'row',
					justifyContent: 'space-between',
					alignItems: 'center'
				}}>
					<Icon
						name={this.state.paused ? 'play-arrow' : 'pause'}
						size={36}
						color={'black'}
						containerStyle={{
							borderWidth: 1,
							borderRadius: 20
						}}
						underlayColor={'transparent'}
						onPress={this.state.paused ? this.play : this.stop}
					/>
					<View style={{
						justifyContent: 'space-between',
						alignItems: 'center',
					}}>
						<Text>
							{utils.formatTimer(this.state.currentTime)} / {utils.formatTimer(this.state.duration)}
						</Text>
						<Bar
							// borderColor={'#ccc'}
							color={'black'}
							// unfilledColor={'white'}
							thickness={1}
							showsText={false}
							progress={this.state.duration > 0 ? this.state.currentTime / this.state.duration : 0}
							height={1}
							// borderWidth={0}
						/>
					</View>
				</View>
			</View>
		)
	}
}