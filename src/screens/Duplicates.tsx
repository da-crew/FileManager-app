import React, { useState } from "react";
import { SafeAreaView, View, Text, FlatList, TouchableOpacity, StyleSheet, StatusBar } from "react-native";
import { AntDesign, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { FontAwesome5 } from '@expo/vector-icons';

// กำหนด type สำหรับไฟล์ซ้ำ
interface DuplicateFile {
    id: string;
    fileName: string;
    size: string;
}

export default function DuplicateFiles() {
    const navigation = useNavigation();

    // กำหนด type ให้ state ของ duplicateFiles
    const [duplicateFiles, setDuplicateFiles] = useState<DuplicateFile[]>([
        {
            id: "1",
            fileName: "20241117_11154.mp4",
            size: "279 MB"
        },
        {
            id: "2",
            fileName: "20241117_11154.mp4",
            size: "279 MB"
        }
    ]);

    // กำหนด type ให้ selectedItems
    const [selectedItems, setSelectedItems] = useState<string[]>([]);

    const toggleSelect = (id: string) => {
        setSelectedItems((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        );
    };

    const renderItem = ({ item }: { item: DuplicateFile }) => {
        const isSelected = selectedItems.includes(item.id);

        return (
            <TouchableOpacity style={styles.itemRow} onPress={() => toggleSelect(item.id)}>
                <MaterialCommunityIcons
                    name={isSelected ? "checkbox-marked" : "checkbox-blank-outline"}
                    size={24}
                    color="black"
                    style={{ marginRight: 10 }}
                />
                <MaterialCommunityIcons
                    name="file-video-outline"
                    size={40}
                    color="black"
                    style={{ marginRight: 10 }}
                />
                <View style={{ flex: 1 }}>
                    <Text style={styles.fileName}>{item.fileName}</Text>
                    <Text style={styles.fileSize}>{item.size}</Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <AntDesign name="left" size={24} color="black" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Find Duplicate Files</Text>
                <View style={styles.headerRightIcons}>
                    <AntDesign name="search1" size={24} color="black" style={{ marginRight: 15 }} />
                    <AntDesign name="appstore-o" size={24} color="black" style={{ marginRight: 15 }} />
                    <FontAwesome5 name="sort" size={24} color="black" />
                </View>
            </View>

            <View style={styles.infoContainer}>
                <MaterialCommunityIcons
                    name="file-document-outline"
                    size={60}
                    color="black"
                    style={{ marginBottom: 10 }}
                />
                <Text style={styles.largeText}>2 Duplicate Files(0.92 GB)</Text>
                <Text style={styles.subText}>
                    Free up space by deleting redundant files and keeping original files.
                </Text>
            </View>

            <FlatList<DuplicateFile>
                data={duplicateFiles}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.listContainer}
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
