import React, { ReactNode, useEffect, useState } from 'react';
import { SafeAreaView, View, Text, TouchableOpacity, StyleSheet, ScrollView, GestureResponderEvent } from 'react-native';
import HomeSearchBar from '../components/HomeSearchBar';
import { Feather, MaterialIcons, Ionicons, MaterialCommunityIcons, createIconSet } from '@expo/vector-icons';
import { Path } from '../FileSystem';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import { checkManagePermission } from 'manage-external-storage';
import RNFS, { writeFile } from 'react-native-fs';
import { openAppSettings, StorageCapacity, StorageDevice } from '../FileSystem';
import { useTheme } from '../components/ThemeContext';
import { ContainerType } from '../components/ContentContainer/common';




const QuickAccessButton = ({ name, icon, onPress }: {
    name: string,
    icon: ReactNode,
    onPress: (event: GestureResponderEvent) => void
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

const StorageCard = ({ device, icon, onPress }: {
    device: StorageDevice,
    icon: ReactNode,
    onPress: (event: GestureResponderEvent) => void,
}) => {
    const [storageSize, setStorageSize] = useState<StorageCapacity | null>(null);
    const { theme } = useTheme();
    useEffect(() => {
        device.getCapacity().then((result) => {
            setStorageSize(result);
        })
    }, []);

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
                                        { width: `${((storageSize.totalSpace - storageSize.freeSpace) / storageSize.totalSpace) * 100}%` }
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

const UtilityButton = ({ title, desc, icon, onPress }: {
    title: string,
    desc: string,
    icon: ReactNode,
    onPress: (event: GestureResponderEvent) => void
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
        </TouchableOpacity>
    );
};

export default function HomeScreen({ navigation }: NativeStackScreenProps<RootStackParamList>) {
    const { theme } = useTheme();
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
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <HomeSearchBar navigation={navigation} />
            <ScrollView style={styles.scrollView}>
                <View style={[styles.quickAccessGrid, { backgroundColor: theme.card}]}>
                    <QuickAccessButton
                        name="Images"
                        icon={<Feather name="image" size={28} color={theme.iconColor} />}
                        onPress={() => gotoCategory("Images")}
                    />
                    <QuickAccessButton
                        name="Videos"
                        icon={<Feather name="video" size={28} color={theme.iconColor} />}
                        onPress={() => gotoCategory("Videos")}
                    />
                    <QuickAccessButton
                        name="Audio"
                        icon={<Feather name="music" size={28} color={theme.iconColor} />}
                        onPress={() => gotoCategory("Audio")}
                    />
                    <QuickAccessButton
                        name="Documents"
                        icon={<Ionicons name="document-outline" size={28} color={theme.iconColor} />}
                        onPress={() => gotoCategory("Documents")}
                    />
                    <QuickAccessButton
                        name="Downloads"
                        icon={<Feather name="download" size={28} color={theme.iconColor} />}
                        onPress={() => gotoCategory("Downloads")}
                    />
                    {/* <QuickAccessButton
                        name="Recycle Bin"
                        icon={<Feather name="trash" size={28} color={theme.iconColor} />}
                        onPress={() => navigation.navigate("RecycleBin")}
                    /> */}
                </View>

                <Text style={[styles.storageTitle, { color: theme.text }]}>All storage</Text>
                <View style={styles.storageSection}>
                    <StorageCard
                        device={internalStorage}
                        icon={<Feather name="smartphone" size={24} color={theme.iconColor} />}
                        onPress={() => {
                            gotoStorageDevice(internalStorage);
                        }}
                    />
                    {/* <StorageCard
                        device={new StorageDevice('SD card', 16.0, 32.0)}
                        icon={<MaterialCommunityIcons name="sd" size={24} color="#666" />}
                    /> */}
                </View>

                <Text style={[styles.storageTitle, { color: theme.text }]}>Utilities</Text>
                <View style={styles.utilitiesSection}>
                    <UtilityButton
                        title="Large File"
                        desc="Files larger than 200MB"
                        icon={<MaterialCommunityIcons name="file-document-outline" size={24} color={theme.iconColor} />}
                        onPress={() => navigation.navigate("LargeFiles")}
                    />
                    <UtilityButton
                        title="Duplicate Files"
                        desc="Find and remove duplicate files"
                        icon={<MaterialCommunityIcons name="content-copy" size={24} color={theme.iconColor} />}
                        onPress={() => navigation.navigate("Duplicates")}
                    />
                    {/* <UtilityButton
                        title="Test Screen"
                        desc="For testing purposes only"
                        icon={<MaterialCommunityIcons name="content-copy" size={24} color={theme.iconColor} />}
                        onPress={() => navigation.navigate("Test")}
                    /> */}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    scrollView: {
        flex: 1,
        margin: 16,
    },
    quickAccessGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        backgroundColor: '',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
    },
    quickAccessButton: {
        width: '30%',
        alignItems: 'center',
        marginBottom: 16,
    },
    iconContainer: {
        width: 50,
        height: 50,
        backgroundColor: '#f0f0f0',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    quickAccessText: {
        fontSize: 12,
        color: '#333',
        textAlign: 'center',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 12,
    },
    storageSection: {
        marginBottom: 24,
    },
    storageCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 8,
    },
    storageInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    storageTextContainer: {
        flex: 1,
        marginLeft: 12,
    },
    storageTitle: {
        fontSize: 14,
        fontWeight: '500',
        color: '#333',
        marginBottom: 4,
    },
    storageBarContainer: {
        height: 4,
        backgroundColor: '#f0f0f0',
        borderRadius: 2,
        marginVertical: 4,
    },
    storageBar: {
        height: '100%',
        backgroundColor: '#007AFF',
        borderRadius: 2,
    },
    storageText: {
        fontSize: 12,
        color: '#666',
    },
    utilitiesSection: {
        marginBottom: 24,
    },
    utilityButton: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 8,
    },
    utilityContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    utilityTextContainer: {
        marginLeft: 12,
    },
    utilityTitle: {
        fontSize: 14,
        fontWeight: '500',
        color: '#333',
    },
    utilityDesc: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
    },
});
