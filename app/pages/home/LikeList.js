import React from 'react'
import {
    View,
    Text,
    FlatList
} from 'react-native'

import {
    Avatar
} from 'react-native-elements'
import LoadingMore from "../../components/load/LoadingMore";
import Separator from "../../components/Separator";
import styleUtil from "../../common/styleUtil";
import UserListRow from "../../components/UserListRow";

export default class LikesList extends React.PureComponent {
    static navigatorStyle = {
        title: '赞过的人'
    };

    constructor(props) {
        super(props)
        this.page = 1
        this.total = 0
        this.state = {
            list: [],
            isLoading: false
        }
    }

    componentDidMount() {
        this._fetchLikeList()
    }

    componentWillUnmount() {

    }

    _fetchLikeList = () => {
        this.setState({
            isLoading: true
        })
        setTimeout(_ => {
            request.post(config.api.baseURI + config.api.dynamicLikeList, {
                page: this.page,
                postId: this.props.id
            }).then(res => {
                if (res.code === 0) {
                    this.page++
                    this.total = res.data.total
                    let list = this.state.list.concat(res.data.list)
                    this.setState({
                        list
                    })
                }
                this.setState({
                    isLoading: false
                })
            }).catch(e => {
                this.setState({
                    isLoading: false
                })
            })
        }, config.loadingTime)
    }

    _renderFooter = () => {
        return <LoadingMore
            hasMore={this._hasMore()}
            total={this.total}
        />
    }

    _hasMore = () => {
        return this.state.list.length < this.total && this.total > 0
    }

    _fetchMoreData = () => {
        if (this._hasMore() && !this.state.isLoading) {
            this._fetchLikeList(this.page)
        }
    }

    _renderRows = ({item, separators, index}) => {
        return (
            <UserListRow
                item={item}
                index={index}
                list={this.state.list}
                backTitle={this.props.title}
            />
        )
    }

    render() {
        return (
            <View style={styleUtil.container}>
                <FlatList
                    data={this.state.list}
                    // extraData={this.state}
                    renderItem={this._renderRows}
                    initialNumToRender={config.pageSize}
                    keyExtractor={(item, index) => index.toString()}
                    // ItemSeparatorComponent={this._itemSeparator}
                    onEndReached={this._fetchMoreData}
                    onEndReachedThreshold={0.3}
                    ListFooterComponent={this._renderFooter}
                />
            </View>
        )
    }
}