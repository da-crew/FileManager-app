import { View, Text, TouchableOpacity, GestureResponderEvent } from "react-native";
import { ReactNode } from "react";
import { useTheme } from "../ThemeContext";
import { StyleSheet } from "react-native";

const BottomBarItem = ({ name, icon, onPress, disabled }: {
    name: string,
    icon: ReactNode,
    onPress: (event: GestureResponderEvent) => void,
    disabled?: boolean,
}) => {
    const { theme } = useTheme();

    return (<TouchableOpacity
        style={{ padding: 10, opacity: disabled ? 0.5 : 1}}
        onPress={disabled ? undefined : onPress} disabled={disabled} >
        <View style={{ alignItems: 'center'}}>
            {icon}
        </View>
        <Text style={{ fontSize: 16, color: theme.textSecondary}}>{name}</Text>
    </TouchableOpacity>);
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