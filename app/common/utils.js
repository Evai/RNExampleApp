'use strict';
import moment from 'moment'

/**
 * 公共方法类库
 */
const utils = {
	type: {
		'string': '[object String]',
		'number': '[object Number]',
		'boolean': '[object Boolean]',
		'function': '[object Function]',
		'array': '[object Array]',
		'object': '[object Object]',
		'date': '[object Date]',
		'null': '[object Null]',
		'undefined': '[object Undefined]'
	},
	isNumber(obj) {
		return !isNaN(parseInt(obj));
	},
	isString(obj) {
		return this.typeOf(obj, 'string')
	},
	isArray(obj) {
		return this.typeOf(obj, 'array')
	},
	isDate(obj) {
		return this.typeOf(obj, 'date')
	},
	typeOf(obj, type) {
		return Object.prototype.toString.call(obj) === this.type[type]
	},
	isMobile,
	isEmail,
	isChinese,
	isIDCard,
	timeStampToStr,
	strToTimeStamp,
	generateMixed,
	generateNumber,
	inArray,
	toThousands,
	removeHTMLTag,
	getRequestParam,
	copyObj,
	strLimit,
	exchangeSpec,
	randInt,
	nextInt,
	cryptXOR,
	timeStampToFriendlyTime,
	formatSimilar,
	getFuncName,
	getGender,
	generateSerialNumArray,
	getMonthDate,
	formatBirth,
	numberToTenThousand,
	showTime,
	sortByPinYin,
	formatData,
	formatTimer,
	stringToBytes,
	mbStringLength,
	checkIsSymbol,
	checkIsChinese,
	checkPassword,
	replaceAll
}

export default utils

/**
 *校验手机号
 * @param tel
 * @returns {boolean}
 * @constructor
 */
function isMobile(tel) {
	let reg = new RegExp(/^13[\d]{9}$|^14[5,7]{1}\d{8}$|^15[^4]{1}\d{8}$|^17[0,6,7,8]{1}\d{8}$|^18[\d]{9}$/);
	return tel.match(reg);
}

/**
 * 校验邮箱
 * @param email
 * @constructor
 */
function isEmail(email) {
	//let reg = /^(\w)+(\.\w+)*@(\w)+((\.\w{2,3}){1,3})$/;
	let reg = /[\w!#$%&'*+/=?^_`{|}~-]+(?:\.[\w!#$%&'*+/=?^_`{|}~-]+)*@(?:[\w](?:[\w-]*[\w])?\.)+[\w](?:[\w-]*[\w])?/;
	return email.match(reg);
}

/**
 * 校验中文
 * @param lang
 * @constructor
 */
function isChinese(lang) {
	let reg = /[^\u0000-\u00FF]/;
	return lang.match(reg);
}

/**
 * 校验身份证
 * @param idCard
 * @constructor
 */
function isIDCard(idCard) {
	let reg = /^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$|^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}([0-9]|X)$/;
	return idCard.match(reg);
}

/**
 * 时间戳转字符串
 * @param str
 * @param time
 * @param addZero
 * @returns {string|*}
 * @constructor
 */
function timeStampToStr(time, str, addZero = true) {
	str = str ? str.toLowerCase() : 'y-m-d h:i:s';
	let weeks = ['日', '一', '二', '三', '四', '五', '六'];
	let t = new Date(time);
	let year = t.getFullYear();
	let month, day, hour, minute, second;
	if (addZero) {
		month = (t.getMonth() + 1) < 10 ? '0' + (t.getMonth() + 1) : (t.getMonth() + 1);
		day = t.getDate() < 10 ? '0' + t.getDate() : t.getDate();
		hour = t.getHours() < 10 ? '0' + t.getHours() : t.getHours();
		minute = t.getMinutes() < 10 ? '0' + t.getMinutes() : t.getMinutes();
		second = t.getSeconds() < 10 ? '0' + t.getSeconds() : t.getSeconds();
	} else {
		month = (t.getMonth() + 1);
		day = t.getDate();
		hour = t.getHours();
		minute = t.getMinutes();
		second = t.getSeconds();
	}
	let week = weeks[t.getDay()];
	
	return str.replace('y', year)
		.replace('m', month)
		.replace('d', day)
		.replace('h', hour)
		.replace('i', minute)
		.replace('s', second)
		.replace('w', week);
}

