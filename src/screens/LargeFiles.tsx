import React, { useState } from "react";
import { SafeAreaView, View, Text, FlatList, TouchableOpacity, StyleSheet, StatusBar } from "react-native";
import AntDesign from "@expo/vector-icons/AntDesign";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useNavigation } from "@react-navigation/native";
import { FontAwesome5 } from '@expo/vector-icons';

// ตัว Toolbar และ SelectionToolBar (ถ้ายังไม่มีให้สร้าง)
import Toolbar from "../components/Toolbar"; 
import SelectionToolBar from "../components/SelectionToolbar";

// กำหนด type สำหรับไฟล์
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
        setSelectedItems((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />

            { !isSelecting ? (
                <Toolbar
                    navigation={navigation}
                    containerName="Find Large Files"
                    sortByHandler={() => console.log("Sort files")}
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
                            style={styles.itemRow} 
                            onPress={() => {
                                toggleSelect(item.id);
                                setIsSelecting(true);
                            }}
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
                                color="red"
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
        backgroundColor: "#fff"
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#000",
        backgroundColor: "#fff",
        justifyContent: "space-between"
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "black",
        flex: 1,
        marginHorizontal: 10,
    },
    headerRightIcons: {
        flexDirection: "row",
        alignItems: "center"
    },
    infoContainer: {
        alignItems: "center",
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: "#ccc"
    },
    largeText: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 5,
        color: "black"
    },
    subText: {
        fontSize: 14,
        color: "#555",
        textAlign: "center",
        marginHorizontal: 20
    },
    listContainer: {
        paddingHorizontal: 16,
        paddingVertical: 10
    },
    itemRow: {
        flexDirection: "row",
        alignItems: "center",
        borderBottomWidth: 1,
        borderBottomColor: "#ccc",
        paddingVertical: 12
    },
    fileName: {
        fontSize: 16,
        fontWeight: "bold",
        color: "black"
    },
    fileSize: {
        fontSize: 13,
        color: "#888",
        marginTop: 4
    }
});
