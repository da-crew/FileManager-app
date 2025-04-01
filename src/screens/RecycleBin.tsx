import React, { useState } from 'react';
import { SafeAreaView, View, Text, FlatList, TouchableOpacity, StyleSheet, StatusBar, Modal } from 'react-native';
import { MaterialCommunityIcons, MaterialIcons, Ionicons, AntDesign, FontAwesome5 } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack'; 
import SelectionToolBar from '../components/SelectionToolbar';

type RootStackParamList = {
  Search: undefined; 
  RecycleBin: undefined;
};

interface FileItem {
    id: string;
    name: string;
    date: string;
    size: string;
}

export default function RecycleBin() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    const [isSelecting, setIsSelecting] = useState<boolean>(false);
    const [isConfirmDeleteVisible, setConfirmDeleteVisible] = useState(false);
    const [isConfirmRestoreVisible, setConfirmRestoreVisible] = useState(false);
    const [sortByOptionVisible, setSortByOptionVisible] = useState(false);
    const [menuVisible, setMenuVisible] = useState(false);

    const data: FileItem[] = [
        { id: '1', name: 'Document 1', date: 'Feb 11, 2025', size: '5.5 MB' },
        { id: '2', name: 'Document 2', date: 'Feb 12, 2025', size: '3.2 MB' },
        { id: '3', name: 'Document 3', date: 'Feb 13, 2025', size: '2.8 MB' }
    ];
    
    const toggleSelect = (id: string) => {
        if (!isSelecting) setIsSelecting(true);
        setSelectedItems(prev => {
            const newSelection = prev.includes(id) 
                ? prev.filter(item => item !== id) 
                : [...prev, id];
            
            // ถ้าไม่มีไฟล์ที่เลือกแล้ว ให้ปิดโหมดการเลือก
            if (newSelection.length === 0) {
                setIsSelecting(false);
            }
            
            return newSelection;
        });
    };

    const renderItem = ({ item }: { item: FileItem }) => {
        const isSelected = selectedItems.includes(item.id);
        return (
            <TouchableOpacity style={styles.itemContainer} onPress={() => toggleSelect(item.id)}>
                <MaterialCommunityIcons name="file-pdf-box" size={40} color="red" />
                <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemDetail}>{item.date} - {item.size}</Text>
                </View>
                <MaterialCommunityIcons
                    name={isSelected ? "checkbox-marked" : "checkbox-blank-outline"}
                    size={24}
                    color="black"
                />
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar backgroundColor="#fff" barStyle="dark-content" />

            {!isSelecting ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#d9d9d9' }}>
                    <TouchableOpacity style={{ padding: 15, marginRight: 0 }} onPress={() => navigation.goBack()}>
                        <MaterialIcons name="arrow-back-ios-new" size={20} />
                    </TouchableOpacity>
                    <Text style={{ fontSize: 20 }}>Recycle Bin</Text>
                    
                    {/* ปุ่มค้นหาที่ลิงก์ไปยังหน้าค้นหา */}
                    <TouchableOpacity
                        style={{ marginLeft: 'auto', marginRight: 15 }}
                        onPress={() => navigation.navigate("Search")} // 3. ใช้ navigation แบบมีประเภทแล้ว
                    >
                        <Ionicons name="search" size={24} color="black" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={{ marginRight: 15 }}
                        onPress={() => setSortByOptionVisible(true)}
                    >
                        <FontAwesome5 name="sort" size={24} color="black" />
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                        style={{ marginRight: 15 }}
                        onPress={() => setMenuVisible(true)}
                    >
                        <MaterialIcons name="more-vert" size={24} color="black" />
                    </TouchableOpacity>
                </View>
            ) : (
                <SelectionToolBar
                    onCancel={() => { setIsSelecting(false); setSelectedItems([]); }}
                    onSelectAll={() => {
                        if (data.length === selectedItems.length) {
                            setSelectedItems([]);
                        } else {
                            setSelectedItems(data.map(file => file.id));
                        }
                    }}
                    count={selectedItems.length}
                    maxCount={data.length}
                />
            )}

            <Text style={styles.subHeader}>Files will be permanently deleted after 30 days.</Text>

            <FlatList
                data={data}
                keyExtractor={item => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.listContainer}
            />

            {/* เมนูสามจุด */}
            <Modal
                transparent
                visible={menuVisible}
                animationType="fade"
                onRequestClose={() => setMenuVisible(false)}
            >
                <TouchableOpacity 
                    style={styles.menuModalOverlay} 
                    activeOpacity={1} 
                    onPress={() => setMenuVisible(false)}
                >
                    <View style={styles.menuContainer}>
                        <TouchableOpacity style={styles.menuItem} onPress={() => {
                            setMenuVisible(false);
                            setSortByOptionVisible(true);
                        }}>
                            <MaterialCommunityIcons name="sort" size={24} color="black" />
                            <Text style={styles.menuItemText}>Sort by</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity style={styles.menuItem} onPress={() => {
                            setMenuVisible(false);
                            setIsSelecting(true);
                            setSelectedItems(data.map(file => file.id));
                        }}>
                            <MaterialCommunityIcons name="select-all" size={24} color="black" />
                            <Text style={styles.menuItemText}>Select All</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity style={styles.menuItem} onPress={() => {
                            setMenuVisible(false);
                            setConfirmDeleteVisible(true);
                        }}>
                            <Ionicons name="trash-bin" size={24} color="black" />
                            <Text style={styles.menuItemText}>Empty Recycle Bin</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>
        </SafeAreaView>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff"
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderBottomColor: "#000"
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "bold",
        flex: 1,
        marginHorizontal: 10,
        color: "black",
    },
    subHeader: {
        fontSize: 14,
        color: "#555",
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: "#f9f9f9"
    },
    listContainer: {
        padding: 16
    },
    itemContainer: {
        flexDirection: "row",
        paddingHorizontal: 16,
        paddingVertical: 12,
        alignItems: "center",
        borderBottomWidth: 1,
        borderBottomColor: "#000"
    },
    itemInfo: {
        flex: 1,
        marginLeft: 10
    },
    itemName: {
        fontSize: 15,
        fontWeight: "bold",
        color: "black"
    },
    itemDetail: {
        fontSize: 12,
        color: "black",
        marginTop: 4
    },
    bottomBar: {
        flexDirection: "row",
        borderTopWidth: 1,
        borderTopColor: "#000"
    },
    bottomButton: {
        flex: 1,
        padding: 16,
        alignItems: "center",
        justifyContent: "center"
    },
    bottomButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "black"
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    modalContainer: {
        width: 300,
        padding: 20,
        backgroundColor: 'white',
        borderRadius: 10,
        alignItems: 'center'
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        color: "black"
    },
    modalMessage: {
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 20,
        color: "black"
    },
    modalButtonRow: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        width: '100%'
    },
    modalButton: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        marginHorizontal: 5,
        borderRadius: 5
    },
    modalButtonText: {
        fontSize: 16,
        fontWeight: '600'
    },
    cancelText: {
        color: '#007AFF'
    },
    deleteText: {
        color: 'red'
    },
    menuModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    menuContainer: {
        position: 'absolute',
        top: 60,
        right: 20,
        backgroundColor: 'white',
        borderRadius: 5,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    menuItemText: {
        marginLeft: 10,
        fontSize: 16,
        color: 'black',
    }
});