import React from "react";
import { View, StyleSheet, Text, TouchableOpacity } from "react-native";
import { ViewMode } from "./common";
import { MaterialIcons, Ionicons } from '@expo/vector-icons';

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

    const getFilesIcon = (): string => {
        switch (fileType) {
            case 'images':
                return 'photo-library';
            case 'videos':
                return 'videocam';
            case 'audio':
                return 'audiotrack';
            case 'documents':
                return 'insert-drive-file';
            default:
                return 'insert-drive-file';
        }
    };

    const getFolderIcon = (): string => {
        return 'collections';
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity 
                onPress={() => handleModeChange(ViewMode.FILES)} 
                style={[
                    styles.tabButton,
                    { backgroundColor: selectedMode === ViewMode.FILES ? '#FFFFFF' : 'transparent' }
                ]}
            >
                <MaterialIcons 
                    name={getFilesIcon()} 
                    size={18} 
                    color={selectedMode === ViewMode.FILES ? '#2196F3' : '#757575'} 
                    style={styles.icon}
                />
                <Text style={[
                    styles.tabText,
                    { 
                        fontWeight: selectedMode === ViewMode.FILES ? 'bold' : 'normal',
                        color: selectedMode === ViewMode.FILES ? '#2196F3' : '#757575'
                    }
                ]}>
                    {getFilesLabel()}
                </Text>
            </TouchableOpacity>
            <TouchableOpacity 
                onPress={() => handleModeChange(ViewMode.FOLDERS)} 
                style={[
                    styles.tabButton,
                    { backgroundColor: selectedMode === ViewMode.FOLDERS ? '#FFFFFF' : 'transparent' }
                ]}
            >
                <MaterialIcons 
                    name={getFolderIcon()} 
                    size={18} 
                    color={selectedMode === ViewMode.FOLDERS ? '#2196F3' : '#757575'} 
                    style={styles.icon}
                />
                <Text style={[
                    styles.tabText,
                    { 
                        fontWeight: selectedMode === ViewMode.FOLDERS ? 'bold' : 'normal',
                        color: selectedMode === ViewMode.FOLDERS ? '#2196F3' : '#757575'
                    }
                ]}>
                    {getFolderLabel()}
                </Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        backgroundColor: '#f8f8f8',
        borderRadius: 30,
        overflow: 'hidden',
        margin: 10,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.22,
        shadowRadius: 2.22,
        borderWidth: 0.5,
        borderColor: '#e0e0e0',
        padding: 4
    },
    tabButton: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 5,
        alignItems: 'center',
        borderRadius: 25,
        flexDirection: 'row',
        justifyContent: 'center'
    },
    tabText: {
        fontSize: 15
    },
    icon: {
        marginRight: 6
    }
});