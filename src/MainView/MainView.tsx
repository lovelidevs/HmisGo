import React, {useContext, useEffect, useState} from "react";
import {FlatList, View} from "react-native";

import {NativeStackScreenProps} from "@react-navigation/native-stack";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import cloneDeep from "lodash.clonedeep";
import {SafeAreaView} from "react-native-safe-area-context";

import {ContactEditorContext} from "../ContactEditor/ContactEditorProvider";
import LLActivityIndicatorView from "../LLComponents/LLActivityIndicatorView";
import LLButton from "../LLComponents/LLButton";
import LLDebouncedTextInput from "../LLComponents/LLDebouncedTextInput";
import {RootStackParamList} from "../NavigationStack";
import {Client, ClientContext} from "../Realm/ClientProvider";
import {DailyListContext} from "../Realm/DailyListProvider";
import ClientLI from "./ClientLI";
import MenuButton from "./MenuButton";

dayjs.extend(utc);

const MainView = ({
  navigation,
}: NativeStackScreenProps<RootStackParamList, "HmisGo">) => {
  const clientContext = useContext(ClientContext);
  const dailyListContext = useContext(DailyListContext);
  const contactEditorContext = useContext(ContactEditorContext);

  const [searchText, setSearchText] = useState<string>("");

  useEffect(() => {
    if (!dailyListContext?.dailyListId) navigation.goBack();
  }, [navigation, dailyListContext?.dailyListId]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => <MenuButton navigation={navigation} />,
    });
  }, [navigation]);

  // TODO: Make it just ONE flat list

  const clientMapFn = (
    client: Client,
    isChecked: boolean,
  ): JSX.Element | null => {
    if (!dailyListContext?.dailyList) return null;

    return (
      <View className="my-2 mx-3" key={String(client._id)}>
        <ClientLI
          client={client}
          isChecked={isChecked}
          onCheckboxPress={() => {
            let contactsClone = cloneDeep(
              dailyListContext?.dailyList?.contacts,
            );
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
                cityUUID: dailyListContext.currentLocation.cityUUID,
                locationCategoryUUID:
                  dailyListContext.currentLocation.locationCategoryUUID,
                location: dailyListContext.currentLocation.location,
                services: [],
              });

            dailyListContext.updateDailyListContacts(contactsClone);
          }}
          contact={
            isChecked
              ? dailyListContext.dailyList.contacts?.find(
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

  if (!clientContext?.clients || !dailyListContext?.dailyList)
    return <LLActivityIndicatorView />;

  const selectedClients: Client[] = [];
  const unselectedClients: Client[] = [];

  for (const client of clientContext.clients) {
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

  if (dailyListContext.dailyList.contacts)
    for (const contact of dailyListContext?.dailyList?.contacts) {
      const index = unselectedClients.findIndex(
        client => client._id.toString() === contact.clientId.toString(),
      );

      if (index === -1) continue;

      selectedClients.push(unselectedClients.splice(index, 1)[0]);
    }

  // TODO: Make just one flatlist

  return (
    <SafeAreaView>
      <FlatList
        data={selectedClients}
        renderItem={({item}) => {
          return <View key={String(item._id)}>{clientMapFn(item, true)}</View>;
        }}
        keyExtractor={item => String(item._id)}
        ListHeaderComponent={
          <>
            <LLDebouncedTextInput
              initialValue={
                dailyListContext.dailyList.note
                  ? dailyListContext.dailyList.note?.join("\n")
                  : ""
              }
              onChange={value => {
                dailyListContext.updateDailyListNote(
                  value ? value.split("\n") : [],
                );
              }}
              placeholder="NOTES"
              multiline={true}
              twStyle="mb-4 mx-2"
            />
            <View className="mx-2">
              <LLButton
                title={
                  dailyListContext.currentLocation.location
                    ? dailyListContext.currentLocation.location
                    : "SELECT LOCATION"
                }
                onPress={() => {
                  navigation.navigate("LocationSelect", {
                    context: "DailyList",
                  });
                }}
              />
            </View>
            <LLDebouncedTextInput
              initialValue={searchText}
              onChange={(value: string) => setSearchText(value)}
              placeholder="SEARCH"
              twStyle="my-4 mx-2"
            />
          </>
        }
        ListFooterComponent={
          <FlatList
            data={unselectedClients}
            renderItem={({item}) => {
              return (
                <View key={String(item._id)}>{clientMapFn(item, false)}</View>
              );
            }}
            keyExtractor={item => String(item._id)}
            ListFooterComponent={<View className="mb-4" />}
          />
        }
      />
    </SafeAreaView>
  );
};

export default MainView;
