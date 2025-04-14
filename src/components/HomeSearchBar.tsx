import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Octicons, Ionicons } from '@expo/vector-icons';
import { NavigationProp } from '@react-navigation/native';
import { Path } from '../FileSystem';
import { ContainerType } from './ContentContainer/common';
import RNFS from 'react-native-fs';

/**
 * คอมโพเนนต์แถบค้นหาสำหรับหน้าหลัก แสดงไอคอนค้นหาและไอคอนการตั้งค่า
 * Home search bar component that displays search and settings icons
 */
export interface HomeSearchBarProps {
    /**
     * navigation prop สำหรับการนำทางไปยังหน้าอื่นๆ
     * Navigation prop for navigating to other screens
     */
    navigation: NavigationProp<any>;
}

const HomeSearchBar: React.FC<HomeSearchBarProps> = ({ navigation }) => {
    const handleSearch = () => {
        const rootPath = new Path('Internal Storage', RNFS.ExternalStorageDirectoryPath, []);
        navigation.navigate("Search", {
            containerName: 'Internal Storage',
            path: rootPath,
            containerType: ContainerType.DEFAULT
        });
    };

    return (
        <View style={{ padding: 20, paddingBottom: 0 }}>
            <View style={{ flexDirection: 'row' }}>
                <TouchableOpacity
                    style={{ marginLeft: 'auto' }}
                    onPress={handleSearch}
                >
                    <Ionicons name="search" size={24} color={theme.text} />
                </TouchableOpacity>
                <TouchableOpacity
                    style={{ marginLeft: 10 }}
                    onPress={() => navigation.navigate("Settings")}
                >
                    <Octicons name="gear" size={24} color={theme.text} />
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default HomeSearchBar;
