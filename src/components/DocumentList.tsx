import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, FlatList } from 'react-native';
import * as RNFS from 'react-native-fs';
import { FontAwesome } from '@expo/vector-icons';

interface DocumentListProps {
    documents: RNFS.ReadDirItem[], 
    isLoading: boolean,
    onDocumentPress: (item: RNFS.ReadDirItem) => void,
    onDocumentLongPress?: (item: RNFS.ReadDirItem) => void,
    selectedDocuments: Set<RNFS.ReadDirItem>
}

const DocumentList = ({ documents, isLoading, onDocumentPress, onDocumentLongPress, selectedDocuments }: DocumentListProps) => {
    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#2196F3" />
                <Text style={{ marginTop: 10, color: '#333' }}>กำลังโหลดเอกสาร...</Text>
            </View>
        );
    }
    
    if (documents.length === 0) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ fontSize: 16, color: '#333' }}>ไม่พบเอกสาร</Text>
            </View>
        );
    }
    
    // เลือกไอคอนตามประเภทเอกสาร
    const getDocumentIcon = (fileName: string): any => {
        const ext = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();
        
        if (ext === '.pdf') return 'file-pdf-o';
        if (['.doc', '.docx'].includes(ext)) return 'file-word-o';
        if (['.xls', '.xlsx'].includes(ext)) return 'file-excel-o';
        if (['.ppt', '.pptx'].includes(ext)) return 'file-powerpoint-o';
        if (ext === '.txt') return 'file-text-o';
        
        return 'file-o';
    };
    
    return (
        <FlatList
            data={documents}
            keyExtractor={(item) => item.path}
            renderItem={({ item }) => (
                <TouchableOpacity 
                    style={{ 
                        flexDirection: 'row',
                        padding: 12,
                        borderBottomWidth: 1,
                        borderBottomColor: '#f0f0f0',
                        backgroundColor: selectedDocuments.has(item) ? '#e3f2fd' : 'white',
                        alignItems: 'center'
                    }}
                    onPress={() => onDocumentPress(item)}
                    onLongPress={() => onDocumentLongPress && onDocumentLongPress(item)}
                >
                    <View style={{ 
                        width: 40, 
                        height: 40, 
                        borderRadius: 5, 
                        backgroundColor: '#f0f0f0',
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginRight: 15
                    }}>
                        <FontAwesome name={getDocumentIcon(item.name)} size={20} color="#2196F3" />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 16, fontWeight: '500' }} numberOfLines={1}>
                            {item.name}
                        </Text>
                        <Text style={{ fontSize: 12, color: '#666', marginTop: 2 }}>
                            {new Date(item.mtime?.getTime() || 0).toLocaleDateString()}
                        </Text>
                    </View>
                </TouchableOpacity>
            )}
        />
    );
};

export default DocumentList; 