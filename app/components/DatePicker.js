import React from 'react'
import {
	Picker,
	View
} from 'react-native'
import styleUtil from "../common/styleUtil";
import OverlayModal from "./OverlayModal";
import utils from "../common/utils";
import PropTypes from 'prop-types'
import PickerHeader from "./PickerHeader";

export default class DatePicker extends React.Component {
	static propTypes = {
		selectedYear: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
		selectedMonth: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
		selectedDate: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
		startYear: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
		endYear: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
		onChange: PropTypes.func,
		onDone: PropTypes.func
	};
	
	constructor(props) {
		super(props)
		let year = new Date().getFullYear();
		let startYear = props.startYear || year - 90;
		let endYear = props.endYear || year;
		this.state = {
			selectedYear: Number(props.selectedYear) || 1990,
			selectedMonth: Number(props.selectedMonth) || 1,
			selectedDate: Number(props.selectedDate) || 1,
			yearArr: utils.generateSerialNumArray(startYear, endYear),
			monthArr: utils.generateSerialNumArray(1, 12),
			dateArr: utils.generateSerialNumArray(1, 31)
		}
	}
	
	onChange = () => {
		const {selectedYear, selectedMonth, selectedDate} = this.state
		const selected = [selectedYear, selectedMonth, selectedDate]
		this.props.onChange && this.props.onChange(selected)
	};
	
	updateDateArr = () => {
		const {selectedYear, selectedMonth, selectedDate, dateArr} = this.state
		const lastDate = utils.getMonthDate(selectedYear, selectedMonth)
		const dates = utils.generateSerialNumArray(1, lastDate)
		if (dates.toString() === dateArr.toString()) {
			this.onChange()
		} else {
			const newState = {dateArr: dates}
			if (lastDate < selectedDate) {
				newState.selectedDate = lastDate
			}
			this.setState(newState, _ => this.onChange())
		}
	};
	
	onChangeYear = (selectedYear) => {
		this.setState({selectedYear}, _ => this.updateDateArr())
	};
	
	onChangeMonth = (selectedMonth) => {
		this.setState({selectedMonth}, _ => this.updateDateArr())
	};
	
	onChangeDate = (selectedDate) => {
		this.setState({selectedDate}, _ => this.onChange())
	};
	
	render() {
		const {
			selectedYear,
			selectedMonth,
			selectedDate,
			yearArr,
			monthArr,
			dateArr
		} = this.state;
		return (
			<View style={{backgroundColor: 'white'}}>
				<PickerHeader
					onCancel={_ => OverlayModal.hide()}
					onDone={_ => {
						OverlayModal.hide()
						this.props.onDone && this.props.onDone([selectedYear, selectedMonth, selectedDate])
					}}
				/>
				<View style={{
					flexDirection: 'row'
				}}>
					<Picker
						style={{width: styleUtil.window.width / 3}}
						selectedValue={selectedYear}
						onValueChange={this.onChangeYear}>
						{
							yearArr.map((v, i) => (
								<Picker.Item key={i} label={v.toString() + '年'} value={v}/>
							))
						}
					</Picker>
					<Picker
						style={{width: styleUtil.window.width / 3}}
						selectedValue={selectedMonth}
						onValueChange={this.onChangeMonth}>
						{
							monthArr.map((v, i) => (
								<Picker.Item key={i} label={v.toString() + '月'} value={v}/>
							))
						}
					</Picker>
					<Picker
						style={{width: styleUtil.window.width / 3}}
						selectedValue={selectedDate}
						onValueChange={this.onChangeDate}>
						{
							dateArr.map((v, i) => (
								<Picker.Item key={i} label={v.toString() + '日'} value={v}/>
							))
						}
					</Picker>
				</View>
			</View>
		)
	}
}