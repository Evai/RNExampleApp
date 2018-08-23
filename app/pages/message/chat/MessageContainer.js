import React from 'react';

import {
	FlatList,
	View,
	Platform
} from 'react-native';

import shallowEqual from './shallowEqual';
import LoadEarlier from './LoadEarlier';
import PropTypes from 'prop-types';
import Message from './Message';

export default class MessageContainer extends React.Component {
	constructor(props) {
		super(props);
		
		this.renderRow = this.renderRow.bind(this);
		this.renderFooter = this.renderFooter.bind(this);
		this.renderLoadEarlier = this.renderLoadEarlier.bind(this);
		
		this.state = {
			messagesData: this.prepareMessages(props.messages),
		};
	}
	
	prepareMessages(messages) {
		return messages.reduce((o, m, i) => {
			const previousMessage = messages[i + 1] || {}
			const nextMessage = messages[i - 1] || {}
			o.push({
				...m,
				previousMessage,
				nextMessage
			})
			return o
		}, [])
	}
	
	shouldComponentUpdate(nextProps, nextState) {
		// if (!shallowEqual(this.props, nextProps)) {
		// 	return true;
		// }
		// console.log(this.state, nextState)
		return !shallowEqual(this.state.messagesData, nextState.messagesData);
	}
	
	componentWillReceiveProps(nextProps) {
		if (this.props.messages === nextProps.messages) {
			return;
		}
		
		this.setState({
			messagesData: this.prepareMessages(nextProps.messages)
		});
	}
	
	
	scrollTo(options) {
		this.refs.flatListRef.scrollToOffset(options)
	}
	
	renderRow({item, index}) {
		if (!item.msgId && item.msgId !== 0) {
			console.warn('GiftedChat: `msgId` is missing for message', JSON.stringify(item));
		}
		if (!item.fromUser) {
			console.warn('GiftedChat: `fromUser` is missing for message', JSON.stringify(item));
			item.fromUser = {};
		}
		let position;
		if (item.msgType === 'notification') {
			position = "center";
		} else {
			position = item.fromUser._id === this.props.user._id ? 'right' : 'left';
		}
		item.isOutgoing = item.fromUser._id === this.props.user._id
		const messageProps = {
			...this.props,
			// key: item.msgId,
			currentMessage: item,
			previousMessage: item.previousMessage,
			nextMessage: item.nextMessage,
			position: position,
		};
		
		if (this.props.renderMessage) {
			return this.props.renderMessage(messageProps);
		}
		return (
			<View
				style={{flex: 1, transform: Platform.OS === 'android' ? [{scaleY: -1}, {perspective: 1280}] : [{scaleY: -1}]}}>
				<Message {...messageProps}/></View>);
	}
	
	renderHeaderWrapper = () => {
		return <View style={{
			flex: 1,
			transform: Platform.OS === 'android' ? [{scaleY: -1}, {perspective: 1280}] : [{scaleY: -1}]
		}}>{this.renderLoadEarlier()}</View>;
	}
	_keyExtractor = (item, index) => item._id + " " + index
	
	renderFooter() {
		if (this.props.renderFooter) {
			const footerProps = {
				...this.props,
			};
			return this.props.renderFooter(footerProps);
		}
		return null;
	}
	
	renderLoadEarlier() {
		if (this.props.canLoadMore === true) {
			const loadEarlierProps = {
				...this.props,
			};
			if (this.props.renderLoadEarlier) {
				return this.props.renderLoadEarlier(loadEarlierProps);
			}
			
			return (
				<LoadEarlier {...loadEarlierProps}/>
			);
		}
		return null;
	}
	
	render() {
		return (
			<View ref='container' style={{flex: 1}}>
				<FlatList
					enableEmptySections={true}
					// keyboardShouldPersistTaps="handled"
					automaticallyAdjustContentInsets={false}
					initialListSize={config.pageSize}
					pageSize={config.pageSize}
					ref='flatListRef'
					keyExtractor={this._keyExtractor}
					contentContainerStyle={{flexGrow: 1, justifyContent: 'flex-end'}}
					data={this.state.messagesData}
					renderItem={this.renderRow}
					renderHeader={this.renderFooter}
					canLoadMore={this.props.canLoadMore}
					renderFooter={this.renderLoadEarlier()}
					style={{transform: Platform.OS === 'android' ? [{scaleY: -1}, {perspective: 1280}] : [{scaleY: -1}]}}
					{...this.props.invertibleScrollViewProps}
					ListFooterComponent={this.renderHeaderWrapper}
					onLoadMoreAsync={this.props.onLoadMoreAsync}
					onEndReachedThreshold={0.3}
					onEndReached={this.props.onLoadMoreAsync}
					keyboardDismissMode={'on-drag'}
				/>
			</View>
		);
	}
}

MessageContainer.defaultProps = {
	messages: [],
	user: {},
	renderMessage: null,
};

MessageContainer.propTypes = {
	messages: PropTypes.array,
	user: PropTypes.object,
	renderMessage: PropTypes.func,
};
