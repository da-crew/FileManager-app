import React, { useState } from "react";
import { SafeAreaView, View, Text, FlatList, TouchableOpacity, StyleSheet, StatusBar, Platform } from "react-native";
import { useNavigation } from "@react-navigation/native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import Toolbar from "../components/Toolbar";
import SelectionToolBar from '../components/SelectionToolbar';

interface LargeFile {
    id: string;
    fileName: string;
    size: string;
}

export default function LargeFiles() {
    const navigation = useNavigation();
    const [largeFiles, setLargeFiles] = useState<LargeFile[]>([
        { id: "1", fileName: "20241117_11154.mp4", size: "279 MB" },
        { id: "2", fileName: "20241117_11140.mp4", size: "279 MB" }
    ]);
    
    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    const [isSelecting, setIsSelecting] = useState(false);

    const toggleSelect = (id: string) => {
        if (!isSelecting) setIsSelecting(true);
        setSelectedItems((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />

            {!isSelecting ? (
                <Toolbar
                    navigation={navigation}
                    containerName="Large Files"
                    sortByHandler={() => console.log("Sort Large Files")}
                />
            ) : (
                <SelectionToolBar
                    onCancel={() => {
                        setIsSelecting(false);
                        setSelectedItems([]);
                    }}
                    onSelectAll={() => {
                        if (largeFiles.length === selectedItems.length) {
                            setSelectedItems([]);
                        } else {
                            setSelectedItems(largeFiles.map(file => file.id));
                        }
                    }}
                    count={selectedItems.length}
                    maxCount={largeFiles.length}
                />
            )}

            <FlatList
                data={largeFiles}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => {
                    const isSelected = selectedItems.includes(item.id);
                    
                    return (
                        <TouchableOpacity
                            style={styles.row}
                            onPress={() => toggleSelect(item.id)}
                        >
                            <MaterialCommunityIcons
                                name={isSelected ? "checkbox-marked" : "checkbox-blank-outline"}
                                size={24}
                                color="black"
                                style={{ marginRight: 10 }}
                            />
                            <MaterialCommunityIcons
                                name="file-video"
                                size={40}
                                color="blue"
                                style={{ marginRight: 10 }}
                            />
                            <View style={{ flex: 1 }}>
                                <Text style={styles.fileName}>{item.fileName}</Text>
                                <Text style={styles.fileSize}>{item.size}</Text>
                            </View>
                        </TouchableOpacity>
                    );
                }}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F2F2F7"
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#E5E5EA"
    },
    fileName: {
        fontSize: 16,
        color: "#000",
        marginBottom: 4
    },
    fileSize: {
        fontSize: 14,
        color: "#8E8E93"
    }
});
