
import React, { useState } from "react";
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View, StatusBar } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';

const SearchScreen = () => {
    return (
        <SafeAreaView style={styles.container}>
            <StatusBar/>
        </SafeAreaView>
    );
};


const styles = StyleSheet.create({
    container: { flex: 1, 
        paddingVertical: 16,  // Keep vertical padding
        paddingHorizontal: 14, // Add horizontal padding 
        marginTop: 20,
        },
});

export default SearchScreen; 