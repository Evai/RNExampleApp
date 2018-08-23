import React from 'react'
import {
	View,
	Alert,
	Text,
	Image,
	ImageBackground,
} from 'react-native'
import NavigatorPage from "../../components/NavigatorPage";
import {ListRow, NavigationBar} from 'teaset'
import LoadingMore from "../../components/load/LoadingMore";
import config from "../../common/config";
import {Avatar} from "react-native-elements/src/index";
import navigate from "../../screens/navigate";
import AddTopicLibrary from "./AddTopicLibrary";
import request from "../../common/request";
import utils from "../../common/utils";
import styleUtil from "../../common/styleUtil";
import TopicLibraryDetail from "./TopicLibraryDetail";
import ScrollPage from "../../components/ScrollPage";
import toast from "../../common/toast";


export default class UserTopicLibrary extends NavigatorPage {
	static defaultProps = {
		...NavigatorPage.navigatorStyle,
		title: '题库',
		isShowDefault: true //默认显示个人题库
	};
	
	constructor(props) {
		super(props);
		Object.assign(this.state, {
			list: [],
			isLoading: false, //上拉加载
			isLoaded: false,
			total: 0
		})
	}
	
	componentWillMount() {
		if (this.props.isShowDefault) {
			this._fetchDataWithLoading()
		} else {
			config.loadData(this.fetchCollect)
		}
	}
	
	fetchCollect = () => {
		request.post(config.api.baseURI + config.api.getCollectTopicLibraryList, {
			userId: this.props.userId
		}).then(res => {
			if (res.code === 0) {
				this.setState({
					list: res.data,
					isLoaded: true
				});
			}
		}).catch(error => {
			// console.warn(`requestError: ${error}`)
		})
	};
	
	addLibrary = (text, isHidden) => {
		request.post(config.api.baseURI + config.api.addTopicLibrary, {
			title: text,
			isHidden: !isHidden
		}).then(res => {
			if (res.code === 0) {
				config.removeTopicLibraryList();
				let list = this.state.list;
				list.unshift({
					title: text,
					isHidden: !isHidden,
					total: 0,
					joins: 0,
					user: config.user,
					id: res.data.id
				});
				this.setState({
					list
				}, _ => navigate.pop());
			}
		})
	};
	
	renderNavigationRightView() {
		if (config.user._id !== this.props.user._id) {
			return null;
		}
		else if (!this.props.isShowDefault) {
			return null;
		}
		return (
			<NavigationBar.LinkButton
				onPress={_ => navigate.push(AddTopicLibrary, {
					title: '新增题库',
					submit: this.addLibrary
				})}
				// style={rightTitleStyle}
				title={'新增题库'}/>
		)
	}
	
	_fetchDataWithLoading = () => {
		let uri = config.api.baseURI + config.api.getTopicLibrary;
		config.loadData(_ => {
			request.post(uri, {
				userId: this.props.userId
			}).then(res => {
				if (res.code === 0) {
					this.setState({
						list: res.data.list,
						isLoaded: true,
						total: res.data.total
					});
					config.setTopicLibraryList(res.data.list)
				}
			}).catch(error => {
				// console.warn(`requestError: ${error}`)
			})
		})
	}
	
	cancelTopicLibrary = (item, index) => {
		request.post(config.api.baseURI + config.api.collectLibrary, {
			libraryId: item.id,
			isCollect: false
		}).then(res => {
			if (res.code === 0) {
				let list = this.state.list;
				list.splice(index, 1);
				this.setState({list})
			}
		})
	};
	
	removeTopicLibrary = (item, index) => {
		request.post(config.api.baseURI + config.api.removeTopicLibrary, {
			libraryId: item.id
		}).then(res => {
			if (res.code === 0) {
				let list = this.state.list;
				list.splice(index, 1);
				this.setState({list})
				config.removeTopicLibraryList()
			}
		})
	};
	
	updateTotal = () => {
		let total = this.state.total;
		total -= 1;
		this.setState({total});
	};
	
