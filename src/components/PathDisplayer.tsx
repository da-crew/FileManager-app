import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { View, Text, ScrollView } from "react-native";
import { Path } from '../FileSystem';
import { useTheme } from './ThemeContext';
import { invertHexColor } from './themes';
import React from 'react'

// กำหนด Props ที่จำเป็นสำหรับ PathDisplayer
interface PathDisplayerProps {
    navpath: Path  // เส้นทางการนำทาง (Path object)
}

const PathDisplayer = ({ navpath }: PathDisplayerProps) => {
    const { theme } = useTheme();

    let separator = <MaterialIcons name="arrow-forward-ios" size={18} color={theme.text} style={{ marginHorizontal: 10 }} />;
    let comps = [];
    comps.push(<Text key={1} style={{ color: theme.text }}>{navpath.root.displayName}</Text>);
    for (let name of navpath.nodes) {
        comps.push(<Text key={`separator-${name}`} style={{ color: theme.text }}>{separator}</Text>);
        comps.push(<Text key={`node-${name}`} style={{ marginHorizontal: 5, color: theme.text }}>{name}</Text>);
    }

    return <View style={{ backgroundColor: theme.toolbarColor, padding: 10 }}>
        <View style={{ flexDirection: 'row', backgroundColor: theme.background, borderRadius: 5, padding: 5 }}>
            <FontAwesome5 name="home" size={18} color={theme.text} />
            {separator}
            {/* แสดงเส้นทางแบบเลื่อนได้ กรณีเส้นทางยาว */}
            <ScrollView horizontal>
                {comps}
            </ScrollView>
        </View>
    </View>;
};

export { PathDisplayer };