/**
 * 字符串转时间戳
 * @param str
 * @returns {number}
 */
function strToTimeStamp(str) {
	if (utils.isString(str)) {
		str = str.replace(/\-/g, ',')
			.replace(/ /g, ',')
			.replace(/:/g, ',')
			.split(',')
		for (let key in str) {
			str[key] = parseInt(str[key])
		}
		return new Date(str[0], str[1] - 1, str[2], str[3], str[4], str[5]).getTime()
	}
	return str;
	
}

/**
 * 生成随机字符串，大小写加数字
 * @param n
 * @returns {string}
 */
function generateMixed(n) {
	let chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ02345789';
	let res = "";
	for (let i = 0; i < n; i++) {
		let id = Math.ceil(Math.random() * (chars.length - 1));
		res += chars.charAt(id);
	}
	return res;
}

/**
 * 判断给定的元素是否在数组里，
 * @param value
 * @param arr
 * @param accurate 是否严格匹配，默认否
 * @returns {boolean}
 */
function inArray(arr, value, accurate = false) {
	if (accurate !== false) {
		for (let key of arr) {
			if (arr[key] === value) {
				return true;
			}
		}
	} else {
		for (let key of arr) {
			if (arr[key].indexOf(value) !== -1 || arr[key] == value) {
				return true;
			}
		}
	}
	return false;
}

/**
 * 数字格式化加逗号
 * @param num
 * @returns {string}
 */
function toThousands(num) {
	num = (num || 0).toString();
	let result = '';
	while (num.length > 3) {
		result = ',' + num.slice(-3) + result;
		num = num.slice(0, num.length - 3);
	}
	if (num) {
		result = num + result;
	}
	return result;
}

/**
 * 移除HTML标签
 * @param str
 * @returns {string | *}
 */
function removeHTMLTag(str) {
	str = str.replace(/<\/?[^>]*>/g, '') //去除HTML tag
		.replace(/[ | ]*\n/g, '\n') //去除行尾空白
		.replace(/\n[\s| | ]*\r/g, '\n') //去除多余空行
		.replace(/ /ig, '');
	return str;
}

/**
 * 获取请求参数
 * @param url
 * @returns {*}
 */
function getRequestParam(url) {
	if (url.indexOf("?") === -1) return null;
	let urlString = url.substring(url.indexOf("?") + 1);
	let urlArray = urlString.split("&");
	
	let urlObject = []
	for (let i = 0, len = urlArray.length; i < len; i++) {
		let urlItem = urlArray[i];
		let item = urlItem.split("=");
		urlObject[item[0]] = item[1];
	}
	return urlObject;
}

/**
 * 复制一个对象
 * @param source
 * @returns {{} & any}
 */
function copyObj(source) {
	return Object.assign({}, source)
}

/**
 * 超过限制的字符串以省略号形式显示
 * @param content
 * @param limit
 * @param ellipsis
 * @returns {*}
 */
function strLimit(content, limit = 50, ellipsis = '……') {
	if (content.length <= limit)
		return content;
	return content.substring(0, limit) + ellipsis
}

/**
 * 生成多种规格
 * @param doubleArrays 必须为二维数组
 * @returns {*}
 */
function exchangeSpec(doubleArrays = [
	[]
]) {
	if (!utils.isArray(doubleArrays)) {
		console.warn('params must be doubleArrays')
		return
	}
	for (let item of doubleArrays) {
		if (!utils.isArray(item)) {
			console.warn('params must be doubleArrays')
			return
		}
	}
	
	let len = doubleArrays.length;
	
	if (len >= 2) {
		let len1 = doubleArrays[0].length;
		let len2 = doubleArrays[1].length;
		let newLen = len1 * len2;
		let temp = new Array(newLen);
		let index = 0;
		
		for (let i = 0; i < len1; i++) {
			for (let j = 0; j < len2; j++) {
				temp[index] = doubleArrays[0][i] + '|' + doubleArrays[1][j];
				index++;
			}
		}
		
		let newArray = new Array(len - 1);
		for (let i = 2; i < len; i++) {
			newArray[i - 1] = doubleArrays[i];
		}
		newArray[0] = temp;
		return exchangeSpec(newArray);
		
	} else {
		return doubleArrays[0];
	}
}

