'use strict'

import {
	AsyncStorage
} from 'react-native'

export default class Storage {
	
	constructor(options: Object) {
		const {
			defaultExpires,
			enableCache
		} = options
		//过期时间（单位毫秒），默认一天
		this.defaultExpires = typeof defaultExpires === 'number' ?
			defaultExpires : 1000 * 3600 * 24
		//是否缓存，默认开启
		this.enableCache = enableCache !== false
		this._prefix = 'map_'
		//缓存对象
		this.cache = {}
	}
	
	setItem(key: string, data = {}, expired = this.defaultExpires) {
		if (typeof data !== 'object') {
			console.warn('data must be Object');
			return
		}
		
		let dataToSave = {
			data
		};
		
		if (typeof expired === 'number' && expired > 0) {
			let now = new Date().getTime()
			dataToSave.expired = now + expired;
		}
		if (this.enableCache) {
			this._setCache(key, dataToSave) //直接存内存中，无需json
		}
		
		dataToSave = JSON.stringify(dataToSave);
		return AsyncStorage.setItem(this._prefix + key, dataToSave)
	}
	
	getItem(key: string, defaultData = null) {
		if (this.enableCache) {
			let data = this._getCache(key)
			if (data && !this._isExpired(data)) {
				return Promise.resolve(data.data)
			}
		}
		return this._getStorageData(key, defaultData)
	}
	
	/**
	 * 判断本地存储值是否为null
	 * @param key
	 * @param defaultData
	 * @private
	 */
	_getStorageData(key: string, defaultData = null) {
		return AsyncStorage.getItem(this._prefix + key)
			.then(data => {
				if (data !== null) {
					data = JSON.parse(data)
					if (!this._isExpired(data)) {
						if (this.enableCache) {
							this._setCache(key, data)
						}
						return data.data
					} else {
						this.removeItem(key)
					}
				}
				return defaultData
			})
	}
	
	/**
	 * 判断值是否已经过期
	 * @param data
	 * @returns {*}
	 * @private
	 */
	_isExpired(data: Object) {
		return data.expired > 0 && new Date().getTime() > data.expired;
	}
	
	removeItem(key: string) {
		key = this._prefix + key;
		this.removeCache(key);
		return AsyncStorage.removeItem(key)
	}
	
	removeCache(key: string) {
		if (this.enableCache) {
			delete this.cache[key]
		}
	}
	
	multiRemove(keys: Array) {
		return AsyncStorage.multiRemove(
			keys.map((item) => {
				return this._prefix + item
			})
		)
	}
	
	clear() {
		return this.getAllKeys().then(keys => {
			return this.multiRemove(keys)
		})
	}
	
	/**
	 * 获取所有key，返回keys数组
	 * @returns {*}
	 */
	getAllKeys() {
		return AsyncStorage.getAllKeys().then(keys => {
			//只获取本地应用中的keys
			keys.forEach((item, i) => {
				if (keys[i].indexOf(this._prefix) > -1) {
					keys[i] = keys[i].substring(this._prefix.length)
				}
			});
			return keys
		})
	}
	
	multiGet() {
		return this.getAllKeys()
			.then(keys => {
				keys.forEach((item, i) => {
					keys[i] = this._prefix + item
				});
				return AsyncStorage.multiGet(keys)
			})
	}
	
	_getCache(key: string) {
		return this.cache[this._prefix + key]
	}
	
	_setCache(key: string, data: Object) {
		this.cache[this._prefix + key] = data
	}
	
}