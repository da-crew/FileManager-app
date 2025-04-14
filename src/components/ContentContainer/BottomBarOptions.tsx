import { Text, TouchableOpacity, GestureResponderEvent, StyleSheet } from "react-native";
import { ReactNode } from "react";

const BottomBarOptions = ({ name, icon, onPress }: {
    name: string,
    icon: ReactNode,
    onPress: (event: GestureResponderEvent) => void,
}) => {
    return (
        <TouchableOpacity 
            style={styles.container} 
            onPress={onPress}
            activeOpacity={0.7}
        >
            {icon}
            <Text style={styles.text}>{name}</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        backgroundColor: 'rgba(242, 242, 242, 0.6)',
        marginRight: 10,
    },
    text: {
        textAlignVertical: 'center',
        fontSize: 14,
        marginLeft: 6,
        fontWeight: '500',
        color: '#333'
    }
});

export default BottomBarOptions;