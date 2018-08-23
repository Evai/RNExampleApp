import React from 'react'
import {
	StyleSheet,
	View,
	Text, PermissionsAndroid, Platform
} from 'react-native'
import {Avatar, Icon} from "react-native-elements";
import styleUtil from "../../common/styleUtil";
import ImageCached from "../../components/ImageCached";
import Profile from "../account/Profile";
import navigate from "../../screens/navigate";
import Contacts from 'react-native-contacts'
import toast from "../../common/toast";
import {ListRow} from 'teaset'
import SimilarText from "../../components/SimilarText";
import IndexedListView, {AlphaBetaList} from '../../components/IndexedListView'
import utils from "../../common/utils";
import request from "../../common/request";
import config from "../../common/config";

export default class ContactList extends React.Component {
	
	static navigatorStyle = {
		title: '手机通讯录'
	};
	
	constructor(props) {
		super(props);
		this.state = {
			list: {},
			letters: []
		};
	}
	
	componentDidMount() {
		this._checkPermission().then(res => {
			if (!res) return;
			this.getContacts()
		}).catch(err => {})
	}
	
	_checkPermission() {
		if (Platform.OS === 'ios') {
			return Promise.resolve(true);
		}
		
		const rationale = {
			'title': '访问通讯录',
			'message': '是否允许软件访问您的通讯录以便可以获取通讯录里的好友？'
		};
		
		return PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.READ_CONTACTS, rationale)
			.then((result) => {
				console.log('Permission result:', result);
				return (result === true || result === PermissionsAndroid.RESULTS.GRANTED);
			});
	}
	
	getContacts = () => {
		config.getContactList().then(list => {
			this.setState({
				list,
				letters: Object.keys(list)
			});
			Contacts.getAllWithoutPhotos((err, contacts) => {
				if (err) {
					toast.fail('获取手机联系人失败');
					return;
				}
				// console.log(contacts);
				if (!list || Object.keys(list).length === 0 ){
					toast.modalLoading('加载中');
				}
				config.loadData(_ => this.fetchData(contacts), 500)
			})
		});
	}
	
	fetchData = (data) => {
		const contacts = [];
		data.forEach((item, index) => {
			const obj = {
				fullName: (item.familyName || '') + (item.givenName || ''),
			};
			item.phoneNumbers.forEach((v, i) => {
				let phone = utils.replaceAll(v.number, '-', '');
				if (phone.length === 11) {
					obj.phone = phone;
				}
			});
			contacts[index] = obj;
		});
		this.isLoaded = true;
		request.post(config.api.baseURI + config.api.getContactList, {
			contacts
		}).then(res => {
			toast.modalLoadingHide();
			if (res.code === 0) {
				let list = utils.sortByPinYin(res.data);
				config.setContactList(list);
				this.setState({
					list,
					letters: Object.keys(list)
				})
			}
		}).catch(e => {
			toast.modalLoadingHide();
		})
	};
	
	_renderRow = (item, sectionId, index) => {
		let list = this.state.list;
		return (
			<ListRow
				title={
					<View style={{
						flexDirection: 'row',
						marginLeft: 8,
						alignItems: 'center'
					}}>
						<Icon
							name={item.gender === 1 ? 'gender-male' : item.gender === 2 ? 'gender-female' : 'gender-male-female'}
							type={'material-community'}
							size={20}
							color={item.gender === 1 ? '#009ad6' : item.gender === 2 ? '#f391a9' : '#7D26CD'}
							containerStyle={{marginRight: 5}}
						/>
						<View style={{
							justifyContent: 'space-between',
							height: 35
						}}>
							<Text numberOfLines={1}
							      style={{
								      width: styleUtil.window.width - 210,
								      fontSize: 16,
							      }}>{item.fullName}</Text>
							<Text
								numberOfLines={1}
								style={{
									width: styleUtil.window.width - 210,
									fontSize: 12,
									color: styleUtil.detailTextColor
								}}>{item.username}</Text>
						</View>
					</View>
				}
				titleStyle={{marginLeft: 10}}
				detail={
					<Text style={{
						color:item.isFriend ? styleUtil.successColor : styleUtil.detailTextColor
					}}>
						{item.isFriend ? '已添加' : '未添加'}
					</Text>
				}
				onPress={_ => navigate.push(Profile, {
					_id: item._id
				})}
				icon={<ImageCached
					component={Avatar}
					medium
					rounded
					source={config.defaultAvatar(item.isViewable || ImageCached.cache.get().cache[item.avatar] ? item.avatar : undefined)}
				/>
				}
				topSeparator={
					index === 0 ? 'full' : 'none'
				}
				bottomSeparator={
					Number(index) + 1 === list[sectionId].length ? 'full' : 'indent'
				}
				accessory={'none'}
			/>
		)
	};
	
	onChangeVisibleRows = (visibleRows, changedRows) => {
		// console.warn(visibleRows)
		let list = this.state.list;
		for (let key in visibleRows) {
			for (let index in visibleRows[key]) {
				list[key][index].isViewable = visibleRows[key][index];
			}
		}
		this.setState({list})
	};
	
	_renderSearch = () => {
		return (
			<View style={{
				backgroundColor: 'white',
				margin: 5,
				padding: 5,
				borderWidth: styleUtil.borderSeparator,
				borderColor: styleUtil.borderColor,
				borderRadius: 3,
				flexDirection: 'row',
				alignItems: 'center',
				justifyContent: 'center'
			}}>
				<Icon
					name={'search'}
					color={'#666'}
				/>
				<Text style={{
					color: '#666',
				}}>搜索</Text>
			</View>
		)
	};
	
	render() {
		return (
			<View style={styles.container}>
				<IndexedListView
					ref={ele => this.indexList = ele}
					list={this.state.list}
					renderRow={this._renderRow}
					// renderFooter={this._renderFooter}
					renderHeader={() => {
						if (Object.keys(this.state.list).length === 0 && this.isLoaded) {
							return <Text style={{
								textAlign:'center',
								marginVertical:15
							}}>还没有用户注册哦，赶紧去邀请一下吧~</Text>
						}
						return null;
					}}
					onChangeVisibleRows={this.onChangeVisibleRows}
				/>
				<AlphaBetaList
					onLetterPress={letter => {
						this.indexList && this.indexList.scrollToSection(letter)
					}}
					letters={this.state.letters}
				/>
			</View>
		)
	}
}


const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: styleUtil.backgroundColor
	},
	row: {
		paddingVertical: 10,
		flexDirection: 'row',
		alignItems: 'center',
	},
	avatar: {
		height: 50,
		width: 50,
		borderRadius: 25,
		marginHorizontal: 20,
	},
	name: {
		fontSize: 18
	}
});