import { View, Text, TouchableOpacity, GestureResponderEvent } from "react-native";
import { ReactNode} from "react";

const BottomBarItem = ({ name, icon, onPress, disabled }: {
    name: string,
    icon: ReactNode,
    onPress: (event: GestureResponderEvent) => void,
    disabled?: boolean,
}) => {
    return (<TouchableOpacity 
        style={{ padding: 10, opacity: disabled ? 0.5 : 1 }} 
        onPress={disabled ? undefined : onPress} disabled={disabled} >
        <View style={{ alignItems: 'center' }}>
            {icon}
        </View>
        <Text style={{ fontSize: 16 }}>{name}</Text>
    </TouchableOpacity>);
};

export default BottomBarItem;