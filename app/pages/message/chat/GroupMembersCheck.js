import React from 'react'

import {NavigationBar} from "teaset";
import ScrollPage from "../../../components/ScrollPage";
import NavigatorPage from "../../../components/NavigatorPage";
import styleUtil from "../../../common/styleUtil";
import navigate from "../../../screens/navigate";
import UserListRowCheck from "../../../components/UserListRowCheck";

export default class GroupMembersCheck extends NavigatorPage {
	static defaultProps = {
		...NavigatorPage.navigatorStyle,
		scene: navigate.sceneConfig.FloatFromBottom
	};
	
	constructor(props) {
		super(props);
		// this.state.bind(this)
		// this.state = {
		// 	list:props.list || []
		// }
		let list = [...props.groupInfo.members];
		let index = list.findIndex(item => item._id === props.master._id);
		if (index > -1) {
			list.splice(index, 1)
		}
		Object.assign(this.state, {
			list: list || [],
			checkedList: []
		})
	}
	
	renderNavigationLeftView() {
		return <NavigationBar.LinkButton
			title={'关闭'}
			onPress={_ => navigate.pop()}
		/>
	}
	
	renderNavigationRightView() {
		return <NavigationBar.LinkButton
			onPress={_ => this.props.submit && this.props.submit(this.state.checkedList)}
			style={{
				color: this.state.checkedList.length === 0 ? styleUtil.disabledColor : styleUtil.successColor
			}}
			title={'完成'}
		/>
	}
	
	updateCheckedList = checkedList => {
		this.setState({checkedList})
	};
	
	renderPage() {
		return (
			<ScrollPage>
				{this.state.list.map((v, i) => (
					<UserListRowCheck
						key={i}
						list={this.state.list}
						item={v}
						index={i}
						checkedList={this.state.checkedList}
						updateCheckedList={this.updateCheckedList}
						type={this.props.type}
					/>
				))}
			</ScrollPage>
		)
	}
}
