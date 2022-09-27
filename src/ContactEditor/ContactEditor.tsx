import React, {useContext} from "react";
import {ScrollView, Text, View} from "react-native";

import {NativeStackScreenProps} from "@react-navigation/native-stack";
import {SafeAreaView} from "react-native-safe-area-context";
import {useTailwind} from "tailwindcss-react-native";

import LLActivityIndicatorView from "../LLComponents/LLActivityIndicatorView";
import LLButton from "../LLComponents/LLButton";
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
    <SafeAreaView>
      <ScrollView
        contentContainerStyle={tw(
          "flex flex-col flex-nowrap justify-start items-stretch",
        )}>
        <View className="flex flex-row flex-nowrap justify-center items-center w-full mb-6 mx-2">
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
        <View className="mx-2">
          <LLButton
            title={
              editorContext.contact.location
                ? editorContext.contact.location
                : "SELECT LOCATION"
            }
            onPress={() => {
              navigation.navigate("LocationSelect", {context: "ContactEditor"});
            }}
          />
        </View>
        <View className="mt-4 mx-2">
          <Text className="text-xl text-black font-bold">SERVICES</Text>
        </View>
        <View className="mt-4 flex flex-col flex-nowrap justify-start items-stretch space-y-2 mx-2 mb-4">
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