	updateList = item => {
		let list = [...this.state.list];
		let index = list.findIndex(row => row.id === item.id);
		if (index > -1) {
			list[index].total -= 1;
			this.setState({list})
		}
	};
	
	_renderRows = (item, index) => {
		return (
			<ListRow
				key={'library' + index}
				// activeOpacity={1}
				onPress={_ => {
					navigate.push(TopicLibraryDetail, {
						item,
						isShowHeader: true,
						updateList: this.updateList
					})
				}}
				swipeActions={[
					<ListRow.SwipeActionButton
						title='删除'
						type='danger'
						style={{width: 100}}
						onPress={_ => {
							Alert.alert('确定删除题库？', '', [
								{text: '取消'},
								{
									text: '删除', onPress: _ => {
										if (this.props.isShowDefault) {
											this.removeTopicLibrary(item, index)
										} else {
											this.cancelTopicLibrary(item, index)
										}
									}
								},
							])
						}}/>
				]}
				title={
					<View style={{
						width: styleUtil.window.width - 90
					}}>
						<Text
							numberOfLines={1}
							style={{
								fontSize: 18,
								marginBottom: 5
							}}>
							{item.title}
						</Text>
						<Text
							numberOfLines={1}
							style={{
								color: styleUtil.detailTextColor,
								fontSize: 14
							}}>
							{item.total}题
							{(config.user._id !== item.user._id ||
								!this.props.isShowDefault) && (
								'，by  ' + item.user.username
							)}
						</Text>
					</View>
				}
				// detail={
				// 	<View style={{
				// 		flexDirection: 'row',
				// 		alignItems: 'center'
				// 	}}>
				// 		<Image
				// 			source={require('../../assets/image/joins.png')}
				// 			style={{
				// 				width: 22,
				// 				height: 19,
				// 				marginRight: 5
				// 			}}
				// 		/>
				// 		<Text>{utils.numberToTenThousand(item.joins)}</Text>
				// 	</View>
				// }
				icon={
					<ImageBackground
						source={item.cover ? {uri: item.cover} : require('../../assets/image/library_cover.jpg')}
						style={{
							width: 50,
							height: 50,
							marginRight: 10
						}}
					>
						{item.isHidden && <View style={{
							position: 'absolute',
							top: 0,
							left: 0,
							width: 0,
							height: 0,
							borderWidth: 15,
							borderColor: 'rgba(0,0,0,.5)',
							borderBottomColor: 'transparent',
							borderRightColor: 'transparent',
						}}>
							<Image
								source={require('../../assets/image/hidden.png')}
								style={{
									width: 20,
									height: 20,
									tintColor: 'white',
									position: 'absolute',
									top: -15,
									left: -15,
								}}
							/>
						</View>}
					</ImageBackground>
				}
				topSeparator={index === 0 ? 'full' : 'none'}
				bottomSeparator={index + 1 === this.state.list.length ? 'full' : 'indent'}
			/>
		)
	};
	
	_renderHeader = () => {
		return (
			<View style={{
				marginTop: 10,
				marginBottom: 10,
			}}>
				<ListRow
					title={'默认题库'}
					icon={require('../../assets/image/default_title_bank.png')}
					topSeparator={'full'}
					bottomSeparator={'full'}
					detail={this.state.total + '题'}
					onPress={_ => navigate.push(TopicLibraryDetail, {
						item: {
							id: 0,
							user: this.props.user
						},
						updateTotal: this.updateTotal,
						isShowHeader: false,
						title: '题库'
					})}
				/>
			</View>
		)
	}
	
	renderPage() {
		return (
			<ScrollPage>
				{this.props.isShowDefault && this._renderHeader()}
				{<LoadingMore hasMore={!this.state.isLoaded} showText={!this.props.isShowDefault && this.state.list.length === 0}/>}
				{this.state.list.map((item, index) => this._renderRows(item, index))}
			</ScrollPage>
		)
	}
}