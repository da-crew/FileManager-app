import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { View, Text, ScrollView } from "react-native";
import { Path } from '../FileSystem';
import { useTheme } from './ThemeContext';
import { invertHexColor } from './themes';

// กำหนด Props ที่จำเป็นสำหรับ PathDisplayer
interface PathDisplayerProps {
    navpath: Path  // เส้นทางการนำทาง (Path object)
}

/**
 * คอมโพเนนต์แสดงเส้นทางการนำทางไฟล์ (ที่อยู่ปัจจุบัน)
 * ใช้แสดงเส้นทางการนำทางในรูปแบบ Breadcrumbs
 * 
 * @param {Object} props - คุณสมบัติของคอมโพเนนต์
 * @param {Path} props.navpath - ออบเจ็กต์เส้นทางที่ประกอบด้วย root และ nodes
 * @returns {JSX.Element} คอมโพเนนต์ที่เรนเดอร์แล้ว
 */
const PathDisplayer = ({navpath}: PathDisplayerProps) => {
    // สร้างไอคอนคั่นระหว่างโฟลเดอร์
    let separator = <MaterialIcons name="arrow-forward-ios" size={18} color="black" style={{marginHorizontal: 10}}/>;
    
    // สร้างองค์ประกอบเส้นทาง
    let comps = [];
    // เพิ่ม root path
    comps.push(<Text key={1}>{navpath.root.displayName}</Text>);
    
    // เพิ่มโฟลเดอร์ย่อยในเส้นทาง
    for (let name of navpath.nodes) { 
        comps.push(<Text key={`separator-${name}`}>{separator}</Text>);
        comps.push(<Text key={`node-${name}`} style={{marginHorizontal: 5}}>{name}</Text>);
    }

    // แสดงเส้นทางในรูปแบบแถบนำทาง
    return <View style={{backgroundColor: '#d9d9d9', padding: 10}}>
        <View style={{flexDirection: 'row', backgroundColor: "white", borderRadius: 5, padding: 5}}>
            {/* ไอคอนบ้าน (รูท) */}
            <FontAwesome5 name="home" size={18} color="black"/>
            {separator}
            {/* แสดงเส้นทางแบบเลื่อนได้ กรณีเส้นทางยาว */}
            <ScrollView horizontal>
                {comps}
            </ScrollView>
        </View>
    </View>;
};

export { PathDisplayer };