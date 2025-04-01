import React, { useState } from "react";
import { SafeAreaView, View, Text, FlatList, StyleSheet, StatusBar } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Toolbar from "../components/Toolbar";
import SelectionToolBar from '../components/SelectionToolbar';
import ItemCard from '../components/ItemCard';
import * as RNFS from "react-native-fs";

interface FileItem {
    name: string;
    path: string;
    size: number;
    mtime: Date;
    ctime: Date;
    isFile: () => boolean;
    isDirectory: () => boolean;
    isSymbolicLink: () => boolean;
    type: string;
}

export default function Duplicates() {
    const navigation = useNavigation();
    const [duplicateFiles, setDuplicateFiles] = useState<FileItem[]>([
        // ตัวอย่างข้อมูล
        {
            name: "Report_2024.pdf",
            path: "/path/to/file1",
            size: 5.2 * 1024 * 1024, // 5.2 MB in bytes
            mtime: new Date(),
            ctime: new Date(),
            isFile: () => true,
            isDirectory: () => false,
            isSymbolicLink: () => false,
            type: "file"
        },
        {
            name: "Invoice_001.pdf",
            path: "/path/to/file2",
            size: 3.1 * 1024 * 1024, // 3.1 MB in bytes
            mtime: new Date(),
            ctime: new Date(),
            isFile: () => true,
            isDirectory: () => false,
            isSymbolicLink: () => false,
            type: "file"
        },
        {
            name: "Backup_2023.zip",
            path: "/path/to/file3",
            size: 1.8 * 1024 * 1024 * 1024, // 1.8 GB in bytes
            mtime: new Date(),
            ctime: new Date(),
            isFile: () => true,
            isDirectory: () => false,
            isSymbolicLink: () => false,
            type: "file"
        }
    ]);

    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    const [isSelecting, setIsSelecting] = useState(false);

    const handleSelect = (selected: boolean, item: FileItem) => {
        if (!isSelecting) setIsSelecting(true);
        setSelectedItems(prev => 
            selected 
                ? [...prev, item.path]
                : prev.filter(path => path !== item.path)
        );
    };

    const handleOpen = (item: FileItem) => {
        // Handle file opening
        console.log("Opening file:", item.name);
    };

    const handleItemSelect = (selected: boolean, item: RNFS.ReadDirItem) => {
        handleSelect(selected, item as unknown as FileItem);
    };

    const handleItemOpen = (item: RNFS.ReadDirItem) => {
        handleOpen(item as unknown as FileItem);
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
                            setSelectedItems(duplicateFiles.map(file => file.path));
                        }
                    }}
                    count={selectedItems.length}
                    maxCount={duplicateFiles.length}
                />
            )}

            <FlatList
                data={duplicateFiles}
                keyExtractor={(item) => item.path}
                renderItem={({ item }) => (
                    <ItemCard
                        item={item as unknown as RNFS.ReadDirItem}
                        onSelect={handleItemSelect}
                        onOpen={handleItemOpen}
                        isSelected={selectedItems.includes(item.path)}
                    />
                )}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F2F2F7"
    }
});
