import React from 'react'
import {
	StyleSheet,
	View
} from 'react-native'
import styleUtil from "../common/styleUtil";
import {Button} from 'teaset'
import PropTypes from 'prop-types'

export default class HeaderTitleButton extends React.Component {
	static propTypes = {
		items: PropTypes.array.isRequired,
		activeIndex: PropTypes.number,
		onChange: PropTypes.func
	};
	
	constructor(props) {
		super(props);
		this.state = {
			activeIndex: props.activeIndex || 0
		}
	}
	
	onChange = (i) => {
		this.setState({
			activeIndex: i
		}, _ => this.props.onChange(i))
	};
	
	render() {
		const {
			activeIndex
		} = this.state;
		return (
			<View style={styles.headerView}>
				{
					this.props.items.map((v, i) => (
						<Button
							key={i}
							style={[
								styles.headerButton,
								activeIndex === i ? styles.activeButton : {}
							]}
							titleStyle={[
								styles.headerTitle,
								activeIndex === i ? {
									color: styleUtil.themeColor
								} : {}
							]}
							onPress={_ => this.onChange(i)}
							activeOpacity={1}
							title={v}
						/>
					))
				}
			</View>
		)
	}
}

const styles = StyleSheet.create({
	headerView: {
		flexDirection: 'row',
		alignItems: 'center',
		borderWidth: 1,
		borderColor: 'white',
		borderRadius: 20
	},
	headerButton: {
		backgroundColor: 'transparent',
		borderColor: 'white',
		borderWidth: 0,
		borderRadius: 20,
		paddingLeft: 18,
		paddingRight: 18,
		paddingTop: 5,
		paddingBottom: 5
	},
	headerTitle: {
		color: 'white',
		fontSize: 16
	},
	activeButton: {
		backgroundColor: 'white',
		borderWidth: 1
	}
});