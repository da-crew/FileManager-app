import React, { useState } from "react";
import {SafeAreaView,ScrollView,View,Text,Switch,StyleSheet,TouchableOpacity,StatusBar,} from "react-native";

// Icons
import { Ionicons } from "@expo/vector-icons/";

// Navigation
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../App";

// หน้าจอการตั้งค่าแอปพลิเคชัน
export default function SettingsScreen({ navigation }: NativeStackScreenProps<RootStackParamList>) {
    // ตั้งค่าแอปพลิเคชันเริ่มต้น
    const [imageViewer, setImageViewer] = useState(true);        // เปิดใช้งานโปรแกรมดูรูปภาพ
    const [videoPlayer, setVideoPlayer] = useState(true);        // เปิดใช้งานโปรแกรมเล่นวิดีโอ
    const [musicPlayer, setMusicPlayer] = useState(true);        // เปิดใช้งานโปรแกรมเล่นเพลง
    const [textEditor, setTextEditor] = useState(true);          // เปิดใช้งานโปรแกรมแก้ไขข้อความ
    
    // ตั้งค่าการแสดงผล
    const [darkMode, setDarkMode] = useState(false);             // โหมดกลางคืน (ธีมสีเข้ม)
    const [sortByDate, setSortByDate] = useState(true);          // เรียงตามวันที่เป็นค่าเริ่มต้น
    
    // ตั้งค่าการแจ้งเตือน
    const [storageFull, setStorageFull] = useState(true);        // แจ้งเตือนเมื่อพื้นที่จัดเก็บเหลือน้อย
    
    // ตั้งค่าถังขยะ
    const [recycleBin, setRecycleBin] = useState(true);          // ใช้ถังขยะเป็นค่าเริ่มต้น
    const [recycleConfirm, setRecycleConfirm] = useState(true);  // แสดงการยืนยันก่อนลบ
    
    // ข้อมูลแอป
    const version = "1.0.0";                                     // เวอร์ชันของแอปพลิเคชัน

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar backgroundColor="#fff" barStyle="dark-content" />
            
            {/* ส่วนหัวของหน้าจอ */}
            <View style={styles.header}>
                <TouchableOpacity 
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                >
                    <Ionicons name="chevron-back" size={28} color="#007AFF" />
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
                        style={[styles.row, { borderBottomWidth: 0 }]}
                        onPress={() => setStorageFull(!storageFull)}
                    >
                        <View style={styles.rowContent}>
                            <View style={[styles.iconCircle, {backgroundColor: '#FF370020'}]}>
                                <Ionicons name="disc-outline" size={20} color="#FF3700" />
                            </View>
                            <View>
                                <Text style={styles.label}>Storage Full</Text>
                                <Text style={styles.subLabel}>
                                    Notify when storage space is less than 2%
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
                            <View style={[styles.iconCircle, {backgroundColor: '#5856D620'}]}>
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
        borderBottomWidth: 1,
        borderBottomColor: "#E5E5EA",
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
