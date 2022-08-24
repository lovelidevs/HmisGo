import React from "react";

import {createNativeStackNavigator} from "@react-navigation/native-stack";

import {Contact} from "../MainView";
import ClientServiceEditor from "./ClientServiceEditor";

export type ClientServiceStackParamList = {
  ServiceEditor: {
    contact: Contact;
    dailyListIdAsString: string;
  };
};

const ClientServiceNavigator = () => {
  const Stack = createNativeStackNavigator();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {backgroundColor: "cyan"},
        headerTintColor: "black",
        headerTitleAlign: "center",
      }}>
      <Stack.Screen
        name="ServiceEditor"
        component={ClientServiceEditor}
        options={{title: "Service Editor"}}
      />
    </Stack.Navigator>
  );
};

export default ClientServiceNavigator;
