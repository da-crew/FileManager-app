import { View, Text, TouchableOpacity, GestureResponderEvent } from "react-native";
import { ReactNode} from "react";

const BottomBarItem = ({ name, icon, onPress }: {
    name: string,
    icon: ReactNode,
    onPress: (event: GestureResponderEvent) => void,
}) => {
    return <TouchableOpacity style={{ padding: 10 }} onPress={onPress}>
        <View style={{ alignItems: 'center' }}>
            {icon}
        </View>
        <Text style={{ fontSize: 16 }}>{name}</Text>
    </TouchableOpacity>;
};

export default BottomBarItem;