import React from 'react'
import {
	View,
	Picker
} from 'react-native'
import styleUtil from "../common/styleUtil";
import PropTypes from 'prop-types'
import area from '../assets/area'
import OverlayModal from "./OverlayModal";
import PickerHeader from "./PickerHeader";


export default class AreaPicker extends React.Component {
	static propTypes = {
		selectedProvince: PropTypes.string,
		selectedCity: PropTypes.string,
		onChange: PropTypes.func,
		onDone: PropTypes.func
	};
	
	constructor(props) {
		super(props)
		this.state = {
			selectedProvince: props.selectedProvince || '直辖市',
			selectedCity: props.selectedCity || '北京',
			cityArr: this.findProvinceCities(props.selectedProvince)
		}
	}
	
	onChange = () => {
		const {selectedProvince, selectedCity} = this.state
		const selected = [selectedProvince, selectedCity]
		this.props.onChange && this.props.onChange(selected)
	};
	
	findProvinceCities = (selectedProvince) => {
		if (!selectedProvince) return area[0].cities
		for (let item of area) {
			if (item.provinceName === selectedProvince) {
				return item.cities
			}
		}
	}
	
	onChangeProvince = (selectedProvince) => {
		this.setState({selectedProvince}, _ => {
			let cityArr = this.findProvinceCities(selectedProvince)
			this.setState({
				cityArr,
				selectedCity:cityArr[0].cityName
			})
			this.onChange()
		})
	}
	
	onChangeCity = (selectedCity) => {
		this.setState({selectedCity}, _ => this.onChange())
	}
	
	render() {
		const {
			selectedProvince,
			selectedCity,
			cityArr
		} = this.state
		return (
			<View style={{backgroundColor: 'white'}}>
				<PickerHeader
					onCancel={_ => OverlayModal.hide()}
					onDone={_ => {
						OverlayModal.hide()
						this.props.onDone && this.props.onDone([selectedProvince,selectedCity])
					}}
				/>
				<View style={{
					flexDirection: 'row'
				}}>
					<Picker
						style={{width: styleUtil.window.width / 2}}
						selectedValue={selectedProvince}
						onValueChange={this.onChangeProvince}>
						{
							area.map((v, i) => (
								<Picker.Item key={i} label={v.provinceName} value={v.provinceName}/>
							))
						}
					</Picker>
					<Picker
						style={{width: styleUtil.window.width / 2}}
						selectedValue={selectedCity}
						onValueChange={this.onChangeCity}>
						{
							cityArr.map((v, i) => (
								<Picker.Item key={i} label={v.cityName} value={v.cityName}/>
							))
						}
					</Picker>
				</View>
			</View>
		)
	}
}
