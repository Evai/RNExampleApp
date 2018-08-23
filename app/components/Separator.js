import React from 'react'
import {
    StyleSheet,
    View
} from 'react-native'
import styleUtil from "../common/styleUtil";

export default class Separator extends React.Component {
    render() {
        const {
            highlighted,
            style = {}
        } = this.props
        return (
            <View
                style={[
                    styles.separator,
                    style
                ]}
            />
        )
    }
}

const styles = StyleSheet.create({
    separator: {
        height: .5,
        backgroundColor: '#ccc',
        position: 'absolute',
        left: 0,
        bottom: 0,
        right: 0
    }
})