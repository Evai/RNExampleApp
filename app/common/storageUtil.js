'use strict'

import Storage from './storage'

let storageUtil = new Storage({
	// 数据过期时间，默认一天（1000 * 3600 * 24 毫秒），设为-1则永不过期
	defaultExpires: -1,
	// 读写时在内存中缓存数据。默认启用。
	enableCache: true
});
export default storageUtil;