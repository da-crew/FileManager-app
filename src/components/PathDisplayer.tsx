import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { View, Text, ScrollView } from "react-native";


type PathType = {
    root: string;
    nodes: string[];
}

class Path implements PathType {
    root: string;
    nodes: string[];

    constructor(root: string, nodes: string[]) {
        this.root = root;
        this.nodes = nodes;
    }
}

interface PathDisplayerProps {
    navpath: Path
}

const PathDisplayer = ({navpath}: PathDisplayerProps) => {
    let separator = <MaterialIcons name="arrow-forward-ios" size={18} color="black" style={{marginHorizontal: 10}}/>;
    let comps = [];
    comps.push(<Text key={1}>{navpath.root}</Text>);
    for (let name of navpath.nodes) { 
        comps.push(<Text key={`separator-${name}`}>{separator}</Text>);
        comps.push(<Text key={`node-${name}`} style={{marginHorizontal: 5}}>{name}</Text>);
    }

    return <View style={{backgroundColor: '#d9d9d9', padding: 10}}>
        <View style={{flexDirection: 'row', backgroundColor: "white", borderRadius: 5, padding: 5}}>
            <FontAwesome5 name="home" size={18} color="black"/>
            {separator}
            <ScrollView horizontal>
                {comps}
            </ScrollView>
        </View>
    </View>;
};

export { Path, PathDisplayer };