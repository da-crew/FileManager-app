import React from 'react';
import { View, Text, TouchableOpacity, GestureResponderEvent } from 'react-native';
import { MaterialIcons, Ionicons, AntDesign } from '@expo/vector-icons';
import { FontAwesome5 } from '@expo/vector-icons';
import PropTypes from 'prop-types';
import { ContainerType, ContentContainerRouteParams } from './ContentContainer/common';
import { Path } from '../FileSystem';


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
 * @param {Function} [props.menuHandler] - Optional handler function for the three-dot menu.
 * @returns {JSX.Element} The rendered Toolbar component.
 */

export default function Toolbar({ navigation, containerName, path, goBackHandler, layoutChangeHandler, sortByHandler, createHandler, menuHandler }: ToolbarProps) {
    return (
        <View style={{ 
            flexDirection: 'row', 
            alignItems: 'center', 
            backgroundColor: '#FFFFFF',
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
            <TouchableOpacity 
                style={{ 
                    padding: 10, 
                    marginRight: 5, 
                    borderRadius: 20,
                    backgroundColor: 'rgba(242, 242, 242, 0.6)' 
                }} 
                onPress={goBackHandler}
            >
                <MaterialIcons name="arrow-back-ios-new" size={20} color="#333" />
            </TouchableOpacity>
            <Text style={{ 
                fontSize: 20, 
                fontWeight: '500', 
                color: '#333',
                marginLeft: 5
            }}>
                {containerName}
            </Text>
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
                <Ionicons name="search" size={22} color="#333" />
            </TouchableOpacity>

            {//View option, i.e., grid, detailed, simple
                layoutChangeHandler ? <TouchableOpacity
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

            {//Sort by
                sortByHandler ? <TouchableOpacity
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

            {//Create item
                createHandler ? <TouchableOpacity
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
                    
            {//Three-dot menu
                menuHandler ? <TouchableOpacity
                    style={{ 
                        marginRight: 5,
                        padding: 8,
                        borderRadius: 20,
                        backgroundColor: 'rgba(242, 242, 242, 0.6)'
                    }}
                    onPress={menuHandler}
                >
                    <MaterialIcons name="more-vert" size={22} color="#333" />
                </TouchableOpacity> : <></>}
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
    menuHandler: PropTypes.func,
};
