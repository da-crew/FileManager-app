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

const QuickAccessButton = ({ name, icon, onPress }: {
    name: string,
    icon: ReactNode,
    onPress: (event: GestureResponderEvent) => void
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

const StorageCard = ({ device, icon, onPress }: {
    device: StorageDevice,
    icon: ReactNode,
    onPress: (event: GestureResponderEvent) => void,
}) => {
    const [storageSize, setStorageSize] = useState<StorageCapacity | null>(null);

    useEffect(() => {
        device.getCapacity().then((result) => {
            setStorageSize(result);
        })
    }, []);

    const usedPercentage = storageSize 
        ? ((storageSize.totalSpace - storageSize.freeSpace) / storageSize.totalSpace) * 100 
        : 0;
    
    const getBarColor = () => {
        if (usedPercentage > 90) return '#FF3B30'; // สีแดงถ้าใช้งานเกิน 90%
        if (usedPercentage > 70) return '#FF9500'; // สีส้มถ้าใช้งานเกิน 70%
        return '#34C759'; // สีเขียวถ้าใช้งานน้อยกว่า 70%
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
                                {`${(storageSize.totalSpace - storageSize.freeSpace).toPrecision(3)} / ${storageSize.totalSpace.toPrecision(3)} ${device.unit}`}
                                <Text style={styles.storagePercentage}>{` (${Math.round(usedPercentage)}% ใช้งานแล้ว)`}</Text>
                            </Text>
                        </>
                    )}
                    {!storageSize && (
                        <Text style={styles.storageText}>กำลังคำนวณพื้นที่...</Text>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
};

const UtilityButton = ({ title, desc, icon, onPress }: {
    title: string,
    desc: string,
    icon: ReactNode,
    onPress: (event: GestureResponderEvent) => void
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

const HeaderBar = ({ navigation }: { navigation: any }) => {
    const internalStorage = new StorageDevice('Internal Storage', RNFS.ExternalStorageDirectoryPath);
    return (
        <View style={styles.headerBar}>
            <Text style={styles.headerTitle}>ไฟล์ของฉัน</Text>
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

export default function HomeScreen({ navigation }: NativeStackScreenProps<RootStackParamList>) {

    useEffect(() => {
        checkManagePermission().then((allowed) => {
            if (!allowed) {
                openAppSettings();
            }
        });
    }, []);

    function gotoCategory(name: string) {
        navigation.navigate("Container", {
            containerName: name,
            path: new Path(name, name, []),
            containerType: ContainerType.CATEGORIZED
        });
    }

    function gotoStorageDevice(device: StorageDevice) {
        navigation.navigate("Container", {
            containerName: device.displayName,
            path: new Path(device.displayName, device.devicePath, []),
            containerType: ContainerType.DEFAULT
        });
    }

    const internalStorage = new StorageDevice('Internal Storage', RNFS.ExternalStorageDirectoryPath);

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar backgroundColor="#fff" barStyle="dark-content" />
            <HeaderBar navigation={navigation} />
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                <Text style={styles.sectionTitle}>ประเภทไฟล์</Text>
                <View style={styles.quickAccessGrid}>
                    <QuickAccessButton
                        name="รูปภาพ"
                        icon={<Feather name="image" size={24} color="#007AFF" />}
                        onPress={() => gotoCategory("Images")}
                    />
                    <QuickAccessButton
                        name="วิดีโอ"
                        icon={<Feather name="video" size={24} color="#FF2D55" />}
                        onPress={() => gotoCategory("Videos")}
                    />
                    <QuickAccessButton
                        name="เพลง"
                        icon={<Feather name="music" size={24} color="#FF9500" />}
                        onPress={() => gotoCategory("Audio")}
                    />
                    <QuickAccessButton
                        name="เอกสาร"
                        icon={<Ionicons name="document-outline" size={24} color="#34C759" />}
                        onPress={() => gotoCategory("Documents")}
                    />
                    <QuickAccessButton
                        name="ดาวน์โหลด"
                        icon={<Feather name="download" size={24} color="#5856D6" />}
                        onPress={() => gotoCategory("Downloads")}
                    />
                    <QuickAccessButton
                        name="ถังขยะ"
                        icon={<Feather name="trash-2" size={24} color="#8E8E93" />}
                        onPress={() => navigation.navigate("RecycleBin")}
                    />
                </View>

                <Text style={styles.sectionTitle}>พื้นที่จัดเก็บ</Text>
                <StorageCard
                    device={internalStorage}
                    icon={<Feather name="smartphone" size={24} color="#007AFF" />}
                    onPress={() => {
                        gotoStorageDevice(internalStorage);
                    }}
                />

                <Text style={styles.sectionTitle}>เครื่องมือ</Text>
                <View style={styles.utilitiesSection}>
                    <UtilityButton
                        title="ไฟล์ขนาดใหญ่"
                        desc="ไฟล์ที่มีขนาดเกิน 200MB"
                        icon={<FontAwesome5 name="file-archive" size={22} color="#007AFF" />}
                        onPress={() => navigation.navigate("LargeFiles")}
                    />
                    <UtilityButton
                        title="ไฟล์ซ้ำซ้อน"
                        desc="ค้นหาและลบไฟล์ที่ซ้ำกัน"
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
