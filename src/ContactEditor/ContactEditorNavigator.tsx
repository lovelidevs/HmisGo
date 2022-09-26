import React, {useContext} from "react";
import {Alert} from "react-native";

import {
  createNativeStackNavigator,
  NativeStackScreenProps,
} from "@react-navigation/native-stack";
import cloneDeep from "lodash.clonedeep";

import LLHeaderButton from "../LLComponents/LLHeaderButton";
import LocationSelect from "../LocationSelect";
import {RootStackParamList} from "../NavigationStack";
import {DailyListContext} from "../Realm/DailyListProvider";
import {TW_CYAN_300, TW_GRAY_800} from "../Theme";
import CategoryEditor from "./CategoryEditor";
import ContactEditor from "./ContactEditor";
import {ContactEditorContext} from "./ContactEditorProvider";
import ServiceEditor from "./ServiceEditor";

export type ContactEditorStackParamList = {
  ContactEditor: undefined;
  CategoryEditor: {categoryUUID: string};
  ServiceEditor: {categoryUUID: string; serviceUUID: string};
  LocationSelect: {context: "DailyList" | "ContactEditor"};
};

const ContactEditorNavigator = ({
  navigation,
}: NativeStackScreenProps<RootStackParamList, "ContactEditorNavigator">) => {
  const dailyListContext = useContext(DailyListContext);
  const editorContext = useContext(ContactEditorContext);

  const Stack = createNativeStackNavigator();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {backgroundColor: TW_GRAY_800},
        headerTintColor: TW_CYAN_300,
        headerTitleAlign: "center",
        headerRight: () => (
          <LLHeaderButton
            title="✓"
            onPress={() => {
              const errorAlert = () =>
                Alert.alert("Error", "Unable to save contact edits");

              if (!editorContext?.contact || !dailyListContext?.dailyList)
                return errorAlert();

              const contactsClone = cloneDeep(
                dailyListContext.dailyList,
              ).contacts;
              if (!contactsClone) return errorAlert();

              const index = contactsClone.findIndex(
                con =>
                  con.clientId.toString() ===
                  editorContext.contact?.clientId.toString(),
              );

              if (index === -1) return errorAlert();

              contactsClone[index] = editorContext.contact;

              dailyListContext.updateDailyListContacts(contactsClone);
              navigation.navigate("HmisGo");
            }}
          />
        ),
      }}>
      <Stack.Screen
        name="ContactEditor"
        component={ContactEditor}
        options={{title: "Contact Editor", presentation: "card"}}
      />
      <Stack.Screen
        name="CategoryEditor"
        component={CategoryEditor}
        options={{title: "Category Editor", presentation: "card"}}
      />
      <Stack.Screen
        name="ServiceEditor"
        component={ServiceEditor}
        options={{title: "Service Editor", presentation: "card"}}
      />
      <Stack.Screen
        name="LocationSelect"
        component={LocationSelect}
        options={{title: "Location Select", presentation: "modal"}}
      />
    </Stack.Navigator>
  );
};

export default ContactEditorNavigator;
