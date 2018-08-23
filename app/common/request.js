'use strict'

import QueryString from 'query-string'
import _ from 'lodash'
import toast from "./toast";
import navigate from "../screens/navigate";
import PhoneLogin from "../pages/account/PhoneLogin";

/**
 * http请求
 */
let request = {
	get(url: string, params: Object) {
		if (params) {
			url += '?' + QueryString.stringify(params);
		}
		const options = {
			method: 'GET'
		}
		return _fetchData(url, options)
	},
	post(url: string, params = {}) {
		// console.log(config.user)
		params.currentUserId = config.user._id;
		params.accessToken = config.user.accessToken;
		for (let key in params) {
			if (params[key] === undefined || params[key] === null) {
				delete params[key];
			}
		}
		params = QueryString.stringify(params);
		
		const options = {
			method: 'POST',
			body: params,
			requestHeader: 'application/x-www-form-urlencoded'
		};
		return _fetchData(url, options)
	},
	upload(url: string, params = {}, callback: Function) {
		let formData = new FormData();
		params.currentUserId = config.user._id;
		params.accessToken = config.user.accessToken;
		params.file = {
			uri: params.uri,
			type: 'multipart/form-data',
			name: `file.${params.ext}`
		};
		let data = params;
		for (let key in data) {
			if (data[key] === undefined || data[key] === null) {
				delete data[key];
			} else {
				formData.append(key, data[key])
			}
		}
		formData.append('file', params.file);
		const options = {
			method: 'POST',
			body: formData,
			requestHeader: 'multipart/form-data'
		};
		return _fetchData(url, options, callback)
	}
};

export default request

const _fetchData = (url, options, callback) => {
	const {
		method = 'POST',
		body,
		requestHeader
	} = options;
	return new Promise((resolve, reject) => {
		const handler = function () {
			try {
				resolve(this)
			} catch (e) {
				// console.warn(e)
				reject(e)
			}
		};
		let xhr = new XMLHttpRequest();
		xhr.open(method, url)
		// xhr.setRequestHeader('Accept', 'application/json')
		// xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded')
		xhr.setRequestHeader('Content-Type', requestHeader)
		xhr.onload = handler;
		xhr.timeout = 20000;
		xhr.ontimeout = () => {
			toast.fail('请求超时')
		};
		callback && callback(xhr);
		xhr.send(body);
	}).then(response => {
		// console.log(response)
		if (response.readyState === 4 && response.status === 200) {
			let res = JSON.parse(response.responseText);
			if (res.code === 1) {//用户未登录
				toast.info("请先登录");
				navigate.push(PhoneLogin)
			}
			else if (res.code === 1000) {//业务逻辑错误
				toast.fail(res.msg)
			}
			else if (res.code < 0) {//非法请求或者服务器异常
				toast.fail(res.msg)
				// toast.fail('系统出错了');
			}
			return res;
		}
		return ResponseStatus(response)
	})
};


// const fetchRequest = {
// 	get(url: string, params: Object) {
// 		if (params) {
// 			url += '?' + QueryString.stringify(params);
// 		}
// 		return this._fetchData(url);
// 	},
// 	post(url: string, params: Object) {
// 		const fetchOptions = _.extend(config.header, {
// 			body: QueryString.stringify(params)
// 		});
// 		return this._fetchData(url, fetchOptions);
// 	},
// 	_fetchData(url: string, fetchOptions ?: Object) {
// 		return fetch(url, fetchOptions)
// 			.then(response => {
// 				// console.log(response)
// 				if (response.ok && response.status === 200) {
// 					return response.json();
// 				}
// 				return ResponseStatus(response)
// 			})
// 	}
// }


const ResponseStatus = function (response) {
	let code = response.status
	let msg = response.responseText;
	if (code === 404) {
		msg = '404 not found'
		toast.fail(msg);
	}
	else if (code === 400) {
		msg = '请求参数不合法'
		toast.fail(msg);
	}
	else if (code === 500) {
		msg = '服务器异常';
		toast.fail(msg);
	}
	return {
		code,
		msg
	}
};