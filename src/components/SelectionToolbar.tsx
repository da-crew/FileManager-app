import React from 'react';
import { View, Text, TouchableOpacity, GestureResponderEvent } from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../components/ThemeContext';

interface SelectionToolBarProps {
    onCancel?: (event: GestureResponderEvent) => void,
    onSelectAll?: (event: GestureResponderEvent) => void,
    count: number,
    maxCount: number,
}

export default function SelectionToolBar({ onCancel, onSelectAll, count, maxCount }: SelectionToolBarProps) {
    const { theme } = useTheme();
    return <View style={{backgroundColor: theme.background }}>
        <View style={{marginHorizontal: 5, flexDirection: 'row', alignItems: 'center', }}>
            <TouchableOpacity style={{ padding: 15, }} onPress={onCancel}>
                <MaterialCommunityIcons name="cancel" size={20} color={theme.text} />
            </TouchableOpacity>
            <Text style={{ fontSize: 20, marginLeft: 10, color: theme.text }}>{count}/{maxCount}</Text>
            <TouchableOpacity style={{ marginLeft: 'auto', marginRight: 15 }} onPress={onSelectAll}>
                <MaterialIcons name="select-all" size={24} color={theme.text} />
            </TouchableOpacity>
        </View>
    </View>
}