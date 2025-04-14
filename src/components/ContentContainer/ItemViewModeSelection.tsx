import { useState } from "react";
import { ViewMode } from "./common";
import { TouchableOpacity, View, Text } from "react-native";
import { useTheme } from '../ThemeContext';

const ItemViewModeSelection = ({ onChange }: { onChange: (mode: ViewMode) => void }) => {

    const highlightColor = '#B6B6B6';
    const [selection, setSelection] = useState(ViewMode.FILES);
    const { theme } = useTheme();

    return <View style={{ flexDirection: 'row', backgroundColor: theme.background }}>
        <TouchableOpacity onPress={() => {
            onChange(ViewMode.FILES);
            setSelection(ViewMode.FILES);
        }} style={{ flex: 1, backgroundColor: selection == ViewMode.FILES ? highlightColor : undefined, padding: 10, alignItems: 'center' }}>
            <Text style={{ fontSize: 16, color: theme.text }}>Files</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => {
            onChange(ViewMode.FOLDERS);
            setSelection(ViewMode.FOLDERS);
        }} style={{ flex: 1, backgroundColor: selection == ViewMode.FOLDERS ? highlightColor : undefined, padding: 10, alignItems: 'center' }}>
            <Text style={{ fontSize: 16, color: theme.text }}>Folders</Text>
        </TouchableOpacity>
    </View>;
};

export default ItemViewModeSelection;