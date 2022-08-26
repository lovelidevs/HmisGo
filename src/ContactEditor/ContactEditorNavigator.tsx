import React, {useContext, useEffect, useState} from "react";
import {Alert, Button} from "react-native";

import {
  createNativeStackNavigator,
  NativeStackScreenProps,
} from "@react-navigation/native-stack";
import cloneDeep from "lodash.clonedeep";

import {Contact} from "../MainView";
import {RootStackParamList} from "../NavigationStack";
import {RealmStateContext} from "../RealmStateProvider";
import CategoryEditor from "./CategoryEditor";
import ContactEditor from "./ContactEditor";

/*
  useEffect(() => {
    if (!realmState?.dailyList?.contacts || !editorContext) return;

    const result = realmState.dailyList.contacts.find(
      contact => contact.clientIdAsString === contactClientIdAsString,
    );

    if (result) editorContext.setContact(result);
    else Alert.alert("Contact Editor Error", "Unable to load contact");
  }, [realmState?.dailyList, editorContext, contactClientIdAsString]);
  */

export type ContactEditorStackParamList = {
  ContactEditor: undefined;
  CategoryEditor: {categoryUUID: string};
  ServiceEditor: undefined;
};

type ContactEditorContextType = {
  contact: Contact | null;
  setContact: React.Dispatch<React.SetStateAction<Contact | null>>;
};

export const ContactEditorContext =
  React.createContext<ContactEditorContextType | null>(null);

const ContactEditorNavigator = ({
  navigation,
  route,
}: NativeStackScreenProps<RootStackParamList, "ContactEditorNavigator">) => {
  const {contactClientIdAsString} = route.params;

  const realmState = useContext(RealmStateContext);

  const [contact, setContact] = useState<Contact | null>(null);

  const Stack = createNativeStackNavigator();

  useEffect(() => {
    if (contact) return;
    if (!realmState?.dailyList) return;

    const result = realmState.dailyList.contacts.find(
      con => con.clientIdAsString === contactClientIdAsString,
    );

    if (!result) return Alert.alert("", "Unable to load contact");

    setContact(result);
  }, [realmState?.dailyList, contact, contactClientIdAsString]);

  return (
    <ContactEditorContext.Provider value={{contact, setContact}}>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {backgroundColor: "cyan"},
          headerTintColor: "black",
          headerTitleAlign: "center",
          headerRight: () => (
            <Button
              title="✓"
              onPress={() => {
                const errorAlert = () =>
                  Alert.alert("Error", "Unable to save contact edits");

                if (!contact || !realmState?.dailyList) return errorAlert();

                const dailyListClone = cloneDeep(realmState.dailyList);
                const index = dailyListClone.contacts.findIndex(
                  con => con.clientIdAsString === contact?.clientIdAsString,
                );

                if (index === -1) return errorAlert();

                dailyListClone.contacts[index] = contact;
                realmState.setDailyList(dailyListClone);
                navigation.navigate("HmisGo");
              }}
            />
          ),
        }}>
        <Stack.Screen
          name="ContactEditor"
          component={ContactEditor}
          options={{title: "Contact Editor"}}
        />
        <Stack.Screen
          name="CategoryEditor"
          component={CategoryEditor}
          options={{title: "Category Editor"}}
        />
      </Stack.Navigator>
    </ContactEditorContext.Provider>
  );
};

export default ContactEditorNavigator;
