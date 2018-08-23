'use strict'

import styleUtil from "../common/styleUtil";
import {StyleSheet,View,Text} from "react-native";
import React, {Component} from 'react'

export default class Header extends Component {
    render() {
        return (
            <View style={styles.header}>
                <Text style={styles.title}>{this.props.title}</Text>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    header: {
        backgroundColor: styleUtil.themeColor,
        paddingTop: 28,
        paddingBottom: 17
    },
    title: {
        fontSize: 18,
        color: '#fff',
        textAlign: 'center',
        fontWeight: '600'
    }
})