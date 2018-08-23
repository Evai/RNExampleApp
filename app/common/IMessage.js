import config from "./config";
import ReconnectingWebSocket from "reconnecting-websocket";
import toast from "./toast";
import TabNavBar from "../screens/TabNavBar";
import JPushModule from "jpush-react-native";
import uuid from "uuid";
import request from "./request";

export const EVENTS = {
	MSG_RECEIVE: 'MSG_RECEIVE',
	RESPONSE: 'RESPONSE',
	SEND_SINGLE_MSG: 'SEND_SINGLE_MSG',
	SEND_GROUP_MSG: 'SEND_GROUP_MSG',
	CREATE_GROUP: 'CREATE_GROUP',
	GET_GROUP_INFO: 'GET_GROUP_INFO',
	GET_NEW_FRIENDS: 'GET_NEW_FRIENDS',
	REQUEST_ADD_FRIEND: 'REQUEST_ADD_FRIEND',
	SEND_DYNAMIC_LIKE: 'SEND_DYNAMIC_LIKE',
	SEND_DYNAMIC_COMMENT: 'SEND_DYNAMIC_COMMENT',
	DYNAMIC_MSG_RECEIVE: 'DYNAMIC_MSG_RECEIVE',
	SYSTEM_MSG_RECEIVE: 'SYSTEM_MSG_RECEIVE',
	SEND_TOPIC_MSG: 'SEND_TOPIC_MSG',
	TOPIC_MSG_RECEIVE: 'TOPIC_MSG_RECEIVE',
	ABNORMAL_LOGIN: 'ABNORMAL_LOGIN',
	SEND_SYSTEM_NOTICE: 'SEND_SYSTEM_NOTICE',
	TOPIC_NOTICE: 'TOPIC_NOTICE',
	DYNAMIC_NOTICE: 'DYNAMIC_NOTICE',
	TOPIC_LIBRARY_NOTICE: 'TOPIC_LIBRARY_NOTICE',
	SYSTEM_NOTICE: 'SYSTEM_NOTICE',
	PING: 'PING',
};

const Reject = (msg = 'send content is not defined') => {
	return Promise.reject(msg);
};

const Resolve = (data) => {
	return Promise.resolve(data);
};

const _Promise = (res, rej) => {
	return new Promise((resolve, reject) => {
		try {
			resolve(res);
		} catch (e) {
			reject(rej);
		}
	})
};

const RegHttp = /^http:\/\/|^https:\/\//;

const MSG_TYPE = {
	text: 'text',
	voice: 'voice',
	image: 'image',
	video: 'video',
	location: 'location',
	notification: 'notification',
};

const CHAT_TYPE = {
	SINGLE: 1,
	GROUP: 2
};

const STATUS = {
	SEND: 'send',
	SUCCESS: 'success',
	FAILED: 'failed',
};

const sharedData = {
	name: undefined,
	msgType: MSG_TYPE.text, //消息类型, ['text', 'voice', 'image', 'location', 'notification']
	chatType: CHAT_TYPE.SINGLE, //会话类型: 1.单聊 2.群聊
	gid: undefined,
	unreadMsg: 1,
	status: STATUS.SEND
};

const EXT = {
	voice: 'aac',
	image: 'jpg',
	video: 'mp4',
};

const emptyObject = Object.freeze({});

const listeners = {};//存储事件方法

export default class IMessage {
	constructor() {
		this._pingIM = null;//心跳检测
		this.sendData = {};
	}
	
	init = (url) => {
		if (!window.WebSocket) {
			toast.fail('你的设备暂不支持通信，请尝试升级系统版本');
			return;
		}
		if (!this._ws) {
			this._ws = new ReconnectingWebSocket(url);
			this._ws.readyState = WebSocket.CONNECTING;
			this.onOpen();
			this.onClose();
			this.onError();
			this.reAddEventListeners();
			this.pingPong();
		}
	};
	
	get readyState() {
		return this._ws ? this._ws.readyState : WebSocket.CONNECTING;
	}
	
	onOpen = () => {
		this._ws.onopen = e => {
		
		};
	};
	
	onClose = () => {
		this._ws.onclose = e => {
			if (e.code === 1001 && e.reason.indexOf('stopping') > -1) {
				this.reconnect();
			}
		}
	};
	
	onError = () => {
		this._ws.onerror = e => {
			this.reconnect();
		}
	};
	
	closeWebSocket = (forceClose) => {
		this._ws && this._ws.close();
		if (forceClose) {
			this._ws = null;
		}
	};
	
	reconnect = () => {
		if (this._ws && this.readyState !== WebSocket.OPEN) {
			this._ws.reconnect();
			this.reAddEventListeners();
			this.pingPong()
		}
	};
	
	onResponse = () => {
		return new Promise(resolve => {
			this.emit(EVENTS.RESPONSE, resolve)
		})
	};
	
