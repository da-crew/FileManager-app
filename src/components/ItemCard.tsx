import { View, Text, TouchableOpacity } from "react-native";
import { AntDesign, FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';
import * as RNFS from "react-native-fs"
import { useTheme } from "./ThemeContext";
import React from "react";

export interface ItemCardProps {
    item: RNFS.ReadDirItem,
    onSelect: (selected: boolean, item: RNFS.ReadDirItem) => void,
    onOpen: (item: RNFS.ReadDirItem) => void,
    isSelected: boolean
}

// File extensions for categorization
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
const VIDEO_EXTENSIONS = ['.mp4', '.mov', '.avi', '.mkv', '.flv', '.wmv', '.3gp'];
const AUDIO_EXTENSIONS = ['.mp3', '.wav', '.ogg', '.m4a', '.flac', '.aac'];
const DOCUMENT_EXTENSIONS = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt'];

const ItemCard = ({ item, onSelect, onOpen, isSelected }: ItemCardProps) => {
    const { theme } = useTheme();

    // Function to determine the appropriate icon based on file type
    const getFileIcon = () => {
        if (item.isDirectory()) {
            return <AntDesign name="folder1" size={40} color={theme.text} />;
        }

        if (item.isFile()) {
            const extension = item.path.toLowerCase().substring(item.path.lastIndexOf('.'));

            if (IMAGE_EXTENSIONS.includes(extension)) {
                return <AntDesign name="picture" size={40} color="#4CAF50" />;
            }

            if (VIDEO_EXTENSIONS.includes(extension)) {
                return <AntDesign name="videocamera" size={40} color="#F44336" />;
            }

            if (AUDIO_EXTENSIONS.includes(extension)) {
                return <FontAwesome name="music" size={40} color="#2196F3" />;
            }

            if (DOCUMENT_EXTENSIONS.includes(extension)) {
                if (extension === '.pdf') {
                    return <AntDesign name="pdffile1" size={40} color="#FF5722" />;
                } else if (['.doc', '.docx'].includes(extension)) {
                    return <AntDesign name="wordfile1" size={40} color="#2196F3" />;
                } else if (['.xls', '.xlsx'].includes(extension)) {
                    return <AntDesign name="exclefile1" size={40} color="#4CAF50" />;
                } else if (['.ppt', '.pptx'].includes(extension)) {
                    return <AntDesign name="pptfile1" size={40} color="#FF9800" />;
                } else {
                    return <AntDesign name="file1" size={40} color="#607D8B" />;
                }
            }

            return <AntDesign name="file1" size={40} color="#607D8B" />;
        }

        return <FontAwesome name="question" size={40} color="#9E9E9E" />;
    };

    return (
        <View style={{ marginVertical: 5, flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity
                style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}
                onPress={() => onOpen(item)}
            >
                {getFileIcon()}
                <Text
                    style={{ fontSize: 15, marginHorizontal: 10, color: theme.text }}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                >
                    {item.name}
                </Text>
            </TouchableOpacity>
            <View style={{ flex: 1, alignItems: 'flex-end' }}>
                <TouchableOpacity
                    onPress={() => {
                        onSelect(!isSelected, item);
                    }}
                    style={{ padding: 10 }}
                >
                    <MaterialCommunityIcons
                        name={isSelected ? "checkbox-marked" : "checkbox-blank-outline"}
                        size={25}
                        color={theme.text}
                    />
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default ItemCard;