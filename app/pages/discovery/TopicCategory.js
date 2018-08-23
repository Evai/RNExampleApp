'use strict'

import React from 'react'
import {
	StyleSheet,
	Text,
	View,
	Image,
	TouchableOpacity
} from 'react-native'
import styleUtil from '../../common/styleUtil'
import NavigatorPage from "../../components/NavigatorPage";
import ScrollPage from "../../components/ScrollPage";
import navigate from "../../screens/navigate";
import LoadingMore from "../../components/load/LoadingMore";
import HomeIndex from "../home/HomeIndex";
import ImageCached from "../../components/ImageCached";

export default class TopicCategory extends NavigatorPage {
	static defaultProps = {
		...NavigatorPage.navigatorStyle,
		title: '分类'
	};
	
	constructor(props) {
		super(props)
		this.position = null;
		Object.assign(this.state, {
			nearList: [],
			isLoading: false, //上拉加载
			isRefreshing: false, //下拉刷新
			category: []
		})
	}
	
	componentDidMount() {
		config.loadData(this.fetchCategory)
	}
	
	componentWillUnmount() {
	
	}
	
	fetchCategory = () => {
		request.post(config.api.baseURI + config.api.getCategory)
			.then(res => {
				if (res.code === 0) {
					this.setState({
						category: res.data
					})
				}
			})
	};
	
	renderPage() {
		if (this.state.category.length === 0) {
			return <LoadingMore hasMore={true} showText={false}/>
		}
		return (
			<ScrollPage
				showsVerticalScrollIndicator={false}>
				<View style={styles.thumbsBox}>
					{
						this.state.category.map((v, i, arr) => (
							<TouchableOpacity
								key={i}
								activeOpacity={1}
								onPress={_ => navigate.pushNotNavBar(HomeIndex, {
									categoryId: v.id,
									leftHidden: false
								})}
								style={{
									marginRight: (i + 1) % 3 === 0 ? 0 : 9
								}}>
								<ImageCached
									images={arr}
									index={i}
									style={styles.thumbs}
									source={{uri: v.cover}}/>
								<Text style={styles.title}>{v.name}</Text>
							</TouchableOpacity>
						))
					}
				</View>
			</ScrollPage>
		)
	}
}


const styles = StyleSheet.create({
	thumbsBox: {
		flex: 1,
		flexDirection: 'row',
		flexWrap: 'wrap',
		padding: 15
	},
	thumbs: {
		width: (styleUtil.window.width - 50) / 3,
		height: (styleUtil.window.width - 50) / 3,
		borderRadius: 8
	},
	title: {
		fontSize: 15,
		textAlign: 'center',
		margin: 8
	}
});