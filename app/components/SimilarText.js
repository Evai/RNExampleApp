import React from 'react'
import {Label} from 'teaset'
import utils from "../common/utils";
import PropTypes from 'prop-types'

export default class SimilarText extends React.Component {
    static propTypes = {
        similar: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    };

    render() {
        return (
            <Label
                text={'相似度: ' + utils.formatSimilar(this.props.similar) + '%'}
                style={{
                    color: this.props.similar > config.similar ? '#008B45' : '#989898'
                }}
            />
        )
    }
}