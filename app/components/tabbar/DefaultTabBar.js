import React from 'react';
const {
	StyleSheet,
	Text,
	View,
	Animated,
	ViewPropTypes
} = ReactNative;
import PropTypes from 'prop-types';
import Button from './Button'

const minSize = 14;
const maxSize = 20;
const ratio = 0.7;

export default class DefaultTabBar extends React.Component {
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
	}
	
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
		this.setTextStyle(this.fonts[0], {fontSize:maxSize});
		this._listener = this.props.scrollValue.addListener(this.setAnimationValue.bind(this));
	}
	
	setAnimationValue({value}) {
		if (value < 0 || value > this.props.tabs.length - 1) {
			return;
		}
		// console.log(this.props.activeTab)
		// const progress = (value - i >= 0 && value - i <= 1) ? value - i : 1;
		//当前活动目标
		const activeTab = this.props.activeTab;
		//下一个活动值
		const nextValue = value - activeTab;
		// console.log(nextValue)
		let differ = Math.abs(activeTab - this.props.fromIndex);
		if (differ >= 2) {
			let progress = value * (1 / differ);
			if (activeTab - this.props.fromIndex > 0) {//往右划
				this.fonts.forEach((font, i) => {
					if (this.props.fromIndex === i) {
						const fontSize = minSize * (1 - progress) * ratio;
						this.setTextStyle(font,{fontSize})
					}
					else if (activeTab === i) {
						let fontSize = minSize * (1 + progress) * ratio;
						this.setTextStyle(font,{fontSize})
					}
				});
			}
			else if (activeTab - this.props.fromIndex < 0) {//往左划
				this.fonts.forEach((font, i) => {
					if (this.props.fromIndex === i) {
						const fontSize = minSize * (1 + progress) * ratio;
						this.setTextStyle(font,{fontSize})
					}
					else if (activeTab === i) {
						let fontSize = minSize * (1 + (1 - progress)) * ratio;
						this.setTextStyle(font,{fontSize})
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
						this.setTextStyle(font,{fontSize})
					}
					else if (nextActiveTab === i) {
						const fontSize = minSize * (1 + (value - activeTab)) * ratio;
						this.setTextStyle(font,{fontSize})
					}
				});
			} else if (nextValue < 0) {//往左划
				const nextActiveTab = activeTab - 1;
				const progress = value - nextActiveTab;
				this.fonts.forEach((font, i) => {
					if (activeTab === i) {
						const fontSize = minSize * (1 + progress) * ratio;
						// const color = this.fontColor(progress);
						this.setTextStyle(font,{fontSize})
					}
					else if (nextActiveTab === i) {
						const fontSize = minSize * (1 + (activeTab - value)) * ratio;
						// const color = this.fontColor(activeTab - value);
						this.setTextStyle(font,{fontSize})
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
	
	renderTabOption(name, page) {
	}
	
	renderTab = (name, page, isTabActive, onPressHandler) => {
		const { activeTextColor, inactiveTextColor, textStyle, } = this.props;
		const textColor = isTabActive ? activeTextColor : inactiveTextColor;
		const fontWeight = isTabActive ? 'bold' : 'normal';
		
		return <Button
			style={{flex: 1, }}
			key={name}
			accessible={true}
			accessibilityLabel={name}
			accessibilityTraits='button'
			onPress={() => onPressHandler(page)}
		>
			<View style={[styles.tab, this.props.tabStyle, ]}>
				<Text
					ref={(font) => {
						this.fonts[page] = font;
					}}
					style={[{color: textColor, fontWeight, }, textStyle, ]}>
					{name}
				</Text>
			</View>
		</Button>;
	}
	
	render() {
		const containerWidth = this.props.containerWidth;
		const numberOfTabs = this.props.tabs.length;
		const tabUnderlineStyle = {
			position: 'absolute',
			width: containerWidth / numberOfTabs,
			height: 4,
			backgroundColor: 'navy',
			bottom: 0,
		};
		
		const translateX = this.props.scrollValue.interpolate({
			inputRange: [0, 1],
			outputRange: [0,  containerWidth / numberOfTabs],
		});
		return (
			<View style={[styles.tabs, {backgroundColor: this.props.backgroundColor, }, this.props.style, ]}>
				{this.props.tabs.map((name, page) => {
					const isTabActive = this.props.activeTab === page;
					const renderTab = this.props.renderTab || this.renderTab;
					return renderTab(name, page, isTabActive, this.props.goToPage);
				})}
				<Animated.View
					style={[
						tabUnderlineStyle,
						{
							transform: [
								{ translateX },
							]
						},
						this.props.underlineStyle,
					]}
				/>
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
		borderWidth: 1,
		borderTopWidth: 0,
		borderLeftWidth: 0,
		borderRightWidth: 0,
		borderColor: '#ccc',
	},
});
