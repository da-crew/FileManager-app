import { View, Text, TouchableOpacity, Modal, Alert, TextInput, StyleSheet } from "react-native";

import { AntDesign, MaterialIcons } from '@expo/vector-icons';
import { useEffect, useState } from "react";
import * as RNFS from 'react-native-fs';
import { Path } from "../../FileSystem";
import BottomBarOptions from "./BottomBarOptions";
import { CreationType } from "./common";

// คอมโพเนนต์สำหรับสร้างไฟล์หรือโฟลเดอร์ใหม่
export default function ItemCreator(props: {
    enabled: boolean,         // สถานะการแสดงหน้าต่าง
    currentPath: Path,        // พาธปัจจุบันที่จะสร้างไฟล์หรือโฟลเดอร์
    onCreationDone: () => void,    // ฟังก์ชันเรียกเมื่อสร้างเสร็จ
    onCreationCanceled: () => void // ฟังก์ชันเรียกเมื่อยกเลิก
}) {

    // สถานะสำหรับเก็บข้อมูลการสร้างไฟล์/โฟลเดอร์
    const [creationState, setCreationState] = useState<{ itemName: string, creationType: CreationType } | null>(null);
    // สถานะการแสดงหน้าต่างตัวเลือก
    const [newItemOptionVisible, setNewItemOptionVisible] = useState(false);

    // อัปเดตสถานะเมื่อ props.enabled เปลี่ยน
    useEffect(() => {
        setNewItemOptionVisible(props.enabled);
        setCreationState(null);
    }, [props.enabled]);

    // ฟังก์ชันสร้างไฟล์หรือโฟลเดอร์
    const onCreate = () => {
        if (creationState == null) {
            throw new Error("creationState is null!");
        }
        if (creationState.creationType == null) {
            throw new Error("creationType is null!");
        }
        // ตรวจสอบว่าชื่อไม่ว่างเปล่า
        if (creationState.itemName.length <= 0) {
            Alert.alert("Error", "Name cannot be empty!", [{ text: "Dismiss" }]);
            return;
        }

        // สร้างพาธเต็ม
        let fullPath = props.currentPath.build() + "/" + creationState.itemName;
        console.log("Create: ", fullPath);
        
        // ตรวจสอบว่าไฟล์หรือโฟลเดอร์มีอยู่แล้วหรือไม่
        RNFS.exists(fullPath)
            .then((itemExists) => {
                if (itemExists) {
                    console.log("Item already exists! Cannot create item!");
                    Alert.alert("Error", "Item already exists", [{ text: "Dismiss" }]);
                    return;
                } else {
                    console.log("Can create: ");
                    try {
                        let promise;
                        // สร้างไฟล์หรือโฟลเดอร์ตามประเภทที่เลือก
                        switch (creationState.creationType) {
                            case CreationType.FOLDER:
                                promise = RNFS.mkdir(fullPath);
                                break;
                            case CreationType.FILE:
                                promise = RNFS.writeFile(fullPath, "");
                                break;
                        }
                        promise
                            .then(() => {
                                console.log("Created ", fullPath);
                                props.onCreationDone();
                            })
                            .catch((reason) => {
                                Alert.alert("Error Creating Item", reason, [{ text: "Dismiss" }]);
                            });
                    } catch (err) {
                        console.log("Error while creating item. ", err);
                    }
                }
            })
            .catch((reason) => {
                console.log("Error checking for item's existence. Reason: ", reason);
            });
        setCreationState(null);
        props.onCreationCanceled();
    };

    return (<>
        {/* หน้าต่างโมดัลสำหรับเลือกประเภทการสร้าง (โฟลเดอร์หรือไฟล์) */}
        <Modal 
            visible={newItemOptionVisible} 
            transparent={true} 
            animationType="slide"
            onRequestClose={() => props.onCreationCanceled()}
        >
            <TouchableOpacity
                style={styles.modalOverlay}
                activeOpacity={1}
                onPress={() => props.onCreationCanceled()}
            >
                {/* คอนเทนเนอร์หลักสำหรับตัวเลือก */}
                <View style={styles.optionsContainer}>
                    <Text style={styles.optionsTitle}>Create New</Text>
                    
                    {/* ปุ่มสร้างโฟลเดอร์ใหม่ */}
                    <TouchableOpacity 
                        style={styles.optionButton}
                        onPress={() => {
                            setNewItemOptionVisible(false);
                            setCreationState({
                                itemName: "",
                                creationType: CreationType.FOLDER,
                            })
                        }}
                    >
                        <View style={styles.iconContainer}>
                            <MaterialIcons name="create-new-folder" size={28} color="#4285F4" />
                        </View>
                        <Text style={styles.optionText}>New Folder</Text>
                    </TouchableOpacity>
                    
                    {/* ปุ่มสร้างไฟล์ใหม่ */}
                    <TouchableOpacity 
                        style={styles.optionButton}
                        onPress={() => {
                            setNewItemOptionVisible(false);
                            setCreationState({
                                itemName: "",
                                creationType: CreationType.FILE,
                            });
                        }}
                    >
                        <View style={styles.iconContainer}>
                            <AntDesign name="addfile" size={28} color="#34A853" />
                        </View>
                        <Text style={styles.optionText}>New File</Text>
                    </TouchableOpacity>
                    
                    {/* ปุ่มยกเลิก */}
                    <TouchableOpacity 
                        style={styles.cancelButton}
                        onPress={() => props.onCreationCanceled()}
                    >
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        </Modal>

        {/* หน้าต่างโมดัลสำหรับกรอกชื่อไฟล์หรือโฟลเดอร์ */}
        <Modal 
            visible={creationState != null && props.enabled} 
            transparent={true} 
            animationType="slide"
            onRequestClose={() => props.onCreationCanceled()}
        >
            <TouchableOpacity
                style={styles.modalOverlay}
                activeOpacity={1}
                onPress={() => props.onCreationCanceled()}
            >
                {/* คอนเทนเนอร์สำหรับช่องกรอกข้อมูล */}
                <View style={styles.inputContainer}>
                    <Text style={styles.inputTitle}>
                        {creationState?.creationType === CreationType.FOLDER ? 'New Folder' : 'New File'}
                    </Text>
                    
                    {/* ช่องกรอกชื่อไฟล์หรือโฟลเดอร์ */}
                    <TextInput
                        style={styles.textInput}
                        placeholder={`Enter ${creationState?.creationType === CreationType.FOLDER ? 'folder' : 'file'} name`}
                        placeholderTextColor="#9E9E9E"
                        autoFocus
                        onChangeText={(text) => {
                            if (creationState == null) {
                                throw new Error("creationState cannot be null!");
                            }
                            setCreationState({
                                ...creationState,
                                itemName: text,
                            });
                        }}
                    />

                    {/* ปุ่มกดยกเลิกหรือสร้าง */}
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={[styles.button, styles.cancelActionButton]}
                            onPress={() => props.onCreationCanceled()}
                        >
                            <Text style={[styles.buttonText, { color: '#5f6368' }]}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.button, styles.createButton]}
                            onPress={onCreate}
                        >
                            <Text style={styles.buttonText}>Create</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableOpacity>
        </Modal>
    </>);
}

