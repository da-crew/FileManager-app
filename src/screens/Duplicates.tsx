import React, { useState } from "react";
import {SafeAreaView,View,Text,FlatList,TouchableOpacity,StyleSheet,StatusBar} from "react-native";
import { AntDesign, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { FontAwesome5 } from '@expo/vector-icons';

export default function DuplicateFiles() {

    return (
        <SafeAreaView>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />
            <Text>Duplicate File Scanner Screen</Text>
        </SafeAreaView>
    );
}
