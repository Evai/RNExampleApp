import React from 'react'
import {
	View,
	Image,
	AsyncStorage,
	Alert
} from 'react-native'
import NavigatorPage from "../../components/NavigatorPage";
import {ListRow} from 'teaset'
import ScrollPage from "../../components/ScrollPage";
import {ImageCache} from "react-native-img-cache";
import utils from "../../common/utils";
import storageUtil from "../../common/storageUtil";
import ChatList from "../message/ChatList";

export default class ClearCache extends NavigatorPage {
	static defaultProps = {
		...NavigatorPage.navigatorStyle,
		title: '清理缓存'
	};
	
	constructor(props) {
		super(props);
		Object.assign(this.state, {
			imageCache: undefined,
			dataCache: undefined
		})
		this.dataCacheKeys = [];
	}
	
	componentWillMount() {
		config.loadData(this.getImageCache)
		config.loadData(this.getDataCache)
	}
	
	getImageCache = () => {
		let cache = ImageCache.get().cache;
		if (cache) {
			let size = Object.keys(cache).length;
			this.setState({
				imageCache: size
			})
		} else {
			this.setState({
				imageCache: 0
			})
		}
	};
	
	getDataCache = () => {
		storageUtil.getAllKeys()
			.then(keys => {
				keys.forEach((item, i) => {
					if (item.indexOf(config.appCache) > -1) {
						this.dataCacheKeys.push(storageUtil._prefix + item)
					}
				});
				return AsyncStorage.multiGet(this.dataCacheKeys)
			})
			.then(list => {
				if (!list || list.length === 0) {
					this.setState({
						dataCache: 0
					})
				}
				else {
					let str = JSON.stringify(list);
					let size = utils.mbStringLength(str);
					size = (size / 1024 / 1024).toFixed(2);
					this.setState({
						dataCache: size
					})
				}
			})
	};
	
	clearImageCache = () => {
		Alert.alert('确定要清空图片缓存吗？', '', [
			{text: '取消'},
			{
				text: '确定', onPress: _ => {
					ImageCache.get().clear();
					this.setState({
						imageCache: 0
					})
				}
			},
		])
	}
	
	clearDataCache = () => {
		Alert.alert('确定要清空缓存吗？', '', [
			{text: '取消'},
			{
				text: '确定', onPress: _ => {
					for (let item of this.dataCacheKeys) {
						storageUtil.removeCache(item);
					}
					AsyncStorage.multiRemove(this.dataCacheKeys)
						.then(res => {
							this.setState({
								dataCache: 0
							});
						})
				}
			},
		])
		
	}
	
	renderPage() {
		let {dataCache, imageCache} = this.state;
		return (
			<ScrollPage>
				<View style={{marginTop: 20}}>
					<ListRow
						title={'应用缓存'}
						detail={dataCache >= 0 ? dataCache + 'M' : '计算中……'}
						topSeparator={'full'}
						onPress={this.clearDataCache}
					/>
					<ListRow
						title={'图片缓存'}
						detail={imageCache >= 0 ? imageCache + '张' : '计算中……'}
						topSeparator={'full'}
						bottomSeparator={'full'}
						onPress={this.clearImageCache}
					/>
				</View>
			</ScrollPage>
		)
	}
}