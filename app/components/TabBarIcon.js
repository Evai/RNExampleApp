import React from 'react'
import {
    View,
    Image,
    StyleSheet
} from 'react-native'
import {Badge} from 'teaset'
import PropTypes from 'prop-types'

export default class TabBarIcon extends React.Component {
    static propTypes = {
        tintColor: PropTypes.string,
        showBadge: PropTypes.bool,
        badgeStyle: PropTypes.object,
        badgeCount: PropTypes.number,
        icon: Image.propTypes.source,
        size: PropTypes.number,
    };

    constructor(props) {
        super(props)
        const {
            showBadge,
            badgeStyle,
            badgeCount,
            badgeType
        } = props
        this.state = {
            showBadge,
            badgeStyle,
            badgeCount,
            badgeType
        }
    }

    updateBadge = (obj) => {
        this.setState(obj)
    }

    render() {
        const {
            tintColor,
            size = 30,
            icon
        } = this.props
        const {
            showBadge,
            badgeStyle,
            badgeCount,
            badgeType
        } = this.state
        return (
            <View>
                <Image
                    style={{
                        tintColor,
                        width:size,
                        height:size
                    }}
                    source={icon}
                />
                {showBadge && <Badge type={badgeType}
                                     style={[{
                                         position: 'absolute',
                                         top: 0,
                                         right: -10
                                     }, badgeStyle]}
                                     count={badgeCount}/>}
            </View>
        )
    }
}