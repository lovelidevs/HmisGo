import React, {useContext} from "react";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";

import {NativeStackScreenProps} from "@react-navigation/native-stack";
import {ObjectId} from "bson";
import cloneDeep from "lodash.clonedeep";
import {SafeAreaView} from "react-native-safe-area-context";
import {useTailwind} from "tailwindcss-react-native";

import LocationPickers from "../LocationPickers";
import {RealmStateContext} from "../RealmStateProvider";
import {ClientServiceStackParamList} from "./ClientServiceNavigator";

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

// TODO: Clicking the CHECK button in the header submits it, or maybe on dismount? Will have to make sure it doesn't hurt to override the same data
// TODO: Back button should submit too

const ClientServiceEditor = ({
  route,
  navigation,
}: NativeStackScreenProps<ClientServiceStackParamList, "ServiceEditor">) => {
  const tw = useTailwind();

  const {contact, dailyListIdAsString} = route.params;
  const realmState = useContext(RealmStateContext);

  console.log(dailyListIdAsString);

  if (
    !realmState ||
    !realmState.clients ||
    !realmState.locations ||
    !realmState.services
  )
    return (
      <SafeAreaView className="h-full flex flex-col flex-nowrap justify-center items-center">
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );

  return (
    <SafeAreaView className={`px-6 ${Platform.OS === "android" && "pt-6"}`}>
      <ScrollView
        contentContainerStyle={tw(
          "flex flex-col flex-nowrap justify-start items-stretch",
        )}>
        <View className="flex flex-row flex-nowrap justify-center items-center w-full mb-6">
          <Text className="text-xl text-black font-bold">
            {(() => {
              const client = realmState.clients.find(
                value => value._id.toString() === contact.clientIdAsString,
              );

              if (!client) return "ERROR: Could not find client";

              let text = client.firstName + " " + client.lastName;
              if (client.alias) text += " (" + client.alias + ")";

              return text;
            })()}
          </Text>
        </View>
        <LocationPickers
          value={{
            city: contact.city,
            locationCategory: contact.locationCategory,
            location: contact.location,
          }}
          onChange={value => {
            const contactClone = cloneDeep(contact);
            contactClone.city = value.city;
            contactClone.locationCategory = value.locationCategory;
            contactClone.location = value.location;
            navigation.setParams({contact: contactClone});
          }}
          locations={realmState.locations}
        />
        <View>
          {realmState.services.categories?.map(category => (
            <Text key={category.uuid}>{category.category}</Text>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ClientServiceEditor;
