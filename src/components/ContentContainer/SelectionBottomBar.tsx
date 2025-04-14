import { View, Alert} from "react-native";
import { Feather, Foundation, MaterialIcons } from '@expo/vector-icons';
import BottomBarItem from "./BottomBarItem";
import { useTheme } from '../ThemeContext';

import * as RNFS from "react-native-fs";


declare interface SelectionBottomBarProps {
    selectionSet: Set<RNFS.ReadDirItem>;
    isSelecting: boolean;
    isMoving: boolean;
    isPasteLocationValid: boolean;
    copyActionHandler: () => void;
    moveActionHandler: () => void;
    renameActionHandler: () => void;
    deleteActionHandler: () => void;
    pasteCancelActionHandler: () => void;
    pasteActionHandler: () => Promise<void>;
}

export default function SelectionBottomBar(props: SelectionBottomBarProps) {
    const { theme } = useTheme();
    if (props.isSelecting) {
        return (
            <View style={{ backgroundColor: theme.background, borderTopWidth: 1, borderColor: theme.border, flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 20 }}>
                <BottomBarItem name='Copy' icon={<Feather name='copy' size={30} color={theme.iconColor} />} onPress={props.copyActionHandler} />
                <BottomBarItem name='Move' icon={<Feather name='scissors' size={30} color={theme.iconColor} />} onPress={props.moveActionHandler} />
                <BottomBarItem name='Rename' icon={<Foundation name='pencil' size={30} color={theme.iconColor} />} onPress={props.renameActionHandler} disabled={props.selectionSet.size > 1} />
                <BottomBarItem name='Delete' icon={<MaterialIcons name='delete' size={30} color={theme.iconColor} />} onPress={props.deleteActionHandler} />
            </View>
        );
    }

    if (props.isMoving) {
        return (<View style={{ backgroundColor: theme.background, borderTopWidth: 1, borderColor: theme.border, flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 20 }}>
            <BottomBarItem name='Cancel' icon={<MaterialIcons name='cancel' size={30} color={theme.iconColor} />} onPress={props.pasteCancelActionHandler} />
            <BottomBarItem name='Paste' icon={<MaterialIcons name='content-paste' size={30} color={theme.iconColor} />} onPress={props.pasteActionHandler} disabled={!props.isPasteLocationValid} />
        </View>);
    }

    return <></>;
}