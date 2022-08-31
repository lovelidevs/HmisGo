import React from "react";

import {SafeAreaProvider} from "react-native-safe-area-context";
import {TailwindProvider} from "tailwindcss-react-native";

import AuthProvider from "./src/Authentication/AuthProvider";
import ContactEditorProvider from "./src/ContactEditor/ContactEditorProvider";
import NavigationStack from "./src/NavigationStack";
import RealmStateProvider from "./src/RealmStateProvider";

const App = () => {
  return (
    <TailwindProvider>
      <SafeAreaProvider>
        <AuthProvider>
          <RealmStateProvider>
            <ContactEditorProvider>
              <NavigationStack />
            </ContactEditorProvider>
          </RealmStateProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </TailwindProvider>
  );
};

export default App;
