import React, { useState } from 'react';
import { SafeAreaView, View, Text, FlatList, TouchableOpacity, StyleSheet, StatusBar, Modal } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Ionicons from '@expo/vector-icons/Ionicons';
import AntDesign from '@expo/vector-icons/AntDesign';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../components/ThemeContext';


interface FileItem {
    id: string;
    name: string;
    date: string;
    size: string;
}

export default function RecycleBin() {
    const navigation = useNavigation();
    const { theme } = useTheme();
    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    const [isConfirmDeleteVisible, setConfirmDeleteVisible] = useState(false);
    const [isConfirmRestoreVisible, setConfirmRestoreVisible] = useState(false);

    const data: FileItem[] = [
        { id: '1', name: '01 51-01-0384 คู่มือความหล่อ', date: '22:41 Feb 11,2025', size: '5.5 MB' },
        { id: '2', name: '01 51-01-0384 คู่มือความหล่อ', date: '22:41 Feb 11,2025', size: '5.5 MB' },
        { id: '3', name: '01 51-01-0384 คู่มือความหล่อ', date: '22:41 Feb 11,2025', size: '5.5 MB' }
    ];
    const toggleSelect = (id: string) => {
        setSelectedItems((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        );
    };


    const handleDelete = () => {
        console.log("File deleted permanently");
        setConfirmDeleteVisible(false);
    };

    const handleRestore = () => {
        console.log("File restored");
        setConfirmRestoreVisible(false);
    };

    const renderItem = ({ item }: { item: FileItem }) => {
        const isSelected = selectedItems.includes(item.id);
        return (
            <TouchableOpacity style={styles.itemContainer} onPress={() => toggleSelect(item.id)}>
                <MaterialCommunityIcons name="file-pdf-box" size={40} color={theme.textSecondary} />
                <View style={styles.itemInfo}>
                    <Text style={[styles.itemName, { color: theme.text }]}>{item.name}</Text>
                    <Text style={[styles.itemDetail, { color: theme.textSecondary }]}>{item.date} - {item.size}</Text>
                </View>
                <MaterialCommunityIcons
                    name={isSelected ? "checkbox-marked" : "checkbox-blank-outline"}
                    size={24}
                    color={theme.primary}
                />
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <StatusBar backgroundColor={theme.background} barStyle="dark-content" />

            {/* Header */}
            <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <AntDesign name="left" size={24} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text }]}>Recycle Bin</Text>
                <TouchableOpacity>
                    <MaterialCommunityIcons name="dots-vertical" size={24} color={theme.text} />
                </TouchableOpacity>
            </View>

            {/* SubHeader */}
            <Text style={[styles.subHeader, { backgroundColor: theme.card, color: theme.textSecondary }]}>
                Files will be permanently deleted after 30 days.
            </Text>

            {/* File List */}
            <FlatList
                data={data}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.listContainer}
            />

            {/* Bottom Bar */}
            <View style={[styles.bottomBar, { borderTopColor: theme.border }]}>
                <TouchableOpacity style={styles.bottomButton} onPress={() => setConfirmRestoreVisible(true)}>
                    <MaterialCommunityIcons name="replay" size={30} color={theme.text} />
                    <Text style={[styles.bottomButtonText, { color: theme.text }]}>Restore</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.bottomButton} onPress={() => setConfirmDeleteVisible(true)}>
                    <Ionicons name="trash-bin" size={30} color={theme.text} />
                    <Text style={[styles.bottomButtonText, { color: theme.text }]}>Permanently delete</Text>
                </TouchableOpacity>
            </View>

            {/* Confirm Delete Modal */}
            <Modal transparent visible={isConfirmDeleteVisible} animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>Confirm Deletion</Text>
                        <Text style={styles.modalMessage}>
                            Are you sure you want to permanently delete the selected items?
                        </Text>
                        <View style={styles.modalButtonRow}>
                            <TouchableOpacity style={styles.modalButton} onPress={() => setConfirmDeleteVisible(false)}>
                                <Text style={[styles.modalButtonText, styles.cancelText]}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.modalButton} onPress={handleDelete}>
                                <Text style={[styles.modalButtonText, styles.deleteText]}>Delete</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            <Modal transparent visible={isConfirmRestoreVisible} animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContainer, { backgroundColor: theme.card }]}>
                        <Text style={[styles.modalTitle, { color: theme.text }]}>Confirm Restore</Text>
                        <Text style={[styles.modalMessage, { color: theme.textSecondary }]}>Are you sure you want to restore the selected items?</Text>
                        <View style={styles.modalButtonRow}>
                            <TouchableOpacity style={styles.modalButton} onPress={() => setConfirmRestoreVisible(false)}>
                                <Text style={[styles.modalButtonText, styles.cancelText]}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.modalButton} onPress={handleRestore}>
                                <Text style={[styles.modalButtonText, styles.deleteText]}>Restore</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
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
    }
});