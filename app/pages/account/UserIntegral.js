import React from 'react'
import {
	Text,
	View,
	Image,
	Alert,
	Platform
} from 'react-native'

import {ListRow, Button} from 'teaset'
import ScrollPage from "../../components/ScrollPage";
import styleUtil from "../../common/styleUtil";
import navigate from "../../screens/navigate";
import request from "../../common/request";
import config from "../../common/config";
import TabNavBar from "../../screens/TabNavBar";
import IntegralTabs from "./IntegralTabs";
import WebPage from "../../components/WebPage";
import {Icon} from 'react-native-elements'
import * as RNIap from 'react-native-iap';
// const RNIap = Platform.OS === 'ios' ? require('react-native-iap') : null
import toast from "../../common/toast";
import NavBar from "../../components/NavBar";

const productPrefix = 'org.reactjs.native.buy.';
const itemSkus = Platform.select({
	ios: [
		'com.example.coins100'
	],
	android: [
		'com.example.coins100'
	]
});


export default class UserIntegral extends React.Component {
	static navigatorStyle = {
		navBarHidden: true,
	};
	
	constructor(props) {
		super(props);
		this.state = {
			integral: config.user.integral || 0,
			item: {},
			list: []
		}
	}
	
	componentWillMount() {
	
	}
	
	async componentDidMount() {
		let list = await config.getIntegralProductList();
		if (list && list.length > 0) {
			this.setState({list})
		}
		config.loadData(this.getIntegralProduct);
		if (Platform.OS !== 'ios') {
			return;
		}
		try {
			await RNIap.prepare();
			// const products = await RNIap.getProducts(itemSkus);
			// console.warn(products)
			// this.setState({ items });
		} catch (err) {
			console.warn(err); // standardized err.code and err.message available
		}
	}
	
	componentWillUnmount() {
		if (Platform.OS !== 'ios') {
			return;
		}
		try {
			RNIap.endConnection();
		} catch (e) {
			
		}
	}
	
	getIntegralProduct = () => {
		request.post(config.api.baseURI + config.api.getIntegralProduct)
			.then(res => {
				if (res.code === 0) {
					this.setState({list: res.data});
					config.setIntegralProductList(res.data)
				}
			})
			.catch(e => {
			
			})
	};
	
	recharge = () => {
		if (Platform.OS !== 'ios') {
			Alert.alert('目前充值功能暂不支持安卓平台');
			return;
		}
		let item = this.state.item;
		if (!item.id) {
			Alert.alert('请选择充值金额');
			return;
		}
		let productId = productPrefix + item.id;
		// console.warn(productId)
		toast.modalLoading();
		let isHas = false;
		RNIap.getProducts(itemSkus).then(purchases => {
			// console.warn(purchase);
			purchases.forEach(purchase => {
				if (purchase.productId === productId) {
					isHas = true;
				}
			});
			if (!isHas) {
				toast.modalLoadingHide();
				Alert.alert('该产品不存在');
				return;
			}
			RNIap.buyProduct(productId)
				.then(purchase => {
					request.post(config.api.baseURI + config.api.appleVerify, purchase)
						.then(res => {
							toast.modalLoadingHide();
							if (res.code === 0) {
								Alert.alert('购买成功！')
								let user = config.user;
								user.integral += item.integral;
								TabNavBar.updateUser(user);
								this.setState({
									integral: this.state.integral + item.integral
								});
							} else {
								Alert.alert(res.msg);
							}
						})
						.catch(e => {
							toast.modalLoadingHide();
							// console.warn(e)
						});
				})
				.catch(err => {
					console.warn(err.message);
					toast.modalLoadingHide();
					// if (err.code !== 'E_USER_CANCELLED') {
					// 	Alert.alert(err.message);
					// }
				})
		}).catch(err => {
			toast.modalLoadingHide();
			console.warn(err.message);
		})
	};
	
	renderDetail = (price) => {
		return (
			<View style={{
				flexDirection: 'row',
				alignItems: 'center',
			}}>
				<Text style={{
					color: '#C30',
					fontSize: 18,
				}}>
					¥ {price}
				</Text>
			</View>
		)
	};
	
	render() {
		let row = this.state.item;
		return (
			<View style={styleUtil.container}>
				<NavBar
					renderTitleView={
						<Text style={{color:'white',fontSize:17}}>我的积分</Text>
					}
					leftIconStyle={{tintColor:'white'}}
					rightTitle={'积分明细'}
					rightStyle={{color:'white'}}
					rightOnPress={_ => navigate.push(IntegralTabs)}
					style={{
						backgroundColor:styleUtil.themeColor,
						borderBottomWidth:0
					}}
				/>
				<ScrollPage>
					<View style={{
						justifyContent: 'center',
						alignItems: 'center',
						flex: 1,
					}}>
						<View style={{
							height: 200,
							backgroundColor: styleUtil.themeColor,
							width: styleUtil.window.width,
							justifyContent: 'space-around',
							alignItems: 'center',
						}}>
							<View style={{
								flexDirection: 'row',
								justifyContent: 'center',
								alignItems: 'center',
							}}>
								<Image
									style={{
										width: 36,
										height: 36
									}}
									source={require('../../assets/image/integral.png')}
								/>
								<Text style={{
									fontSize: 36,
									color: 'white'
								}}>
									{this.state.integral}
								</Text>
							</View>
							<Button
								title={'如何获取积分'}
								titleStyle={{color: 'white'}}
								style={{
									backgroundColor: 'transparent',
									borderColor: 'white'
								}}
								onPress={_ => navigate.push(WebPage, {
									url: config.api.imageURI + '/html/about_integral.html'
								})}
							/>
						</View>
						
						<View style={{
							width: styleUtil.window.width
						}}>
							<View style={{marginTop: 10}}>
								{this.state.list.map((item, index) => (
									<ListRow
										key={item.integral + index}
										title={item.integral + '积分'}
										style={{
											borderColor: item.price === row.price ? '#C30' : styleUtil.borderColor,
											borderTopWidth: item.price === row.price ? 1 : index === 0 ? styleUtil.borderSeparator : 0,
											borderBottomWidth: item.price === row.price ? 1 : styleUtil.borderSeparator,
										}}
										topSeparator={'none'}
										detail={this.renderDetail(item.price)}
										accessory={'none'}
										bottomSeparator={'none'}
										onPress={_ => this.setState({
											item
										})}
									/>
								))}
							</View>
						</View>
					</View>
					<View style={{
						paddingHorizontal: 10,
						paddingVertical: 20
					}}>
						<Button
							activeOpacity={0.7}
							title={'立即充值' + (row.price ? ' ¥' + row.price : '')}
							size={'xl'}
							titleStyle={{
								color: 'white',
								fontSize: 18
							}}
							onPress={this.recharge}
							style={{
								borderRadius: 5,
								borderColor: '#C30',
								backgroundColor: '#C30',
								paddingVertical: 12,
								paddingHorizontal: 10
							}}/>
					</View>
				</ScrollPage>
			</View>
		)
	}
}