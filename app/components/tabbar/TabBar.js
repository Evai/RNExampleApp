import React from 'react'
import {
	StyleSheet,
	Text,
	View,
	Animated,
	ViewPropTypes,
	Platform
} from 'react-native';
import PropTypes from 'prop-types';
import Button from './Button'
import {Badge} from 'teaset'

const minSize = 14;
const maxSize = 20;
const ratio = 0.7;

export default class TabBar extends React.Component {
	static propTypes = {
		goToPage: PropTypes.func,
		activeTab: PropTypes.number,
		tabs: PropTypes.array,
		backgroundColor: PropTypes.string,
		activeTextColor: PropTypes.string,
		inactiveTextColor: PropTypes.string,
		textStyle: Text.propTypes.style,
		tabStyle: ViewPropTypes.style,
		renderTab: PropTypes.func,
		underlineStyle: ViewPropTypes.style,
		containerWidth: PropTypes.number,
		tabUnderlineDefaultWidth: PropTypes.number,
		tabUnderlineScaleX: PropTypes.number,
	};
	
	static defaultProps = {
		activeTextColor: 'navy',
		inactiveTextColor: 'black',
		backgroundColor: null,
	};
	
	constructor(props) {
		super(props);
		this.fonts = [];
	}
	
	componentDidMount() {
		if (Platform.OS === 'ios') {
			this.setTextStyle(this.fonts[0], {fontSize: maxSize});
			if (this.props.scrollValue) {
				this._listener = this.props.scrollValue.addListener(this.setAnimationValue.bind(this));
			}
			this._startTrackingPosition()
		}
	}
	
	componentWillUnmount() {
		this.props.scrollValue && this.props.scrollValue.removeListener(this._listener);
		this._stopTrackingPosition()
	}
	
	_startTrackingPosition = () => {
		if (this.props.offsetX && this.props.panX) {
			this._offsetXListener = this.props.offsetX.addListener(({value}) => {
				this._lastOffsetX = value;
				this._handlePosition();
			});
			this._panXListener = this.props.panX.addListener(({value}) => {
				this._lastPanX = value;
				this._handlePosition();
			});
		}
	};
	
	_stopTrackingPosition = () => {
		this.props.offsetX && this.props.offsetX.removeListener(this._offsetXListener);
		this.props.panX && this.props.panX.removeListener(this._panXListener);
	};
	
	
	_handlePosition = () => {
		const {navigationState, layout} = this.props;
		const panX = typeof this._lastPanX === 'number' ? this._lastPanX : 0;
		const offsetX =
			typeof this._lastOffsetX === 'number'
				? this._lastOffsetX
				: -navigationState.index * layout.width;
		
		const value = (panX + offsetX) / -(layout.width || 0.001);
		this.setAnimationValue({value})
	};
	
	setAnimationValue({value}) {
		// console.log(value)
		if (value < 0 || value > this.props.tabs.length - 1) {
			return;
		}
		// console.log(this.props.activeTab)
		// const progress = (value - i >= 0 && value - i <= 1) ? value - i : 1;
		//当前活动目标
		const activeTab = this.props.activeTab;
		//下一个活动值
		const nextValue = value - activeTab;
		// console.warn(activeTab)
		let differ = Math.abs(activeTab - this.props.fromIndex);
		// console.warn(differ)
		if (differ >= 2) {
			let progress = value * (1 / differ);
			if (activeTab - this.props.fromIndex > 0) {//往右划
				this.fonts.forEach((font, i) => {
					if (this.props.fromIndex === i) {
						const fontSize = minSize * (1 - progress) * ratio;
						this.setTextStyle(font, {fontSize})
					}
					else if (activeTab === i) {
						let fontSize = minSize * (1 + progress) * ratio;
						this.setTextStyle(font, {fontSize})
					}
				});
			}
			else if (activeTab - this.props.fromIndex < 0) {//往左划
				this.fonts.forEach((font, i) => {
					if (this.props.fromIndex === i) {
						const fontSize = minSize * (1 + progress) * ratio;
						this.setTextStyle(font, {fontSize})
					}
					else if (activeTab === i) {
						let fontSize = minSize * (1 + (1 - progress)) * ratio;
						this.setTextStyle(font, {fontSize})
					}
				});
			}
		}
		else {
			if (nextValue > 0) {//往右划
				const nextActiveTab = activeTab + 1;
				const progress = nextActiveTab - value;
				this.fonts.forEach((font, i) => {
					//下一个活动目标
					if (activeTab === i) {
						const fontSize = minSize * (1 + progress) * ratio;
						// const color = this.fontColor(progress);
						this.setTextStyle(font, {fontSize})
					}
					else if (nextActiveTab === i) {
						const fontSize = minSize * (1 + (value - activeTab)) * ratio;
						// const color = this.fontColor(value - activeTab);
						this.setTextStyle(font, {fontSize})
					}
				});
			} else if (nextValue < 0) {//往左划
				const nextActiveTab = activeTab - 1;
				const progress = value - nextActiveTab;
				this.fonts.forEach((font, i) => {
					if (activeTab === i) {
						const fontSize = minSize * (1 + progress) * ratio;
						// const color = this.fontColor(progress);
						this.setTextStyle(font, {fontSize})
					}
					else if (nextActiveTab === i) {
						const fontSize = minSize * (1 + (activeTab - value)) * ratio;
						// const color = this.fontColor(activeTab - value);
						this.setTextStyle(font, {fontSize})
					}
				});
			}
		}
		
	}
	
