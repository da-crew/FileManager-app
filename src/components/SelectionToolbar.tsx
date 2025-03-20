import React from 'react';
import { View, Text, TouchableOpacity, GestureResponderEvent } from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';

interface SelectionToolBarProps {
    onCancel?: (event: GestureResponderEvent) => void,
    onSelectAll?: (event: GestureResponderEvent) => void,
    count: number,
    maxCount: number,
}

export default function SelectionToolBar({ onCancel, onSelectAll, count, maxCount }: SelectionToolBarProps) {
    return <View style={{backgroundColor: '#d9d9d9' }}>
        <View style={{marginHorizontal: 5, flexDirection: 'row', alignItems: 'center', }}>
            <TouchableOpacity style={{ padding: 15, }} onPress={onCancel}>
                <MaterialCommunityIcons name="cancel" size={20} />
            </TouchableOpacity>
            <Text style={{ fontSize: 20, marginLeft: 10 }}>{count}/{maxCount}</Text>
            <TouchableOpacity style={{ marginLeft: 'auto', marginRight: 15 }} onPress={onSelectAll}>
                <MaterialIcons name="select-all" size={24} />
            </TouchableOpacity>
        </View>
    </View>
}