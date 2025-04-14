import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';

// กำหนดโครงสร้างข้อมูลสำหรับตัวเลือกการเรียงลำดับ
type SortOption = {
  id: string | number;    // รหัสหรือค่าที่ใช้ระบุตัวเลือก
  label: string;          // ข้อความที่แสดงบนหน้าจอ
  icon: React.ReactNode;  // ไอคอนที่แสดงประกอบตัวเลือก
};

// กำหนด Props ที่ใช้ในคอมโพเนนต์
interface SortOptionsBarProps {
  visible: boolean;                          // สถานะการแสดงผลของหน้าต่าง
  onClose: () => void;                       // ฟังก์ชันเรียกเมื่อปิดหน้าต่าง
  options: SortOption[];                     // รายการตัวเลือกการเรียงลำดับ
  selectedOption: string | number;           // ตัวเลือกที่ถูกเลือกในปัจจุบัน
  onSelectOption: (option: string | number) => void;  // ฟังก์ชันเรียกเมื่อเลือกตัวเลือก
}

// คอมโพเนนต์แสดงตัวเลือกการเรียงลำดับด้านล่างหน้าจอ
const SortOptionsBar: React.FC<SortOptionsBarProps> = ({
  visible,
  onClose,
  options,
  selectedOption,
  onSelectOption,
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        {/* คอนเทนเนอร์หลักของหน้าต่างตัวเลือก */}
        <View style={styles.container}>
          {/* ส่วนหัวของหน้าต่าง */}
          <View style={styles.header}>
            <Text style={styles.title}>Sort by</Text>
            <View style={styles.divider} />
          </View>

          {/* แสดงรายการตัวเลือกการเรียงลำดับ */}
          {options.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.optionItem,
                selectedOption === option.id && styles.selectedOption,
              ]}
              onPress={() => onSelectOption(option.id)}
            >
              <View style={styles.iconContainer}>
                {option.icon}
              </View>
              <Text style={styles.optionText}>{option.label}</Text>
              {selectedOption === option.id && (
                <MaterialIcons name="check" size={24} color="#007AFF" style={styles.checkIcon} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

// สไตล์สำหรับคอมโพเนนต์
const styles = StyleSheet.create({
  // พื้นหลังโปร่งใสด้านนอก
  overlay: {
    flex: 1,
    justifyContent: 'flex-end', // จัดให้แสดงที่ด้านล่างของหน้าจอ
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  // คอนเทนเนอร์หลักของเนื้อหา
  container: {
    backgroundColor: 'white',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  // ส่วนหัวของหน้าต่าง
  header: {
    alignItems: 'center',
    marginBottom: 8,
  },
  // สไตล์ข้อความหัวข้อ
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  // เส้นคั่นใต้หัวข้อ
  divider: {
    width: 40,
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
  },
  // สไตล์แต่ละรายการตัวเลือก
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  // สไตล์รายการที่ถูกเลือก
  selectedOption: {
    backgroundColor: '#f8f9fa',
  },
  // คอนเทนเนอร์สำหรับไอคอน
  iconContainer: {
    width: 40,
    alignItems: 'center',
    marginRight: 16,
  },
  // สไตล์ข้อความตัวเลือก
  optionText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  // สไตล์ไอคอนเครื่องหมายถูก
  checkIcon: {
    marginLeft: 'auto',
  },
});

export default SortOptionsBar; 