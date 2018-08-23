'use strict'

import React, {
    Component
} from 'react'
import {
    StyleSheet,
    Text,
    View,
    Image,
    TouchableOpacity,
    ScrollView,
    Alert
} from 'react-native'
import styleUtil from "../../common/styleUtil";
import ImagePicker from 'react-native-image-picker'
import {
    Button,
    List,
    ListItem
} from 'react-native-elements'

const SETTINGS = [
    {title:'分享Ta', onPress:() => {}},
    {title:'举报Ta', onPress:() => {}}
]

export default class UserSetting extends Component {
    static navigatorStyle = {
        tabBarHidden: true,
        navBarHidden: false
    };
    constructor(props) {
        super(props)
        this.state = {
            user: this.props || config.user
        }
    }

    componentWillMount() {

    }

    _renderContent = () => {
        return (
            <View style={{backgroundColor:styleUtil.backgroundColor}}>
                <List>
                    {
                        SETTINGS.map((v,i) => (
                            <ListItem
                                key={i}
                                hideChevron={false}
                                onPress={v.onPress}
                                title={v.title}
                            />
                        ))
                    }
                </List>
            </View>
        )
    }

    render() {
        return (
            <View style={styles.container}>
                <ScrollView>
                    {this._renderContent()}
                </ScrollView>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: styleUtil.backgroundColor,
    },
    nickname: {
        paddingTop: 30,
        paddingLeft: 15
    },
    itemContainer: {
        height: 100
    },
    avatarContainer: {
        width: 75,
        height: 75,
        borderRadius: 8
    },
    avatar: {
        width: 75,
        height: 75,
        borderRadius: 8
    },
    logoutText: {
        color: 'red',
        textAlign: 'center'
    }
})