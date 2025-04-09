import { View, Alert} from "react-native";
import { Feather, Foundation, MaterialIcons } from '@expo/vector-icons';
import BottomBarItem from "./BottomBarItem";
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
    if (props.isSelecting) {
        return (
            <View style={{ backgroundColor: '#d9d9d9', borderTopWidth: 1, borderColor: '#e7e7e7', flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 20 }}>
                <BottomBarItem name='Copy' icon={<Feather name='copy' size={30} />} onPress={props.copyActionHandler} />
                <BottomBarItem name='Move' icon={<Feather name='scissors' size={30} />} onPress={props.moveActionHandler} />
                <BottomBarItem name='Rename' icon={<Foundation name='pencil' size={30} />} onPress={props.renameActionHandler} disabled={props.selectionSet.size > 1} />
                <BottomBarItem name='Delete' icon={<MaterialIcons name='delete' size={30} />} onPress={props.deleteActionHandler} />
            </View>
        );
    }

    if (props.isMoving) {
        return (<View style={{ backgroundColor: '#d9d9d9', borderTopWidth: 1, borderColor: '#e7e7e7', flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 20 }}>
            <BottomBarItem name='Cancel' icon={<MaterialIcons name='cancel' size={30} />} onPress={props.pasteCancelActionHandler} />
            <BottomBarItem name='Paste' icon={<MaterialIcons name='content-paste' size={30} />} onPress={props.pasteActionHandler} disabled={!props.isPasteLocationValid} />
        </View>);
    }

    return <></>;
}