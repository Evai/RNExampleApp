'use strict'

import React, {Component} from 'react';
import {
	Text,
	View,
	StyleSheet,
	TouchableOpacity,
	Animated,
	Platform,
	FlatList,
	Image
} from 'react-native';

import emoticonData from './emoticonData.json';
import styleUtil from "../../common/styleUtil";
import {Icon} from 'react-native-elements'
import Emoji from "./Emoji";
import styles from './styles';
import PropTypes from 'prop-types';
import {emojify, unemojify, get, find} from 'node-emoji'
import ImageCached from "../ImageCached";
import config from "../../common/config";
import ImageCropPicker from 'react-native-image-crop-picker';
import toast from "../../common/toast";
import request from "../../common/request";
import navigate from "../../screens/navigate";
import CollectEmoticon from "./CollectEmoticon";

export const EMOTICONS_HEIGHT = 235;

let list = [];
for (let key in emoticonData) {
	list.push({name: key, code: emoticonData[key]})
}

// this.pageSize = 20;
// // let rowNum = Math.round(width / 42);
// // let pageSize = rowNum * 3 - 1;
// this.total = Object.keys(emoticonData).length;
// this.remain = this.total % this.pageSize;
// this.page = this.remain === 0 ? Math.floor(this.total / this.pageSize) : Math.floor(this.total / this.pageSize) + 1;

export default class Emoticons extends Component {
	constructor(props) {
		super(props);
		
		this.state = {
			list: list,
			collectList: props.collectList || [],
			activeIndex: 0,
			images: [
				{
					source: require('../../assets/image/emoticon.png'),
					onPress: (item, index) => {
						this.setState({
							activeIndex: index
						});
					}
				},
				{
					source: require('../../assets/image/favorite.png'),
					onPress: (item, index) => {
						this.setState({
							activeIndex: index
						});
						config.getCollectEmoticon().then(list => {
							if (list.length === 0) {
								list[0] = {id: 0}
							}
							this.updateCollectList(list)
						});
					}
				}
			]
		};
	}
	
	static propTypes = {
		showsPagination: PropTypes.bool,
		onSend: PropTypes.func,
		onTextSend: PropTypes.func,
		onEmoticon: PropTypes.func,
		onBackspace: PropTypes.func,
		selection: PropTypes.object,
		text: PropTypes.string,
		showButton: PropTypes.bool
	};
	
	static defaultProps = {
		showsPagination: true,
		showButton: true
	};
	
	componentDidMount() {
	
	}
	
	componentWillReceiveProps(nextProps) {
		if (nextProps.collectList) {
			const list = [...nextProps.collectList];
			this.setState({collectList: list})
		}
	}
	
	static parse = emojify
	static stringify = unemojify
	static get = get
	static find = find
	
	onEmoticon = ({name, code}) => {
		const {selection, text} = this.props;
		let pos = selection.end;
		let startText = text.substring(0, pos);
		let endText = code + text.substring(pos);
		this.props.onEmoticon && this.props.onEmoticon({text: startText + endText, name, code})
	};
	
	onBackspace = () => {
		const {selection, text} = this.props;
		let pos = selection.end;
		if (!text || !pos) {
			return
		}
		let startText = text.substring(0, pos);
		let char = startText.charAt(pos - 1).charCodeAt();
		if (char >= 55356 && char <= 59000) {
			startText = startText.substring(0, pos - 2)
		} else {
			startText = startText.substring(0, pos - 1)
		}
		let endText = text.substring(pos);
		this.props.onBackspace && this.props.onBackspace(startText + endText)
	};
	
	
	updateCollectList = (arr) => {
		this.props.updateCollectList && this.props.updateCollectList(arr)
		// if (!Array.isArray(arr)) {
		// 	arr = [arr]
		// }
		// let list = [...arr];
		// // console.warn(list.length)
		// if (list[0].id !== 0) {
		// 	list.unshift({id: 0})
		// }
		// // console.warn(list.length)
		// this.setState({collectList: list});
		// config.setCollectEmoticon(list)
	};
	
	_renderRows = ({item, index}) => {
		return (
			<TouchableOpacity
				activeOpacity={0.5}
				onPress={_ => {
					this.onEmoticon({
						name: item.name,
						code: item.code
					})
				}}
				style={styles.touchBtn}>
				<Emoji name={item.name}/>
			</TouchableOpacity>
		)
	};
	
