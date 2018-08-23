import React from 'react'
import {View} from 'react-native'

export default class List extends React.Component {
    render() {
        return (
            <View style={[{marginTop:20},{...this.props.style}]}>
                {this.props.children}
            </View>
        )
    }
}