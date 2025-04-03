import React from 'react';
import { View, Text, TouchableOpacity, GestureResponderEvent } from 'react-native';
import { MaterialIcons, Ionicons, AntDesign } from '@expo/vector-icons';
import { FontAwesome5 } from '@expo/vector-icons';
import PropTypes from 'prop-types';


interface ToolbarProps {
    navigation: any,
    containerName: string,
    goBackHandler: (event: GestureResponderEvent) => void,
    layoutChangeHandler?: (event: GestureResponderEvent) => void,
    sortByHandler?: (event: GestureResponderEvent) => void,
    createHandler?: (event: GestureResponderEvent) => void,
}

/**
 * Toolbar component that provides navigation and action buttons.
 *
 * @param {Object} props - The properties object.
 * @param {Object} props.navigation - The navigation object.
 * @param {Function} props.navigation.goBack - Function to navigate back.
 * @param {Function} props.navigation.navigate - Function to navigate to a specific route.
 * @param {string} props.containerName - The name of the container to be displayed.
 * @param {Function} [props.layoutChangeHandler] - Optional handler function for layout change.
 * @param {Function} [props.sortByHandler] - Optional handler function for sorting items.
 * @param {Function} [props.createHandler] - Optional handler function for creating a new item.
 * @returns {JSX.Element} The rendered Toolbar component.
 */

export default function Toolbar({ navigation, containerName, goBackHandler, layoutChangeHandler, sortByHandler, createHandler }: ToolbarProps) {

    return (
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#d9d9d9' }}>
            <TouchableOpacity style={{ padding: 15, marginRight: 0 }} onPress={goBackHandler}>
                <MaterialIcons name="arrow-back-ios-new" size={20} />
            </TouchableOpacity>
            <Text style={{ fontSize: 20 }}>{containerName}</Text>
            <TouchableOpacity
                style={{ marginLeft: 'auto', marginRight: 15 }}
                onPress={() => navigation.navigate("Search")}
            >
                <Ionicons name="search" size={24} color="black" />
            </TouchableOpacity>

            {//View option, i.e., grid, detailed, simple
                layoutChangeHandler ? <TouchableOpacity
                    style={{ marginRight: 15 }}
                    onPress={layoutChangeHandler}
                >
                    <Ionicons name="grid-outline" size={24} color="black" />
                </TouchableOpacity> : <></>}

            {//Sort by
                sortByHandler ? <TouchableOpacity
                    style={{ marginRight: 15 }}
                    onPress={sortByHandler}
                >
                    <FontAwesome5 name="sort" size={24} color="black" />
                </TouchableOpacity> : <></>}

            {//Create item
                createHandler ? <TouchableOpacity
                    style={{ marginRight: 15 }}
                    onPress={createHandler}
                >
                    <AntDesign name="plus" size={24} color="black" />
                </TouchableOpacity>
                    : <></>}
        </View>
    );
};

Toolbar.propTypes = {
    navigation: PropTypes.shape({
        goBack: PropTypes.func.isRequired,
        navigate: PropTypes.func.isRequired,
    }).isRequired,
    containerName: PropTypes.string.isRequired,
    layoutChangeHandler: PropTypes.func,
    sortByHandler: PropTypes.func,
    createHandler: PropTypes.func,
};
