import React from 'react'
import {
	View,
	FlatList,
	Text,
	TouchableOpacity,
	Alert
} from 'react-native'

import styleUtil from "../../common/styleUtil";
import config from "../../common/config";
import navigate from "../../screens/navigate";
import {NavigationBar} from 'teaset'
import styles from "./styles";
import ImageCached from "../ImageCached";
import NavBar from "../NavBar";
import {Icon} from 'react-native-elements'
import request from "../../common/request";
import toast from "../../common/toast";


export default class CollectEmoticon extends React.Component {
	static navigatorStyle = {
		navBarHidden: true,
		scene: navigate.sceneConfig.FloatFromBottom
	};
	
	constructor(props) {
		super(props);
		this.state = {
			isEdit: false,
			list: props.collectList || [],
			rightTitle: '整理',
			checkedList: [],
			isCheckAll: false
		}
	}
	
	componentWillReceiveProps(nextProps) {
		if (this.props.collectList !== nextProps.collectList) {
			this.setState({collectList: nextProps.collectList})
		}
	}
	
	rightOnPress = () => {
		let isEdit = !this.state.isEdit;
		const rightTitle = isEdit ? '完成' : '整理';
		let list = [...this.state.list];
		if (isEdit) {
			list.forEach((v, i) => {
				list[i].checked = false;
			})
		}
		this.setState({
			isEdit: isEdit,
			rightTitle,
			list,
			checkedList: [],
			isCheckAll: false
		})
	}
	
	renderNavBar = () => {
		return (
			<NavBar
				title={'添加的表情'}
				renderLeftView={<NavigationBar.LinkButton
					title={'关闭'}
					onPress={_ => navigate.pop()}
				/>}
				rightTitle={this.state.rightTitle}
				rightStyle={{
					color: this.state.isEdit ? styleUtil.successColor : 'black'
				}}
				rightOnPress={this.rightOnPress}
			/>
		)
	};
	
	_renderRows = ({item, index}) => {
		const size = (styleUtil.window.width - 10) / 4;
		if (index === 0) {
			return <TouchableOpacity
				style={[styles.addButton, {
					width: size,
					height: size,
					marginVertical: 1,
					marginHorizontal: 1,
				}]}
				activeOpacity={0.5}
				onPress={() => {
					this.props.selectLibrary(list => {
						list.forEach((v, i) => {
							list[i].isViewable = true
						})
						this.setState({list})
					})
				}}
			>
				<Icon
					name={'ios-add'}
					type={'ionicon'}
					size={size}
					color={'#ccc'}
				/>
			</TouchableOpacity>
		}
		return (
			<TouchableOpacity
				activeOpacity={this.state.isEdit ? 0.7 : 1}
				onPress={_ => {
					if (this.state.isEdit) {
						item.checked = !item.checked;
						let list = [...this.state.list];
						let checkedList = this.state.checkedList;
						list[index] = item;
						if (item.checked) {
							if (item.id !== 0) {
								checkedList.push(item.id)
							}
						} else {
							const i = checkedList.findIndex(id => id === item.id);
							if (i > -1) {
								checkedList.splice(i, 1);
							}
						}
						this.setState({
							list,
							checkedList
						})
					}
				}}
				style={{
					justifyContent: 'center',
					alignItems: 'center',
					width: size,
					height: size,
					marginVertical: 1,
					marginHorizontal: 1,
					backgroundColor: styleUtil.borderColor
				}}>
				<ImageCached
					source={{uri: item.isViewable || ImageCached.cache.get().cache[item.image] ? item.image : undefined}}
					style={{
						width: size,
						height: size
					}}
				/>
				{this.state.isEdit && <Icon
					name={'check'}
					size={18}
					color={'white'}
					containerStyle={{
						borderColor: item.checked ? styleUtil.successColor : 'white',
						borderWidth: styleUtil.borderSeparator,
						backgroundColor: item.checked ? styleUtil.successColor : 'rgba(0,0,0,.3)',
						borderRadius: 11,
						width: 22,
						height: 22,
						position: 'absolute',
						zIndex: 99,
						right: 2,
						top: 2
					}}
				/>}
			</TouchableOpacity>
		)
	};
	
	checkAll = () => {
		let isCheckAll = !this.state.isCheckAll;
		let list = [...this.state.list];
		let checkedList = [];
		if (isCheckAll) {
			list.forEach((v, i) => {
				list[i].checked = true;
				if (v.id !== 0) {
					checkedList.push(v.id);
				}
			})
		}
		else {
			list.forEach((v, i) => {
				list[i].checked = false;
			})
		}
		this.setState({
			isCheckAll,
			list,
			checkedList
		})
	};
	
	removeEmoticon = () => {
		let checkedList = this.state.checkedList;
		request.post(config.api.baseURI + config.api.removeEmoticon, {
			emoticonIds: checkedList
		}).then(res => {
			if (res.code === 0) {
				toast.success('删除表情成功');
				let list = [...this.state.list];
				checkedList.forEach((v, i) => {
					let index = list.findIndex(item => item.id === v);
					if (index > -1) {
						list.splice(index, 1)
					}
				});
				this.setState({
					list,
					checkedList: [],
					isEdit: false,
					isCheckAll: false,
					rightTitle: '整理'
				});
				this.props.updateCollectList && this.props.updateCollectList(list)
			}
		}).catch()
	};
	
	renderFooter = () => {
		// if (!this.state.isEdit) {
		// 	return null;
		// }
		const {checkedList, isCheckAll, isEdit} = this.state;
		const Component = isEdit ? TouchableOpacity : View;
		return (
			<View style={{
				flexDirection: 'row',
				justifyContent: 'space-between',
				alignItems: 'center',
				height: 51,
				paddingVertical: 8,
				paddingHorizontal: 15,
				borderTopWidth: styleUtil.borderSeparator,
				borderTopColor: styleUtil.borderColor
			}}>
				<Component onPress={this.checkAll}>
					<Text style={{
						fontSize: 17,
						color: isEdit ? 'black' : styleUtil.disabledColor,
					}}>{isCheckAll ? '取消全选' : '全选'}</Text>
				</Component>
				<Component onPress={() => {
					Alert.alert('确认要删除吗？', '删除后不可恢复', [
						{text: '取消'},
						{
							text: '确认', onPress: this.removeEmoticon
						},
					])
				}}>
					<Text style={{
						color: checkedList.length > 0 ? 'red' : styleUtil.disabledColor,
						fontSize: 17
					}}>删除{checkedList.length > 0 ? `(${checkedList.length})` : null}</Text>
				</Component>
			</View>
		)
	}
	
	render() {
		return (
			<View style={styleUtil.container}>
				{this.renderNavBar()}
				<FlatList
					style={{marginBottom: 60}}
					data={this.state.list}
					renderItem={this._renderRows}
					numColumns={4}
					initialNumToRender={config.pageSize}
					keyExtractor={(item, index) => index.toString()}
					onEndReachedThreshold={0.3}
					// onViewableItemsChanged={this._onViewableItemsChanged}
				/>
				{this.renderFooter()}
			</View>
		)
	}
}