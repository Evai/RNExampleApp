'use strict'

import React from 'react'
import {
	StyleSheet,
	Text,
	View,
	Image
} from 'react-native'
import styleUtil from '../../common/styleUtil'
import ScrollPage from "../../components/ScrollPage";
import navigate from "../../screens/navigate";
import LoadingMore from "../../components/load/LoadingMore";
import Profile from "../account/Profile";
import config from "../../common/config";
import {ListRow} from 'teaset'
import {Icon, Avatar} from 'react-native-elements'
import ImageCached from "../../components/ImageCached";

export default class RankingUserList extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			list: [],
			isLoaded: false
		}
	}
	
	componentDidMount() {
		config.loadData(this.fetchData)
	}
	
	componentWillUnmount() {
	
	}
	
	fetchData = () => {
		request.post(this.props.uri, {}).then(res => {
			if (res.code === 0) {
				this.setState({
					list: res.data,
					isLoaded:true
				})
			} else {
				this.setState({
					isLoaded:true
				})
			}
		}).catch(e => {
			this.setState({
				isLoaded:true
			})
		})
	};
	
	render() {
		if (!this.state.isLoaded) {
			return <LoadingMore hasMore={true}/>
		}
		if (this.state.isLoaded && this.state.list.length === 0) {
			return <LoadingMore hasMore={false}/>
		}
		return (
			<ScrollPage>
				{this.state.list.map((v, i, arr) => (
					<UserRow
						key={i}
						item={v}
						index={i}
						list={arr}
						tabIndex={this.props.tabIndex}
						// detail={(v.distance).toFixed(2) + 'km'}
					/>
				))}
			</ScrollPage>
		)
	}
}


class UserRow extends React.Component {
	renderIcon = index => {
		let style = {
			width: 20,
			height: 20,
			marginRight: 12
		};
		
		if (index === 0) {
			return <Image
				source={require('../../assets/image/first.png')}
				style={style}
			/>
		}
		if (index === 1) {
			return <Image
				source={require('../../assets/image/second.png')}
				style={style}
			/>
		}
		if (index === 2) {
			return <Image
				source={require('../../assets/image/third.png')}
				style={style}
			/>
		}
		return <View style={{
			...style,
			backgroundColor: styleUtil.themeColor,
			borderRadius: 10,
			alignItems: 'center',
			justifyContent: 'center'
		}}>
			<Text style={{
				color: 'white',
				fontSize: 14,
			}}>{index + 1}</Text>
		</View>
	};
	
	renderDetail = count => {
		let text, source;
		if (this.props.tabIndex === 0) {
			text = '出题数';
			source = require('../../assets/image/title.png')
		} else {
			text = '人气指数'
			source = require('../../assets/image/popularity.png')
		}
		return (
			<View style={{
				flexDirection: 'row',
				alignItems: 'center'
			}}>
				<ImageCached
					source={source}
					style={{
						width: 20,
						height: 20,
						marginRight: 5
					}}
				/>
				<Text style={{color: '#666'}}>{count}</Text>
			</View>
		)
	};
	
	render() {
		const {
			item,
			list,
			index,
			detail
		} = this.props;
		return (
			<ListRow
				title={
					<View style={{
						flexDirection: 'row',
						alignItems: 'center',
					}}>
						{this.renderIcon(index)}
						<ImageCached
							component={Avatar}
							medium
							rounded
							source={config.defaultAvatar(item.avatar)}
							containerStyle={{
								marginRight: 8
							}}
						/>
						<Icon
							name={item.gender === 1 ? 'gender-male' : item.gender === 2 ?  'gender-female' : 'gender-male-female'}
							type={'material-community'}
							size={20}
							color={item.gender === 1 ? '#009ad6' : item.gender === 2 ?  '#f391a9' : '#7D26CD'}
							containerStyle={{
								marginRight: 5,
								marginTop: 2
							}}
						/>
						<Text>{item.username}</Text>
					</View>
				}
				titleStyle={{marginLeft: 10}}
				detail={this.renderDetail(item.rankCount)} // <SimilarText similar={item.similar}/>
				onPress={_ => navigate.push(Profile, {
					_id: item._id
				})}
				// icon={undefined}
				topSeparator={index === 0 ? 'full' : 'none'}
				bottomSeparator={index + 1 === list.length ? 'full' : 'indent'}
				accessory={'none'}
			/>
		)
	}
}