// สไตล์สำหรับคอมโพเนนต์
const styles = StyleSheet.create({
    // พื้นหลังโปร่งใสสำหรับโมดัล
    modalOverlay: {
        flex: 1, 
        justifyContent: 'flex-end', // จัดให้แสดงที่ด้านล่างของหน้าจอ
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    // คอนเทนเนอร์หลักสำหรับตัวเลือก
    optionsContainer: {
        backgroundColor: 'white',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        padding: 20,
        paddingBottom: 24,
    },
    // สไตล์หัวข้อ "Create New"
    optionsTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#212121',
        textAlign: 'center'
    },
    // สไตล์ปุ่มตัวเลือก (New Folder, New File)
    optionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 16,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    // คอนเทนเนอร์สำหรับไอคอน
    iconContainer: {
        width: 40,
        alignItems: 'center',
        backgroundColor: '#f4f8ff',
        padding: 8,
        borderRadius: 8,
        marginRight: 16,
    },
    // สไตล์ข้อความในปุ่มตัวเลือก
    optionText: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    },
    // สไตล์ปุ่มยกเลิก
    cancelButton: {
        alignItems: 'center',
        paddingVertical: 16,
        marginTop: 5,
    },
    // สไตล์ข้อความปุ่มยกเลิก
    cancelButtonText: {
        color: '#5f6368',
        fontSize: 16,
        fontWeight: '500'
    },
    // คอนเทนเนอร์สำหรับช่องกรอกข้อมูล
    inputContainer: {
        backgroundColor: 'white',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        padding: 20,
        paddingBottom: 30,
    },
    // สไตล์หัวข้อหน้ากรอกข้อมูล
    inputTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#212121'
    },
    // สไตล์ช่องกรอกข้อความ
    textInput: {
        height: 50,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        paddingHorizontal: 15,
        borderRadius: 10,
        fontSize: 16,
        backgroundColor: '#fafafa',
        marginBottom: 20
    },
    // คอนเทนเนอร์สำหรับปุ่มด้านล่าง
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    // สไตล์พื้นฐานของปุ่ม
    button: {
        flex: 1,
        padding: 12,
        borderRadius: 10,
        alignItems: 'center',
        marginHorizontal: 5
    },
    // สไตล์ปุ่มยกเลิก
    cancelActionButton: {
        backgroundColor: '#f1f3f4',
    },
    // สไตล์ปุ่มสร้าง
    createButton: {
        backgroundColor: '#4285F4',
    },
    // สไตล์ข้อความในปุ่ม
    buttonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: 'white'
    }
});