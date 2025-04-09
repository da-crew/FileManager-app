import React from "react";
import { View, StyleSheet, Text, TouchableOpacity } from "react-native";
import { ViewMode } from "./common";

interface ItemViewModeSelectionProps {
    onChange: (mode: ViewMode) => void;
    fileType?: 'images' | 'videos' | 'audio' | 'documents' | string;
    initialMode?: ViewMode;
}

export default function ItemViewModeSelection({ onChange, fileType = 'images', initialMode = ViewMode.FOLDERS }: ItemViewModeSelectionProps) {
    const [selectedMode, setSelectedMode] = React.useState<ViewMode>(initialMode);

    // ตั้งค่า mode เริ่มต้นเมื่อ props เปลี่ยน
    React.useEffect(() => {
        setSelectedMode(initialMode);
    }, [initialMode]);

    const handleModeChange = (mode: ViewMode) => {
        setSelectedMode(mode);
        onChange(mode);
    };

    // Return appropriate labels based on file type
    const getFolderLabel = (): string => {
        switch (fileType) {
            case 'images':
                return 'Albums';
            case 'videos':
                return 'Collections';
            case 'audio':
                return 'Playlists';
            case 'documents':
                return 'Folders';
            default:
                return 'Albums';
        }
    };

    const getFilesLabel = (): string => {
        switch (fileType) {
            case 'images':
                return 'Photos';
            case 'videos':
                return 'Videos';
            case 'audio':
                return 'Tracks';
            case 'documents':
                return 'Files';
            default:
                return 'Files';
        }
    };

    const highlightColor = '#B6B6B6';

    return <View style={{ flexDirection: 'row', backgroundColor: '#d9d9d9' }}>
        <TouchableOpacity onPress={() => handleModeChange(ViewMode.FILES)} style={{ flex: 1, backgroundColor: selectedMode == ViewMode.FILES ? highlightColor : undefined, padding: 10, alignItems: 'center' }}>
            <Text style={{ fontSize: 16 }}>{getFilesLabel()}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleModeChange(ViewMode.FOLDERS)} style={{ flex: 1, backgroundColor: selectedMode == ViewMode.FOLDERS ? highlightColor : undefined, padding: 10, alignItems: 'center' }}>
            <Text style={{ fontSize: 16 }}>{getFolderLabel()}</Text>
        </TouchableOpacity>
    </View>;
};