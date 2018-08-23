import React, {Component} from 'react';
import {
    Text
} from 'react-native';
import PropTypes from 'prop-types';
import nodeEmoji from 'node-emoji';

export default class Emoji extends Component {
    static propTypes = {
        name: PropTypes.string.isRequired,
        size: PropTypes.number
    }

    static defaultProps = {
        size: 30
    }

    render() {
        return (
            <Text
                {...this.props}
                style={{fontSize: this.props.size}}
            >
                {nodeEmoji.get(this.props.name)}
            </Text>
        );
    }
}
