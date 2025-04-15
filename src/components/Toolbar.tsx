import React from 'react';
import { View, Text, TouchableOpacity, GestureResponderEvent } from 'react-native';
import { MaterialIcons, Ionicons, AntDesign } from '@expo/vector-icons';
import { FontAwesome5 } from '@expo/vector-icons';
import PropTypes from 'prop-types';
import { ContainerType, ContentContainerRouteParams } from './ContentContainer/common';
import { Path } from '../FileSystem';
import { useTheme } from './ThemeContext';
import { invertHexColor } from './themes';

// กำหนด Props ที่จำเป็นสำหรับ Toolbar
interface ToolbarProps {
    navigation: any,
    containerName: string,
    path?: Path,
    goBackHandler: (event: GestureResponderEvent) => void,
    layoutChangeHandler?: (event: GestureResponderEvent) => void,
    sortByHandler?: (event: GestureResponderEvent) => void,
    createHandler?: (event: GestureResponderEvent) => void,
    menuHandler?: (event: GestureResponderEvent) => void,
}

/**
 * คอมโพเนนต์แถบเครื่องมือสำหรับการนำทางและแสดงปุ่มการทำงานต่างๆ
 *
 * @param {Object} props - คุณสมบัติของคอมโพเนนต์
 * @param {Object} props.navigation - ออบเจ็กต์สำหรับการนำทาง
 * @param {Function} props.navigation.goBack - ฟังก์ชันสำหรับนำทางกลับ
 * @param {Function} props.navigation.navigate - ฟังก์ชันสำหรับนำทางไปยังเส้นทางที่ระบุ
 * @param {string} props.containerName - ชื่อของคอนเทนเนอร์ที่จะแสดง
 * @param {Function} [props.layoutChangeHandler] - ฟังก์ชันจัดการการเปลี่ยนรูปแบบการแสดงผล (ตัวเลือก)
 * @param {Function} [props.sortByHandler] - ฟังก์ชันจัดการการเรียงลำดับรายการ (ตัวเลือก)
 * @param {Function} [props.createHandler] - ฟังก์ชันจัดการการสร้างรายการใหม่ (ตัวเลือก)
 * @param {Function} [props.menuHandler] - ฟังก์ชันจัดการเมนูสามจุด (ตัวเลือก)
 * @returns {JSX.Element} คอมโพเนนต์ที่เรนเดอร์แล้ว
 */

export default function  Toolbar({ navigation, containerName, path, goBackHandler, layoutChangeHandler, sortByHandler, createHandler, menuHandler }: ToolbarProps)  {
    const { theme } = useTheme();
    return (
        <View style={{ 
            flexDirection: 'row', 
            alignItems: 'center', 
            backgroundColor: theme.toolbarColor,
            paddingVertical: 8,
            paddingHorizontal: 10,
            elevation: 4,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 3,
            borderBottomWidth: 1,
            borderBottomColor: '#f2f2f2'
        }}>
            <TouchableOpacity  style={{ 
                    padding: 10, 
                    marginRight: 5, 
                    borderRadius: 20,
                    backgroundColor: 'rgba(242, 242, 242, 0.6)' 
                }}  onPress={goBackHandler}>
                <MaterialIcons name="arrow-back-ios-new" size={20} color={theme.text} />
            </TouchableOpacity>
            <Text style={{ fontSize: 20, color: theme.text }}>{containerName}</Text>
            <TouchableOpacity
                style={{ marginLeft: 'auto', marginRight: 15 }}
                onPress={() => navigation.navigate("Search")}
            >
                <Ionicons name="search" size={24} color={theme.text} />
            </TouchableOpacity>
            
            {/* ชื่อคอนเทนเนอร์ */}
            <Text style={{ 
                fontSize: 20, 
                fontWeight: '500', 
                color: '#333',
                marginLeft: 5
            }}>
                {containerName}
            </Text>
            {path && containerName ?
                <TouchableOpacity
                    style={{ 
                        marginLeft: 'auto', 
                        marginRight: 10,
                        padding: 8,
                        borderRadius: 20,
                        backgroundColor: 'rgba(242, 242, 242, 0.6)'
                    }}
                    onPress={() => navigation.replace("Search", {
                        containerName: containerName,
                        path: path,
                        containerType: ContainerType.DEFAULT
                    })}
                >
                    <Ionicons name="grid-outline" size={24} color={theme.text} />
                </TouchableOpacity> : <></>}

            {//Sort by
                sortByHandler ? <TouchableOpacity
                    style={{ marginRight: 15 }}
                    onPress={sortByHandler}
                >
                    <FontAwesome5 name="sort" size={24} color={theme.text} />
                </TouchableOpacity> : <></>}

            {//Create item
                createHandler ? <TouchableOpacity
                    style={{ marginRight: 15 }}
                    onPress={createHandler}
                >
                    <AntDesign name="plus" size={24} color={theme.text} />
                </TouchableOpacity>
                : <></>}

            {/* ปุ่มเปลี่ยนรูปแบบการแสดงผล - กริด, รายละเอียด, เรียบง่าย */}
            {layoutChangeHandler ? <TouchableOpacity
                style={{ 
                    marginRight: 10,
                    padding: 8,
                    borderRadius: 20,
                    backgroundColor: 'rgba(242, 242, 242, 0.6)'
                }}
                onPress={layoutChangeHandler}
            >
                <Ionicons name="grid-outline" size={22} color="#333" />
            </TouchableOpacity> : <></>}

            {/* ปุ่มเรียงลำดับ */}
            {sortByHandler ? <TouchableOpacity
                style={{ 
                    marginRight: 10,
                    padding: 8,
                    borderRadius: 20,
                    backgroundColor: 'rgba(242, 242, 242, 0.6)'
                }}
                onPress={sortByHandler}
            >
                <FontAwesome5 name="sort" size={22} color="#333" />
            </TouchableOpacity> : <></>}

            {/* ปุ่มสร้างรายการใหม่ */}
            {createHandler ? <TouchableOpacity
                style={{ 
                    marginRight: 10,
                    padding: 8,
                    borderRadius: 20,
                    backgroundColor: 'rgba(242, 242, 242, 0.6)'
                }}
                onPress={createHandler}
            >
                <AntDesign name="plus" size={22} color="#333" />
            </TouchableOpacity>
                : <></>}
                    
            {/* ปุ่มเมนูสามจุด */}
            {menuHandler ? <TouchableOpacity
                style={{ 
                    marginRight: 5,
                    padding: 8,
                    borderRadius: 20,
                    backgroundColor: 'rgba(242, 242, 242, 0.6)'
                }}
                onPress={menuHandler}
            >
                <MaterialIcons name="more-vert" size={22} color={theme.text} />
            </TouchableOpacity> : <></>}
        </View>
    );
}

// กำหนด PropTypes สำหรับการตรวจสอบประเภทข้อมูล
Toolbar.propTypes = {
    navigation: PropTypes.shape({
        goBack: PropTypes.func.isRequired,
        navigate: PropTypes.func.isRequired,
    }).isRequired,
    containerName: PropTypes.string.isRequired,
    layoutChangeHandler: PropTypes.func,
    sortByHandler: PropTypes.func,
    createHandler: PropTypes.func,
    menuHandler: PropTypes.func,
};

