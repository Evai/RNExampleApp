import styleUtil from "../../common/styleUtil";
import {StyleSheet} from "react-native";

let width = styleUtil.window.width;

const styles = StyleSheet.create({
	wrapper: {},
	emoticonContainer: {
		flex: 1,
		flexDirection: 'row',
		justifyContent: 'space-between',
		flexWrap: 'wrap',
		padding: 10,
		backgroundColor: styleUtil.backgroundColor
	},
	touchBtn: {
		width: (width - 5) / 8,
		height: 50,
		justifyContent: 'center',
		alignItems: 'center',
	},
	imageIcon: {
		width: 24,
		height: 24,
		marginHorizontal: 5
	},
	addButton: {
		borderWidth: 1,
		// borderStyle: 'dotted',
		borderColor: '#ccc',
		justifyContent: 'center',
		alignItems: 'center',
		marginVertical: 5,
		marginHorizontal: 5,
	},
})

export default styles