import React, { ReactNode, useEffect, useState } from 'react';
import { SafeAreaView, View, Text, TouchableOpacity, StyleSheet, ScrollView, GestureResponderEvent, StatusBar } from 'react-native';
import { Feather, MaterialIcons, Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { Path } from '../FileSystem';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import { checkManagePermission } from 'manage-external-storage';
import RNFS from 'react-native-fs';
import { openAppSettings, StorageCapacity, StorageDevice } from '../FileSystem';
import { ContainerType } from '../components/ContentContainer/common';

// คอมโพเนนต์ปุ่มเมนูแบบรวดเร็ว (แสดงในส่วน File Types)
const QuickAccessButton = ({ name, icon, onPress }: {
    name: string,             // ชื่อปุ่ม
    icon: ReactNode,          // ไอคอนของปุ่ม
    onPress: (event: GestureResponderEvent) => void  // ฟังก์ชันที่จะทำงานเมื่อกดปุ่ม
}) => {
    return (
        <TouchableOpacity style={styles.quickAccessButton} onPress={onPress}>
            <View style={styles.iconContainer}>
                {icon}
            </View>
            <Text style={styles.quickAccessText}>{name}</Text>
        </TouchableOpacity>
    );
};

// คอมโพเนนต์แสดงข้อมูลพื้นที่จัดเก็บ (อุปกรณ์จัดเก็บข้อมูล)
const StorageCard = ({ device, icon, onPress }: {
    device: StorageDevice,    // ข้อมูลอุปกรณ์จัดเก็บ
    icon: ReactNode,          // ไอคอนอุปกรณ์
    onPress: (event: GestureResponderEvent) => void,  // ฟังก์ชันที่จะทำงานเมื่อกดปุ่ม
}) => {
    // สถานะสำหรับเก็บข้อมูลความจุพื้นที่จัดเก็บ
    const [storageSize, setStorageSize] = useState<StorageCapacity | null>(null);

    // ดึงข้อมูลความจุพื้นที่จัดเก็บเมื่อคอมโพเนนต์ถูกโหลด
    useEffect(() => {
        device.getCapacity().then((result) => {
            setStorageSize(result);
        })
    }, []);

    // คำนวณเปอร์เซ็นต์พื้นที่ที่ใช้ไป
    const usedPercentage = storageSize 
        ? ((storageSize.totalSpace - storageSize.freeSpace) / storageSize.totalSpace) * 100 
        : 0;
    
    // กำหนดสีของแถบแสดงพื้นที่ตามปริมาณการใช้งาน
    const getBarColor = () => {
        if (usedPercentage > 90) return '#FF3B30'; // แดง ถ้าใช้เกิน 90%
        if (usedPercentage > 70) return '#FF9500'; // ส้ม ถ้าใช้เกิน 70%
        return '#34C759'; // เขียว ถ้าใช้น้อยกว่า 70%
    };

    return (
        <TouchableOpacity style={styles.storageCard} onPress={onPress}>
            <View style={styles.storageInfo}>
                <View style={styles.storageIconContainer}>
                    {icon}
                </View>
                <View style={styles.storageTextContainer}>
                    <Text style={styles.storageTitle}>{device.displayName}</Text>
                    {storageSize && (
                        <>
                            <View style={styles.storageBarContainer}>
                                <View
                                    style={[
                                        styles.storageBar,
                                        { width: `${usedPercentage}%`, backgroundColor: getBarColor() }
                                    ]}
                                />
                            </View>
                            <Text style={styles.storageText}>
                                {`${(storageSize.totalSpace - storageSize.freeSpace).toFixed(2)} / ${storageSize.totalSpace.toFixed(2)} ${device.unit}`}
                                <Text style={styles.storagePercentage}>{` (${Math.round(usedPercentage)}% used)`}</Text>
                            </Text>
                        </>
                    )}
                    {!storageSize && (
                        <Text style={styles.storageText}>Calculating storage...</Text>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
};

// คอมโพเนนต์ปุ่มฟีเจอร์พิเศษ (เครื่องมืออรรถประโยชน์)
const UtilityButton = ({ title, desc, icon, onPress }: {
    title: string,            // ชื่อฟีเจอร์
    desc: string,             // คำอธิบายสั้นๆ
    icon: ReactNode,          // ไอคอน
    onPress: (event: GestureResponderEvent) => void  // ฟังก์ชันที่จะทำงานเมื่อกดปุ่ม
}) => {
    return (
        <TouchableOpacity style={styles.utilityButton} onPress={onPress}>
            <View style={styles.utilityIconContainer}>
                {icon}
            </View>
            <View style={styles.utilityTextContainer}>
                <Text style={styles.utilityTitle}>{title}</Text>
                <Text style={styles.utilityDesc}>{desc}</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#999" />
        </TouchableOpacity>
    );
};

// คอมโพเนนต์ส่วนหัวของหน้าจอ
const HeaderBar = ({ navigation }: { navigation: any }) => {
    return (
        <View style={styles.headerBar}>
            <Text style={styles.headerTitle}>My Files</Text>
            <View style={styles.headerActions}>
                <TouchableOpacity
                    style={styles.headerButton}
                    onPress={() => navigation.navigate("Search")}
                >
                    <Ionicons name="search" size={24} color="#333" />
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.headerButton}
                    onPress={() => navigation.navigate("Settings")}
                >
                    <Ionicons name="settings-outline" size={24} color="#333" />
                </TouchableOpacity>
            </View>
        </View>
    );
};

// หน้าจอหลักของแอปพลิเคชัน
export default function HomeScreen({ navigation }: NativeStackScreenProps<RootStackParamList>) {

    // ตรวจสอบสิทธิ์การจัดการไฟล์เมื่อเปิดแอป
    useEffect(() => {
        checkManagePermission().then((allowed) => {
            if (!allowed) {
                openAppSettings();
            }
        });
    }, []);

    // ฟังก์ชันสำหรับนำทางไปยังหมวดหมู่ต่างๆ (รูปภาพ, วิดีโอ, เพลง, เอกสาร, ดาวน์โหลด)
    function gotoCategory(name: string) {
        navigation.navigate("Container", {
            containerName: name,
            path: new Path(name, name, []),
            containerType: ContainerType.CATEGORIZED
        });
    }

    // ฟังก์ชันสำหรับนำทางไปยังอุปกรณ์จัดเก็บข้อมูล
    function gotoStorageDevice(device: StorageDevice) {
        navigation.navigate("Container", {
            containerName: device.displayName,
            path: new Path(device.displayName, device.devicePath, []),
            containerType: ContainerType.DEFAULT
        });
    }

    // สร้างอ็อบเจกต์อุปกรณ์จัดเก็บภายใน
    const internalStorage = new StorageDevice('Device Storage', RNFS.ExternalStorageDirectoryPath);

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar backgroundColor="#fff" barStyle="dark-content" />
            <HeaderBar navigation={navigation} />
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* ส่วนแสดงประเภทไฟล์ */}
                <Text style={styles.sectionTitle}>File Types</Text>
                <View style={styles.quickAccessGrid}>
                    <QuickAccessButton
                        name="Images"
                        icon={<Feather name="image" size={24} color="#007AFF" />}
                        onPress={() => gotoCategory("Images")}
                    />
                    <QuickAccessButton
                        name="Videos"
                        icon={<Feather name="video" size={24} color="#FF2D55" />}
                        onPress={() => gotoCategory("Videos")}
                    />
                    <QuickAccessButton
                        name="Music"
                        icon={<Feather name="music" size={24} color="#FF9500" />}
                        onPress={() => gotoCategory("Audio")}
                    />
                    <QuickAccessButton
                        name="Documents"
                        icon={<Ionicons name="document-outline" size={24} color="#34C759" />}
                        onPress={() => gotoCategory("Documents")}
                    />
                    <QuickAccessButton
                        name="Downloads"
                        icon={<Feather name="download" size={24} color="#5856D6" />}
                        onPress={() => gotoCategory("Downloads")}
                    />
                    <QuickAccessButton
                        name="Trash"
                        icon={<Feather name="trash-2" size={24} color="#8E8E93" />}
                        onPress={() => navigation.navigate("RecycleBin")}
                    />
                </View>

                {/* ส่วนแสดงข้อมูลพื้นที่จัดเก็บ */}
                <Text style={styles.sectionTitle}>Storage</Text>
                <StorageCard
                    device={internalStorage}
                    icon={<Feather name="smartphone" size={24} color="#4CAF50" />}
                    onPress={() => {
                        gotoStorageDevice(internalStorage);
                    }}
                />

                <Text style={styles.sectionTitle}>Tools</Text>
                <View style={styles.utilitiesSection}>
                    <UtilityButton
                        title="Large Files"
                        desc="Files larger than 200MB"
                        icon={<FontAwesome5 name="file-archive" size={22} color="#007AFF" />}
                        onPress={() => navigation.navigate("LargeFiles")}
                    />
                    <UtilityButton
                        title="Duplicate Files"
                        desc="Find and delete duplicate files"
                        icon={<MaterialCommunityIcons name="content-copy" size={24} color="#FF9500" />}
                        onPress={() => navigation.navigate("Duplicates")}
                    />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    headerBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#000',
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerButton: {
        padding: 8,
        marginLeft: 8,
    },
    scrollView: {
        flex: 1,
        padding: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
        marginTop: 16,
        marginBottom: 12,
    },
    quickAccessGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        marginBottom: 24,
        paddingHorizontal: 4,
    },
    quickAccessButton: {
        width: '30%',
        alignItems: 'center',
        marginBottom: 16,
    },
    iconContainer: {
        width: 56,
        height: 56,
        backgroundColor: '#f5f5f7',
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
        elevation: 1,
    },
    quickAccessText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#333',
        textAlign: 'center',
    },
    storageCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#f0f0f0',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    storageInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    storageIconContainer: {
        width: 48,
        height: 48,
        backgroundColor: '#f5f5f7',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    storageTextContainer: {
        flex: 1,
        marginLeft: 16,
    },
    storageTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
        marginBottom: 8,
    },
    storageBarContainer: {
        height: 8,
        backgroundColor: '#f0f0f0',
        borderRadius: 4,
        marginBottom: 8,
        overflow: 'hidden',
    },
    storageBar: {
        height: '100%',
        borderRadius: 4,
    },
    storageText: {
        fontSize: 14,
        color: '#666',
    },
    storagePercentage: {
        fontSize: 12,
        color: '#8e8e93',
    },
    utilitiesSection: {
        marginBottom: 24,
    },
    utilityButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#f0f0f0',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    utilityIconContainer: {
        width: 44,
        height: 44,
        backgroundColor: '#f5f5f7',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    utilityTextContainer: {
        flex: 1,
        marginLeft: 16,
    },
    utilityTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
    },
    utilityDesc: {
        fontSize: 14,
        color: '#666',
        marginTop: 2,
    },
});
