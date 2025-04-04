import { SafeAreaView, View, StatusBar, Text, ScrollView, TouchableOpacity, Modal, GestureResponderEvent, Alert, BackHandler, FlatList } from "react-native";
import ItemCard from "../ItemCard";
import * as RNFS from "react-native-fs"

interface ContentListProps {
    content: RNFS.ReadDirItem[] | null;
    selectionSet: Set<RNFS.ReadDirItem>;
    handleSelect: (select: boolean, item: RNFS.ReadDirItem) => void;
    handleOpen: (item: RNFS.ReadDirItem) => void;
}


export default function ContentList({content, selectionSet, handleSelect, handleOpen}: ContentListProps) {
    if (content) {
        if (content.length == 0) {
            return (<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ fontSize: 15 }}>Empty</Text>
            </View>);
        }
        return (
            <FlatList
                data={content}
                keyExtractor={(item, i) => item + i.toString()}
                renderItem={({ item }) =>
                    <ItemCard item={item}
                        onSelect={handleSelect}
                        onOpen={handleOpen}
                        isSelected={selectionSet.has(item)}
                    />
                }
            />
        );
    } else {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ fontSize: 15 }}>Loading</Text>
            </View>
        );
    }
}