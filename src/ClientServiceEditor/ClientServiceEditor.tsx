import React from "react";

import {createNativeStackNavigator} from "@react-navigation/native-stack";

import ServiceCategoryView from "./ServiceCategoryView";

const ClientServiceEditor = () => {
  const Stack = createNativeStackNavigator();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {backgroundColor: "cyan"},
        headerTintColor: "black",
        headerTitleAlign: "center",
      }}>
      <Stack.Screen
        name="ServiceCategory"
        component={ServiceCategoryView}
        options={{title: "Service Editor"}}
      />
    </Stack.Navigator>
  );
};

export default ClientServiceEditor;
