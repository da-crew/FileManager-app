import React, { ReactNode } from 'react';
import { SafeAreaView, View, Text, TouchableOpacity, StyleSheet, ScrollView, GestureResponderEvent } from 'react-native';
import HomeSearchBar from '../components/HomeSearchBar';
import { Feather, MaterialIcons, Ionicons, Octicons, MaterialCommunityIcons, Entypo } from '@expo/vector-icons';
import { ContainerType, ContentContainerRouteParams } from './ContentContainer';
import { Path } from '../components/PathDisplayer';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';

class StorageDevice {
    name: string;
    size: number;
    maxSize: number;
    unit: string;
    constructor(name: string, size: number, maxSize: number) { // in bytes
        this.name = name;
        this.size = size;
        this.maxSize = maxSize;
        this.unit = 'GB';
    }

    getUsage() {
        return `${this.size} ${this.unit} / ${this.maxSize} ${this.unit}`;
    }
}



const StorageDeviceCard = ({ device, icon, onPress }: {
    device: StorageDevice, 
    icon: ReactNode,
    onPress?: (event: GestureResponderEvent) => void
}) => {
    return <TouchableOpacity style={{ margin: 10, marginLeft: 0 }} onPress={onPress}>
        <View style={{flexDirection: 'row'}}>
            {icon}
            <View style={{ marginLeft: 10 }}>
                <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{device.name}</Text>
                <Text>{device.getUsage()}</Text>
            </View>
        </View>
    </TouchableOpacity>;
};

const UtilityCard = ({ title, desc, icon, onPress }: {
    title: string,
    desc: string,
    icon: ReactNode,
    onPress: (event: GestureResponderEvent) => void
}) => {
    return (
        <TouchableOpacity style={{ margin: 10, marginLeft: 0 }} onPress={onPress}>
            <View style={{ flexDirection: 'row' }}>
                {icon}
                <View style={{ marginLeft: 10 }}>
                    <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{title}</Text>
                    <Text>{desc}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const CategoryCard = ({ name, icon, onPress }: {
    name: string,
    icon: ReactNode,
    onPress: (event: GestureResponderEvent) => void
}) => {
    return (
        <TouchableOpacity style={{ margin: 10, marginLeft: 0, justifyContent: 'center' }} onPress={onPress}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
                {icon}
                <View style={{ marginLeft: 10 }}>
                    <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{name}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );
};



//วาง "StatusBar" จาก "expo-status-bar" ถ้าไม่ได้ผล
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
        <SafeAreaView>
            <HomeSearchBar navigation={navigation} />
            <ScrollView style={{ padding: 20 }}>
                <View style={styles.sectionTitleContainer}>
                    <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Categories</Text>
                </View>
                <View>
                    <CategoryCard
                        name='Images'
                        icon={<Feather name="image" size={40} color="black" />}
                        onPress={() => gotoCategory("Images")}
                    />
                    <CategoryCard
                        name='Videos'
                        icon={<Octicons name="video" size={40} color="black" />}
                        onPress={() => gotoCategory("Videos")}
                    />
                    <CategoryCard
                        name='Audio'
                        icon={<MaterialIcons name="multitrack-audio" size={40} color="black" />}
                        onPress={() => gotoCategory("Audio")}
                    />
                    <CategoryCard
                        name='Documents'
                        icon={<Ionicons name="document-outline" size={40} color="black" />}
                        onPress={() => gotoCategory("Documents")}
                    />
                    <CategoryCard
                        name='Downloads'
                        icon={<Feather name="download" size={40} color="black" />}
                        onPress={() => gotoStorage("Downloads")}
                    />
                </View >

                <View style={styles.sectionTitleContainer}>
                    <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Storage Devices</Text>
                </View>
                <View>
                    <StorageDeviceCard
                        device={new StorageDevice('Internal Storage', 40.25, 256.0)}
                        icon={<Feather name="smartphone" size={40} />}
                        onPress={() => gotoStorage("Internal Storage")}
                    />
                    <StorageDeviceCard
                        device={new StorageDevice('SD Card', 16.0, 32.0)}
                        icon={<MaterialCommunityIcons name="sd" size={40} />}
                        onPress={() => gotoStorage("SD Card")}
                    />
                </View>

                <View style={styles.sectionTitleContainer}>
                    <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Utilities</Text>
                </View>
                <View>
                    <UtilityCard
                        title='Scan for Large Files'
                        desc='Find large files on your device'
                        icon={<MaterialCommunityIcons name='data-matrix-scan' size={40} />}
                        onPress={() => navigation.navigate("LargeFiles")}
                    />
                    <UtilityCard
                        title='Scan for Duplicate Files'
                        desc='Find duplicate files on your device'
                        icon={<MaterialCommunityIcons name='content-duplicate' size={40} />}
                        onPress={() => navigation.navigate("Duplicates")}
                    />
                    <UtilityCard
                        title='Recycle Bin'
                        desc='Manage and restore deleted files'
                        icon={<Feather name="trash" size={40} color="black" />}
                        onPress={() => navigation.navigate("RecycleBin")}
                    />
                </View >
            </ScrollView >
        </SafeAreaView >
    );
}

const styles = StyleSheet.create({
    sectionTitleContainer: { alignItems: 'center' },
});
