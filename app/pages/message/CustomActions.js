import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {
    Keyboard,
    StyleSheet,
    TouchableOpacity,
    View,
    ViewPropTypes,
    Text
} from 'react-native';

import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import Entypo from 'react-native-vector-icons/Entypo'
import ImagePicker from 'react-native-image-picker'
import ImageCropPicker from 'react-native-image-crop-picker';

export default class CustomActions extends Component {
    constructor(props) {
        super(props);
        this.state = {
            modalVisible: false,
        };
        this.onActionsPress = this.onActionsPress.bind(this);
    }

    onActionsPress() {
        Keyboard.dismiss()
        this.props.showEmoticonModal(false, false)
        ImagePicker.showImagePicker(config.mediaPickerOptions({
            chooseFromLibraryButtonTitle: null,
            customButtons: [
                {name: 'library', title: '从相册中选取'},
                // {name: 'sendLocation', topic: '发送位置'}
            ]
        }), (res) => {
            // console.log(res);
            if (res.uri) {
                this.props.onSend({image: res.uri})
                return
            }
            if (res.error) {
                console.log('ImagePicker Error: ', res.error);
                return
            }
            if (res.didCancel) {
                return
            }
            if (res.customButton === 'sendLocation') {
                navigator.geolocation.getCurrentPosition(position => {
                        this.props.onSend({
                            location: {
                                latitude: position.coords.latitude,
                                longitude: position.coords.longitude,
                            },
                        });
                    },
                    (error) => alert(error.message),
                    {enableHighAccuracy: true, timeout: 20000, maximumAge: 1000}
                );
            } else if (res.customButton === 'library') {
                ImageCropPicker.openPicker({
                    multiple: true,
	                // cropping: true,
                   //  compressImageQuality: 0,
                    // compressImageMaxWidth:400,
                    // compressImageMaxHeight:200,
                    minFiles: 1,
                    maxFiles: 5,
                    loadingLabelText: '请稍等...'
                }).then(images => {
                    // console.log(images);
                    const img = images.map((item) => {
                        return {
                            image: item.path,
                        }
                    })
                    this.props.onSend(img)
                }).catch(err => {
                    if (err.code === 'E_PICKER_CANCELLED') {
                        return
                    }
                    console.log(err)
                })
            }
        });
    }

    render() {
        return (
            <View style={styles.container}>
                <TouchableOpacity
                    style={styles.iconBox}
                    onPress={this.onActionsPress}
                >
                    <MaterialIcons
                        name='add-circle-outline'
                        size={30}
                    />
                </TouchableOpacity>
                {
                    this.props.showEmoticons
                        ? <TouchableOpacity
                            style={styles.iconBox}
                            onPress={_ => {
                                this.props.showEmoticonModal(false, true)
                            }}
                        >
                            <Entypo
                                name='keyboard'
                                size={30}
                            />
                        </TouchableOpacity>
                        : <TouchableOpacity
                            style={styles.iconBox}
                            onPress={_ => {
                                this.props.showEmoticonModal(true, false)
                            }}
                        >
                            <MaterialIcons
                                name='insert-emoticon'
                                size={30}
                            />
                        </TouchableOpacity>
                }
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
    },
    iconBox: {
        width: 30,
        height: 30,
        marginLeft: 3,
        marginBottom: 8,
    },
    wrapper: {
        borderRadius: 13,
        borderColor: '#b2b2b2',
        borderWidth: 2,
    },
    iconText: {
        color: '#b2b2b2',
        fontWeight: 'bold',
        fontSize: 16,
        backgroundColor: 'transparent',
        textAlign: 'center',
    },
});

CustomActions.contextTypes = {
    actionSheet: PropTypes.func,
};

CustomActions.defaultProps = {
    onSend: () => {
    },
    options: {},
    icon: null,
    containerStyle: {},
    wrapperStyle: {},
    iconTextStyle: {},
    showEmoticonModal: () => {
    },
    showEmoticons: false
};

CustomActions.propTypes = {
    onSend: PropTypes.func,
    options: PropTypes.object,
    icon: PropTypes.func,
    containerStyle: ViewPropTypes.style,
    wrapperStyle: ViewPropTypes.style,
    iconTextStyle: Text.propTypes.style,
    showEmoticonModal: PropTypes.func,
    showEmoticons: PropTypes.bool
};