import React, { useState } from "react";
import { SafeAreaView, View, Text, TouchableOpacity, StyleSheet, StatusBar, ScrollView, Platform } from "react-native";
import { useNavigation } from "@react-navigation/native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import AntDesign from "@expo/vector-icons/AntDesign";

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

    const toggleSelect = (id: string) => {
        setSelectedItems((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />
            <View style={styles.header}>
                <TouchableOpacity 
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                >
                    <AntDesign name="left" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Large Files</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.sectionHeader}>Large Files Found</Text>
                <View style={styles.sectionContainer}>
                    {largeFiles.map((item) => {
                        const isSelected = selectedItems.includes(item.id);
                        
                        return (
                            <TouchableOpacity
                                key={item.id}
                                style={styles.row}
                                onPress={() => toggleSelect(item.id)}
                            >
                                <View style={styles.rowContent}>
                                    <MaterialCommunityIcons
                                        name="file-video"
                                        size={24}
                                        color="#666"
                                        style={styles.rowIcon}
                                    />
                                    <View>
                                        <Text style={styles.label}>{item.fileName}</Text>
                                        <Text style={styles.subLabel}>{item.size}</Text>
                                    </View>
                                </View>
                                <MaterialCommunityIcons
                                    name={isSelected ? "checkbox-marked" : "checkbox-blank-outline"}
                                    size={24}
                                    color="#007AFF"
                                />
                            </TouchableOpacity>
                        );
                    })}
                </View>

                <Text style={styles.sectionHeader}>Filter Options</Text>
                <View style={styles.sectionContainer}>
                    <TouchableOpacity
                        style={styles.row}
                        onPress={() => console.log("Filter by size")}
                    >
                        <View style={styles.rowContent}>
                            <MaterialCommunityIcons name="filter" size={24} color="#666" style={styles.rowIcon} />
                            <Text style={styles.label}>Filter by Size</Text>
                        </View>
                        <AntDesign name="right" size={18} color="#C7C7CC" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.row}
                        onPress={() => console.log("Filter by type")}
                    >
                        <View style={styles.rowContent}>
                            <MaterialCommunityIcons name="file-multiple" size={24} color="#666" style={styles.rowIcon} />
                            <Text style={styles.label}>Filter by Type</Text>
                        </View>
                        <AntDesign name="right" size={18} color="#C7C7CC" />
                    </TouchableOpacity>
                </View>

                <Text style={styles.sectionHeader}>Actions</Text>
                <View style={styles.sectionContainer}>
                    <TouchableOpacity
                        style={styles.row}
                        onPress={() => console.log("Delete selected files")}
                    >
                        <View style={styles.rowContent}>
                            <MaterialCommunityIcons name="delete" size={24} color="#666" style={styles.rowIcon} />
                            <Text style={styles.label}>Delete Selected Files</Text>
                        </View>
                        <AntDesign name="right" size={18} color="#C7C7CC" />
                    </TouchableOpacity>
                </View>
            </ScrollView>
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
    }
});
