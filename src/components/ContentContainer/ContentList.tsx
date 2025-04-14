import React from "react";
import { SafeAreaView, View, StatusBar, Text, ScrollView, TouchableOpacity, Modal, GestureResponderEvent, Alert, BackHandler, FlatList, StyleSheet, Dimensions, ActivityIndicator } from "react-native";
import ItemCard from "../ItemCard";
import * as RNFS from "react-native-fs"

interface ContentListProps {
    content: RNFS.ReadDirItem[] | null;
    selectionSet: Set<RNFS.ReadDirItem>;
    handleSelect: (select: boolean, item: RNFS.ReadDirItem) => void;
    handleOpen: (item: RNFS.ReadDirItem) => void;
}

export const ContentList = ({content, selectionSet, handleSelect, handleOpen}: ContentListProps) => {
    if (content) {
        if (content.length == 0) {
            return (<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ fontSize: 15 }}>Empty</Text>
            </View>);
        }
        return (
            <FlatList
                data={content}
                keyExtractor={(item, i) => item + i.toString()}
                renderItem={({ item }) =>
                    <ItemCard item={item}
                        onSelect={handleSelect}
                        onOpen={handleOpen}
                        isSelected={selectionSet.has(item)}
                    />
                }
            />
        );
    } else if (content === null) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text style={styles.loaderText}>Loading files...</Text>
            </View>
        );
    } else {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ fontSize: 15 }}>Loading</Text>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loaderText: {
        marginTop: 10,
        fontSize: 16,
        color: '#444',
    },
});