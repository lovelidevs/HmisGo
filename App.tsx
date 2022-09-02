import React from "react";

import {SafeAreaProvider} from "react-native-safe-area-context";
import {TailwindProvider} from "tailwindcss-react-native";

import AuthProvider from "./src/Authentication/AuthProvider";
import ContactEditorProvider from "./src/ContactEditor/ContactEditorProvider";
import NavigationStack from "./src/NavigationStack";
import RealmProvider from "./src/Realm/RealmProvider";

const App = () => {
  return (
    <TailwindProvider>
      <SafeAreaProvider>
        <AuthProvider>
          <RealmProvider>
            <ContactEditorProvider>
              <NavigationStack />
            </ContactEditorProvider>
          </RealmProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </TailwindProvider>
  );
};

export default App;
