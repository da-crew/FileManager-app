import React, { useState } from "react";
import { SafeAreaView, View, Text, FlatList, TouchableOpacity, StyleSheet, StatusBar } from "react-native";
import AntDesign from "@expo/vector-icons/AntDesign";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useNavigation } from "@react-navigation/native";
import { FontAwesome5 } from '@expo/vector-icons';
import { useTheme } from '../components/ThemeContext';
// กำหนด type สำหรับไฟล์ใหญ่
interface LargeFile {
    id: string;
    fileName: string;
    size: string;
}

export default function LargeFiles() {
    const navigation = useNavigation();
    const { theme } = useTheme();

    // กำหนด type ให้ state ของ largeFiles
    const [largeFiles, setLargeFiles] = useState<LargeFile[]>([
        {
            id: "1",
            fileName: "20241117_11154.mp4",
            size: "279 MB"
        },
        {
            id: "2",
            fileName: "20241117_11140.mp4",
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

    const renderItem = ({ item }: { item: LargeFile }) => {
        const isSelected = selectedItems.includes(item.id);

        return (
            <TouchableOpacity style={[styles.itemRow, { borderBottomColor: theme.border }]} onPress={() => toggleSelect(item.id)}>
                <MaterialCommunityIcons
                    name={isSelected ? "checkbox-marked" : "checkbox-blank-outline"}
                    size={24}
                    color={theme.primary}
                    style={{ marginRight: 10 }}
                />

                <MaterialCommunityIcons
                    name="file-pdf-box"
                    size={40}
                    color={theme.primary}
                    style={{ marginRight: 10 }}
                />

                <View style={{ flex: 1 }}>
                    <Text style={[styles.fileName, { color: theme.text }]}>{item.fileName}</Text>
                    <Text style={[styles.fileSize, { color: theme.textSecondary }]}>{item.size}</Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <StatusBar barStyle="dark-content" backgroundColor={theme.background} /> 

            <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <AntDesign name="left" size={24} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text }]}>Find Large Files</Text>
                <View style={styles.headerRightIcons}>
                    <AntDesign name="search1" size={24} color={theme.text} style={{ marginRight: 15 }} />
                    <AntDesign name="appstore-o" size={24} color={theme.text} style={{ marginRight: 15 }} />
                    <FontAwesome5 name="sort" size={24} color={theme.text} />
                </View>
            </View>

            <View style={[styles.infoContainer, { borderBottomColor: theme.border }]}>
                <MaterialCommunityIcons
                    name="file-document-outline"
                    size={60}
                    color={theme.text}
                    style={{ marginBottom: 10 }}
                />
                <Text style={[styles.largeText, { color: theme.text }]}>2 Large Files(0.92 GB)</Text>
                <Text style={[styles.subText, { color: theme.textSecondary }]}>
                    Quickly free up space by deleting large files or moving them to another storage location.
                </Text>
            </View>

            <FlatList<LargeFile>
                data={largeFiles}
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
