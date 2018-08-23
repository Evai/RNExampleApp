import React, {Component} from 'react';

import {
	StyleSheet,
	Text,
	View,
	TouchableOpacity,
	Platform,
	PermissionsAndroid,
	PanResponder
} from 'react-native';

import Sound from 'react-native-sound';
import {AudioRecorder, AudioUtils} from 'react-native-audio';
import {Icon} from 'react-native-elements'
import Styles from "./Styles/MessageScreenStyle";
import toast from "../../../common/toast";
import {Toast} from 'teaset'
import styleUtil from "../../../common/styleUtil";

const maxDuration = 45;

export default class Audio extends Component {
	constructor(props) {
		super(props)
		this.state = {
			paused: false,
			recordingText: "",
			opacity:'white',
			recordingColor: "transparent",
			text:'按住 说话',
			currentTime: 0.0, //开始录音到现在的持续时间
			recording: false, //是否正在录音
			stoppedRecording: false, //是否停止了录音
			finished: false, //是否完成录音
			audioPath: AudioUtils.DocumentDirectoryPath + '/test.aac', //路径下的文件名
			hasPermission: undefined, //是否获取权限
		};
		this.prepareRecordingPath = this.prepareRecordingPath.bind(this);
		this._checkPermission = this._checkPermission.bind(this);
		this._record = this._record.bind(this);
		this._stop = this._stop.bind(this);
		this._pause = this._pause.bind(this);
		this._finishRecording = this._finishRecording.bind(this);
		this._cancel = this._cancel.bind(this);
	}
	
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
				// console.log(data)
				this.setState({
					currentTime: Math.floor(data.currentTime)
				}, () => {
					if (this.state.currentTime >= maxDuration) {
						toast.fail('说话时间太长了');
						this._cancel(true)
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
	
	componentWillUnmount() {
		AudioRecorder.removeListeners()
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
				console.log('Permission result:', result);
				return (result === true || result === PermissionsAndroid.RESULTS.GRANTED);
			});
	}
	
	async _pause() {
		if (!this.state.recording) {
			console.warn('Can\'t pause, not recording!');
			return;
		}
		
		try {
			const filePath = await AudioRecorder.pauseRecording();
			this.setState({paused: true});
		} catch (error) {
			console.warn(error);
		}
	}
	
	async _resume() {
		if (!this.state.paused) {
			console.warn('Can\'t resume, not paused!');
			return;
		}
		
		try {
			await AudioRecorder.resumeRecording();
			this.setState({paused: false});
		} catch (error) {
			console.warn(error);
		}
	}
	
	async _stop() {
		if (!this.state.recording) {
			console.warn('Can\'t stop, not recording!');
			return;
		}
		
		this.setState({stoppedRecording: true, recording: false, paused: false});
		
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
	
	static playVoice(audioPath) {
		// These timeouts are a hacky workaround for some issues with react-native-sound.
		// See https://github.com/zmxv/react-native-sound/issues/89.
		setTimeout(() => {
			let sound = new Sound(audioPath, '', (error) => {
				if (error) {
					console.log('failed to load the sound', error);
				}
			});
			
			setTimeout(() => {
				sound.play((success) => {
					if (success) {
						console.log('successfully finished playing');
					} else {
						console.log('playback failed due to audio decoding errors');
					}
				});
			}, 100);
		}, 100);
	}
	
	async _record() {
		if (this.state.recording) {
			console.warn('Already recording!');
			return;
		}
		
		if (!this.state.hasPermission) {
			console.warn('Can\'t record, no permission granted!');
			return;
		}
		
		if (this.state.stoppedRecording) {
			this.prepareRecordingPath(this.state.audioPath);
		}
		
		this.setState({
			recording: true,
			paused: false
		});
		
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
	
	_cancel(canceled) {
		let filePath = this._stop();
		if (canceled) {
			return;
		}
		if (this.state.currentTime < 1) {
			toast.info('说话时间太短了');
			return;
		}
		
		// console.warn(this.state.audioPath)
		this.props.onSend({
			voice: {
				path: this.state.audioPath,
				duration: this.state.currentTime
			},
			msgType: 'voice'
		})
	}
	
	handleLayout(e) {
		this.refs.record.measure((x, y, w, h, px, py) => {
			// console.log("record measure:", x, y, w, h, px, py);
			this.recordPageX = px;
			this.recordPageY = py;
		});
	}
	
	render() {
		//android bug: https://github.com/facebook/react-native/issues/7221
		let responder = {
			onStartShouldSetResponder: (evt) => true,
			onMoveShouldSetResponder: (evt) => true,
			onResponderGrant: (evt) => {
				this.setState({
					opacity: "#c9c9c9",
					recordingText: '手指上滑, 取消发送',
					text:'松开 结束',
					recordingColor: 'transparent'
				}, _ => RecordView.show(this.state.recordingText, this.state.recordingColor));
				this._record();
			},
			onResponderReject: (evt) => {
			},
			onResponderMove: (evt) => {
				if (evt.nativeEvent.locationY < 0 ||
					evt.nativeEvent.pageY < this.recordPageY) {
					this.setState({
						recordingText: '松开手指, 取消发送',
						recordingColor: 'red'
					}, _ => RecordView.show(this.state.recordingText, this.state.recordingColor));
				} else {
					this.setState({
						recordingText: '手指上滑, 取消发送',
						recordingColor: 'transparent'
					}, _ => RecordView.show(this.state.recordingText, this.state.recordingColor));
				}
			},
			onResponderRelease: (evt) => {
				this.setState({
					opacity: "white",
					text:'按住 说话'
				});
				RecordView.hide();
				let canceled;
				if (evt.nativeEvent.locationY < 0 ||
					evt.nativeEvent.pageY < this.recordPageY) {
					canceled = true;
				} else {
					canceled = false;
				}
				this._cancel(canceled)
			},
			onResponderTerminationRequest: (evt) => true,
			onResponderTerminate: (evt) => {
				console.log("responder terminate")
			},
			
		};
		return (
			<View style={{flex: 1}}>
				<View style={[Styles.searchRow, {padding: 4}]}>
					<View
						ref="record"
						{...responder}
						style={{
							flex: 1,
							justifyContent: 'center',
							alignItems: 'center',
							borderRadius: 5,
							backgroundColor: this.state.opacity,
							borderWidth: styleUtil.borderSeparator,
							borderColor: styleUtil.borderColor,
						}}
						onLayout={this.handleLayout.bind(this)}
					>
						<Text>{this.state.text}</Text>
					</View>
				</View>
			</View>
		);
	}
}

class RecordView {
	static key = null;
	
	static show(text, color) {
		if (RecordView.key) RecordView.hide()
		RecordView.key = Toast.show({
			text: (
				<Text style={{margin: 4, padding: 4, backgroundColor: color, color: '#fff'}}>
					{text}
				</Text>
			),
			icon: <Icon name={'ios-mic'} type={'ionicon'} size={45} color={'white'}/>,
			position: 'center',
			duration: 1000000,
		});
	}
	
	static hide() {
		if (!RecordView.key) return;
		Toast.hide(RecordView.key);
		RecordView.key = null;
	}
}