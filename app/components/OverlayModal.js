import React from 'react'
import {Overlay} from "teaset";

let elements = [];

export default class OverlayModal extends React.Component {
	static show(component) {
		let overlayView = (
			<Overlay.PullView
				side='bottom'
				modal={false}
				ref={v => elements.push(v)}
			>
				{component}
			</Overlay.PullView>
		);
		Overlay.show(overlayView);
	}
	
	static hide() {
		let key = elements.pop()
		key && key.close()
	}
	
	static destroy() {
		for (let item of elements) {
			item && item.close()
		}
		elements = []
	}
	
	componentWillUnmount() {
		OverlayModal.destroy()
	}
}