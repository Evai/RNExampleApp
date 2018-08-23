'use strict';
import React, {Component} from 'react';
import {Alert, StyleSheet, Text, TouchableOpacity, View, InteractionManager} from 'react-native';
// import {RNCamera} from 'react-native-camera';
import MovToMp4 from 'react-native-mov-to-mp4';
import Spinkit from 'react-native-spinkit'
import styleUtil from "../common/styleUtil";
import {Icon} from 'react-native-elements'
import navigate from "../screens/navigate";
import {Circle} from 'react-native-progress'
import {Button} from 'teaset'
import RNThumbnail from 'react-native-thumbnail'

const PendingView = () => (
	<View
		style={{
			flex: 1,
			backgroundColor: 'white',
			justifyContent: 'center',
			alignItems: 'center',
		}}
	>
		<Spinkit type={'Bounce'} color={styleUtil.themeColor}/>
	</View>
);

const RECORD_TIME = 5;

export default class RecordVideo extends Component {
	static navigatorStyle = {
		title: '录像',
		navBarHidden: true,
		scene: navigate.sceneConfig.FloatFromBottom
	};
	
	static defaultProps = {
		quality: RNCamera.Constants.VideoQuality["480p"]
	};
	
	constructor(props) {
		super(props);
		this.state = {
			recording: false,//是否正在录制
			type: RNCamera.Constants.Type.back,
			currentTime: 0,//录制当前时间
			finished: false,//是否完成录制
			videoPath: null,//录制缓存路径
			videoThumb: null,//视频第一帧图片
			isSaved: false//是否转换格式完成并保存
		};
	}
	
	renderRecording(camera) {
		return (
			<Button onPress={_ => this.stop(camera)}
			        style={[styles.buttonContainer, styles.buttonStopContainer, this.props.style]}>
				<Circle
					size={70}
					borderColor={'white'}
					color={styleUtil.successColor}
					unfilledColor={'white'}
					thickness={4}
					showsText={false}
					progress={this.state.currentTime / RECORD_TIME}
					borderWidth={0}
				>
					<View style={styles.buttonStop}/>
				</Circle>
			</Button>
		);
	}
	
	renderWaiting(camera) {
		return (
			<Button onPress={_ => this.record(camera)}
			        style={[styles.buttonContainer, this.props.style]}
			>
				<Circle
					size={70}
					borderColor={'white'}
					// color={'white'}
					unfilledColor={'white'}
					thickness={1}
					showsText={false}
					progress={0}
					borderWidth={3}
				>
					<View style={styles.circleInside}/>
				</Circle>
			
			</Button>
		);
	}
	
	record = (camera) => {
		const options = {quality: this.props.quality, maxDuration: 10, maxFileSize: 1024 * 1024 * 5};
		if (!this.state.recording) {
			camera.recordAsync(options).then(data => {
				// console.warn(data)
				this.setState({
					isSaved: false,
					finished: true,
					recording:false
				});
				this.stopTimer();
				const filename = Date.now().toString();
				MovToMp4.convertMovToMp4(data.uri, filename + ".mp4", (path) => {
					RNThumbnail.get(path).then((result) => {
						// console.warn(result)
						this.setState({
							videoPath: path,
							isSaved: true,
							videoThumb: result
						});
					}).catch(e => {
						Alert.alert('获取视频文件失败')
					});
				});
			}).catch(e => {
				this.setState({
					recording: false,
					recorded: false,
					finished: false,
					videoPath: null,
					currentTime: 0,
				});
			});
			setTimeout(() => {
				this.startTimer();
				this.setState({
					recording: true,
					recorded: false,
					finished: false,
					videoPath: null,
					currentTime: 0,
				});
			});
		}
		
	};
	
	stop = (camera) => {
		if (this.state.recording) {
			this.setState({recording: false});
			this.stopTimer();
			camera.stopRecording();
		}
	};
	
	back = (camera) => {
		this.stop(camera);
		navigate.pop()
	};
	
	reverse = () => {
		const type = this.state.type;
		if (type === RNCamera.Constants.Type.back) {
			this.setState({
				type: RNCamera.Constants.Type.front
			})
		} else {
			this.setState({
				type: RNCamera.Constants.Type.back
			})
		}
		
	};
	
