import React, {useContext} from "react";

import {NavigationContainer} from "@react-navigation/native";
import {createNativeStackNavigator} from "@react-navigation/native-stack";

import {AuthContext} from "./Authentication/AuthProvider";
import Login from "./Authentication/Login";
import MainView from "./MainView";

// TODO: https://reactnavigation.org/docs/auth-flow/#how-it-will-work

const NavigationStack = () => {
  const auth = useContext(AuthContext);

  const Stack = createNativeStackNavigator();

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {auth?.isAuthenticated ? (
          <Stack.Screen name="HMIS Go" component={MainView} />
        ) : (
          <Stack.Screen name="Login" component={Login} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default NavigationStack;
