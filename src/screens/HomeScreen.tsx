import React, { ReactNode, useEffect, useState } from 'react';
import { SafeAreaView, View, Text, TouchableOpacity, StyleSheet, ScrollView, GestureResponderEvent, StatusBar } from 'react-native';
import HomeSearchBar from '../components/HomeSearchBar';
import { Feather, MaterialIcons, Ionicons, MaterialCommunityIcons, createIconSet,FontAwesome5 } from '@expo/vector-icons';
import { Path } from '../FileSystem';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import { checkManagePermission } from 'manage-external-storage';
import RNFS from 'react-native-fs';
import { openAppSettings, StorageCapacity, StorageDevice } from '../FileSystem';
import { ContainerType } from '../components/ContentContainer/common';
import { useTheme } from '../components/ThemeContext';


const QuickAccessButton = ({ name, icon, onPress }: {
    name: string,             // ชื่อปุ่ม
    icon: ReactNode,          // ไอคอนของปุ่ม
    onPress: (event: GestureResponderEvent) => void  // ฟังก์ชันที่จะทำงานเมื่อกดปุ่ม
}) => {
    const { theme } = useTheme();
    return (
        <TouchableOpacity style={[styles.quickAccessButton, { backgroundColor: theme.card }]} onPress={onPress}>
            <View style={[styles.iconContainer, { backgroundColor: theme.background }]}>
                {icon}
            </View>
            <Text style={[styles.quickAccessText, { color: theme.text }]}>{name}</Text>
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
    const { theme } = useTheme();

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
        <TouchableOpacity style={[styles.storageCard, { backgroundColor: theme.card }]} onPress={onPress}>
            <View style={[styles.storageInfo, { backgroundColor: theme.card }]}>
                {icon}
                <View style={styles.storageTextContainer}>
                    <Text style={[styles.storageTitle, { color: theme.text }]}>{device.displayName}</Text>
                    {
                        storageSize
                            ?
                            <View style={styles.storageBarContainer}>
                                <View
                                    style={[
                                        styles.storageBar,
                                        { width: `${usedPercentage}%`, backgroundColor: getBarColor() }
                                    ]}
                                />
                            </View>
                            : <></>
                    }
                    <Text style={[styles.storageText, { color: theme.text }]}>{
                        storageSize
                            ? `${(storageSize.totalSpace - storageSize.freeSpace).toPrecision(3)} / ${storageSize.totalSpace.toPrecision(3)} ${device.unit}`
                            : "Calculating..."
                    }</Text>
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

    const { theme } = useTheme();

    return (
        <TouchableOpacity style={[styles.utilityButton, { backgroundColor: theme.card }]} onPress={onPress}>
            <View style={styles.utilityContent}>
                {icon}
                <View style={styles.utilityTextContainer}>
                    <Text style={[styles.utilityTitle, { color: theme.text }]}>{title}</Text>
                    <Text style={[styles.utilityDesc, { color: theme.textSecondary }]}>{desc}</Text>
                </View>
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
    const internalStorage = new StorageDevice('Internal Storage', RNFS.ExternalStorageDirectoryPath);
    return (
        <View style={styles.headerBar}>
            <Text style={styles.headerTitle}>My Files</Text>
            <View style={styles.headerActions}>
                <TouchableOpacity
                    style={styles.headerButton}
                    onPress={() => navigation.navigate("Search", {
                        containerName: internalStorage.displayName,
                        path: new Path(internalStorage.displayName, internalStorage.devicePath, []),
                        containerType: ContainerType.DEFAULT
                    })}
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

    const { theme } = useTheme();

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
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <StatusBar backgroundColor={theme.background} />
            <HomeSearchBar navigation={navigation} />
            <ScrollView style={styles.scrollView}>
                <View style={[styles.quickAccessGrid, { backgroundColor: theme.card}]}>
                    <QuickAccessButton
                        name="Images"
                        icon={<Feather name="image" size={28} color={theme.text} />}
                        onPress={() => gotoCategory("Images")}
                    />
                    <QuickAccessButton
                        name="Videos"
                        icon={<Feather name="video" size={28} color={theme.text} />}
                        onPress={() => gotoCategory("Videos")}
                    />
                    <QuickAccessButton
                        name="Audio"
                        icon={<Feather name="music" size={28} color={theme.text} />}
                        onPress={() => gotoCategory("Audio")}
                    />
                    <QuickAccessButton
                        name="Documents"
                        icon={<Ionicons name="document-outline" size={28} color={theme.text} />}
                        onPress={() => gotoCategory("Documents")}
                    />
                    <QuickAccessButton
                        name="Downloads"
                        icon={<Feather name="download" size={28} color={theme.text} />}
                        onPress={() => gotoCategory("Downloads")}
                    />
                    <QuickAccessButton
                        name="Trash"
                        icon={<Feather name="trash-2" size={24} color="#8E8E93" />}
                        onPress={() => navigation.navigate("RecycleBin")}
                    /> 
                </View>

                <Text style={[styles.storageTitle, { color: theme.text }]}>All storage</Text>
                <View style={styles.storageSection}>
                    <StorageCard
                        device={internalStorage}
                        icon={<Feather name="smartphone" size={24} color={theme.text} />}
                        onPress={() => {
                            gotoStorageDevice(internalStorage);
                        }}
                    />
                </View>

                <Text style={[styles.storageTitle, { color: theme.text }]}>Utilities</Text>
                <View style={styles.utilitiesSection}>
                    <UtilityButton
                        title="Large Files"
                        desc="Files larger than 200MB"
                        icon={<MaterialCommunityIcons name="file-document-outline" size={24} color={theme.text} />}
                        onPress={() => navigation.navigate("LargeFiles")}
                    />
                    <UtilityButton
                        title="Duplicate Files"
                        desc="Find and remove duplicate files"
                        icon={<MaterialCommunityIcons name="content-copy" size={24} color={theme.text} />}
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
    storageSection: {
        marginBottom: 24,
    },
    utilityContent: {
        flexDirection: 'row',
        alignItems: 'center',
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
