import React, {useContext} from "react";

import {NavigationContainer} from "@react-navigation/native";
import {createNativeStackNavigator} from "@react-navigation/native-stack";

import {AuthContext} from "./Authentication/AuthProvider";
import Login from "./Authentication/Login";
import {ServiceDocument} from "./ClientServiceEditor/ClientServiceEditor";
import ClientServiceNavigator from "./ClientServiceEditor/ClientServiceNavigator";
import {LocationDocument} from "./LocationPickers";
import MainView, {Contact} from "./MainView";
import NewClientView from "./NewClientView";

export type RootStackParamList = {
  HmisGo: undefined;
  NewClient: undefined;
  Login: undefined;
  ClientServiceNavigator: undefined;
  ServiceEditor: {
    contact: Contact;
    onChange: (contactClone: Contact) => void;
    services: ServiceDocument;
    locations: LocationDocument;
  };
};

const NavigationStack = () => {
  const auth = useContext(AuthContext);

  const Stack = createNativeStackNavigator();

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {backgroundColor: "cyan"},
          headerTintColor: "black",
          headerTitleAlign: "center",
        }}>
        {auth?.isAuthenticated ? (
          <>
            <Stack.Screen
              name="HmisGo"
              component={MainView}
              options={{title: "HMIS Go"}}
            />
            <Stack.Screen
              name="NewClient"
              component={NewClientView}
              options={{title: "New Client", presentation: "modal"}}
            />
            <Stack.Screen
              name="ClientServiceNavigator"
              component={ClientServiceNavigator}
              options={{headerShown: false, presentation: "modal"}}
            />
          </>
        ) : (
          <Stack.Screen name="Login" component={Login} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default NavigationStack;
