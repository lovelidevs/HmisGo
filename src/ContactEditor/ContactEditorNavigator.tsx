import React, {useContext, useEffect, useState} from "react";
import {Alert} from "react-native";

import {
  createNativeStackNavigator,
  NativeStackScreenProps,
} from "@react-navigation/native-stack";
import {ObjectId} from "bson";
import cloneDeep from "lodash.clonedeep";

import LLHeaderButton from "../LLComponents/LLHeaderButton";
import {RootStackParamList} from "../NavigationStack";
import {RealmStateContext} from "../RealmStateProvider";
import {TW_CYAN_300, TW_GRAY_800} from "../Theme";
import CategoryEditor from "./CategoryEditor";
import ContactEditor from "./ContactEditor";
import ServiceEditor from "./ServiceEditor";

export type Contact = {
  clientId: ObjectId;
  timestamp: string;
  cityUUID: string;
  locationCategoryUUID: string;
  location: string;
  services: ContactService[];
};

export type ContactService = {
  uuid: string;
  service: string;
  text?: string;
  count?: number;
  units?: string;
  list?: string[];
};

export type ContactEditorStackParamList = {
  ContactEditor: undefined;
  CategoryEditor: {categoryUUID: string};
  ServiceEditor: {categoryUUID: string; serviceUUID: string};
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

    const result = realmState.dailyList.contacts?.find(
      con => con.clientId.toString() === contactClientIdAsString,
    );

    if (!result) return Alert.alert("", "Unable to load contact");

    setContact(result);
  }, [realmState?.dailyList, contact, contactClientIdAsString]);

  return (
    <ContactEditorContext.Provider value={{contact, setContact}}>
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

                if (!contact || !realmState?.dailyList) return errorAlert();

                const contactsClone = cloneDeep(realmState.dailyList).contacts;
                if (!contactsClone) return errorAlert();

                const index = contactsClone.findIndex(
                  con =>
                    con.clientId.toString() === contact?.clientId.toString(),
                );

                if (index === -1) return errorAlert();

                contactsClone[index] = contact;

                realmState.updateDailyListContacts(contactsClone);
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
      </Stack.Navigator>
    </ContactEditorContext.Provider>
  );
};

export default ContactEditorNavigator;
