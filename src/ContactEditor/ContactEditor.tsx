import React, {useContext} from "react";
import {ScrollView, Text, View} from "react-native";

import {NativeStackScreenProps} from "@react-navigation/native-stack";
import cloneDeep from "lodash.clonedeep";
import {SafeAreaView} from "react-native-safe-area-context";
import {useTailwind} from "tailwindcss-react-native";

import LLActivityIndicatorView from "../LLComponents/LLActivityIndicatorView";
import LocationPickers from "../LocationPickers";
import {ClientContext} from "../Realm/ClientProvider";
import {LocationContext} from "../Realm/LocationProvider";
import {ServiceContext} from "../Realm/ServiceProvider";
import ContactEditorLI from "./ContactEditorLI";
import {ContactEditorStackParamList} from "./ContactEditorNavigator";
import {ContactEditorContext} from "./ContactEditorProvider";

const ContactEditor = ({
  navigation,
}: NativeStackScreenProps<ContactEditorStackParamList, "ContactEditor">) => {
  const tw = useTailwind();

  const locationContext = useContext(LocationContext);
  const serviceContext = useContext(ServiceContext);
  const clientContext = useContext(ClientContext);
  const editorContext = useContext(ContactEditorContext);

  if (
    !locationContext?.locations ||
    !serviceContext?.services ||
    !clientContext?.clients ||
    !editorContext?.contact
  )
    return <LLActivityIndicatorView />;

  return (
    <SafeAreaView className={"px-6"}>
      <ScrollView
        contentContainerStyle={tw(
          "flex flex-col flex-nowrap justify-start items-stretch pb-4 mt-4",
        )}>
        <View className="flex flex-row flex-nowrap justify-center items-center w-full mb-6">
          <Text className="text-xl text-black font-bold">
            {(() => {
              const client = clientContext.clients.find(value => {
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
        />
        <View className="mt-4">
          <Text className="text-xl text-black font-bold">SERVICES</Text>
        </View>
        <View className="mt-4 flex flex-col flex-nowrap justify-start items-stretch space-y-2">
          {serviceContext.services.categories?.map(category => (
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
