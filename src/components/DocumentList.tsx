import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, FlatList } from 'react-native';
import * as RNFS from 'react-native-fs';
import { FontAwesome } from '@expo/vector-icons';

// กำหนด Props ที่จำเป็นสำหรับ DocumentList
interface DocumentListProps {
    documents: RNFS.ReadDirItem[],       // รายการไฟล์เอกสาร
    isLoading: boolean,                  // สถานะกำลังโหลดข้อมูล
    onDocumentPress: (item: RNFS.ReadDirItem) => void,  // ฟังก์ชันเรียกเมื่อกดที่เอกสาร
    onDocumentLongPress?: (item: RNFS.ReadDirItem) => void,  // ฟังก์ชันเรียกเมื่อกดค้างที่เอกสาร (ใช้ในการเลือก)
    selectedDocuments: Set<RNFS.ReadDirItem>  // รายการเอกสารที่ถูกเลือก
}

/**
 * คอมโพเนนต์แสดงรายการเอกสาร
 * ใช้สำหรับแสดงรายการเอกสารต่างๆ เช่น PDF, Word, Excel, PowerPoint, ไฟล์ข้อความ ในหน้า Documents
 */
const DocumentList = ({ documents, isLoading, onDocumentPress, onDocumentLongPress, selectedDocuments }: DocumentListProps) => {
    // แสดงส่วนกำลังโหลดข้อมูล
    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#2196F3" />
                <Text style={{ marginTop: 10, color: '#333' }}>Loading document file...</Text>
            </View>
        );
    }
    
    // แสดงข้อความเมื่อไม่พบเอกสาร
    if (documents.length === 0) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ fontSize: 16, color: '#333' }}>Document file not found</Text>
            </View>
        );
    }
    
    // เลือกไอคอนตามประเภทเอกสาร
    const getDocumentIcon = (fileName: string): any => {
        const ext = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();
        
        if (ext === '.pdf') return 'file-pdf-o';         // ไอคอนสำหรับไฟล์ PDF
        if (['.doc', '.docx'].includes(ext)) return 'file-word-o';  // ไอคอนสำหรับไฟล์ Word
        if (['.xls', '.xlsx'].includes(ext)) return 'file-excel-o';  // ไอคอนสำหรับไฟล์ Excel
        if (['.ppt', '.pptx'].includes(ext)) return 'file-powerpoint-o';  // ไอคอนสำหรับไฟล์ PowerPoint
        if (ext === '.txt') return 'file-text-o';        // ไอคอนสำหรับไฟล์ข้อความ
        
        return 'file-o';  // ไอคอนเริ่มต้นสำหรับเอกสารอื่นๆ
    };
    
    // แสดงรายการเอกสารในรูปแบบลิสต์
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
                        backgroundColor: selectedDocuments.has(item) ? '#e3f2fd' : 'white',  // สีพื้นหลังเปลี่ยนเมื่อถูกเลือก
                        alignItems: 'center'
                    }}
                    onPress={() => onDocumentPress(item)}
                    onLongPress={() => onDocumentLongPress && onDocumentLongPress(item)}
                >
                    {/* ไอคอนเอกสาร (แสดงตามประเภทไฟล์) */}
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
                    {/* ข้อมูลเอกสาร */}
                    <View style={{ flex: 1 }}>
                        {/* ชื่อไฟล์ */}
                        <Text style={{ fontSize: 16, fontWeight: '500' }} numberOfLines={1}>
                            {item.name}
                        </Text>
                        {/* วันที่แก้ไขล่าสุด */}
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