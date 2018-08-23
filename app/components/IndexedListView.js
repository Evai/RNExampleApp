'use strict'

import React, {Component} from 'react'
import {
	StyleSheet,
	View,
	Text,
	ListView,
} from 'react-native';
import _ from 'lodash';
import PropTypes from 'prop-types';
import styleUtil from "../common/styleUtil";

export class AlphaBetaList extends Component {
	static defaultProps = {
		letters: [0, 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 1]
	};
	
	onTouchMove = (e) => {
		const index = Math.floor(e.nativeEvent.locationY / this.itemHeight);
		const letter = this.props.letters[index];
		if (this.lastLetter !== letter) {
			this.lastLetter = letter;
			this.props.onLetterPress(letter);
		}
	}
	
	onLayout = (e) => {
		const {height} = e.nativeEvent.layout;
		this.itemHeight = height / this.props.letters.length;
	}
	
	render() {
		const {letters, alphaBetaListStyle, letterStyle} = this.props;
		return (
			<View style={[styles.alphaBetaList, {
				position: 'absolute',
				top: styleUtil.window.height / 2 - this.itemHeight - styleUtil.navBarHeight,
				right: -2,
			}]}>
				<View onLayout={this.onLayout}>
					{
						letters.map((l) => {
							return (
								<Text key={l} letter={l}
								      style={letterStyle || styles.letterStyle}>{l === 0 ? '↑' : l === 1 ? '#' : l}</Text>
							);
						})
					}
					<View style={styles.touchLayer} onTouchStart={this.onTouchMove} onTouchMove={this.onTouchMove}/>
				</View>
			</View>
		)
	}
}


export default class IndexedListView extends Component {
	constructor(props) {
		super(props)
		const {list} = props;
		this.ds = new ListView.DataSource({
			rowHasChanged: (r1, r2) => r1 !== r2,
			sectionHeaderHasChanged: (s1, s2) => s1 !== s2,
		});
		this.sectionData = this.getSectionData(list);
		this.state = {
			dataSource: this.ds.cloneWithRowsAndSections(list),
			initialListSize: 20,
		};
	}
	
	static propTypes = {
		list: PropTypes.object,
		visible: PropTypes.bool
	}
	
	static defaultProps = {
		list: {},
		visible: true
	}
	
	componentWillReceiveProps(nextProps) {
		if (!_.isEqual(nextProps.list, this.props.list)) {
			const {list} = nextProps;
			this.sectionData = this.getSectionData(list);
			this.setState({
				dataSource: this.ds.cloneWithRowsAndSections(list),
			});
		}
	}
	
	getSectionData = (list) => {
		const sectionData = this.sectionData || {};
		const keys = _.keys(list);
		let preItem = {count: 0};
		keys.forEach((key) => {
			const item = sectionData[key] || {};
			item.count = preItem.count + list[key].length;
			preItem = item;
			sectionData[key] = item;
		});
		return sectionData;
	}
	
	_onLayout = (sectionID, e) => {
		const {y} = e.nativeEvent.layout;
		const sectionData = this.sectionData;
		sectionData[sectionID].y = y;
		if (this.needScrollSection === sectionID) {
			this.listView.scrollTo({x: 0, y, animated: false});
		}
	}
	
	scrollToSection = (sectionID) => {
		const item = this.sectionData[sectionID];
		if (item) {
			if (item.y == null) {
				this.needScrollSection = sectionID;
				this.setState({initialListSize: item.count});
			} else {
				this.listView.scrollTo({x: 0, y: item.y, animated: false});
			}
		}
	}
	
	renderRow = (obj, sectionID, rowID) => {
		return (
			<View style={{paddingVertical: 50}}>
				<Text>{obj.name}</Text>
			</View>
		);
	}
	
	renderSectionHeader = (obj, sectionID) => {
		return (
			<View style={styles.section}
			      onLayout={this._onLayout.bind(null, sectionID)}
			>
				<Text style={styles.sectionLabel}>{sectionID}</Text>
			</View>
		);
	}
	
	renderSeparator = (sectionID, rowID) => {
		return (
			<View style={styles.separator} key={sectionID + '_' + rowID}/>
		);
	}
	
	render() {
		const {renderRow, renderSectionHeader, renderSeparator, letters, alphaBetaListStyle, letterStyle, visible, renderHeader} = this.props;
		const {initialListSize, dataSource} = this.state;
		return (
			<View style={[styles.container, {display: visible ? 'flex' : 'none'}]}>
				<ListView
					ref={(ref) => {
						this.listView = ref;
					}}
					style={styles.list}
					initialListSize={initialListSize}
					removeClippedSubviews={false}
					onEndReachedThreshold={20}
					enableEmptySections
					dataSource={dataSource}
					renderRow={renderRow || this.renderRow}
					renderHeader={renderHeader && renderHeader}
					renderSeparator={renderSeparator && renderSeparator}
					renderSectionHeader={renderSectionHeader || this.renderSectionHeader}
					{...this.props}
				/>
				{/*<AlphaBetaList onLetterPress={this.scrollToSection} {...{letters, alphaBetaListStyle, letterStyle}} />*/}
			</View>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		flexDirection: 'row',
	},
	list: {
		flex: 1,
	},
	separator: {
		backgroundColor: '#DDDDDD',
		height: 1,
	},
	section: {
		backgroundColor: '#DDDDDD',
		paddingLeft: 10
	},
	alphaBetaList: {
		width: 20,
		flexDirection: 'column',
		justifyContent: 'center',
	},
	letterStyle: {
		fontSize: 11,
		textAlign: 'center',
		color: '#555'
	},
	touchLayer: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
	},
	sectionLabel: {
		color: '#000'
	}
});
