import React from 'react'
import {
	View,
	Picker
} from 'react-native'
import OverlayModal from "./OverlayModal";
import styleUtil from "../common/styleUtil";
import PickerHeader from "./PickerHeader";
import PropTypes from 'prop-types'


export default class CategoryPicker extends React.Component {
	static propTypes = {
		onDone: PropTypes.func,
		category:PropTypes.array,
		selectedId:PropTypes.number,
	};
	
	constructor(props) {
		super(props)
		this.state = {
			category: props.category || [],
			selectedId: props.selectedId || 1
		}
	}
	
	render() {
		return (
			<View style={{backgroundColor: 'white'}}>
				<PickerHeader
					onCancel={_ => OverlayModal.hide()}
					onDone={_ => {
						OverlayModal.hide();
						let selected = {};
						this.state.category.forEach((v, i) => {
							if (v.id === this.state.selectedId) {
								selected = v;
							}
						});
						this.props.onDone(selected)
					}}
				/>
				<View style={{
					flexDirection: 'row'
				}}>
					<Picker
						style={{width: styleUtil.window.width}}
						selectedValue={this.state.selectedId}
						onValueChange={v => this.setState({selectedId: v})}>
						{
							this.state.category.map((v, i) => (
								<Picker.Item key={i} label={v.name} value={v.id}/>
							))
						}
					</Picker>
				</View>
			</View>
		)
	}
}