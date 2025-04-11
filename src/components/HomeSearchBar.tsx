import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Octicons, Ionicons } from '@expo/vector-icons';
import { useTheme } from '../components/ThemeContext';
import { NavigationProp } from '@react-navigation/native';

export interface HomeSearchBarProps {
    navigation: NavigationProp<any>;
}

const HomeSearchBar: React.FC<HomeSearchBarProps> = ({ navigation }) => {
    const { theme } = useTheme();
    return (
        <View style={{ padding: 20, paddingBottom: 0 }}>
            <View style={{ flexDirection: 'row' }}>
                <TouchableOpacity
                    style={{ marginLeft: 'auto' }}
                    onPress={() => navigation.navigate("Search")}
                >
                    <Ionicons name="search" size={24} color={theme.iconColor} />
                </TouchableOpacity>
                <TouchableOpacity
                    style={{ marginLeft: 10 }}
                    onPress={() => navigation.navigate("Settings")}
                >
                    <Octicons name="gear" size={24} color={theme.iconColor}/>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default HomeSearchBar;
