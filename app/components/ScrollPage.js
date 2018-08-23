import React from 'react'

import {
	Animated,
	ScrollView
} from 'react-native'

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

export default class ScrollPage extends React.Component {
	
	render() {
		const AnimatedView = this.props.animated ? AnimatedScrollView : ScrollView;
		return (
			<AnimatedView
				scrollEventThrottle={16}
				keyboardDismissMode={'on-drag'}
				keyboardShouldPersistTaps={'handled'}
				{...this.props}
			>
				{this.props.children}
			</AnimatedView>
		)
	}
}