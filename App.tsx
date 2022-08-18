import React from "react";

import {SafeAreaProvider} from "react-native-safe-area-context";
import {TailwindProvider} from "tailwindcss-react-native";

import AuthProvider from "./src/Authentication/AuthProvider";
import NavigationStack from "./src/NavigationStack";

const App = () => {
  return (
    <TailwindProvider>
      <SafeAreaProvider>
        <AuthProvider>
          <NavigationStack />
        </AuthProvider>
      </SafeAreaProvider>
    </TailwindProvider>
  );
};

export default App;