	setTextStyle = (font, {fontSize, color}) => {
		font.setNativeProps({
			style: {
				fontSize: fontSize <= minSize ? minSize : fontSize >= maxSize ? maxSize : fontSize,
				color
			},
		});
	};
	
	fontColor = (progress) => {
		// const red = 59 + (204 - 59) * progress;
		// const green = 89 + (204 - 89) * progress;
		// const blue = 152 + (204 - 152) * progress;
		// let opacity = (0.7 + progress) >= 1 ? 1 : 0.7 + progress;
		return `rba(${red},${green},${blue})`;
	};
	
	renderBadge = item => {
		if (item.badgeCount > 0) {
			return (
				<Badge
					count={item.badgeCount}
					style={{
						position: 'absolute',
						right: 0,
						top: 0,
						...this.props.badgeStyle
					}}
				/>
			)
		}
		else if (item.newCount > 0) {
			return (
				<Badge
					type={'dot'}
					style={{
						position: 'absolute',
						right: 5,
						top: 5
					}}
				/>
			)
		}
		return null;
	};
	
	_renderUnderline() {
		const containerWidth = this.props.tabContainerWidth || this.props.containerWidth;
		const numberOfTabs = this.props.tabs.length;
		const underlineWidth = this.props.tabUnderlineDefaultWidth ? this.props.tabUnderlineDefaultWidth : containerWidth / (numberOfTabs * 2);
		const scale = this.props.tabUnderlineScaleX ? this.props.tabUnderlineScaleX : 3;
		const deLen = (containerWidth / numberOfTabs - underlineWidth) / 2;
		const tabUnderlineStyle = {
			position: 'absolute',
			width: underlineWidth,
			height: 2,
			borderRadius: 2,
			backgroundColor: this.props.activeColor,
			bottom: 0,
			left: deLen
		};
		let translateX;
		// console.warn(containerWidth,numberOfTabs)
		if (this.props.scrollValue) {
			translateX = this.props.scrollValue.interpolate({
				inputRange: [0, 1],
				outputRange: [0, containerWidth / numberOfTabs],
			});
		} else {
			translateX = this.props.position.interpolate({
				inputRange: [0, 1],
				outputRange: [0, containerWidth / numberOfTabs],
			})
		}
		
		const scaleValue = (defaultScale) => {
			let number = 4
			let arr = new Array(number * 2)
			return arr.fill(0).reduce(function (pre, cur, idx) {
				idx === 0 ? pre.inputRange.push(cur) : pre.inputRange.push(pre.inputRange[idx - 1] + 0.5);
				idx % 2 ? pre.outputRange.push(defaultScale) : pre.outputRange.push(1)
				return pre
			}, {inputRange: [], outputRange: []})
		};
		let scaleX;
		if (this.props.scrollValue) {
			scaleX = this.props.scrollValue.interpolate(scaleValue(scale));
		} else {
			scaleX = this.props.position.interpolate(scaleValue(scale));
		}
		
		return (
			<Animated.View
				style={[
					tabUnderlineStyle,
					{
						transform: [
							{translateX},
							{scaleX}
						],
					},
					this.props.underlineStyle,
				]}
			/>
		)
	}
	
	renderTab = (item, page, isTabActive, onPressHandler) => {
		const name = item.name || item;
		const {activeTextColor, inactiveTextColor, textStyle,} = this.props;
		const textColor = isTabActive ? activeTextColor : inactiveTextColor;
		const fontWeight = isTabActive ? 'bold' : 'normal';
		return <Button
			style={[{flex: 1}, {...this.props.buttonStyle}]}
			key={name}
			accessible={true}
			accessibilityLabel={name}
			accessibilityTraits='button'
			onPress={() => onPressHandler(page)}
		>
			<View style={[styles.tab, this.props.tabStyle,]}>
				{this.renderBadge(item)}
				<Text
					ref={(font) => {
						this.fonts[page] = font;
					}}
					style={[{color: textColor, fontWeight,}, textStyle,]}>
					{name}
				</Text>
			</View>
		</Button>;
	};
	
	render() {
		let {
			containerWidth,
			tabs,
			tabList,
			scrollValue,
			backgroundColor
		} = this.props;
		const tabArr = tabList ? tabList : tabs;
		return (
			<View style={[styles.tabs, {backgroundColor: backgroundColor,}, this.props.style,]}>
				{tabArr.map((item, page) => {
					const isTabActive = this.props.activeTab === page;
					const renderTab = this.props.renderTab || this.renderTab;
					return renderTab(item, page, isTabActive, this.props.goToPage);
				})}
				{this._renderUnderline()}
			</View>
		);
	}
	
}

const styles = StyleSheet.create({
	tab: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		paddingBottom: 10,
	},
	tabs: {
		height: 50,
		flexDirection: 'row',
		justifyContent: 'space-around',
		// borderWidth: 1,
		// borderTopWidth: 0,
		// borderLeftWidth: 0,
		// borderRightWidth: 0,
		// borderColor: '#ccc',
	},
});
