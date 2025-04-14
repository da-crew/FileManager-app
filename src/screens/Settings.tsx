import React, { useState } from "react";
import { SafeAreaView, ScrollView, View, Text, Switch, StyleSheet, TouchableOpacity, StatusBar, } from "react-native";
import { Ionicons } from "@expo/vector-icons/";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../App";
import { requestNotificationPermission, checkStorageUsage } from "../services/NotificationService";
import { useTheme } from "../components/ThemeContext";

// หน้าจอการตั้งค่าแอปพลิเคชัน
export default function SettingsScreen({ navigation }: NativeStackScreenProps<RootStackParamList>) {

    const { theme, changeTheme, isDarkMode } = useTheme();

    const [imageViewer, setImageViewer] = useState(true);
    const [videoPlayer, setVideoPlayer] = useState(true);
    const [musicPlayer, setMusicPlayer] = useState(true);
    const [textEditor, setTextEditor] = useState(true);

    // Display settings
    const [darkMode, setDarkMode] = useState(false);
    const [sortByDate, setSortByDate] = useState(true);

    // Notification settings
    const [storageFull, setStorageFull] = useState(true);

    // Recycle bin settings
    const [recycleBin, setRecycleBin] = useState(true);
    const [recycleConfirm, setRecycleConfirm] = useState(true);

    // App info
    const version = "1.0.0";

    return (
        <SafeAreaView style={[styles.container, {backgroundColor: theme.background}]}>
            <StatusBar barStyle='default' backgroundColor={theme.background}/>
            <View style={[styles.header, {backgroundColor: theme.toolbarColor}]}>
                <TouchableOpacity 
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                >
                    <AntDesign name="left" size={24} color={theme.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Settings</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* 1. แอปพลิเคชันเริ่มต้น */}
                <Text style={styles.sectionHeader}>Default Applications</Text>
                <View style={styles.sectionContainer}>
                    {/* โปรแกรมดูรูปภาพ */}
                    <SettingItem 
                        icon="image-outline"
                        iconColor="#007AFF"
                        iconBgColor="#007AFF20"
                        label="Image Viewer"
                        value={imageViewer}
                        onValueChange={setImageViewer}
                    />
                    
                    {/* โปรแกรมเล่นวิดีโอ */}
                    <SettingItem 
                        icon="videocam-outline"
                        iconColor="#FF2D55"
                        iconBgColor="#FF2D5520"
                        label="Video Player"
                        value={videoPlayer}
                        onValueChange={setVideoPlayer}
                    />
                    
                    {/* โปรแกรมเล่นเพลง */}
                    <SettingItem 
                        icon="musical-notes-outline"
                        iconColor="#FF9500"
                        iconBgColor="#FF950020"
                        label="Music Player"
                        value={musicPlayer}
                        onValueChange={setMusicPlayer}
                    />
                    
                    {/* โปรแกรมแก้ไขข้อความ */}
                    <SettingItem 
                        icon="document-text-outline"
                        iconColor="#34C759"
                        iconBgColor="#34C75920"
                        label="Text Editor"
                        value={textEditor}
                        onValueChange={setTextEditor}
                        isLast={true}
                    />
                </View>

                {/* 2. ธีมและการแสดงผล */}
                <Text style={styles.sectionHeader}>Theme and Display</Text>
                <View style={styles.sectionContainer}>
                    {/* โหมดกลางคืน */}
                    <SettingItem 
                        icon="moon-outline"
                        iconColor="#8E8E93"
                        iconBgColor="#8E8E9320"
                        label="Night Mode"
                        value={darkMode}
                        onValueChange={setDarkMode}
                    />
                    
                    {/* เรียงตามวันที่เป็นค่าเริ่มต้น */}
                    <SettingItem 
                        icon="calendar-outline"
                        iconColor="#5856D6"
                        iconBgColor="#5856D620"
                        label="Sort by date as default"
                        value={sortByDate}
                        onValueChange={setSortByDate}
                        isLast={true}
                    />
                </View>

                {/* 3. การแจ้งเตือน */}
                <Text style={styles.sectionHeader}>Notifications</Text>
                <View style={styles.sectionContainer}>
                    {/* แจ้งเตือนเมื่อพื้นที่เก็บข้อมูลเต็ม */}
                    <TouchableOpacity
                        style={styles.row}
                        onPress={() => setImageViewer(!imageViewer)}
                    >
                        <View style={styles.rowContent}>
                            <MaterialCommunityIcons name="image" size={24} color={theme.text} style={styles.rowIcon} />
                            <Text style={[styles.label, {color: theme.text}]}>Image viewer</Text>
                        </View>
                        <MaterialCommunityIcons
                            name={imageViewer ? "checkbox-marked" : "checkbox-blank-outline"}
                            size={24}
                            color={theme.iconColor}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.row}
                        onPress={() => setVideoPlayer(!videoPlayer)}
                    >
                        <View style={styles.rowContent}>
                            <MaterialCommunityIcons name="video" size={24} color={theme.text} style={styles.rowIcon} />
                            <Text style={[styles.label, {color: theme.text}]}>Video player</Text>
                        </View>
                        <MaterialCommunityIcons
                            name={videoPlayer ? "checkbox-marked" : "checkbox-blank-outline"}
                            size={24}
                            color={theme.iconColor}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.row}
                        onPress={() => setMusicPlayer(!musicPlayer)}
                    >
                        <View style={styles.rowContent}>
                            <MaterialCommunityIcons name="music" size={24} color={theme.text} style={styles.rowIcon} />
                            <Text style={[styles.label, {color: theme.text}]}>Music player</Text>
                        </View>
                        <MaterialCommunityIcons
                            name={musicPlayer ? "checkbox-marked" : "checkbox-blank-outline"}
                            size={24}
                            color={theme.iconColor}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.row, { borderBottomWidth: undefined }]}
                        onPress={() => setTextEditor(!textEditor)}
                    >
                        <View style={styles.rowContent}>
                            <MaterialCommunityIcons name="text-box" size={24} color={theme.text} style={styles.rowIcon} />
                            <Text style={[styles.label, {color: theme.text}]}>Text editor</Text>
                        </View>
                        <MaterialCommunityIcons
                            name={textEditor ? "checkbox-marked" : "checkbox-blank-outline"}
                            size={24}
                            color={theme.iconColor}
                        />
                    </TouchableOpacity>
                </View>

                <Text style={styles.sectionHeader}>Appearance</Text>
                <View style={[styles.sectionContainer, {backgroundColor: theme.toolbarColor}]}>
                    <TouchableOpacity
                        style={[styles.row, { borderBottomWidth: undefined }]}
                    >
                        <View style={styles.rowContent}>
                            <MaterialCommunityIcons name="theme-light-dark" size={24} color={theme.text} style={styles.rowIcon} />
                            <Text style={[styles.label, { color: theme.text }]}>Dark mode</Text>
                        </View>
                        <Switch
                            value={isDarkMode}
                            onValueChange={(value) => {
                                changeTheme(!isDarkMode);
                                setDarkMode(value);
                            }}
                            trackColor={{ false: "#767577", true: theme.text }}
                            thumbColor={isDarkMode ? theme.text : "#f4f3f4"}
                        />
                    </TouchableOpacity>
                </View>

                <Text style={styles.sectionHeader}>Notification Setting</Text>
                <View style={[styles.sectionContainer, { backgroundColor: theme.toolbarColor }]}>
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
                            <MaterialCommunityIcons name="harddisk" size={24} color={theme.text} style={styles.rowIcon} />
                            <View>
                                <Text style={[styles.label, {color: theme.text}]}>Storage is full</Text>
                                <Text style={[styles.subLabel, {color: theme.textSecondary}]}>
                                    Show when the storage is over 95% full
                                </Text>
                            </View>
                        </View>
                        <MaterialCommunityIcons
                            name={storageFull ? "checkbox-marked" : "checkbox-blank-outline"}
                            size={24}
                            color={theme.iconColor}
                        />
                    </TouchableOpacity>
                </View>

                {/* 4. ถังขยะ */}
                <Text style={styles.sectionHeader}>Trash</Text>
                <View style={styles.sectionContainer}>
                    {/* ใช้ถังขยะเป็นค่าเริ่มต้น */}
                    <SettingItem
                        icon="trash-outline"
                        iconColor="#8E8E93"
                        iconBgColor="#8E8E9320"
                        label="Use Trash by default"
                        value={recycleBin}
                        onValueChange={setRecycleBin}
                    />

                    {/* แสดงการยืนยันก่อนลบ */}
                    <SettingItem
                        icon="alert-circle-outline"
                        iconColor="#FF9500"
                        iconBgColor="#FF950020"
                        label="Show confirmation before delete"
                        value={recycleConfirm}
                        onValueChange={setRecycleConfirm}
                        isLast={true}
                    />
                </View>

                {/* 5. เกี่ยวกับแอป */}
                <Text style={styles.sectionHeader}>About App</Text>
                <View style={styles.sectionContainer}>
                    <View style={[styles.row, { borderBottomWidth: 0 }]}>
                        <View style={styles.rowContent}>
                            <View style={[styles.iconCircle, { backgroundColor: '#5856D620' }]}>
                                <Ionicons name="information-circle-outline" size={20} color="#5856D6" />
                            </View>
                            <Text style={styles.label}>Version</Text>
                        </View>
                        <Text style={styles.versionText}>{version}</Text>
                    </View>
                </View>
                
                {/* ส่วนท้าย */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>File Manager App © 2023-2024</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

// คอมโพเนนต์สำหรับรายการตั้งค่าแบบสวิตช์ทั่วไป
function SettingItem({ 
    icon,                 // ชื่อไอคอน
    iconColor,            // สีของไอคอน 
    iconBgColor,          // สีพื้นหลังของไอคอน
    label,                // ข้อความที่แสดง
    value,                // ค่าสถานะของสวิตช์
    onValueChange,        // ฟังก์ชันเมื่อค่าเปลี่ยน
    isLast = false        // เป็นรายการสุดท้ายหรือไม่
}: { 
    icon: any; 
    iconColor: string; 
    iconBgColor: string; 
    label: string; 
    value: boolean; 
    onValueChange: (val: boolean) => void;
    isLast?: boolean;
}) {
    return (
        <TouchableOpacity
            style={[styles.row, isLast && { borderBottomWidth: 0 }]}
            onPress={() => onValueChange(!value)}
        >
            <View style={styles.rowContent}>
                <View style={[styles.iconCircle, { backgroundColor: iconBgColor }]}>
                    <Ionicons name={icon} size={20} color={iconColor} />
                </View>
                <Text style={styles.label}>{label}</Text>
            </View>
            <Switch
                value={value}
                onValueChange={onValueChange}
                trackColor={{ false: "#E5E5EA", true: "#007AFF80" }}
                thumbColor={value ? "#007AFF" : "#fff"}
                ios_backgroundColor="#E5E5EA"
            />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    // Container styles
    container: {
        flex: 1,
        backgroundColor: "#F8F8F8"
    },
    scrollView: {
        flex: 1,
    },

    // Header styles
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: "#fff",
        // borderBottomWidth: 1,
        // borderBottomColor: "#E5E5EA",
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

    // Section styles
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

    // Row styles
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

    // Text styles
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
    versionText: {
        fontSize: 15,
        color: "#8E8E93"
    },

    // Footer styles
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
