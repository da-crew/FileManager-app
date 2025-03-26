import React, { ReactNode } from 'react';
import { SafeAreaView, View, Text, TouchableOpacity, StyleSheet, ScrollView, GestureResponderEvent } from 'react-native';
import HomeSearchBar from '../components/HomeSearchBar';
import { Feather, MaterialIcons, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { ContainerType, ContentContainerRouteParams } from './ContentContainer';
import { Path } from '../components/PathDisplayer';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';

class StorageDevice {
    name: string;
    size: number;
    maxSize: number;
    unit: string;
    constructor(name: string, size: number, maxSize: number) {
        this.name = name;
        this.size = size;
        this.maxSize = maxSize;
        this.unit = 'GB';
    }

    getUsage() {
        return `${this.size} ${this.unit} / ${this.maxSize} ${this.unit}`;
    }
}

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

const StorageCard = ({ device, icon }: {
    device: StorageDevice,
    icon: ReactNode,
}) => {
    return (
        <View style={styles.storageCard}>
            <View style={styles.storageInfo}>
                {icon}
                <View style={styles.storageTextContainer}>
                    <Text style={styles.storageTitle}>{device.name}</Text>
                    <View style={styles.storageBarContainer}>
                        <View
                            style={[
                                styles.storageBar,
                                { width: `${(device.size / device.maxSize) * 100}%` }
                            ]}
                        />
                    </View>
                    <Text style={styles.storageText}>{device.getUsage()}</Text>
                </View>
            </View>
        </View>
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
            <View style={styles.utilityContent}>
                {icon}
                <View style={styles.utilityTextContainer}>
                    <Text style={styles.utilityTitle}>{title}</Text>
                    <Text style={styles.utilityDesc}>{desc}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );
};

export default function HomeScreen({ navigation }: NativeStackScreenProps<RootStackParamList>) {
    function gotoCategory(name: string) {
        navigation.navigate("Container", new ContentContainerRouteParams(
            name,
            new Path(name, []),
            ContainerType.CATEGORIZED,
        ));
    }

    function gotoStorage(name: string) {
        navigation.navigate("Container", new ContentContainerRouteParams(
            name,
            new Path(name, []),
            ContainerType.DEFAULT,
        ));
    }

    return (
        <SafeAreaView style={styles.container}>
            <HomeSearchBar navigation={navigation} />
            <ScrollView style={styles.scrollView}>
                <View style={styles.quickAccessGrid}>
                    <QuickAccessButton
                        name="Images"
                        icon={<Feather name="image" size={28} color="black" />}
                        onPress={() => gotoCategory("Images")}
                    />
                    <QuickAccessButton
                        name="Videos"
                        icon={<Feather name="video" size={28} color="black" />}
                        onPress={() => gotoCategory("Videos")}
                    />
                    <QuickAccessButton
                        name="Audio"
                        icon={<Feather name="music" size={28} color="black" />}
                        onPress={() => gotoCategory("Audio")}
                    />
                    <QuickAccessButton
                        name="Documents"
                        icon={<Ionicons name="document-outline" size={28} color="black" />}
                        onPress={() => gotoCategory("Documents")}
                    />
                    <QuickAccessButton
                        name="Downloads"
                        icon={<Feather name="download" size={28} color="black" />}
                        onPress={() => gotoStorage("Downloads")}
                    />
                    <QuickAccessButton
                        name="Recycle Bin"
                        icon={<Feather name="trash" size={28} color="black" />}
                        onPress={() => navigation.navigate("RecycleBin")}
                    />
                </View>

                <Text style={styles.sectionTitle}>All storage</Text>
                <View style={styles.storageSection}>
                    <StorageCard
                        device={new StorageDevice('Internal storage', 40.25, 256.0)}
                        icon={<Feather name="smartphone" size={24} color="#666" />}
                    />
                    <StorageCard
                        device={new StorageDevice('SD card', 16.0, 32.0)}
                        icon={<MaterialCommunityIcons name="sd" size={24} color="#666" />}
                    />
                </View>

                <Text style={styles.sectionTitle}>Utilities</Text>
                <View style={styles.utilitiesSection}>
                    <UtilityButton
                        title="Large File"
                        desc="Files larger than 200MB"
                        icon={<MaterialCommunityIcons name="file-document-outline" size={24} color="#666" />}
                        onPress={() => navigation.navigate("LargeFiles")}
                    />
                    <UtilityButton
                        title="Duplicate Files"
                        desc="Find and remove duplicate files"
                        icon={<MaterialCommunityIcons name="content-copy" size={24} color="#666" />}
                        onPress={() => navigation.navigate("Duplicates")}
                    />
                    <UtilityButton
                        title="Test Screen"
                        desc="For testing purposes only"
                        icon={<MaterialCommunityIcons name="content-copy" size={24} color="#666" />}
                        onPress={() => navigation.navigate("Test")}
                    />
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
        padding: 16,
    },
    quickAccessGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
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
