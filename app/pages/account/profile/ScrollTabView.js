import React from 'react'
import {
    StyleSheet,
    View,
    Animated,
    Platform,
    Text
} from 'react-native'

import styleUtil from "../../../common/styleUtil";
import ScrollableTabView from 'react-native-scrollable-tab-view'
import {DEFAULT_WINDOW_MULTIPLIER, SCREEN_HEIGHT} from "./constants";
import FriendDynamic from "../../message/FriendDynamic";

const WINDOW_HEIGHT = SCREEN_HEIGHT * DEFAULT_WINDOW_MULTIPLIER
const NAV_BAR_HEIGHT = Platform.OS === 'ios' ? 64 : 32;
const HEADER_HEIGHT = WINDOW_HEIGHT - NAV_BAR_HEIGHT

export default class ScrollTabView extends React.Component {
    constructor(props) {
        super(props)
        this.onScroll = Animated.event([{
            nativeEvent: {
                contentOffset: {
                    y: this.state.scrollY
                }
            }
        }])
    }

    onChangeTab = ({i, ref, from}) => {
        // let scrollY = this.state.scrollY
        // if (i === 0) {
        //     scrollY = this._userTopic.state.scrollY
        // }
        // else if (i === 1) {
        //     scrollY = this._userDynamic.state.scrollY
        // }
        // else if (i === 2) {
        //     scrollY = this._userAbout.state.scrollY
        // }
        // this.setState({
        //     scrollY
        // })
    }

    render() {
        let {scrollY} = this.props
        return (
            <Animated.View style={[styles.scroll, {
                transform: [{
                    translateY: scrollY.interpolate({
                        inputRange: [0, HEADER_HEIGHT, WINDOW_HEIGHT],
                        outputRange: [0, -HEADER_HEIGHT, -HEADER_HEIGHT]
                    })
                }]
            }]}
            >
                <View style={{
                    backgroundColor:'#fff',
                    height:styleUtil.window.height - NAV_BAR_HEIGHT - 40
                }}>
                    <ScrollableTabView
                        tabBarPosition={'top'}
                        onChangeTab={this.onChangeTab}
                        initialPage={0}
                    >
                        <UserTopic
                            tabLabel={'题目'}
                            user={user}
                            onScroll={this.onScroll}
                            ref={ele => this._userTopic = ele}
                        />
                        <FriendDynamic
                            tabLabel={'动态'}
                            user={user}
                            onScroll={this.onScroll}
                            ref={ele => this._userDynamic = ele}
                        />
                        <UserAbout
                            tabLabel={'关于Ta'}
                            user={user}
                            onScroll={this.onScroll}
                            ref={ele => this._userAbout = ele}
                        />
                    </ScrollableTabView>
                </View>
            </Animated.View>
        )
    }
}


const styles = StyleSheet.create({
    scroll: {
        position: 'absolute',
        left: 0,
        top: WINDOW_HEIGHT,
        right: 0,
        bottom: 0,
    }
});
