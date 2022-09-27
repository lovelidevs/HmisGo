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

type FlatListDatum = {
  client: Client;
  isChecked: boolean;
};

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

  if (!clientContext?.clients || !dailyListContext?.dailyList)
    return <LLActivityIndicatorView />;

  const generateFlatListData = (): FlatListDatum[] => {
    const flatListData: FlatListDatum[] = [];

    if (!clientContext.clients) return flatListData;

    for (const client of clientContext.clients) {
      if (
        searchText &&
        ![client.lastName, client.firstName, client.alias]
          .join(" ")
          .toLowerCase()
          .includes(searchText.toLowerCase())
      )
        continue;
      flatListData.push({client, isChecked: false});
    }

    if (!dailyListContext.dailyList?.contacts) return flatListData;

    let selectedIndex = 0;
    for (const contact of dailyListContext.dailyList.contacts) {
      const index = flatListData.findIndex(
        flatListDatum =>
          flatListDatum.client._id.toString() === contact.clientId.toString(),
      );

      if (index === -1) continue;

      const flatListDatum = flatListData.splice(index, 1)[0];
      flatListDatum.isChecked = true;

      flatListData.splice(selectedIndex, 0, flatListDatum);
      selectedIndex++;
    }

    return flatListData;
  };

  const renderFlatListDatum = (
    flatListDatum: FlatListDatum,
  ): JSX.Element | null => {
    return (
      <View className="my-2 mx-3">
        <ClientLI
          client={flatListDatum.client}
          isChecked={flatListDatum.isChecked}
          onCheckboxPress={() => {
            let contactsClone = cloneDeep(
              dailyListContext?.dailyList?.contacts,
            );
            if (!contactsClone) contactsClone = [];

            if (flatListDatum.isChecked) {
              const index = contactsClone.findIndex(
                contact =>
                  contact.clientId.toString() ===
                  flatListDatum.client._id.toString(),
              );
              contactsClone.splice(index, 1);
            } else
              contactsClone.push({
                clientId: flatListDatum.client._id,
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
            flatListDatum.isChecked
              ? dailyListContext?.dailyList?.contacts?.find(
                  contact =>
                    contact.clientId.toString() ===
                    flatListDatum.client._id.toString(),
                )
              : undefined
          }
          onEditPress={
            flatListDatum.isChecked
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

  return (
    <SafeAreaView>
      <FlatList
        data={generateFlatListData()}
        renderItem={({item}) => renderFlatListDatum(item)}
        keyExtractor={item => item.client._id.toString()}
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
      />
    </SafeAreaView>
  );
};

export default MainView;