	startTimer = () => {
		this.timer = setInterval(() => {
			if (this.state.currentTime >= 10) {
				this.stopTimer();
				this.setState({recording: false});
			} else {
				this.setState({currentTime: this.state.currentTime + 1});
			}
		}, 1000);
	};
	
	stopTimer = () => {
		if (this.timer) clearInterval(this.timer);
	};
	
	renderContent = (camera) => {
		return (
			<View style={styles.bottomContainer}>
				<TouchableOpacity onPress={_ => this.back(camera)}>
					<Text style={{color: 'white', fontSize: 18}}>取消</Text>
				</TouchableOpacity>
				<View style={{flex: 0, flexDirection: 'row', justifyContent: 'center'}}>
					{this.state.recording ? this.renderRecording(camera) : this.renderWaiting(camera)}
				</View>
				<Icon
					name={'ios-reverse-camera-outline'}
					type={'ionicon'}
					size={45}
					color={'white'}
					onPress={this.reverse}
					underlayColor={'transparent'}
					activeOpacity={0.7}
				/>
			</View>
		)
	};
	
	renderLoader = () => {
		return (
			<View style={styles.bottomContainer}>
				<Spinkit type={'Bounce'} color={'white'}/>
			</View>
		)
	};
	
	renderFinished = () => {
		return (
			<View style={styles.bottomContainer}>
				<Icon
					name={'close'}
					color={'white'}
					size={38}
					underlayColor={'transparent'}
					onPress={this.cancel}
				/>
				<Icon
					name={'check'}
					color={styleUtil.successColor}
					size={38}
					underlayColor={'transparent'}
					onPress={this.onSend}
				/>
			</View>
		)
	};
	
	cancel = () => {
		this.setState({
			videoPath: null,
			finished: false,
			recording: false,
			isSaved: false,
			currentTime: 0
		})
	};
	
	onSend = () => {
		const {videoPath, videoThumb, currentTime} = this.state;
		navigate.pop();
		setTimeout(() => {
			if (videoPath && videoThumb) {
				this.props.onSend && this.props.onSend({
					video: {
						width: videoThumb.width,
						height: videoThumb.height,
						thumb: videoThumb.path,
						path: videoPath,
						duration: currentTime
					}
				});
			}
		}, 450);
	};
	
	render() {
		const {isSaved, finished} = this.state;
		return (
			<View style={styles.container}>
				{/*<RNCamera*/}
					{/*style={styles.preview}*/}
					{/*type={this.state.type}*/}
					{/*captureAudio={true}*/}
					{/*autoFocus={RNCamera.Constants.AutoFocus.on}*/}
					{/*flashMode={RNCamera.Constants.FlashMode.auto}*/}
					{/*permissionDialogTitle={'获取权限'}*/}
					{/*permissionDialogMessage={'录像需要你允许我们访问你的相机'}*/}
				{/*>*/}
					{/*{({camera, status}) => {*/}
						{/*if (status !== 'READY') return <PendingView/>;*/}
						{/*if (finished && !isSaved) {*/}
							{/*return this.renderLoader();*/}
						{/*}*/}
						{/*else if (finished && isSaved) {*/}
							{/*return this.renderFinished();*/}
						{/*} else {*/}
							{/*return this.renderContent(camera)*/}
						{/*}*/}
					{/*}}*/}
				{/*</RNCamera>*/}
			</View>
		);
	}
	
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		flexDirection: 'column',
		backgroundColor: 'black',
	},
	preview: {
		flex: 1,
		justifyContent: 'flex-end',
		// alignItems: 'center',
	},
	bottomContainer: {
		backgroundColor: 'black',
		flex: 0,
		paddingVertical: 20,
		flexDirection: 'row',
		justifyContent: 'space-around',
		alignItems: 'center'
	},
	buttonContainer: {
		width: 70,
		height: 70,
		borderRadius: 35,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: 'transparent',
		borderWidth: 0,
		paddingVertical: 0,
		paddingHorizontal: 0
	},
	circleInside: {
		position: 'absolute',
		top: 7,
		left: 7,
		width: 56,
		height: 56,
		borderRadius: 28,
		backgroundColor: '#D91E18',
	},
	buttonStopContainer: {
		backgroundColor: 'transparent',
	},
	buttonStop: {
		backgroundColor: '#D91E18',
		position: 'absolute',
		top: 15,
		left: 15,
		width: 40,
		height: 40,
		borderRadius: 3,
	},
});