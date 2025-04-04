import { Path } from "../../FileSystem";
import * as RNFS from "react-native-fs";

export enum ContainerType {
    CATEGORIZED,
    DEFAULT,
}

export enum ViewMode {
    FILES,
    FOLDERS,
}

export type ContentContainerRouteParams = {
    containerName: string,
    path: Path,
    containerType: ContainerType,
};

export enum SortType {
    ALPHABETICAL,
    DATE,
}

export enum CreationType {
    FOLDER,
    FILE,
}

export enum MoveType {
    COPY,
    CUT,
}


export interface MovingState {
    sourceDir: Path,
    moveType: MoveType,
    items: Array<RNFS.ReadDirItem>,
}