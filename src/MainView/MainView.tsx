import React, {useContext, useEffect, useState} from "react";
import {Platform, ScrollView, View} from "react-native";

import {NativeStackScreenProps} from "@react-navigation/native-stack";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import cloneDeep from "lodash.clonedeep";
import {SafeAreaView} from "react-native-safe-area-context";
import {useTailwind} from "tailwindcss-react-native";

import {ContactEditorContext} from "../ContactEditor/ContactEditorProvider";
import LLActivityIndicatorView from "../LLComponents/LLActivityIndicatorView";
import LLDebouncedTextInput from "../LLComponents/LLDebouncedTextInput";
import LocationPickers from "../LocationPickers";
import {RootStackParamList} from "../NavigationStack";
import {Client, RealmStateContext} from "../RealmStateProvider";
import ClientLI from "./ClientLI";
import MenuButton from "./MenuButton";

dayjs.extend(utc);

const MainView = ({
  navigation,
}: NativeStackScreenProps<RootStackParamList, "HmisGo">) => {
  const tw = useTailwind();

  const realmState = useContext(RealmStateContext);
  const contactEditorContext = useContext(ContactEditorContext);

  const [cityUUID, setCityUUID] = useState<string>("");
  const [locationCategoryUUID, setLocationCategoryUUID] = useState<string>("");
  const [location, setLocation] = useState<string>("");

  const [searchText, setSearchText] = useState<string>("");

  useEffect(() => {
    if (!realmState) return;
    if (!realmState.dailyListId) navigation.goBack();
  }, [navigation, realmState, realmState?.dailyListId]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => <MenuButton navigation={navigation} />,
    });
  }, [navigation]);

  // TODO: Change the clients into a flatlist

  const clientMapFn = (client: Client, isChecked: boolean) => {
    if (!realmState?.dailyList) return;

    return (
      <View key={String(client._id)}>
        <ClientLI
          client={client}
          isChecked={isChecked}
          onCheckboxPress={() => {
            let contactsClone = cloneDeep(realmState?.dailyList?.contacts);
            if (!contactsClone) contactsClone = [];

            if (isChecked) {
              const index = contactsClone.findIndex(
                contact =>
                  contact.clientId.toString() === client._id.toString(),
              );
              contactsClone.splice(index, 1);
            } else
              contactsClone.push({
                clientId: client._id,
                timestamp: dayjs.utc().toISOString(),
                cityUUID,
                locationCategoryUUID,
                location,
                services: [],
              });

            realmState.updateDailyListContacts(contactsClone);
          }}
          contact={
            isChecked
              ? realmState.dailyList.contacts?.find(
                  contact =>
                    contact.clientId.toString() === client._id.toString(),
                )
              : undefined
          }
          onEditPress={
            isChecked
              ? clientId => {
                  contactEditorContext?.setContactClientId(clientId);
                  navigation.navigate("ContactEditorNavigator");
                }
              : undefined
          }
        />
      </View>
    );
  };

  if (
    !realmState ||
    !realmState.clients ||
    !realmState.locations ||
    !realmState.services ||
    !realmState.dailyList
  )
    return <LLActivityIndicatorView />;

  return (
    <SafeAreaView className={`px-6 ${Platform.OS === "android" && "pt-6"}`}>
      <ScrollView
        contentContainerStyle={tw(
          "flex flex-col flex-nowrap justify-start items-stretch",
        )}>
        <LLDebouncedTextInput
          initialValue={
            realmState.dailyList.note
              ? realmState.dailyList.note?.join("\n")
              : ""
          }
          onChange={value => {
            realmState.updateDailyListNote(value ? value.split("\n") : []);
          }}
          placeholder="NOTES"
          multiline={true}
          twStyle="mb-4"
        />
        <LocationPickers
          value={{
            cityUUID,
            locationCategoryUUID,
            location,
          }}
          onChange={value => {
            setCityUUID(value.cityUUID);
            setLocationCategoryUUID(value.locationCategoryUUID);
            setLocation(value.location);
          }}
          locations={realmState.locations}
        />
        <LLDebouncedTextInput
          initialValue={searchText}
          onChange={(value: string) => setSearchText(value)}
          placeholder="SEARCH"
          twStyle="mt-4"
        />
        <View className="space-y-4 my-4">
          {(() => {
            const selectedClients: Client[] = [];
            const unselectedClients: Client[] = [];

            for (const client of realmState.clients) {
              if (
                searchText &&
                ![client.lastName, client.firstName, client.alias]
                  .join(" ")
                  .toLowerCase()
                  .includes(searchText.toLowerCase())
              )
                continue;
              unselectedClients.push(client);
            }

            if (realmState.dailyList.contacts)
              for (const contact of realmState?.dailyList?.contacts) {
                const index = unselectedClients.findIndex(
                  client =>
                    client._id.toString() === contact.clientId.toString(),
                );

                if (index === -1) continue;

                selectedClients.push(unselectedClients.splice(index, 1)[0]);
              }

            return [
              selectedClients.map(client => clientMapFn(client, true)),
              unselectedClients.map(client => clientMapFn(client, false)),
            ];
          })()}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default MainView;
