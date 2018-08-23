import React from 'react';

import {
	StyleSheet,
	Text,
	View,
	WebView,
	Linking,
	Image,
	Alert
} from 'react-native';
import toast from "../common/toast";
import {Icon} from 'react-native-elements'
import {NavigationBar} from 'teaset'
import navigate from "../screens/navigate";
import styleUtil from "../common/styleUtil";
import PropTypes from 'prop-types'

const WEBVIEW_REF = 'webview';

export default class WebPage extends React.Component {
	static navigatorStyle = {
		navBarHidden: true
	};
	
	static propTypes = {
		url: PropTypes.string.isRequired
	};
	
	constructor(props) {
		super(props);
		this.state = {
			url: props.url || '',
			title: '',
			canGoBack: false,
			canGoForward: false,
			loading: true,
			scalesPageToFit: true,
			progress: 0,
			loadStart: false,
			loadEnd: false
		};
		this.timer = null;
		this.percent = null
	}
	
	componentWillUnmount() {
		clearInterval(this.timer)
	}
	
	onLoadStart = e => {
		// console.log(e.nativeEvent)
		// console.log('start')
		if (this.state.url.indexOf('https://itunes.apple.com/') > -1) {
			Alert.alert('即将离开于何处，前往App Store', '', [
				{text: '取消'},
				{
					text: '允许', onPress: _ => {
						this.openSafari();
						navigate.pop();
					}
				},
			]);
			return;
		}
		if (this.state.loadStart) {
			return;
		}
		this.percent = 0;
		this.timer = setInterval(_ => {
			++this.percent;
			let progress = this.state.progress;
			if (progress >= 80) {
				clearInterval(this.timer);
				return;
			}
			this.setState({
				loadStart: true,
				loadEnd: false,
				progress: 1 * this.percent
			})
		}, 20);
	};
	
	onError = e => {
		// console.log(e.nativeEvent)
	};
	onLoad = e => {
		// console.log('load')
	};
	
	onLoadEnd = e => {
		clearInterval(this.timer);
		this.setState({
			progress: 100
		}, _ => {
			setTimeout(_ => {
				this.setState({
					loadStart: false,
					loadEnd: true
				})
			}, 500);
		});
	};
	
	renderError = () => {
		return <View style={{
			flexDirection: 'row',
			justifyContent: 'center',
			alignItems: 'center',
			marginTop: 20
		}}>
			<Image
				style={{
					width: 30,
					height: 30,
					marginRight: 8
				}}
				source={require('../assets/image/load_error.png')}
			/>
			<Text>页面出错啦！</Text>
		</View>
	};
	
	onShouldStartLoadWithRequest = e => {
		// Implement any custom loading logic here, don't forget to return!
// 解决WebKitErrorDomain code:101的警告
// http://leonhwa.com/blog/0014905236320002ebb3db97fe64fb3bb6f047eafb1c5de000
		let scheme = e.url.split('://')[0];
		return scheme === 'http' || scheme === 'https';
	};
	
	onNavigationStateChange = (navState) => {
		++this.percent;
		// console.log(navState)
		this.setState({
			progress: 10 * this.percent,
			canGoBack: navState.canGoBack,
			canGoForward: navState.canGoForward,
			url: navState.url,
			title: navState.title,
			loading: navState.loading,
			scalesPageToFit: true
		});
	};
	
	goBack = () => {
		this.refs[WEBVIEW_REF] && this.refs[WEBVIEW_REF].goBack();
	};
	
	goForward = () => {
		this.refs[WEBVIEW_REF] && this.refs[WEBVIEW_REF].goForward();
	};
	
	reload = () => {
		this.refs[WEBVIEW_REF] && this.refs[WEBVIEW_REF].reload();
	};
	
	renderNavBar = () => {
		return (
			<NavigationBar
				title={this.state.title}
				style={{
					position: 'relative',
					backgroundColor: 'white'
				}}
				leftView={
					<View style={{
						flexDirection: 'row',
						justifyContent: 'center',
						alignItems: 'center'
					}}>
						<NavigationBar.Button
							onPress={_ => {
								this.state.canGoBack ? this.goBack() : navigate.pop();
							}}
						>
							<Icon
								name={'arrow-left'}
								type={'simple-line-icon'}
								color={'black'}
								size={20}
							/>
							{!this.state.canGoForward && <Text style={{color: 'black'}}>返回</Text>}
						</NavigationBar.Button>
						{this.state.canGoForward && <NavigationBar.Button
							onPress={_ => this.goForward()}
						>
							<Icon
								name={'arrow-right'}
								type={'simple-line-icon'}
								color={'black'}
								size={20}
							/>
						</NavigationBar.Button>}
						{this.state.canGoBack && <NavigationBar.LinkButton
							title={'关闭'}
							style={{
								fontSize: 14
							}}
							onPress={_ => navigate.pop()}
						/>}
					</View>
				}
				rightView={
					<NavigationBar.Button
						onPress={this.showAction}
					>
						<Icon
							name={'ios-more'}
							type={'ionicon'}
							color={'black'}
							size={34}
						/>
					</NavigationBar.Button>
				}
			/>
		)
	};
	
	showAction = () => {
		const items = [
			{title: '刷新', onPress: _ => this.reload()},
			{
				title: '在浏览器中打开', onPress: this.openSafari
			}
		];
		config.showAction(items)
	};
	
	renderLoading = () => {
		return !this.state.loadEnd && <View style={{
			height: 2,
			width: this.state.progress * (styleUtil.window.width / 100),
			backgroundColor: styleUtil.successColor
		}}/>
	};
	
	onMessage = data => {
	
	};
	
	openSafari = () => {
		Linking
			.openURL(this.state.url)
			.catch(err => alert('出错啦'));
	}
	
	render() {
		return (
			<View style={styleUtil.container}>
				{this.renderNavBar()}
				{this.renderLoading()}
				{
					this.props.isFocused &&
					<WebView
						ref={WEBVIEW_REF}
						automaticallyAdjustContentInsets={true}
						dataDetectorTypes={['phoneNumber', 'link']}
						style={styles.webView}
						onLoadStart={this.onLoadStart}
						onError={this.onError}
						// injectedJavaScript={this.injectedJavaScript}
						onLoad={this.onLoad}
						onLoadEnd={this.onLoadEnd}
						onMessage={this.onMessage}
						// renderLoading={this.renderLoading}
						source={{uri: this.state.url}}
						javaScriptEnabled={false}
						domStorageEnabled={true}
						decelerationRate={'normal'}
						renderError={this.renderError}
						onNavigationStateChange={this.onNavigationStateChange}
						onShouldStartLoadWithRequest={this.onShouldStartLoadWithRequest}
						startInLoadingState={true}
						scalesPageToFit={true}
					/>
				}
			</View>
		)
	}
}

const styles = StyleSheet.create({
	webView: {
		flex: 1
	}
});