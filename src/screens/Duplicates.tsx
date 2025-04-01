import React, { useState } from "react";
import { SafeAreaView, View, Text, FlatList, TouchableOpacity, StyleSheet, StatusBar, Platform } from "react-native";
import { useNavigation } from "@react-navigation/native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import Toolbar from "../components/Toolbar";
import SelectionToolBar from '../components/SelectionToolbar';

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
                            style={styles.row}
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
        backgroundColor: "#F2F2F7"
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderBottomColor: "#E5E5EA",
        marginTop: Platform.OS === 'ios' ? 0 : 20
    },
    backButton: {
        padding: 8
    },
    headerTitle: {
        fontSize: 17,
        fontWeight: "600",
        color: "#000",
        flex: 1,
        textAlign: 'center'
    },
    content: {
        padding: 16
    },
    sectionHeader: {
        fontSize: 13,
        fontWeight: "600",
        marginTop: 20,
        marginBottom: 8,
        color: "#8E8E93",
        textTransform: 'uppercase',
        letterSpacing: 0.5
    },
    sectionContainer: {
        backgroundColor: "#fff",
        borderRadius: 10,
        overflow: 'hidden'
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
    rowContent: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1
    },
    rowIcon: {
        marginRight: 12
    },
    label: {
        fontSize: 17,
        color: "#000"
    },
    subLabel: {
        fontSize: 13,
        color: "#8E8E93",
        marginTop: 2
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
