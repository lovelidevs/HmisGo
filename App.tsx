import React from "react";

import {NavigationContainer} from "@react-navigation/native";
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import {SafeAreaProvider} from "react-native-safe-area-context";
import {TailwindProvider} from "tailwindcss-react-native";

import Login from "./src/Authentication/Login";

const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <TailwindProvider>
      <SafeAreaProvider>
        <NavigationContainer>
          <Stack.Navigator>
            <Stack.Screen name="Login" component={Login} />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </TailwindProvider>
  );
};

export default App;