	selectLibrary = (callback) => {
		ImageCropPicker.openPicker({
			multiple: true,
			// cropping: true,
			mediaType: 'photo',
			// compressImageQuality: 0,
			minFiles: 1,
			maxFiles: 1,
			loadingLabelText: '请稍等...'
		}).then(images => {
			// console.warn(images);
			this.addEmoticon(images, callback)
		}).catch(err => {
			if (err.code === 'E_PICKER_CANCELLED') {
				return
			}
			toast.fail('出错啦~')
		})
	};
	
	addEmoticon = (images, callback) => {
		const image = images[0];
		toast.modalLoading()
		request.upload(config.api.baseURI + config.api.uploadImage, {
			uri: image.path,
			ext: 'jpg'
		}).then(res => {
			return res.data;
		}).then(image => {
			if (!image) {
				return
			}
			request.post(config.api.baseURI + config.api.addEmoticon, {
				image
			}).then(res => {
				toast.modalLoadingHide()
				if (res.code === 0) {
					toast.success('添加成功')
					let arr = [...this.state.collectList];
					arr.push(res.data);
					// console.warn(arr)
					this.updateCollectList(arr);
					callback && callback(arr)
				}
			})
		}).catch(e => {
			toast.modalLoadingHide()
		})
	};
	
	_renderFavorite = ({item, index}) => {
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
				onPress={_ => navigate.push(CollectEmoticon, {
					item,
					index,
					collectList: this.state.collectList,
					selectLibrary: this.selectLibrary,
					updateCollectList: this.updateCollectList
				})}
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
				activeOpacity={0.7}
				onPress={_ => {
					this.props.onSend({
						image: {
							path: item.image
						}
					})
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
			</TouchableOpacity>
		)
	}
	
	_onViewableItemsChanged = ({viewableItems, changed}) => {
		// console.log(viewableItems,changed);
		let list = [...this.state.collectList];
		viewableItems.forEach((v, i) => {
			if (list[v.index] && list[v.index].id === v.item.id) {
				list[v.index].isViewable = v.isViewable;
			}
		});
		changed.forEach((v, i) => {
			if (list[v.index] && list[v.index].id === v.item.id) {
				list[v.index].isViewable = v.isViewable;
			}
		});
		this.updateCollectList(list)
	};
	
	render() {
		return (
			<View style={{
				flex: 1,
				// display:this.props.show ? 'flex' : 'none',
			}}>
				{this.state.activeIndex === 0 && <FlatList
					data={this.state.list}
					renderItem={this._renderRows}
					numColumns={8}
					initialNumToRender={config.pageSize}
					keyExtractor={(item, index) => item.name + index.toString()}
					onEndReachedThreshold={0.2}
				/>}
				{this.props.showButton && this.state.activeIndex === 1 && <FlatList
					data={this.state.collectList}
					renderItem={this._renderFavorite}
					numColumns={4}
					initialNumToRender={config.pageSize}
					keyExtractor={(item, index) => index.toString()}
					onEndReachedThreshold={0.2}
					onViewableItemsChanged={this._onViewableItemsChanged}
				/>}
				{this.props.showButton && <View style={{
					height: 40,
					flexDirection: 'row',
					backgroundColor: 'white',
					justifyContent: 'space-between'
				}}>
					<View style={{
						flex: 1,
						flexDirection: 'row',
					}}>
						{this.state.images.map((v, i) => (
							<TouchableOpacity
								key={i}
								activeOpacity={0.7}
								style={{
									backgroundColor: this.state.activeIndex === i ? 'rgba(0,0,0,.3)' : 'white',
									padding: 8,
								}}
								onPress={_ => v.onPress(v, i)}
							>
								<Image
									source={v.source}
									style={styles.imageIcon}
								/>
							</TouchableOpacity>
						))}
					</View>
					<TouchableOpacity onPress={this.props.onTextSend}
					                  style={{
						                  backgroundColor: styleUtil.themeColor,
						                  justifyContent: 'center',
						                  alignItems: 'center',
						                  width: 60
					                  }}>
						<Text style={{color: '#fff'}}>发送</Text>
					</TouchableOpacity>
				</View>
				}
			</View>
		)
	}
}