/**
 * 生成长度为 length 的随机数字
 * @returns {string}
 */
function generateNumber(length = 1) {
	const min = 1
	const max = 21
	if (length <= min) length = 1
	if (length >= max) length = max
	let n = '1';
	for (let i = 0; i < length; i++) {
		n += '0'
	}
	return Math.round(Math.random() * parseInt(n));
}

/**
 * 随机生成 start - end 之间的数字
 * @param start
 * @param end
 * @returns {*}
 */
function randInt(start, end) {
	if (arguments.length <= 1) {
		return nextInt(start)
	}
	if (start > end) {
		console.warn("Start value must be smaller end value.")
		return
	}
	if (start < 0) {
		console.warn("Both range values must be non-negative.")
		return
	}
	return start === end ? start : start + nextInt(end - start + 1)
}

/**
 * 随机生成 0 - bound 之前的数字
 * @param bound
 * @return
 */
function nextInt(bound = 10) {
	return Math.round(Math.random() * bound);
}

/**
 * XOR加解密
 * @param str 待加解密的字符串
 * @param key 密钥
 * @returns {string}
 */
function cryptXOR(str, key = 1234567890) {
	let text = '';
	for (let i = 0; i < str.length; i++) {
		text += String.fromCharCode(str.charCodeAt(i) ^ key)
	}
	return text;
}

function timeStampToFriendlyTime(unixTime) {
	if (unixTime instanceof Date) {
		unixTime = new Date(unixTime)
	}
	unixTime = (unixTime / 1000).toFixed(0)
	const now = (+new Date() / 1000).toFixed(0)
	const second = now - unixTime
	if (second <= 60) {
		return '刚刚'
	}
	else if (Math.floor(second / 60) < 60) {
		return Math.floor(second / 60) + '分钟前'
	}
	else if (Math.floor(second / 3600) < 24) {
		return Math.floor(second / 3600) + '小时前'
	}
	else if (Math.floor(second / (3600 * 24)) < 3) {
		return Math.floor(second / (3600 * 24)) + '天前'
	}
	else {
		unixTime = unixTime * 1000
		const year = new Date(unixTime).getFullYear()
		if (year < new Date().getFullYear()) {
			return timeStampToStr(unixTime, 'y-m-d')
		}
		return timeStampToStr(unixTime, 'm月d日', false)
	}
}

/**
 * 保留两位小数
 * @param similar
 * @returns {any}
 */
function formatSimilar(similar = 0) {
	if (!similar || similar <= 0) {
		return 0
	}
	return (similar * 100) === 100 ? 100 : (similar * 100).toFixed(2)
}

/**
 * 获取函数名称
 * @param func
 * @returns {any[]}
 */
function getFuncName(func) {
	return func.toString().match(/function\s*(\w*)/i)[1];
}

/**
 * 获取性别
 * @param sex
 * @returns {string}
 */
function getGender(sex) {
	if (Number(sex) === 1) {
		return '男'
	}
	else if (Number(sex) === 2) {
		return '女'
	}
	return '未知';
}

/**
 * 生成 start - end 之间的有序数组
 * @param start
 * @param end
 * @returns {Array}
 */
function generateSerialNumArray(start, end) {
	const len = end - start + 1
	let arr = []
	for (let i = 0; i < len; i++) {
		arr[i] = start + i
	}
	return arr
}

/**
 * 获取当年月份的天数
 * @param year
 * @param month
 * @returns {number}
 */
function getMonthDate(year, month) {
	return new Date(year, month, 0).getDate();
}

/**
 * 格式化出生日期
 */
function formatBirth(birth = [1990, 1, 1], formatStr = 'y-m-d') {
	let y = parseInt(birth[0]);
	let m = parseInt(birth[1]) >= 10 ? parseInt(birth[1]) : '0' + parseInt(birth[1]);
	let d = parseInt(birth[2]) >= 10 ? parseInt(birth[2]) : '0' + parseInt(birth[2]);
	return formatStr.replace('y', y)
		.replace('m', m)
		.replace('d', d)
}

/**
 * 数字超过后1万转换单位
 */
function numberToTenThousand(num, unit = '万') {
	return num > 10000 ? (num / 10000).toFixed(0) + unit : num || 0
}

