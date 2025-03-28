import { View, Text, TouchableOpacity } from "react-native";
import { AntDesign, FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';
import * as RNFS from "react-native-fs"

export interface ItemCardProps {
    item: RNFS.ReadDirItem,
    onSelect: (selected: boolean, item: RNFS.ReadDirItem) => void,
    onOpen: (item: RNFS.ReadDirItem) => void,
    isSelected: boolean
}

/**
 * ItemCard component to display a file or folder item.
 * 
 * @param {Object} props - The component props.
 * @param {FolderItem|FileItem} props.item - The item to display, either a FolderItem or FileItem.
 * @param {function(boolean, FolderItem|FileItem): void} props.onSelect - Callback function to handle item selection.
 * @param {bool} props.isSelected - Indicates whether the item is selected.
 * @returns {JSX.Element} The rendered component.
 */

const ItemCard = ({ item, onSelect, onOpen, isSelected }: ItemCardProps) => {
    return <View style={{ marginVertical: 5, flexDirection: 'row', alignItems: 'center' }}>
        <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }} onPress={() => onOpen(item)}>{/* Icon and Name */}
            {
                item.isDirectory()
                    ? <AntDesign name="folder1" size={40} />
                    : item.isFile()
                        ? <AntDesign name="file1" size={40} />
                        : <FontAwesome name="question" size={40} />
            }
            <Text style={{ fontSize: 15, marginHorizontal: 10 }}>{item.name}</Text>
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: 'flex-end' }}>
            <TouchableOpacity onPress={() => {
                onSelect(!isSelected, item);
            }} style={{ padding: 10 }}>
                <MaterialCommunityIcons
                    name={isSelected ? "checkbox-marked" : "checkbox-blank-outline"}
                    size={25}
                    color="black"
                />
            </TouchableOpacity>
        </View>

    </View>;
};

export default ItemCard;