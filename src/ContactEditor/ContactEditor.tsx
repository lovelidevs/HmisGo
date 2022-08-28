import React, {useContext} from "react";
import {Platform, ScrollView, Text, View} from "react-native";

import {NativeStackScreenProps} from "@react-navigation/native-stack";
import {ObjectId} from "bson";
import cloneDeep from "lodash.clonedeep";
import {SafeAreaView} from "react-native-safe-area-context";
import {useTailwind} from "tailwindcss-react-native";

import LLActivityIndicatorView from "../LLComponents/LLActivityIndicatorView";
import LocationPickers from "../LocationPickers";
import {RealmStateContext} from "../RealmStateProvider";
import ContactEditorLI from "./ContactEditorLI";
import {
  ContactEditorContext,
  ContactEditorStackParamList,
} from "./ContactEditorNavigator";

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

export type ServiceDocument = {
  _id: ObjectId;
  organization: string;
  categories: ServiceCategory[] | null;
};

export type ServiceCategory = {
  uuid: string;
  category: string;
  services: Service[] | null;
};

export type Service = {
  uuid: string;
  service: string;
  inputType: string;
  units: string | null;
  customList: string[] | null;
};

const ContactEditor = ({
  navigation,
}: NativeStackScreenProps<ContactEditorStackParamList, "ContactEditor">) => {
  const tw = useTailwind();

  const realmState = useContext(RealmStateContext);
  const editorContext = useContext(ContactEditorContext);

  if (
    !realmState?.clients ||
    !realmState?.locations ||
    !realmState?.services ||
    !editorContext?.contact
  )
    return <LLActivityIndicatorView />;

  return (
    <SafeAreaView className={`px-6 ${Platform.OS === "android" && "pt-6"}`}>
      <ScrollView
        contentContainerStyle={tw(
          "flex flex-col flex-nowrap justify-start items-stretch pb-4",
        )}>
        <View className="flex flex-row flex-nowrap justify-center items-center w-full mb-6">
          <Text className="text-xl text-black font-bold">
            {(() => {
              const client = realmState.clients.find(value => {
                if (!editorContext.contact) return;
                return (
                  value._id.toString() ===
                  editorContext.contact.clientId.toString()
                );
              });

              if (!client) return "ERROR: Could not find client";

              let text = client.firstName + " " + client.lastName;
              if (client.alias) text += " (" + client.alias + ")";

              return text;
            })()}
          </Text>
        </View>
        <LocationPickers
          value={{
            cityUUID: editorContext.contact.cityUUID,
            locationCategoryUUID: editorContext.contact.locationCategoryUUID,
            location: editorContext.contact.location,
          }}
          onChange={value => {
            const contactClone = cloneDeep(editorContext.contact);

            if (!contactClone) return;

            contactClone.cityUUID = value.cityUUID;
            contactClone.locationCategoryUUID = value.locationCategoryUUID;
            contactClone.location = value.location;

            editorContext.setContact(contactClone);
          }}
          locations={realmState.locations}
        />
        <View className="mt-4">
          <Text className="text-xl text-black font-bold">SERVICES</Text>
        </View>
        <View className="mt-4 flex flex-col flex-nowrap justify-start items-stretch space-y-2">
          {realmState.services.categories?.map(category => (
            <View key={category.uuid}>
              <ContactEditorLI
                label={category.category}
                onPress={() =>
                  navigation.navigate("CategoryEditor", {
                    categoryUUID: category.uuid,
                  })
                }
              />
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ContactEditor;
