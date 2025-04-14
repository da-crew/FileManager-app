import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { View, Text, ScrollView } from "react-native";
import { Path } from '../FileSystem';
import { useTheme } from '../components/ThemeContext';
interface PathDisplayerProps {
    navpath: Path
}

const PathDisplayer = ({navpath}: PathDisplayerProps) => {
    let separator = <MaterialIcons name="arrow-forward-ios" size={18} color="black" style={{marginHorizontal: 10}}/>;
    let comps = [];
    comps.push(<Text key={1}>{navpath.root.displayName}</Text>);
    for (let name of navpath.nodes) { 
        comps.push(<Text key={`separator-${name}`}>{separator}</Text>);
        comps.push(<Text key={`node-${name}`} style={{marginHorizontal: 5}}>{name}</Text>);
    }
    const { theme } = useTheme();
    return <View style={{backgroundColor: theme.background, padding: 10}}>
        <View style={{flexDirection: 'row', backgroundColor: theme.background, borderRadius: 5, padding: 5}}>
            <FontAwesome5 name="home" size={18} color={theme.text}/>
            {separator}
            <ScrollView horizontal>
                {comps}
            </ScrollView>
        </View>
    </View>;
};

export { PathDisplayer };