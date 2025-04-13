import { View, Text, TouchableOpacity, GestureResponderEvent, StyleSheet } from "react-native";
import { ReactNode} from "react";

const BottomBarItem = ({ name, icon, onPress, disabled }: {
    name: string,
    icon: ReactNode,
    onPress: (event: GestureResponderEvent) => void,
    disabled?: boolean,
}) => {
    return (
        <TouchableOpacity 
            style={[
                styles.container,
                { opacity: disabled ? 0.5 : 1 }
            ]} 
            onPress={disabled ? undefined : onPress} 
            disabled={disabled}
            activeOpacity={0.7}
        >
            <View style={styles.iconContainer}>
                {icon}
            </View>
            <Text style={styles.text}>{name}</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 10,
        paddingHorizontal: 15,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
    },
    iconContainer: {
        alignItems: 'center',
        marginBottom: 4,
    },
    text: {
        fontSize: 14,
        fontWeight: '500',
        color: '#333',
        textAlign: 'center'
    }
});

export default BottomBarItem;