import { Text, TouchableOpacity, GestureResponderEvent } from "react-native";
import { ReactNode } from "react";

const BottomBarOptions = ({ name, icon, onPress }: {
    name: string,
    icon: ReactNode,
    onPress: (event: GestureResponderEvent) => void,
}) => {
    return <TouchableOpacity style={{ flexDirection: 'row' }} onPress={onPress}>
        {icon}
        <Text style={{ textAlignVertical: 'center', fontSize: 15 }}>{name}</Text>
    </TouchableOpacity>;
}

export default BottomBarOptions;