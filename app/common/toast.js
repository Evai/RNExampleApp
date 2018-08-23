'use strict'

import React from 'react'
import {ActivityIndicator} from 'react-native'
import {
	Toast,
	Theme,
	ModalIndicator
} from 'teaset'

export default {
	element: null,
	isLoading: false,
	isModalLoading: false,
	message(...args) {
		Toast.hide(this.element)
		this.element = Toast.message(...args)
	},
	success(...args) {
		Toast.hide(this.element)
		this.element = Toast.success(...args)
	},
	fail(...args) {
		Toast.hide(this.element)
		this.element = Toast.fail(...args)
	},
	smile(...args) {
		Toast.hide(this.element)
		this.element = Toast.smile(...args)
	},
	sad(...args) {
		Toast.hide(this.element)
		this.element = Toast.sad(...args)
	},
	info(...args) {
		Toast.hide(this.element)
		this.element = Toast.info(...args)
	},
	stop(...args) {
		Toast.hide(this.element)
		this.element = Toast.stop(...args)
	},
	loadingShow(text, duration = 10000) {
		if (this.isLoading) {
			this.loadingHide()
		}
		this.isLoading = Toast.show({
			text,
			icon: <ActivityIndicator size='large' color={Theme.toastIconTintColor}/>,
			position: 'center',
			duration,
		});
	},
	loadingHide() {
		if (!this.isLoading) return;
		Toast.hide(this.isLoading);
		this.isLoading = null;
	},
	modalLoading(text, duration = 10000) {
		if (this.isModalLoading) return false
		ModalIndicator.show(text)
		this.isModalLoading = true
		setTimeout(_ => {
			if (this.modalLoadingHide()) {
				// this.fail('请求超时')
			}
		}, duration)
		return true
	},
	modalLoadingHide() {
		if (!this.isModalLoading) return false
		ModalIndicator.hide()
		this.isModalLoading = false
		return true
	}
}