function showTime(msgDate) {
	msgDate = new Date(msgDate);
	let nowDate = new Date();
	let result = "";
	let startTime = nowDate.getTime();
	let endTime = msgDate.getTime();
	let dates = Math.abs((startTime - endTime)) / (1000 * 60 * 60 * 24);
	// let d = moment.duration(moment(nowDate, 'YYYYMMDD').diff(moment(msgDate, "YYYYMMDD")));
	// let dates = d.asDays();
	if (dates < 1) //小于24小时
	{
		if (nowDate.getDate() === msgDate.getDate()) {//同一天,显示时间
			result = moment(msgDate).locale("en").format("HH:mm");
		} else {
			result = moment(msgDate).locale("en").format("昨天 HH:mm");
		}
	}
	else if (dates < 2)//昨天
	{
		let yesterday = new Date(new Date(new Date().toLocaleDateString()).getTime() - 1);
		if (msgDate.getDate() === yesterday.getDate()) {
			result = moment(msgDate).locale("en").format("昨天 HH:mm");
		} else {
			result = moment(msgDate).locale("en").format("前天 HH:mm");
		}
	}
	// else if (dates <= 2) //前天
	// {
	// 	result = moment(msgDate).format("前天 HH:mm");
	// }
	else if (dates < 7)//一周内
	{
		result = moment(msgDate).locale("en").format("M月D日");
	}
	else//显示日期
	{
		result = moment(msgDate).locale("en").format("YYYY/MM/DD");
	}
	return result;
	
}

/**
 * 按拼音首字符排序
 * @param list
 */
function sortByPinYin(list = []) {
	list.sort((a, b) => {
		return a.letters > b.letters
	});
	let obj = {};
	list.forEach((v, i) => {
		if (!obj[v.letters]) {
			obj[v.letters] = [];
		}
		obj[v.letters].push(v);
	});
	let temp = obj['#'];
	if (temp) {
		delete obj['#'];
		obj['#'] = temp;
	}
	return obj;
};

function formatData(arr = []) {
	arr.sort(function (a, b) {
		return b.createdAt - a.createdAt
	});
	return arr;
}

function formatTimer(second = 0) {
	if (second <= 0) {
		return '00:00';
	}
	let s = Math.floor(second);
	let m = Math.floor(s / 60);
	if (m < 0) {
		//如果小于一分钟
		return s >= 10 ? '00:' + s : '00:0' + s;
	}
	else {
		s = s >= 10 ? s : '0' + s;
		return m >= 10 ? m + ':' + s : '0' + m + ':' + s;
	}
}

function stringToBytes(str) {
	if (!str || typeof str !== 'string') {
		return [];
	}
	let ch, st, re = [];
	for (let i = 0; i < str.length; i++) {
		ch = str.charCodeAt(i);  // get char
		st = [];                 // set up "stack"
		
		do {
			st.push(ch & 0xFF);  // push byte to stack
			ch = ch >> 8;          // shift value down by 1 byte
		}
		
		while (ch);
		// add stack contents to result
		// done because chars have "wrong" endianness
		re = re.concat(st.reverse());
	}
	// return an array of bytes
	return re;
}

function mbStringLength(str) {
	return unescape(encodeURIComponent(str)).length * 8;
}

/**
 * 全局替换
 * @param targetStr 目标字符串
 * @param searchStr 要替换的字符串
 * @param replaceStr 替换成的字符串
 * @returns {*}
 */
function replaceAll(targetStr, searchStr, replaceStr) {
	let reg = new RegExp(searchStr, "g");
	return targetStr.replace(reg, replaceStr);
}


function checkIsSymbol(value){
	const pattern = new RegExp("[`~!%@#$^&*()=|{}':;',\\[\\].<>《》/?~！@#￥……&*（）——|{}【】‘；：”“'。，、？]");
	return pattern.test(value)
}

function checkIsChinese(value){
	const pattern = new RegExp("[\\u4E00-\\u9FFF]+","g");
	return pattern.test(value)
}

/**
 * 判断是否含有字母和数字组合
 * @param str
 * @returns {boolean}
 */
function checkPassword(str) {
	const regNum = /[0-9]/;
	const regLetter = /[a-zA-Z]/i;
	const isNumber = regNum.test(str);
	const isLetter = regLetter.test(str);
	if (!isNumber || !isLetter) {
		return false;
	}
	return true;
};