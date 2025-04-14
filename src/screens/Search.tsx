import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useEffect, useState, useCallback } from "react";
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View, StatusBar, BackHandler } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from "../App";
import * as RNFS from 'react-native-fs';
import { MaterialIcons } from '@expo/vector-icons';
import { Path } from "../FileSystem";

import { ContainerType, ContentContainerRouteParams, MovingState, SortType } from "../components/ContentContainer/common";
import { ContentList } from "../components/ContentContainer/ContentList";
import { getFileType, openWith } from "../utils/openWith";

export default function SearchScreen({ route, navigation }: NativeStackScreenProps<RootStackParamList>) {
    const routeParams = route.params as ContentContainerRouteParams;
    const storageName = routeParams?.containerName;
    const containerType = routeParams.containerType;
    const currentPath = routeParams.path;

    const [{ selectionSet, isSelecting }, updateSelectionState] = useState<{ selectionSet: Set<RNFS.ReadDirItem>, isSelecting: boolean }>({ selectionSet: new Set(), isSelecting: false });
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<RNFS.ReadDirItem[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    function handleGoBack() {
        // ล้างข้อมูลการค้นหา
        setSearchQuery('');
        setSearchResults([]);
        
        // ถ้าอยู่ในระดับ Device Storage หรือ Internal Storage ให้กลับไปหน้า Home
        if (storageName === 'Device Storage' || storageName === 'Internal Storage') {
            navigation.navigate("Home");
            return;
        }
        
        // กลับไปยังหน้าเดิมโดยใช้ path ที่ถูกต้อง
        if (currentPath) {
            navigation.navigate("Container", {
                containerName: storageName,
                path: currentPath,
                containerType: containerType
            });
        } else {
            // ถ้าไม่มี path ให้กลับไปหน้า Home
            navigation.navigate("Home");
        }
    }

    // ฟังก์ชันค้นหา
    const handleSearch = async (text: string) => {
        setSearchQuery(text);
        if (text.trim() === '') {
            setSearchResults([]);
            return;
        }

        setIsSearching(true);
        try {
            // ตรวจสอบและใช้ path ที่ถูกต้อง
            const searchPath = routeParams?.path?.build() || RNFS.ExternalStorageDirectoryPath;
            console.log('Searching in path:', searchPath);
            
            // ค้นหาเฉพาะในโฟลเดอร์ปัจจุบัน
            const items = await RNFS.readDir(searchPath);
            console.log('Found items:', items.length);
            
            const results = items.filter(item => 
                item.name.toLowerCase().includes(text.toLowerCase())
            );
            console.log('Search results:', results.length);
            
            setSearchResults(results);
        } catch (error) {
            console.error('Search error:', error);
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    };

    function handleOpen(item: RNFS.ReadDirItem): void {
        if (item.isFile()) {
            if (getFileType(item) == "text/plain") {
                // สำหรับไฟล์ข้อความ
                navigation.navigate("TextEditor", {
                    containerName: storageName,
                    path: new Path(storageName, item.path, []),
                    containerType: ContainerType.DEFAULT
                });
            } else {
                // สำหรับไฟล์อื่นๆ
                openWith(item.path, getFileType(item));
            }
        } else if (item.isDirectory()) {
            // เก็บ path ของโฟลเดอร์ที่จะเปิด
            const folderPath = item.path;
            console.log('Opening folder with path:', folderPath);
            
            // ใช้ path เต็มของโฟลเดอร์
            navigation.navigate("Container", {
                containerName: storageName,
                path: new Path(storageName, folderPath, []),
                containerType: ContainerType.DEFAULT
            });
        }
    }

    return (
        <SafeAreaView style={{ flex: 1, paddingVertical: 16, paddingHorizontal: 14, marginTop: 0 }}>
            <StatusBar />
            <View style={{ marginBottom: 16, flexDirection: 'row', alignItems: 'center' }}>
                <TouchableOpacity onPress={handleGoBack} style={{ marginRight: 8 }}>
                    <MaterialIcons name="arrow-back-ios-new" size={20} color="#000" />
                </TouchableOpacity>
                <TextInput
                    style={{ flex: 1, height: 40, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 12, backgroundColor: '#fff' }}
                    placeholder="Search files and folders..."
                    value={searchQuery}
                    onChangeText={handleSearch}
                    autoFocus={true}
                />
            </View>
            <View style={{ margin: 10, flex: 1, backgroundColor: 'transparent' }}>
                {isSearching ? (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <MaterialIcons name="search" size={40} color="#999" />
                        <Text style={{ marginTop: 10, color: '#999' }}>Searching...</Text>
                    </View>
                ) : searchResults.length > 0 ? (
                    <ContentList 
                        content={searchResults} 
                        handleOpen={handleOpen} 
                        handleSelect={() => {}} 
                        selectionSet={new Set()}
                        hideCheckbox={true}  
                    />
                ) : searchQuery ? (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <MaterialIcons name="search-off" size={40} color="#999" />
                        <Text style={{ marginTop: 10, color: '#999' }}>No results found</Text>
                    </View>
                ) : null}
            </View>
        </SafeAreaView>
    );
}
