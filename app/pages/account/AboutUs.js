import React from 'react'
import {
	View,
	Text,
	StyleSheet,
	Alert,
	Modal,
	TouchableHighlight
} from 'react-native'
import CodePush from 'react-native-code-push'
import toast from "../../common/toast";
import styleUtil from "../../common/styleUtil";
import {ListRow, Button} from 'teaset'
import ScrollPage from "../../components/ScrollPage";
import WebPage from "../../components/WebPage";
import navigate from "../../screens/navigate";
import config from "../../common/config";

export default class AboutUs extends React.Component {
	static navigatorStyle = {
		title: '关于我们'
	}
	
	constructor(props) {
		super(props);
		this.state = {
			restartAllowed: true,
			syncMessage: '正在下载更新',
			progress: false,
		};
	}
	
	// 监听更新状态
	codePushStatusDidChange(syncStatus) {
		switch (syncStatus) {
			case CodePush.SyncStatus.CHECKING_FOR_UPDATE:
				toast.modalLoading('正在检查更新');
				break;
			case CodePush.SyncStatus.DOWNLOADING_PACKAGE:
				toast.modalLoadingHide();
				this.setState({syncMessage: "正在下载更新"});
				break;
			case CodePush.SyncStatus.AWAITING_USER_ACTION:
				toast.modalLoadingHide();
				break;
			case CodePush.SyncStatus.INSTALLING_UPDATE:
				toast.modalLoadingHide();
				this.setState({syncMessage: "正在安装更新，请稍等……", progress: false});
				break;
			case CodePush.SyncStatus.UP_TO_DATE:
				toast.modalLoadingHide();
				Alert.alert('当前已经是最新版本');
				this.setState({progress: false});
				break;
			case CodePush.SyncStatus.UPDATE_IGNORED:
				console.log('用户取消更新');
				toast.modalLoadingHide();
				this.setState({progress: false});
				break;
			case CodePush.SyncStatus.UPDATE_INSTALLED:
				toast.modalLoadingHide();
				toast.success("更新完成");
				setTimeout(() => {
					CodePush.restartApp();
				}, 1000)
				this.setState({progress: false});
				break;
			case CodePush.SyncStatus.UNKNOWN_ERROR:
				toast.modalLoadingHide();
				Alert.alert('未知错误');
				this.setState({progress: false});
				break;
		}
	}
	
	
	codePushDownloadDidProgress(progress) {
		this.setState({progress});
	}
	
	// 允许重启后更新
	toggleAllowRestart() {
		this.state.restartAllowed
			? CodePush.disallowRestart()
			: CodePush.allowRestart();
		
		this.setState({restartAllowed: !this.state.restartAllowed});
	}
	
	// 获取更新数据
	getUpdateMetadata() {
		CodePush.getUpdateMetadata(CodePush.UpdateState.RUNNING)
			.then((metadata: LocalPackage) => {
				this.setState({syncMessage: metadata ? JSON.stringify(metadata) : "Running binary version", progress: false});
			}, (error: any) => {
				this.setState({syncMessage: "Error: " + error, progress: false});
			});
	}
	
	/** Update pops a confirmation dialog, and then immediately reboots the app 一键更新，加入的配置项 */
	syncImmediate() {
		CodePush.sync(
			{
				installMode: CodePush.InstallMode.IMMEDIATE,
				updateDialog: {
					// descriptionPrefix:'描述',
					mandatoryUpdateMessage: '立即更新',
					optionalIgnoreButtonLabel: '取消',
					optionalInstallButtonLabel: '更新',
					optionalUpdateMessage: '检测到有新的更新，是否立即更新',
					title: '有可用的更新'
				},
			},
			this.codePushStatusDidChange.bind(this),
			this.codePushDownloadDidProgress.bind(this)
		);
	}
	
	showDownload = () => {
		const {progress, syncMessage} = this.state;
		if (!progress) {
			return null;
		}
		const float = progress.receivedBytes / progress.totalBytes;
		if (float >= 1) {
			return null;
		}
		const content = (progress.receivedBytes / 1024).toFixed(2) + 'KB/' + (progress.totalBytes / 1024).toFixed(2) + 'KB';
		return (
			<ModalDownload
				visible={true}
				title={syncMessage}
				content={content}
			/>
		)
	};
	
	render() {
		return (
			<ScrollPage style={styleUtil.container}>
				<View style={{marginTop: 20}}>
					<ListRow
						title={'用户协议'}
						onPress={_ => navigate.push(WebPage, {
							url:config.api.imageURI + 'html/user_agreement.html'
						})}
						topSeparator={'full'}
					/>
					<ListRow
						title={'用户行为规范'}
						onPress={_ => navigate.push(WebPage, {
							url:config.api.imageURI + 'html/user_spec.html'
						})}
					/>
					{/*<ListRow*/}
						{/*title={'软件评分'}*/}
					{/*/>*/}
					<ListRow
						title={'联系邮箱'}
						detail={'yuhechu@126.com'}
					/>
					<ListRow
						title={'版本更新'}
						detail={'v1.0.0'}
						bottomSeparator={'full'}
						onPress={this.syncImmediate.bind(this)}
					/>
				</View>
				{this.showDownload()}
			</ScrollPage>
		);
	}
	
}


class ModalDownload extends React.Component {
	
	constructor(props) {
		super(props);
		this.state = {
			modalVisible: props.visible,
			transparent: true
		};
	}
	
	setModalVisible(visible) {
		this.setState({modalVisible: visible});
	}
	
	render() {
		const modalBackgroundStyle = {
			backgroundColor: this.state.transparent ? 'rgba(0, 0, 0, 0.5)' : '#f5fcff',
		};
		const innerContainerTransparentStyle = this.state.transparent
			? {backgroundColor: '#fff', padding: 20}
			: null;
		return (
			<View>
				<Modal
					animationType={'fade'}
					transparent={this.state.transparent}
					visible={this.state.modalVisible}
					onRequestClose={() => {
						this.setModalVisible(false)
					}}
				>
					<View style={[styles.container, modalBackgroundStyle]}>
						<View style={[styles.innerContainer, innerContainerTransparentStyle]}>
							<Text style={{
								fontWeight: 'bold',
								fontSize: 18,
								paddingBottom: 10
							}}>{this.props.title}</Text>
							<Text>{this.props.content}</Text>
							{/*<Button title={'close'} onPress={_ => this.setModalVisible(false)}/>*/}
						</View>
					
					</View>
				</Modal>
			
			</View>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
		padding: 20,
	},
	innerContainer: {
		borderRadius: 10,
		alignItems: 'center',
	},
	row: {
		alignItems: 'center',
		flex: 1,
		flexDirection: 'row',
		marginBottom: 20,
	},
	rowTitle: {
		flex: 1,
		fontWeight: 'bold',
	},
	button: {
		borderRadius: 5,
		flex: 1,
		height: 44,
		alignSelf: 'stretch',
		justifyContent: 'center',
		overflow: 'hidden',
	},
	buttonText: {
		fontSize: 18,
		margin: 5,
		textAlign: 'center',
	},
	modalButton: {
		marginTop: 10,
	},
});