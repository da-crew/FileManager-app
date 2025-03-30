import React, { useState } from "react";
import { SafeAreaView, View, Text, FlatList, TouchableOpacity, StyleSheet, StatusBar } from "react-native";
import { useNavigation } from "@react-navigation/native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import Toolbar from "../components/Toolbar";
import SelectionToolBar from "../components/SelectionToolbar";

// กำหนด type สำหรับไฟล์ซ้ำ
interface DuplicateFile {
    id: string;
    fileName: string;
    size: string;
}

export default function Duplicates() {
    const navigation = useNavigation();
    const [duplicateFiles, setDuplicateFiles] = useState<DuplicateFile[]>([
        { id: "1", fileName: "Report_2024.pdf", size: "5.2 MB" },
        { id: "2", fileName: "Invoice_001.pdf", size: "3.1 MB" },
        { id: "3", fileName: "Backup_2023.zip", size: "1.8 GB" },
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

            {!isSelecting ? (
                <Toolbar
                    navigation={navigation}
                    containerName="Duplicate Files"
                    sortByHandler={() => console.log("Sort Duplicates")}
                />
            ) : (
                <SelectionToolBar
                    onCancel={() => {
                        setIsSelecting(false);
                        setSelectedItems([]);
                    }}
                    onSelectAll={() => {
                        if (duplicateFiles.length === selectedItems.length) {
                            setSelectedItems([]);
                        } else {
                            setSelectedItems(duplicateFiles.map(file => file.id));
                        }
                    }}
                    count={selectedItems.length}
                    maxCount={duplicateFiles.length}
                />
            )}

            <FlatList
                data={duplicateFiles}
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
                                name="file-document"
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
    storageButtonContainer: {
        flexDirection: "row",
        marginTop: 10
    },
    storageButton: {
        backgroundColor: "gray",
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 5,
        marginHorizontal: 5
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
