import { Text, TouchableOpacity, GestureResponderEvent } from "react-native";
import { ReactNode } from "react";
import { useTheme } from '../ThemeContext';

const BottomBarOptions = ({ name, icon, onPress }: {
    name: string,
    icon: ReactNode,
    onPress: (event: GestureResponderEvent) => void,
}) => {
    const { theme } = useTheme();
    return (
    <TouchableOpacity style={{ flexDirection: 'row', backgroundColor: theme.background }} onPress={onPress}>
        {icon}
        <Text style={{ textAlignVertical: 'center', fontSize: 15, color: theme.text }}>{name}</Text>
    </TouchableOpacity>
    );
}

export default BottomBarOptions;