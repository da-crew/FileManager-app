import React, { useState } from "react";
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View, StatusBar } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';

interface SearchItem {
    id: string;
    title: string;
}

const SearchScreen = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<SearchItem[]>([]);

    const handleSearch = (text: string) => {
        setSearchQuery(text);
        
        const mockResults: SearchItem[] = [
            { id: '1', title: 'ผลการค้นหา 1' },
            { id: '2', title: 'ผลการค้นหา 2' },
            { id: '3', title: 'ผลการค้นหา 3' },
        ];
        setSearchResults(mockResults.filter(item => 
            item.title.toLowerCase().includes(text.toLowerCase())
        ));
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar/>
            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="ค้นหา..."
                    value={searchQuery}
                    onChangeText={handleSearch}
                />
            </View>
            <FlatList<SearchItem>
                data={searchResults}
                renderItem={({ item }) => (
                    <TouchableOpacity style={styles.resultItem}>
                        <Text>{item.title}</Text>
                    </TouchableOpacity>
                )}
                keyExtractor={item => item.id}
                ListEmptyComponent={() => (
                    <View style={styles.emptyContainer}>
                        <Text>ไม่พบผลการค้นหา</Text>
                    </View>
                )}
            />
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

export default SearchScreen;