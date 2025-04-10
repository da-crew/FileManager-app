import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useEffect, useState, useCallback } from "react";
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View, StatusBar } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from "../App";
import * as RNFS from 'react-native-fs';

import { ContainerType, ContentContainerRouteParams, MovingState, SortType } from "../components/ContentContainer/common";
import ContentList from "../components/ContentContainer/ContentList";
import { getFileType, openWith } from "../utils/openWith";

// interface SearchItem {
//     id: string;
//     title: string;
// }

export default function SearchScreen({ route, navigation }: NativeStackScreenProps<RootStackParamList>) {
    const routeParams = route.params as ContentContainerRouteParams;
    const storageName = routeParams.containerName;
    const containerType = routeParams.containerType;

    const [{ selectionSet, isSelecting }, updateSelectionState] = useState<{ selectionSet: Set<RNFS.ReadDirItem>, isSelecting: boolean }>({ selectionSet: new Set(), isSelecting: false });
    const [movingState, setMovingState] = useState<MovingState | null>(null);

    const [searchQuery, setSearchQuery] = useState('');

    const [sortType, setSortType] = useState(SortType.ALPHABETICAL);//ContentContainer
    const [navpath, setNavPath] = useState(routeParams.path);

    const [searchResults, setSearchResults] = useState<RNFS.ReadDirItem[]>([]);
    const [content, setContent] = useState<RNFS.ReadDirItem[] | null>(null);//ContentContainer

    //function fetchContent() {//ContentContainer
    const fetchContent = useCallback(() => {
        setContent(null);
        RNFS.readDir(navpath.build())
            .then((items) => {
                const sortHandler = (a: RNFS.ReadDirItem, b: RNFS.ReadDirItem) => {
                    switch (sortType) {
                        case SortType.ALPHABETICAL:
                            return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
                        case SortType.DATE:
                            return (b.mtime?.getTime() ?? 0) - (a.mtime?.getTime() ?? 0);
                        default:
                            return 0;
                    }
                };
                let hiddenFolders = items.filter((item) => item.isDirectory() && item.name.startsWith("."));
                let folders = items.filter((item) => item.isDirectory() && !item.name.startsWith(".")).sort(sortHandler);
                let files = items.filter((item) => item.isFile()).sort(sortHandler);
                setContent(hiddenFolders.concat(folders).concat(files));
            })
            .catch(() => {
                console.log("An error occured");
            });
    }, [navpath, sortType]);

    useEffect(() => {
        fetchContent();
    }, [fetchContent]);

    function handleOpen(item: RNFS.ReadDirItem): void {//ContentContainer
        if (item.isFile()) {
            console.log("Open file", item.name);
            if (getFileType(item) == "text/plain") {
                console.log("Open Text editor", navpath.build())
                navpath.nodes.push(item.name);
                navigation.navigate("TextEditor", {
                    containerName: storageName,
                    path: navpath,
                    containerType: ContainerType.DEFAULT
                });
            }
            else {
                openWith(item.path, getFileType(item));
            }
        } else if (item.isDirectory()) {//modify
            navpath.nodes.push(item.name);
            console.log("Open directory", navpath.build());
            setNavPath(navpath);
            navigation.navigate("Container", {
                containerName: storageName,
                path: navpath,
                containerType: ContainerType.DEFAULT
            });
        }
    }

    function handleSelect(select: boolean, item: RNFS.ReadDirItem) {
        if (select) {
            selectionSet.add(item);
        } else {
            selectionSet.delete(item);
        }
        updateSelectionState({ selectionSet, isSelecting: selectionSet.size > 0 });
    }

    function unselectAll() {
        updateSelectionState({ selectionSet: new Set(), isSelecting: false })
    }
    const handleSearch = (text: string) => {
        setSearchQuery(text);
        // const mockResults: SearchItem[] = [
        //     { id: '1', title: 'Search Results 1' },
        // ];
        setSearchResults(content?.filter(item =>
            item.name.toLowerCase().includes(text.toLowerCase())
        ) ?? []);
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar />
            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="search..."
                    value={searchQuery}
                    onChangeText={handleSearch}
                />
            </View>
            <View style={{ margin: 10, flex: 1 }}>{/* ContentContainer */}
                <ContentList content={searchResults} handleOpen={handleOpen} handleSelect={handleSelect} selectionSet={selectionSet} />
            </View>
        </SafeAreaView>
    );
};
const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingVertical: 16,
        paddingHorizontal: 14,
        marginTop: 20,
    },
    searchContainer: {
        marginBottom: 16,
    },
    searchInput: {
        height: 40,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 12,
        backgroundColor: '#fff',
    },
    resultItem: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        backgroundColor: '#fff',
    },
    emptyContainer: {
        padding: 16,
        alignItems: 'center',
    },
});