	onAbnormalLogin = (callback) => {
		this.emit(EVENTS.ABNORMAL_LOGIN, callback);
	};
	onReceiveMsg = (callback) => {
		this.emit(EVENTS.MSG_RECEIVE, callback);
	};
	onGetNewFriends = (callback) => {
		this.emit(EVENTS.GET_NEW_FRIENDS, callback);
	};
	onDynamicMsgReceive = (callback) => {
		this.emit(EVENTS.DYNAMIC_MSG_RECEIVE, callback);
	};
	onSystemMsgReceive = (callback) => {
		this.emit(EVENTS.SYSTEM_MSG_RECEIVE, callback);
	};
	onTopicMsgReceive = (callback) => {
		this.emit(EVENTS.TOPIC_MSG_RECEIVE, callback);
	};
	
	reAddEventListeners = () => {
		if (this._ws) {
			Object.keys(listeners).forEach((eventName) => {
				this._ws.removeEventListener('message', listeners[eventName]);
				this._ws.addEventListener('message', listeners[eventName]);
			})
		}
	};
	
	emit = (eventName, callback) => {
		if (!this._ws) {
			return;
		}
		let listener = listeners[eventName];
		if (listener) {
			this._ws.removeEventListener('message', listener);
		}
		listener = listeners[eventName] = (ev) => {
			const response = JSON.parse(ev.data);
			if (response.event === eventName) {
				this.validateResponse(response);
				// console.warn(this._sendData)
				callback && callback(response);
			}
			else {
				callback && callback(emptyObject);
			}
		};
		this._ws.addEventListener('message', listener);
	};
	
	validateResponse = (response) => {
		if (response.code === 1) {//用户未登录
			toast.info("用户未登录");
			config.removeUser();
			TabNavBar.updateUser({});
			JPushModule.deleteAlias()
		}
		else if (response.code === 1000) {//业务逻辑错误
			toast.fail(res.msg)
		}
		else if (response.code < 0) {//非法请求或者服务器异常
			toast.fail('系统出错了')
		}
	};
	
	send = (data = {}) => {
		this.sendData = data.chatBody;
		return this.resend(cryptData);
	};
	
	sleepSend = (cb, delay = 0) => {
		return new Promise((resolve) => {
			setTimeout(() => {
				resolve(cb())
			}, delay)
		})
	};
	
	resend = (sendData) => {
		this.reconnect();
		if (this._ws && this.readyState === WebSocket.OPEN) {
			this._ws.send(JSON.stringify(sendData));
			return this.onResponse();
		} else {
			return this.sleepSend(() => {
				this.resend(sendData);
			}, 3000)
		}
	};
	
	ping = () => {
		return this._createMessage({}, EVENTS.PING)
			.then(data => {
				return this.send(data)
			});
	};
	
	closePing = () => {
		clearInterval(this._pingIM);
		this._pingIM = null;
	};
	
	pingPong = () => {
		this.closePing();
		this._pingIM = setInterval(() => {
			this.ping();
			// console.log('ping')
		}, 150000)
	};
	
	_createMessage = (data, event) => {
		if (!event) {
			return Reject('event is not defined');
		}
		else if (event === EVENTS.SEND_GROUP_MSG && !data.gid) {
			return Reject('gid is not defined');
		}
		else if (event === EVENTS.SEND_SINGLE_MSG && !data.toUserId) {
			return Reject('toUserId is not defined');
		}
		const sendMessage = new SendMessage({
			event,
			...data
		});
		return Resolve(sendMessage.data);
	};
	
	setSingleData = (data, toId) => {
		data.chatType = CHAT_TYPE.SINGLE;
		data.toUserId = toId;
		return data;
	};
	
	setGroupData = (data, toId) => {
		data.chatType = CHAT_TYPE.GROUP;
		data.gid = toId;
		return data;
	};
	
	_createText = (text, others) => {
		if (!text || !text.trim()) {
			return Reject();
		}
		return Resolve({
			...others,
			text: text.trim(),
			msgType: MSG_TYPE.text,
		})
	};
	
	createSingleText = ({text, toId, ...others}) => {
		return this._createText(text, others)
			.then(data => {
				data = this.setSingleData(data, toId);
				return this._createMessage(data, EVENTS.SEND_SINGLE_MSG);
			})
	};
	
	createGroupText = ({text, toId, ...others}) => {
		return this._createText(text, others)
			.then(data => {
				data = this.setGroupData(data, toId);
				return this._createMessage(data, EVENTS.SEND_GROUP_MSG);
			})
	};
	
	uploadImage = (obj) => {
		return this.upload(obj, MSG_TYPE.image);
	};
	
	uploadVoice = (obj) => {
		return this.upload(obj, MSG_TYPE.voice);
	};
	
	uploadVideo = (obj) => {
		return this.upload(obj, MSG_TYPE.video);
	};
	
