'use strict'

import storageUtil from './storageUtil'
import _ from 'lodash'
import {
	ActionSheet
} from 'teaset'
import {InteractionManager} from 'react-native'

const DEV_HOST = "http://192.168.0.2:8080/";
const DEV_SOCKET = "http://192.168.0.2:3000/chat/";
const PROD_HOST = "https://www";
const PROD_SOCKET = "wss://www";

export default {
	key: 'BDKHFSDKJFHSDKFHWEFH-REACT-NATIVE',
	header: {
		method: 'POST',
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/x-www-form-urlencoded'
		}
	},
	api: {
		webSocketURI: PROD_SOCKET,
		imageURI: 'https://www',
		baseURI: PROD_HOST,
	},
	pageSize: 15,
	loadingTime: 350,
	loadData(callback, timeout) {
		InteractionManager.runAfterInteractions(() => {
			callback && callback()
		});
		// if (timeout) {
		// 	timeout = timeout || this.loadingTime;
		// 	setTimeout(_ => callback(), timeout)
		// } else {
		// 	InteractionManager.runAfterInteractions(() => {
		// 		callback && callback()
		// 	});
		// }
		
	},
	timeout: 10000,
	user: {}, //用户信息存储
	appCache: 'appCache_',
	get constant() {
		return {
			conversation: 'conversation_' + this.user._id,
			chatPrefix: this.user._id + '_chat_',
			chatListPrefix: this.user._id + '_chatList',
			friends: this.user._id + '_friends',
			contacts: this.user._id + '_contacts',
			requestAddFriends: this.appCache + this.user._id + '_requestAddFriends',
			emoticons: 'emoticons',
			qrUserIdUri: 'qrUserId://',
			qrGroupIdUri: 'qrGroupId://',
			chatGroup: this.appCache + 'chatGroup_',
			dynamicPrefix: '_dynamic',
			nearbyAlert: 'nearbyAlert',
			topicLibrary: this.user._id + '_topicLibrary',
			groupMuted: this.user._id + '_groupMuted',
			topicCategory: this.appCache + 'topicCategory',
			refreshDynamicTime: 'refreshDynamicTime',
			topicCommentMsg: 'topicCommentMsg',
			vibration: this.user._id + '_vibration',
			dynamicNewCount: this.user._id + '_dynamicNewCount',
			dynamicLastTime: this.user._id + '_dynamicLastTime',
			integralProductList: this.appCache + 'integralProductList',
			userLocation: this.appCache + 'userLocation',
			groupChatList: this.appCache + this.user._id + '_groupChatList',
			collectEmoticon: this.appCache + this.user._id + '_collectEmoticon',
			systemNotice: this.appCache + this.user._id + '_systemNotice',
			isLogined: '_isLogined',
		}
	},
	friendList: [],//未根据字母排序
	getGroupChatList() {
		return storageUtil.getItem(this.constant.groupChatList, [])
	},
	setGroupChatList(data) {
		return storageUtil.setItem(this.constant.groupChatList, data)
	},
	getChatGroupInfo(gid) {
		return storageUtil.getItem(this.constant.chatGroup + gid, {})
	},
	setChatGroupInfo(gid, data) {
		return storageUtil.setItem(this.constant.chatGroup + gid, data)
	},
	getChatList() {
		return storageUtil.getItem(this.constant.chatListPrefix, [])
	},
	setChatList(data) {
		return storageUtil.setItem(this.constant.chatListPrefix, data)
	},
	removeChatListWithToId(id) {
		return this.getChatList().then(list => {
			let index = list.findIndex(item => item.toId === id);
			if (index > -1) {
				list.splice(index, 1);
				this.setChatList(list)
			}
			return list
		})
	},
	removeAllChatList() {
		return storageUtil.removeItem(this.constant.chatListPrefix)
	},
	getChatWithUser(toUserId) {
		return storageUtil.getItem(this.constant.chatPrefix + toUserId, [])
	},
	setChatWithUser(toUserId, data) {
		return storageUtil.setItem(this.constant.chatPrefix + toUserId, data)
	},
	removeChatWithUser(toUserId) {
		return storageUtil.removeItem(this.constant.chatPrefix + toUserId)
	},
	getConversation() {
		return storageUtil.getItem(this.constant.conversation, {})
	},
	setConversation(map = {}) {
		return storageUtil.setItem(this.constant.conversation, map)
	},
	clearConversation() {
		return storageUtil.removeItem(this.constant.conversation)
	},
	getConversationWithKey(toId) {
		return this.getConversation()
			.then(map => {
				return map[toId] || {};
			})
	},
	setConversationWithKey(toId, data = {}) {
		return this.getConversation()
			.then(map => {
				map[toId] = data;
			})
	},
	removeConversationWithKey(toId) {
		return this.getConversation()
			.then(map => {
				map[toId] = {};
			})
	},
	getUser() {
		return storageUtil.getItem('user', this.user)
	},
	setUser(user) {
		this.user = user
		return storageUtil.setItem('user', user)
	},
	removeUser() {
		this.user = {}
		return storageUtil.removeItem('user')
	},
	getFriendList() {
		return storageUtil.getItem(config.constant.friends, {})
	},
	setFriendList(data) {
		return storageUtil.setItem(config.constant.friends, data)
	},
	getContactList() {
		return storageUtil.getItem(config.constant.contacts, {})
	},
	setContactList(data) {
		return storageUtil.setItem(config.constant.contacts, data)
	},
	getRequestAddFriendList() {
		return storageUtil.getItem(config.constant.requestAddFriends, [])
	},
	setRequestAddFriendList(data) {
		return storageUtil.setItem(config.constant.requestAddFriends, data)
	},
	removeRequestAddFriendList() {
		return storageUtil.removeItem(config.constant.requestAddFriends)
	},
	getDynamicMsg() {
		return storageUtil.getItem(this.user._id + config.constant.dynamicPrefix, [])
	},
	setDynamicMsg(data = []) {
		return storageUtil.setItem(this.user._id + config.constant.dynamicPrefix, data)
	},
	removeDynamicMsg() {
		return storageUtil.removeItem(this.user._id + config.constant.dynamicPrefix)
	},
	getTopicCommentMsg() {
		return storageUtil.getItem(this.user._id + config.constant.topicCommentMsg, [])
	},
	setTopicCommentMsg(data = []) {
		return storageUtil.setItem(this.user._id + config.constant.topicCommentMsg, data)
	},
	removeTopicCommentMsg() {
		return storageUtil.removeItem(this.user._id + config.constant.topicCommentMsg)
	},
	getNearbyAlert() {
		return storageUtil.getItem(this.constant.nearbyAlert)
	},
	setNearbyAlert() {
		return storageUtil.setItem(this.constant.nearbyAlert, {show: true})
	},
	getTopicLibraryList() {
		return storageUtil.getItem(this.constant.topicLibrary, [])
	},
	setTopicLibraryList(data = []) {
		return storageUtil.setItem(this.constant.topicLibrary, data)
	},
	removeTopicLibraryList() {
		return storageUtil.removeItem(this.constant.topicLibrary)
	},
	getTopicCategory() {
		return storageUtil.getItem(this.constant.topicCategory, [])
	},
	setTopicCategory(data = []) {
		return storageUtil.setItem(this.constant.topicCategory, data)
	},
	getRefreshDynamicTime() {
		return storageUtil.getItem(this.constant.refreshDynamicTime, +new Date())
	},
	setRefreshDynamicTime(timestamp) {
		return storageUtil.setItem(this.constant.refreshDynamicTime, timestamp)
	},
	getVibration() {
		return storageUtil.getItem(this.constant.vibration)
	},
	setVibration(data) {
		return storageUtil.setItem(this.constant.vibration, data)
	},
	getFriendDynamicNewCount() {
		return storageUtil.getItem(this.constant.dynamicNewCount)
	},
	setFriendDynamicNewCount(data) {
		return storageUtil.setItem(this.constant.dynamicNewCount, {count: data})
	},
	getFriendDynamicLastTime() {
		return storageUtil.getItem(this.constant.dynamicLastTime)
	},
	setFriendDynamicLastTime(data) {
		return storageUtil.setItem(this.constant.dynamicLastTime, {createdAt: data})
	},
	getIntegralProductList() {
		return storageUtil.getItem(this.constant.integralProductList, [])
	},
	setIntegralProductList(data) {
		return storageUtil.setItem(this.constant.integralProductList, data)
	},
	getCollectEmoticon() {
		return storageUtil.getItem(this.constant.collectEmoticon, [])
	},
	setCollectEmoticon(data) {
		return storageUtil.setItem(this.constant.collectEmoticon, data)
	},
	getSystemNotice() {
		return storageUtil.getItem(this.constant.systemNotice, [])
	},
	setSystemNotice(data) {
		return storageUtil.setItem(this.constant.systemNotice, data)
	},
	removeSystemNotice() {
		return storageUtil.removeItem(this.constant.systemNotice)
	},
	getIsLogined() {
		return storageUtil.getItem(this.constant.isLogined)
	},
	setIsLogined() {
		return storageUtil.setItem(this.constant.isLogined, {isLogined: true})
	},
	version: '1.0',//版本号
	mediaPickerOptions(options) {
		return _.extend({
			title: '选择图片',
			cancelButtonTitle: '取消选择',
			takePhotoButtonTitle: '拍照',
			chooseFromLibraryButtonTitle: '从相册中选取',
			mediaType: 'photo',
			quality: 0.75,
			videoQuality: 'medium',
			durationLimit: 10,
			allowsEditing: true,
			noData: true,
			customButtons: [
				// {name: 'fb', topic: 'Choose Photo from Facebook'},
			],
			storageOptions: {
				skipBackup: true,
				path: 'images',
				cameraRoll: false
			}
		}, options)
	},
	similar: 0.8,
	showAction(items) {
		let cancelItem = {
			title: '取消'
		};
		ActionSheet.show(items, cancelItem);
	},
	defaultAvatar(avatar) {
		return avatar && avatar !== '0' ? {uri: avatar} : require('../assets/image/head.png')
	},
	defaultAvatars(avatars = []) {
		if (!Array.isArray(avatars)) {
			avatars = [];
		}
		let images = [...avatars];
		images.forEach((item, i) => {
			images[i] = this.defaultAvatar(item)
		});
		return images;
	},
	defaultImage(img) {
		return img ? {uri: img} : {uri: ''}
	},
	defaultImages(images = []) {
		if (!Array.isArray(images)) {
			images = [];
		}
		let arr = [...images];
		arr.forEach((item, i) => {
			arr[i] = this.defaultImage(item)
		});
		return arr;
	},
	reportItems() {
		return [
			'无意义的内容（灌水）',
			'恶意攻击谩骂',
			'营销广告',
			'淫秽色情',
			'政治反动',
			'其他',
		];
	},
	generateGroup(data = []) {
		let newMap = {};
		for (let i = 0; i < data.length; i++) {
			if (data[i].msgType === 'notification') {
				data[i].unreadMsg = 0
			}
			let toId;
			if (data[i].chatType === 2 && data[i].gid) {
				toId = data[i].gid;
			} else {
				if (data[i].toUserId === config.user._id) {
					toId = data[i].fromUserId;
				} else {
					toId = data[i].toUserId;
				}
			}
			newMap[toId] = newMap[toId] || {};
			newMap[toId][data[i].msgId] = data[i];
		}
		return newMap;
	},
	updateConversation(newMap, oldMap) {
		Object.keys(newMap).forEach((toId) => {
			let newMsgMap = newMap[toId];
			if (!oldMap[toId]) {
				//不存在当前会话则添加
				oldMap[toId] = newMsgMap;
			} else {
				Object.keys(newMsgMap).forEach((msgId) => {
					let newData = Object.assign({}, newMsgMap[msgId]);
					delete newData.toUser;
					delete newData.name;
					delete newData.avatar;
					if (!oldMap[toId][msgId]) {
						//不存在添加消息
						oldMap[toId][msgId] = newData;
					} else {
						//存在标记已读
						oldMap[toId][msgId] = newData;
						oldMap[toId][msgId].unreadMsg = 0;
					}
				})
			}
		});
		return oldMap;
	},
	saveConversation(data = {}) {
		if (!Array.isArray(data)) {
			data = [data];
		}
		data = this.formatData(data);
		return this.getConversation().then(map => {
			const newMap = this.generateGroup(data, map);
			map = this.updateConversation(newMap, map);
			this.setConversation(map);
			return this.saveConversationList(data);
		});
	},
	saveConversationList(data = {}) {
		if (!Array.isArray(data)) {
			data = [data];
		}
		// console.log(newData.toUser)
		return config.getChatList().then(chatList => {
			for (let i = 0; i < data.length; i++) {
				let item = data[i];
				let newData = Object.assign({}, item);
				newData.toId = newData.toUserId;
				if (newData.chatType === 2 && newData.gid) {//1为单聊，2群聊
					newData.toId = newData.gid;
				} else {
					if (newData.fromUserId !== config.user._id) {
						newData.toId = item.fromUserId;
					}
				}
				if (chatList.length <= 0) {
					chatList.push(newData);
				} else {
					let index = chatList.findIndex(item => item.toId === newData.toId);
					if (index > -1) {
						newData.unreadMsg += chatList[index].unreadMsg;
						chatList.splice(index, 1);
					}
					chatList.unshift(newData);
				}
			}
			//存储所有消息列表
			config.setChatList(chatList);
			return chatList
		});
	},
	resetUnreadCount(toId) {
		//重置会话未读数
		return config.getChatList().then(list => {
			let index = list.findIndex(item => item.toId === toId);
			if (index > -1) {
				list[index].unreadMsg = 0;
			}
			config.setChatList(list);
			return list
		})
	},
	setUnreadCount(toId, count) {
		return config.getChatList().then(list => {
			let index = list.findIndex(item => item.toId === toId);
			if (index > -1) {
				list[index].unreadMsg = count;
			}
			config.setChatList(list);
			return list
		})
	},
	getUnreadCount(toId) {
		//获取会话未读数
		return config.getChatList().then(list => {
			let index = list.findIndex(item => item.toId === toId);
			if (index > -1) {
				return list[index].unreadMsg;
			}
			return 0;
		})
	},
	saveRequestAddFriendList(data = []) {
		if (!Array.isArray(data)) {
			data = [data]
		}
		// console.warn(data);
		//保存请求好友列表，返回未读数
		return config.getRequestAddFriendList()
			.then(list => {
				let obj = {};//存储未读数
				let unreadMsg = 0;
				const arr = [];
				data.forEach((v, i) => {
					data[i].unreadMsg = 1;
					obj[v._id] = data[i];
					arr.push(data[i]);
					unreadMsg += 1;
				});
				if (list.length === 0) {
					list = data;
				} else {
					//todo 查询是否未读
					list.forEach((v, i) => {
						if (obj[v._id]) {
							list[i] = obj[v._id];
							list[i].unreadMsg = 0;
						}
						if (!obj[v._id]) {
							obj[v._id] = 1;
							arr.push(v)
						}
					});
				}
				// list = list.filter(item => new Date().getTime() - item.createdAt < 60 * 60 * 24 * 7);
				// console.warn(list);
				config.setRequestAddFriendList(arr);
				// console.warn(obj)
				return unreadMsg;
			})
	},
	resetRequestAddFriends() {
		return config.getRequestAddFriendList()
			.then(data => {
				data.forEach((v, i) => {
					data[i].unreadMsg = 0;
				});
				return data;
			})
	},
	saveDynamicMsg(data = []) {
		//存储未读动态消息
		if (!Array.isArray(data)) {
			data = [data]
		}
		return config.getDynamicMsg()
			.then(list => {
				list = list.concat(data)
				config.setDynamicMsg(list)
				return list
			})
	},
	formatData(arr) {
		arr.sort(function (a, b) {
			return a.createdAt - b.createdAt
		});
		return arr;
	},
	saveSystemNotice(data) {
		if (!Array.isArray(data)) {
			data = [data]
		}
		return config.getSystemNotice().then(list => {
			list = data.concat(list);
			config.setSystemNotice(list);
			return list;
		})
	}
}