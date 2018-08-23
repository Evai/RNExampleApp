import React, {Component} from 'react';

import {
	StyleSheet,
	Text,
	View,
	TouchableHighlight,
	Platform,
	PermissionsAndroid,
} from 'react-native';

import Sound from 'react-native-sound';
import {AudioRecorder, AudioUtils} from 'react-native-audio';
import navigate from "../../screens/navigate";
import NavBar from "../../components/NavBar";
import {NavigationBar, Button} from 'teaset'
import {Icon} from 'react-native-elements'
import styleUtil from "../../common/styleUtil";
import {Circle} from 'react-native-progress'


const RECORD_TIME = 45;

export default class SoundRecord extends Component {
	static navigatorStyle = {
		scene: navigate.sceneConfig.FloatFromBottom,
		navBarHidden: true
	};
	
	state = {
		currentTime: 0.0,
		recording: false,
		paused: false,
		stoppedRecording: false,
		finished: false,
		audioPath: AudioUtils.DocumentDirectoryPath + '/test.aac',
		hasPermission: undefined,
		playing:false
	};
	
	renderNavBar = () => {
		return (
			<NavBar
				title={'录音'}
				renderLeftView={<NavigationBar.LinkButton
					title={'关闭'}
					onPress={_ => navigate.pop()}
				/>}
				rightHidden={false}
				rightTitle={'完成'}
				rightStyle={{
					color: this.state.finished ? styleUtil.successColor : styleUtil.disabledColor
				}}
				rightDisabled={!this.state.finished}
				rightOnPress={_ => {
					if (this.state.recording) {
						this._stop()
					} else {
						this.props.updateSelectedAudio(this.state.audioPath);
					}
					navigate.pop()
				}}
			/>
		)
	};
	
	prepareRecordingPath(audioPath) {
		AudioRecorder.prepareRecordingAtPath(audioPath, {
			SampleRate: 22050,
			Channels: 1,
			AudioQuality: "Low",
			AudioEncoding: "aac",
			AudioEncodingBitRate: 32000
		});
	}
	
	componentDidMount() {
		this._checkPermission().then((hasPermission) => {
			this.setState({hasPermission});
			if (!hasPermission) return;
			this.prepareRecordingPath(this.state.audioPath);
			AudioRecorder.onProgress = (data) => {
				this.setState({
					currentTime: Math.floor(data.currentTime)
				}, _ => {
					if (this.state.currentTime >= RECORD_TIME) {
						this._stop()
					}
				});
			};
			AudioRecorder.onFinished = (data) => {
				// Android callback comes in the form of a promise instead.
				if (Platform.OS === 'ios') {
					this._finishRecording(data.status === "OK", data.audioFileURL);
				}
			};
		});
	}
	
	_checkPermission() {
		if (Platform.OS !== 'android') {
			return Promise.resolve(true);
		}
		const rationale = {
			'title': '访问麦克风',
			'message': '是否允许软件访问您的麦克风以便可以录制音频'
		};
		
		return PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO, rationale)
			.then((result) => {
				// console.log('Permission result:', result);
				return (result === true || result === PermissionsAndroid.RESULTS.GRANTED);
			});
	}
	
	async _stop() {
		if (!this.state.recording) {
			return;
		}
		this.setState({
			stoppedRecording: true,
			recording: false,
			paused: false,
			currentTime:0.0
		});
		try {
			const filePath = await AudioRecorder.stopRecording();
			if (Platform.OS === 'android') {
				this._finishRecording(true, filePath);
			}
			return filePath;
		} catch (error) {
			console.warn(error);
		}
	}
	
	async _play() {
		if (this.state.recording) {
			await this._stop();
		}
		this.setState({
			playing: true
		}, _ => {
			this.props.playAudio(this.state.audioPath)
		});
	}
	
	async _record() {
		if (this.state.recording) {
			return;
		}
		if (!this.state.hasPermission) {
			return;
		}
		if (this.state.stoppedRecording) {
			this.prepareRecordingPath(this.state.audioPath);
		}
		this.setState({recording: true, paused: false, playing:false});
		this.props.stopAudio();
		try {
			const filePath = await AudioRecorder.startRecording();
		} catch (error) {
			console.warn(error);
		}
	}
	
	_finishRecording(didSucceed, filePath) {
		this.setState({finished: didSucceed});
		console.log(`Finished recording of duration ${this.state.currentTime} seconds at path: ${filePath}`);
	}
	
	renderRecord = () => {
		if (this.state.recording) {
			return (
				<Button
					onPress={_ => this._stop()}
					style={{
						backgroundColor: 'transparent',
						borderWidth: 0,
						paddingVertical: 0,
						paddingHorizontal: 0
					}}>
					<Circle
						size={100}
						// borderColor={'white'}
						// color={'white'}
						unfilledColor={'white'}
						thickness={1}
						showsText={false}
						progress={this.state.currentTime / RECORD_TIME}
						borderWidth={0}
					>
						<View style={{
							justifyContent: 'center',
							alignItems: 'center',
							flexDirection: 'row',
							position: 'absolute',
							top: 25,
							left: 25,
							width: 50,
							height: 50
						}}>
							<Icon
								name={'stop'}
								color={'white'}
							/>
							<Text style={{
								fontSize: 14,
								color: 'white',
								fontWeight: '500'
							}}>停止</Text>
						</View>
					
					</Circle>
				</Button>
			)
		}
		return (
			<Button
				onPress={_ => this._record()}
				style={styles.button}>
				<Icon
					name={'fiber-manual-record'}
					size={20}
					color={'white'}
				/>
				<Text style={{
					color: 'white'
				}}>录音</Text>
			</Button>
		)
	};
	
	renderPlay = () => {
		return (
			<Button
				onPress={_ => this._play()}
				style={[styles.button, {marginLeft: 20}]}>
				<Icon
					name={'play-arrow'}
					size={20}
					color={'white'}
				/>
				<Text style={{
					color: 'white'
				}}>播放</Text>
			</Button>
		)
	};
	
	render() {
		return (
			<View style={styles.container}>
				{this.renderNavBar()}
				<View style={styles.controls}>
					<View style={{
						flexDirection: 'row'
					}}>
						{this.renderRecord()}
						{!this.state.recording && this.state.stoppedRecording && this.renderPlay()}
					</View>
					<Text style={styles.progressText}>{this.state.currentTime}s</Text>
				</View>
			</View>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: styleUtil.themeColor,
	},
	controls: {
		justifyContent: 'center',
		alignItems: 'center',
		flex: 1
	},
	progressText: {
		paddingTop: 20,
		fontSize: 30,
		color: "#fff"
	},
	button: {
		borderRadius: 50,
		width: 100,
		height: 100,
		backgroundColor: 'transparent',
		borderColor: 'white'
	},
	disabledButtonText: {
		color: '#eee'
	},
	buttonText: {
		fontSize: 20,
		color: "#fff"
	},
	activeButtonText: {
		fontSize: 20,
		color: "#B81F00"
	}
	
});