	upload = (obj = {}, msgType) => {
		if (!MSG_TYPE[msgType]) {
			return Reject('msgType is not correct')
		}
		else if (!obj[msgType] || !obj[msgType].path) {
			return Reject(`upload ${msgType} is not defined`);
		}
		obj = {
			...sharedData,
			...obj,
			msgType,
			fromUserId: config.user._id
		};
		if (RegHttp.test(obj[msgType].path)) {
			return Resolve(obj);
		}
		return request.upload(config.api.baseURI + config.api.uploadImage, {
			uri: obj[msgType].path,
			ext: EXT[msgType]
		}).then(res => {
			if (res.code === 0) {
				obj[msgType].path = res.data;
				return obj;
			}
			return Reject('upload failed');
		});
	};
	
	_createImage = (image = {}, others) => {
		if (!image.path) {
			return Reject();
		}
		return Resolve({
			...others,
			image,
			msgType: 'image'
		})
	};
	
	createSingleImage = ({image, toId, ...others}) => {
		return this._createImage(image, others)
			.then(data => {
				data = this.setSingleData(data, toId);
				return this._createMessage(data, EVENTS.SEND_SINGLE_MSG);
			})
	};
	
	createGroupImage = ({image, toId, ...others}) => {
		return this._createImage(image, others)
			.then(data => {
				data = this.setGroupData(data, toId);
				return this._createMessage(data, EVENTS.SEND_GROUP_MSG);
			})
	};
	
	_createVoice = (voice = {}, others) => {
		if (!voice.path) {
			return Reject();
		}
		return Resolve({
			...others,
			voice,
			msgType: 'voice'
		})
	};
	
	createSingleVoice = ({voice, toId, ...others}) => {
		return this._createVoice(voice, others)
			.then(data => {
				data = this.setSingleData(data, toId);
				return this._createMessage(data, EVENTS.SEND_SINGLE_MSG);
			})
	};
	
	createGroupVoice = ({voice, toId, ...others}) => {
		return this._createVoice(voice, others)
			.then(data => {
				data = this.setGroupData(data, toId);
				return this._createMessage(data, EVENTS.SEND_GROUP_MSG);
			})
	};
	
	_createVideo = (video = {}, others) => {
		if (video.path) {
			return Reject();
		}
		return Resolve({
			...others,
			video,
			msgType: 'video',
		})
	};
	
	createSingleVideo = ({video, toId, ...others}) => {
		return this._createVideo(video, others)
			.then(data => {
				data = this.setSingleData(data, toId);
				return this._createMessage(data, EVENTS.SEND_SINGLE_MSG);
			})
	};
	
	createGroupVideo = ({video, toId, ...others}) => {
		return this._createVideo(video, others)
			.then(data => {
				data = this.setGroupData(data, toId);
				return this._createMessage(data, EVENTS.SEND_GROUP_MSG);
			})
	};
	
	_createLocation = (location, others) => {
		if (!location) {
			return Reject();
		}
		return Resolve({
			...others,
			location,
			msgType: MSG_TYPE.location,
		})
	};
	
	createSingleLocation = ({location, toId, ...others}) => {
		return this._createLocation(location, others)
			.then(data => {
				data = this.setSingleData(data, toId);
				return this._createMessage(data, EVENTS.SEND_SINGLE_MSG);
			})
	};
	
	createGroupLocation = ({location, toId, ...others}) => {
		return this._createLocation(location, others)
			.then(data => {
				data = this.setGroupData(data, toId);
				return this._createMessage(data, EVENTS.SEND_GROUP_MSG);
			})
	};
	
	_createNotification = (notification) => {
		if (!notification) {
			return Reject();
		}
		return Resolve({
			notification,
			msgType: MSG_TYPE.notification,
		})
	};
	
	createSingleNotification = (notification, toId) => {
		return this._createNotification(notification)
			.then(data => {
				data = this.setSingleData(data, toId);
				return this._createMessage(data, EVENTS.SEND_SINGLE_MSG);
			})
	};
	
	createGroupNotification = (notification, toId) => {
		return this._createNotification(notification)
			.then(data => {
				data = this.setSingleData(data, toId);
				return this._createMessage(data, EVENTS.SEND_GROUP_MSG);
			})
	};
	
	sendRequestAddFriend = (toUserId, text) => {
		const data = {
			toUserId,
			text
		};
		//发送好友请求验证
		return this._createMessage(data, EVENTS.REQUEST_ADD_FRIEND)
			.then(data => this.send(data))
	};
	
	sendSystemNotice = ({toUserId, noticeId, noticeType}) => {
		return this._createMessage({toUserId, noticeId, noticeType}, EVENTS.SEND_SYSTEM_NOTICE)
			.then(data => this.send(data))
	};
	
	
}

class SendMessage {
	constructor(options = {}) {
		this.chatBody = {
			...sharedData,
			...options,
			msgId: options.msgId || uuid.v4(),
			createdAt: options.createdAt || +new Date(),
			fromUserId: config.user._id
		};
		this.data = {
			event: options.event,
			chatBody: this.chatBody
		};
	}
}