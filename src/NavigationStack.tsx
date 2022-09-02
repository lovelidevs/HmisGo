import React, {useContext} from "react";

import {NavigationContainer} from "@react-navigation/native";
import {createNativeStackNavigator} from "@react-navigation/native-stack";

import {AuthContext} from "./Authentication/AuthProvider";
import Login from "./Authentication/Login";
import SignUp from "./Authentication/SignUp";
import ContactEditorNavigator from "./ContactEditor/ContactEditorNavigator";
import DailyListSelectView from "./DailyListSelectView";
import MainView from "./MainView/MainView";
import NewClientView from "./MainView/NewClientView";
import ReviewView from "./MainView/ReviewView";
import {TW_CYAN_300, TW_GRAY_800} from "./Theme";

export type RootStackParamList = {
  ListSelect: undefined;
  HmisGo: undefined;
  NewClient: undefined;
  Review: undefined;
  Login: undefined;
  SignUp: {email: string};
  ContactEditorNavigator: undefined;
};

const NavigationStack = () => {
  const authContext = useContext(AuthContext);

  const Stack = createNativeStackNavigator();

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {backgroundColor: TW_GRAY_800},
          headerTintColor: TW_CYAN_300,
          headerTitleAlign: "center",
        }}>
        {authContext?.isAuthenticated ? (
          <>
            <Stack.Screen
              name="DailyListSelect"
              component={DailyListSelectView}
              options={{title: "Daily Lists"}}
            />
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
              name="Review"
              component={ReviewView}
              options={{title: "Review", presentation: "modal"}}
            />
            <Stack.Screen
              name="ContactEditorNavigator"
              component={ContactEditorNavigator}
              options={{headerShown: false, presentation: "modal"}}
            />
          </>
        ) : (
          <>
            <Stack.Screen
              name="Login"
              component={Login}
              options={{title: "Login"}}
            />
            <Stack.Screen
              name="SignUp"
              component={SignUp}
              options={{title: "Sign Up"}}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default NavigationStack;
