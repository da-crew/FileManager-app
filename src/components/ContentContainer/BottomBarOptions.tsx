import { Text, TouchableOpacity, GestureResponderEvent, StyleSheet, View } from "react-native";
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
            <View style={styles.iconContainer}>
                {icon}
            </View>
            <Text style={styles.text}>{name}</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        paddingHorizontal: 16,
        borderRadius: 10,
        backgroundColor: 'white',
        marginVertical: 6,
        marginHorizontal: 10,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
        borderColor: '#f0f0f0',
        borderWidth: 1,
    },
    iconContainer: {
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    text: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
        flex: 1,
    }
});

export default BottomBarOptions;