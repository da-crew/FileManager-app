import React, { useState } from "react";
import { SafeAreaView, ScrollView, View, Text, Switch, StyleSheet, TouchableOpacity, StatusBar, Image } from "react-native";
import AntDesign from "@expo/vector-icons/AntDesign";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import Ionicons from "@expo/vector-icons/Ionicons";
import { RootStackParamList } from "../App";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import PushNotification from "react-native-push-notification";
import { PermissionsAndroid } from "react-native";
import { checkStorageUsage, requestNotificationPermission, } from '../services/NotificationService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from "react-native";


export default function SettingsScreen({ navigation }: NativeStackScreenProps<RootStackParamList>) {
    const [imageViewer, setImageViewer] = useState(true);
    const [videoPlayer, setVideoPlayer] = useState(true);
    const [musicPlayer, setMusicPlayer] = useState(true);
    const [textEditor, setTextEditor] = useState(true);
    const [darkMode, setDarkMode] = useState(false);
    const [storageFull, setStorageFull] = useState(true);
    const [recycleBin, setRecycleBin] = useState(true);
    const [recycleConfirm, setRecycleConfirm] = useState(true);

    // เพิ่มการตั้งค่าเพิ่มเติม
    const [sortByDate, setSortByDate] = useState(true);
    const [language, setLanguage] = useState('thai');

    const version = "1.0.0";

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar backgroundColor="#fff" barStyle="dark-content" />
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                >
                    <Ionicons name="chevron-back" size={28} color="#007AFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>ตั้งค่า</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* ส่วนข้อมูลผู้ใช้ */}
                <View style={styles.profileSection}>
                    <View style={styles.profileIconContainer}>
                        <Ionicons name="person" size={40} color="#fff" />
                    </View>
                    <View style={styles.profileInfo}>
                        <Text style={styles.profileName}>ผู้ใช้ทั่วไป</Text>
                        <Text style={styles.profileStatus}>ใช้งานฟรี</Text>
                    </View>
                    <TouchableOpacity style={styles.upgradeButton}>
                        <Text style={styles.upgradeText}>อัพเกรด</Text>
                    </TouchableOpacity>
                </View>

                {/* แอปพลิเคชันที่ติดตั้ง */}
                <Text style={styles.sectionHeader}>แอปพลิเคชันที่ติดตั้ง</Text>
                <View style={styles.sectionContainer}>
                    <TouchableOpacity
                        style={styles.row}
                        onPress={() => setImageViewer(!imageViewer)}
                    >
                        <View style={styles.rowContent}>
                            <View style={[styles.iconCircle, { backgroundColor: '#007AFF20' }]}>
                                <Ionicons name="image-outline" size={20} color="#007AFF" />
                            </View>
                            <Text style={styles.label}>โปรแกรมดูรูปภาพ</Text>
                        </View>
                        <Switch
                            value={imageViewer}
                            onValueChange={setImageViewer}
                            trackColor={{ false: "#E5E5EA", true: "#007AFF80" }}
                            thumbColor={imageViewer ? "#007AFF" : "#fff"}
                            ios_backgroundColor="#E5E5EA"
                        />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.row}
                        onPress={() => setVideoPlayer(!videoPlayer)}
                    >
                        <View style={styles.rowContent}>
                            <View style={[styles.iconCircle, { backgroundColor: '#FF2D5520' }]}>
                                <Ionicons name="videocam-outline" size={20} color="#FF2D55" />
                            </View>
                            <Text style={styles.label}>โปรแกรมเล่นวิดีโอ</Text>
                        </View>
                        <Switch
                            value={videoPlayer}
                            onValueChange={setVideoPlayer}
                            trackColor={{ false: "#E5E5EA", true: "#007AFF80" }}
                            thumbColor={videoPlayer ? "#007AFF" : "#fff"}
                            ios_backgroundColor="#E5E5EA"
                        />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.row}
                        onPress={() => setMusicPlayer(!musicPlayer)}
                    >
                        <View style={styles.rowContent}>
                            <View style={[styles.iconCircle, { backgroundColor: '#FF950020' }]}>
                                <Ionicons name="musical-notes-outline" size={20} color="#FF9500" />
                            </View>
                            <Text style={styles.label}>โปรแกรมเล่นเพลง</Text>
                        </View>
                        <Switch
                            value={musicPlayer}
                            onValueChange={setMusicPlayer}
                            trackColor={{ false: "#E5E5EA", true: "#007AFF80" }}
                            thumbColor={musicPlayer ? "#007AFF" : "#fff"}
                            ios_backgroundColor="#E5E5EA"
                        />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.row}
                        onPress={() => setTextEditor(!textEditor)}
                    >
                        <View style={styles.rowContent}>
                            <View style={[styles.iconCircle, { backgroundColor: '#34C75920' }]}>
                                <Ionicons name="document-text-outline" size={20} color="#34C759" />
                            </View>
                            <Text style={styles.label}>โปรแกรมแก้ไขข้อความ</Text>
                        </View>
                        <Switch
                            value={textEditor}
                            onValueChange={setTextEditor}
                            trackColor={{ false: "#E5E5EA", true: "#007AFF80" }}
                            thumbColor={textEditor ? "#007AFF" : "#fff"}
                            ios_backgroundColor="#E5E5EA"
                        />
                    </TouchableOpacity>
                </View>

                {/* ธีมและการแสดงผล */}
                <Text style={styles.sectionHeader}>ธีมและการแสดงผล</Text>
                <View style={styles.sectionContainer}>
                    <TouchableOpacity
                        style={styles.row}
                        onPress={() => setDarkMode(!darkMode)}
                    >
                        <View style={styles.rowContent}>
                            <View style={[styles.iconCircle, { backgroundColor: '#8E8E9320' }]}>
                                <Ionicons name="moon-outline" size={20} color="#8E8E93" />
                            </View>
                            <Text style={styles.label}>โหมดกลางคืน</Text>
                        </View>
                        <Switch
                            value={darkMode}
                            onValueChange={setDarkMode}
                            trackColor={{ false: "#E5E5EA", true: "#007AFF80" }}
                            thumbColor={darkMode ? "#007AFF" : "#fff"}
                            ios_backgroundColor="#E5E5EA"
                        />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.row}
                        onPress={() => setSortByDate(!sortByDate)}
                    >
                        <View style={styles.rowContent}>
                            <View style={[styles.iconCircle, { backgroundColor: '#5856D620' }]}>
                                <Ionicons name="calendar-outline" size={20} color="#5856D6" />
                            </View>
                            <Text style={styles.label}>เรียงตามวันที่เป็นค่าเริ่มต้น</Text>
                        </View>
                        <Switch
                            value={sortByDate}
                            onValueChange={setSortByDate}
                            trackColor={{ false: "#E5E5EA", true: "#007AFF80" }}
                            thumbColor={sortByDate ? "#007AFF" : "#fff"}
                            ios_backgroundColor="#E5E5EA"
                        />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.row}>
                        <View style={styles.rowContent}>
                            <View style={[styles.iconCircle, { backgroundColor: '#007AFF20' }]}>
                                <Ionicons name="language-outline" size={20} color="#007AFF" />
                            </View>
                            <Text style={styles.label}>ภาษา</Text>
                        </View>
                        <View style={styles.valueContainer}>
                            <Text style={styles.valueText}>ไทย</Text>
                            <Ionicons name="chevron-forward" size={18} color="#C7C7CC" />
                        </View>
                    </TouchableOpacity>
                </View>

                {/* การแจ้งเตือน */}
                <Text style={styles.sectionHeader}>การแจ้งเตือน</Text>
                <View style={styles.sectionContainer}>
                    <TouchableOpacity
                        style={styles.row}
                        onPress={async () => {
                            const newValue = !storageFull;
                            setStorageFull(newValue);

                            if (newValue) {
                                await requestNotificationPermission();
                                await checkStorageUsage(); // กดแล้วแจ้งทันที
                            } else {
                            }
                        }}
                    >
                        <View style={styles.rowContent}>
                            <View style={[styles.iconCircle, { backgroundColor: '#FF370020' }]}>
                                <Ionicons name="disc-outline" size={20} color="#FF3700" />
                            </View>
                            <View>
                                <Text style={styles.label}>พื้นที่เก็บข้อมูลเต็ม</Text>
                                <Text style={styles.subLabel}>
                                    แจ้งเตือนทุกครั้งเมื่อพื้นที่เหลือน้อยกว่า 5%
                                </Text>
                            </View>
                        </View>
                        <Switch
                            value={storageFull}
                            onValueChange={setStorageFull}
                            trackColor={{ false: "#E5E5EA", true: "#007AFF80" }}
                            thumbColor={storageFull ? "#007AFF" : "#fff"}
                            ios_backgroundColor="#E5E5EA"
                        />
                    </TouchableOpacity>
                </View>

                {/* ถังขยะ */}
                <Text style={styles.sectionHeader}>ถังขยะ</Text>
                <View style={styles.sectionContainer}>
                    <TouchableOpacity
                        style={styles.row}
                        onPress={() => setRecycleBin(!recycleBin)}
                    >
                        <View style={styles.rowContent}>
                            <View style={[styles.iconCircle, { backgroundColor: '#8E8E9320' }]}>
                                <Ionicons name="trash-outline" size={20} color="#8E8E93" />
                            </View>
                            <Text style={styles.label}>ใช้ถังขยะเป็นค่าเริ่มต้น</Text>
                        </View>
                        <Switch
                            value={recycleBin}
                            onValueChange={setRecycleBin}
                            trackColor={{ false: "#E5E5EA", true: "#007AFF80" }}
                            thumbColor={recycleBin ? "#007AFF" : "#fff"}
                            ios_backgroundColor="#E5E5EA"
                        />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.row}
                        onPress={() => setRecycleConfirm(!recycleConfirm)}
                    >
                        <View style={styles.rowContent}>
                            <View style={[styles.iconCircle, { backgroundColor: '#FF950020' }]}>
                                <Ionicons name="alert-circle-outline" size={20} color="#FF9500" />
                            </View>
                            <Text style={styles.label}>แสดงการยืนยันก่อนลบ</Text>
                        </View>
                        <Switch
                            value={recycleConfirm}
                            onValueChange={setRecycleConfirm}
                            trackColor={{ false: "#E5E5EA", true: "#007AFF80" }}
                            thumbColor={recycleConfirm ? "#007AFF" : "#fff"}
                            ios_backgroundColor="#E5E5EA"
                        />
                    </TouchableOpacity>
                </View>

                {/* เกี่ยวกับแอป */}
                <Text style={styles.sectionHeader}>เกี่ยวกับแอป</Text>
                <View style={styles.sectionContainer}>
                    <View style={styles.row}>
                        <View style={styles.rowContent}>
                            <View style={[styles.iconCircle, { backgroundColor: '#5856D620' }]}>
                                <Ionicons name="information-circle-outline" size={20} color="#5856D6" />
                            </View>
                            <Text style={styles.label}>เวอร์ชั่น</Text>
                        </View>
                        <Text style={styles.versionText}>{version}</Text>
                    </View>
                </View>

                {/* ปุ่มลงชื่อออก */}
                <TouchableOpacity style={styles.logoutButton}>
                    <Text style={styles.logoutText}>ออกจากระบบ</Text>
                </TouchableOpacity>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>แอปจัดการไฟล์ © 2023-2024</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F8F8F8"
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderBottomColor: "#E5E5EA",
        marginTop: Platform.OS === 'ios' ? 0 : 20
    },
    backButton: {
        padding: 4
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#000",
        flex: 1,
        textAlign: 'center'
    },
    scrollView: {
        flex: 1,
    },
    profileSection: {
        backgroundColor: "#fff",
        flexDirection: "row",
        alignItems: "center",
        padding: 20,
        marginTop: 20,
        marginHorizontal: 16,
        borderRadius: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 3,
    },
    profileIconContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: "#007AFF",
        justifyContent: "center",
        alignItems: "center"
    },
    profileInfo: {
        marginLeft: 15,
        flex: 1
    },
    profileName: {
        fontSize: 18,
        fontWeight: "600",
        color: "#000",
        marginBottom: 4
    },
    profileStatus: {
        fontSize: 14,
        color: "#8E8E93"
    },
    upgradeButton: {
        backgroundColor: "#007AFF10",
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 16,
    },
    upgradeText: {
        color: "#007AFF",
        fontWeight: "600",
        fontSize: 14
    },
    sectionHeader: {
        fontSize: 14,
        fontWeight: "600",
        marginTop: 24,
        marginBottom: 8,
        marginLeft: 16,
        color: "#8E8E93",
    },
    sectionContainer: {
        backgroundColor: "#fff",
        borderRadius: 12,
        marginHorizontal: 16,
        overflow: 'hidden',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#F2F2F7"
    },
    rowContent: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1
    },
    iconCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16
    },
    label: {
        fontSize: 16,
        color: "#000",
        fontWeight: "500"
    },
    subLabel: {
        fontSize: 13,
        color: "#8E8E93",
        marginTop: 3
    },
    valueContainer: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    valueText: {
        fontSize: 15,
        color: "#8E8E93",
        marginRight: 6
    },
    versionText: {
        fontSize: 15,
        color: "#8E8E93"
    },
    logoutButton: {
        backgroundColor: "#FF3B3020",
        marginTop: 30,
        marginHorizontal: 16,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 16
    },
    logoutText: {
        color: "#FF3B30",
        fontWeight: "600",
        fontSize: 16
    },
    footer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 20,
        marginBottom: 20
    },
    footerText: {
        fontSize: 13,
        color: "#8E8E93"
    }
});
