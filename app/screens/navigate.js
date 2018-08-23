/**
 getCurrentRoutes() - 获取当前栈里的路由，也就是push进来，没有pop掉的那些。
 jumpBack() - 跳回之前的路由，当然前提是保留现在的，还可以再跳回来，会给你保留原样。
 jumpForward() - 上一个方法不是调到之前的路由了么，用这个跳回来就好了。
 jumpTo(route) - 跳转到已有的场景并且不卸载。
 push(route) - 跳转到新的场景，并且将场景入栈，你可以稍后跳转过去
 pop() - 跳转回去并且卸载掉当前场景
 replace(route) - 用一个新的路由替换掉当前场景
 replaceAtIndex(route, index) - 替换掉指定序列的路由场景
 replacePrevious(route) - 替换掉之前的场景
 resetTo(route) - 跳转到新的场景，并且重置整个路由栈
 immediatelyResetRouteStack(routeStack) - 用新的路由数组来重置路由栈
 popToRoute(route) - pop到路由指定的场景，在整个路由栈中，处于指定场景之后的场景将会被卸载。
 popToTop() - pop到栈中的第一个场景，卸载掉所有的其他场景。
 */

import React from 'react'

import NavigatorPage from '../components/NavigatorPage'
import TeaNavigatorScene from "teaset/components/TeaNavigator/TeaNavigatorScene";
import utils from "../common/utils";
import {InteractionManager} from 'react-native'

let _navigator;

const sceneConfig = {
	FloatFromBottom: TeaNavigatorScene.FloatFromBottom,
	PushFromRight: TeaNavigatorScene.PushFromRight,
	Replace: TeaNavigatorScene.Replace,
	Suspension: TeaNavigatorScene.Suspension
};

function setContainer(container: Object) {
	_navigator = container && container.navigator;
}

function push(screen: Function, passProps = {}) {
	const screenName = utils.getFuncName(screen);
	const routes = _navigator.getCurrentRoutes();
	// console.log(routes)
	const lastScreen = routes[routes.length - 1];
	if (typeof screen.navigatorStyle === 'function') {
		screen.navigatorStyle = screen.navigatorStyle(passProps)
	}
	// if (lastScreen.viewRef.props.screenName === screenName) {
	// 	return;
	// }
	_navigator.push({
		view: (
			<NavigatorPage
				leftTitle={lastScreen.viewRef.props.title}//默认为上一个页面的标题
				navigationBarInsets={screen.navigatorStyle && !screen.navigatorStyle.navBarHidden}
				{...screen.navigatorStyle}
				screenName={screenName}
				passProps={passProps}
			>
				{screen}
			</NavigatorPage>
		)
	})
}

function pushNotNavBar(Screen: Function, passProps = {}) {
	// const screenName = utils.getFuncName(Screen);
	// const routes = _navigator.getCurrentRoutes();
	// // console.log(routes)
	// const lastScreen = routes[routes.length - 1];
	// if (lastScreen.viewRef.props.screenName === screenName) {
	// 	return;
	// }
	_navigator.push({
		view: <Screen {...passProps} />
	})
}

function replace(screen: Function, passProps = {}) {
	const screenName = utils.getFuncName(screen);
	const routes = _navigator.getCurrentRoutes();
	// console.log(routes)
	const lastScreen = routes[routes.length - 1];
	if (typeof screen.navigatorStyle === 'function') {
		screen.navigatorStyle = screen.navigatorStyle(passProps)
	}
	if (lastScreen.viewRef.props.screenName !== screenName) {
		_navigator.replace({
			view: (
				<NavigatorPage
					backTitle={lastScreen.viewRef.props.title}//默认为上一个页面的标题
					navigationBarInsets={screen.navigatorStyle && !screen.navigatorStyle.navBarHidden}
					{...screen.navigatorStyle}
					screenName={screenName}
					passProps={passProps}
				>
					{screen}
				</NavigatorPage>
			)
		})
	}
}

function pop() {
	InteractionManager.runAfterInteractions(() => {
		_navigator.pop()
	})
}

function popToTop() {
	InteractionManager.runAfterInteractions(() => {
		_navigator.popToTop()
	})
}

function popN(n) {
	_navigator.popN(n)
}

function resetTo() {
	_navigator.resetTo()
}

export default {
	setContainer,
	sceneConfig,
	push,
	pop,
	popToTop,
	popN,
	resetTo,
	pushNotNavBar,
	replace
}