import React from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from "react-native";
import ItemCard from "../ItemCard";
import * as RNFS from "react-native-fs";
import { useTheme } from "../ThemeContext";

interface ContentListProps {
    content: RNFS.ReadDirItem[] | null;
    selectionSet: Set<RNFS.ReadDirItem>;
    handleSelect: (select: boolean, item: RNFS.ReadDirItem) => void;
    handleOpen: (item: RNFS.ReadDirItem) => void;
}

export default function ContentList({ content, selectionSet, handleSelect, handleOpen }: ContentListProps) {
    const { theme } = useTheme();

    const styles = StyleSheet.create({
        view: { flex: 1, justifyContent: 'center', alignItems: 'center' },
        text: { fontSize: 15, color: theme.text },
        loaderContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
        },
        loaderText: {
            marginTop: 10,
            fontSize: 16,
            color: theme.textSecondary,
        },
        background: {
            backgroundColor: theme.background,
            flex: 1,
        },
    });

    if (content) {
        if (content.length === 0) {
            return (
                <View style={styles.view}>
                    <Text style={styles.text}>No files found</Text>
                </View>
            );
        }
        return (
            <View style={styles.background}>
                <FlatList
                    data={content}
                    keyExtractor={(item, i) => item.path + i.toString()}
                    renderItem={({ item }) => (
                        <ItemCard
                            item={item}
                            onSelect={handleSelect}
                            onOpen={handleOpen}
                            isSelected={selectionSet.has(item)}
                        />
                    )}
                />
            </View>
        );
    } else if (content === null) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color={theme.text} />
                <Text style={styles.loaderText}>Loading files...</Text>
            </View>
        );
    } else {
        return (
            <View style={styles.view}>
                <Text style={styles.text}>Loading</Text>
            </View>
        );
    }
}