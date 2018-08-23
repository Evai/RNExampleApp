import React from 'react'
import {
	ActivityIndicator,
	StyleSheet,
	Modal,
	View,
	Text
} from 'react-native'

import PropTypes from 'prop-types'
import styleUtil from "../common/styleUtil";
import Spinkit from 'react-native-spinkit'

const SIZES = ['small', 'large'];

export default class Loading extends React.Component {
	static propTypes = {
		isModal: PropTypes.bool,
		show: PropTypes.bool,
		textStyle: PropTypes.object,
		loadingText: PropTypes.string,
		color: PropTypes.string,
		size: PropTypes.oneOf(SIZES),
	}
	
	static defaultProps = {
		isModal: false,
		show: false,
		textStyle: {},
		loadingText: null,
		color: 'white',
		size: 'small',
	}
	
	state = {
		modalVisible: this.props.show
	}
	
	componentWillReceiveProps(nextProps) {
		const {show} = nextProps;
		this.setState({show});
	}
	
	setModalVisible = (visible) => {
		this.setState({modalVisible: visible});
	}
	
	renderContent = () => {
		const {
			color,
			size,
			loadingText,
			textStyle
		} = this.props
		return (
			<View style={styles.background}>
				<View style={styles.textContainer}>
					{/*<ActivityIndicator*/}
						{/*color={color}*/}
						{/*size={size}*/}
					{/*/>*/}
					<Spinkit
						type={'Bounce'}
						color={color}
						size={size}
					/>
					{loadingText && <Text style={[styles.textContent, textStyle]}>{loadingText}</Text>}
				</View>
			</View>
		)
	}
	
	render() {
		const {
			isModal,
			show
		} = this.props
		if (isModal) {
			return (
				<Modal
					animationType={"fade"}
					transparent={true}
					visible={show}
					supportedOrientations={['landscape', 'portrait']}
					onRequestClose={() => {
						this.setModalVisible(false)
					}}
				>
					<View style={styles.container}>
						{this.renderContent()}
					</View>
				
				</Modal>
			)
		}
		return this.renderContent()
		
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: 'transparent',
		position: 'absolute',
		top: 0,
		bottom: 0,
		left: 0,
		right: 0
	},
	background: {
		position: 'absolute',
		backgroundColor: 'transparent',
		left: 0,
		right: 0,
		bottom: styleUtil.window.height / 2,
		justifyContent: 'center',
		alignItems: 'center'
	},
	textContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: '#000',
		opacity: 0.8,
		borderRadius: 5,
		shadowColor: '#000',
		padding: 10,
		shadowOffset: {
			width: 4,
			height: 4
		},
		shadowOpacity: 0.8,
		shadowRadius: 6,
		elevation: 10
	},
	textContent: {
		marginTop: 5,
		fontSize: 17,
		fontWeight: 'bold',
		color: 'white'
	}
})
