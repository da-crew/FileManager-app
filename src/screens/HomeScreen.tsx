import React, { ReactNode, useEffect, useState } from 'react';
import { SafeAreaView, View, Text, TouchableOpacity, StyleSheet, ScrollView, GestureResponderEvent, StatusBar } from 'react-native';
import HomeSearchBar from '../components/HomeSearchBar';
import { Feather, MaterialIcons, Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { Path } from '../FileSystem';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import { checkManagePermission } from 'manage-external-storage';
import RNFS from 'react-native-fs';
import { openAppSettings, StorageCapacity, StorageDevice } from '../FileSystem';
import { ContainerType } from '../components/ContentContainer/common';
import { useTheme } from '../components/ThemeContext';

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
        });
    }, []);

    const usedPercentage = storageSize
        ? ((storageSize.totalSpace - storageSize.freeSpace) / storageSize.totalSpace) * 100
        : 0;

    const getBarColor = () => {
        if (usedPercentage > 90) return '#FF3B30'; // Red if usage > 90%
        if (usedPercentage > 70) return '#FF9500'; // Orange if usage > 70%
        return '#34C759'; // Green if usage <= 70%
    };

    return (
        <TouchableOpacity style={[styles.storageCard, { backgroundColor: theme.card }]} onPress={onPress}>
            <View style={styles.storageInfo}>
                <View style={styles.storageIconContainer}>
                    {icon}
                </View>
                <View style={styles.storageTextContainer}>
                    <Text style={[styles.storageTitle, { color: theme.text }]}>{device.displayName}</Text>
                    {storageSize ? (
                        <>
                            <View style={styles.storageBarContainer}>
                                <View
                                    style={[
                                        styles.storageBar,
                                        { width: `${usedPercentage}%`, backgroundColor: getBarColor() }
                                    ]}
                                />
                            </View>
                            <Text style={[styles.storageText, { color: theme.text }]}>
                                {`${(storageSize.totalSpace - storageSize.freeSpace).toPrecision(3)} / ${storageSize.totalSpace.toPrecision(3)} ${device.unit}`}
                                <Text style={{ color: theme.textSecondary }}>{` (${Math.round(usedPercentage)}% used)`}</Text>
                            </Text>
                        </>
                    ) : (
                        <Text style={[styles.storageText, { color: theme.textSecondary }]}>Calculating...</Text>
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
    const { theme } = useTheme();

    return (
        <TouchableOpacity style={[styles.utilityButton, { backgroundColor: theme.card }]} onPress={onPress}>
            <View style={styles.utilityIconContainer}>
                {icon}
            </View>
            <View style={styles.utilityTextContainer}>
                <Text style={[styles.utilityTitle, { color: theme.text }]}>{title}</Text>
                <Text style={[styles.utilityDesc, { color: theme.textSecondary }]}>{desc}</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={theme.textSecondary} />
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
            <StatusBar backgroundColor={theme.background} barStyle={theme.statusBarStyle} />
            <HomeSearchBar navigation={navigation} />
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>File Categories</Text>
                <View style={styles.quickAccessGrid}>
                    <QuickAccessButton
                        name="Images"
                        icon={<Feather name="image" size={24} color={theme.text} />}
                        onPress={() => gotoCategory("Images")}
                    />
                    <QuickAccessButton
                        name="Videos"
                        icon={<Feather name="video" size={24} color={theme.text} />}
                        onPress={() => gotoCategory("Videos")}
                    />
                    <QuickAccessButton
                        name="Audio"
                        icon={<Feather name="music" size={24} color={theme.text} />}
                        onPress={() => gotoCategory("Audio")}
                    />
                    <QuickAccessButton
                        name="Documents"
                        icon={<Ionicons name="document-outline" size={24} color={theme.text} />}
                        onPress={() => gotoCategory("Documents")}
                    />
                    <QuickAccessButton
                        name="Downloads"
                        icon={<Feather name="download" size={24} color={theme.text} />}
                        onPress={() => gotoCategory("Downloads")}
                    />
                    <QuickAccessButton
                        name="Recycle Bin"
                        icon={<Feather name="trash-2" size={24} color={theme.text} />}
                        onPress={() => navigation.navigate("RecycleBin")}
                    />
                </View>

                <Text style={[styles.sectionTitle, { color: theme.text }]}>Storage</Text>
                <StorageCard
                    device={internalStorage}
                    icon={<Feather name="smartphone" size={24} color={theme.text} />}
                    onPress={() => gotoStorageDevice(internalStorage)}
                />

                <Text style={[styles.sectionTitle, { color: theme.text }]}>Utilities</Text>
                <View style={styles.utilitiesSection}>
                    <UtilityButton
                        title="Large Files"
                        desc="Files larger than 200MB"
                        icon={<FontAwesome5 name="file-archive" size={22} color={theme.text} />}
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
    },
    scrollView: {
        flex: 1,
        padding: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 16,
        marginBottom: 12,
    },
    quickAccessGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    quickAccessButton: {
        width: '30%',
        alignItems: 'center',
        marginBottom: 16,
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    quickAccessText: {
        fontSize: 14,
        fontWeight: '500',
        textAlign: 'center',
    },
    storageCard: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
    },
    storageInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    storageIconContainer: {
        width: 48,
        height: 48,
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
        marginBottom: 8,
    },
    storageBarContainer: {
        height: 8,
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
    },
    utilitiesSection: {
        marginBottom: 24,
    },
    utilityButton: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
    },
    utilityIconContainer: {
        width: 44,
        height: 44,
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
    },
    utilityDesc: {
        fontSize: 14,
        marginTop: 2,
    },
});