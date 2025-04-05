import React, { useState } from "react";
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View, StatusBar } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../components/ThemeContext';

interface SearchItem {
    id: string;
    title: string;
}

const SearchScreen = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<SearchItem[]>([]);
    const { theme } = useTheme();
    const handleSearch = (text: string) => {
        setSearchQuery(text);
        
        const mockResults: SearchItem[] = [
            { id: '1', title: 'Search Results 1' },
        ];
        setSearchResults(mockResults.filter(item => 
            item.title.toLowerCase().includes(text.toLowerCase())
        ));
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <StatusBar />
            <View style={styles.searchContainer}>
                <TextInput
                    style={[styles.searchInput, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
                    placeholder="search..."
                    placeholderTextColor={theme.textSecondary}
                    value={searchQuery}
                    onChangeText={handleSearch}
                />
            </View>
            <FlatList<SearchItem>
                data={searchResults}
                renderItem={({ item }) => (
                    <TouchableOpacity style={[styles.resultItem, { backgroundColor: theme.card }]}>
                        <Text style={{ color: theme.text }}>{item.title}</Text>
                    </TouchableOpacity>
                )}
                keyExtractor={item => item.id}
                ListEmptyComponent={() => (
                    <View style={styles.emptyContainer}>
                        <Text style={{ color: theme.textSecondary }}>No search results found.</Text>
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