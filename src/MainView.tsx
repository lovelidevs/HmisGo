import React, {useContext, useEffect, useRef, useState} from "react";
import {
  ActionSheetIOS,
  Button,
  findNodeHandle,
  Platform,
  ScrollView,
  UIManager,
  View,
} from "react-native";

import {NativeStackScreenProps} from "@react-navigation/native-stack";
import {ObjectId} from "bson";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import cloneDeep from "lodash.clonedeep";
import {SafeAreaView} from "react-native-safe-area-context";
import {useTailwind} from "tailwindcss-react-native";

import {AuthContext} from "./Authentication/AuthProvider";
import ClientLI from "./ClientLI";
import {ContactService} from "./ContactEditor/ContactEditor";
import LLActivityIndicatorView from "./LLComponents/LLActivityIndicatorView";
import LLTextInput from "./LLComponents/LLTextInput";
import LocationPickers from "./LocationPickers";
import {RootStackParamList} from "./NavigationStack";
import {Client} from "./NewClientView";
import {RealmStateContext} from "./RealmStateProvider";

dayjs.extend(utc);

export type DailyList = {
  _id: ObjectId;
  organization: string;
  creator: string;
  timestamp: dayjs.Dayjs;
  note: string[];
  contacts: Contact[];
};

export type Contact = {
  clientIdAsString: string; // Cannot pass ObjectId as route param
  timestampAsString: string;
  city: string;
  locationCategory: string;
  location: string;
  services: ContactService[];
};

const MainView = ({
  navigation,
}: NativeStackScreenProps<RootStackParamList, "HmisGo">) => {
  const tw = useTailwind();

  const auth = useContext(AuthContext);
  const realmState = useContext(RealmStateContext);

  const [city, setCity] = useState<string>("");
  const [locationCategory, setLocationCategory] = useState<string>("");
  const [location, setLocation] = useState<string>("");

  const menuButton = useRef<Button>(null);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Button
          ref={menuButton}
          title="☰"
          onPress={() => {
            const node = findNodeHandle(menuButton.current);
            if (!node) return;

            const menuItems = ["Submit", "New Client", "Logout"];

            const handlePress = (index: number | undefined) => {
              switch (index) {
                case 0:
                  console.log("Submit pressed!");
                  // TODO
                  break;
                case 1:
                  navigation.navigate("NewClient");
                  break;
                case 2:
                  auth?.logOut();
                  break;
              }
            };

            if (Platform.OS === "ios")
              ActionSheetIOS.showActionSheetWithOptions(
                {
                  anchor: node,
                  options: [...menuItems, "Cancel"],
                  cancelButtonIndex: 3,
                },
                (index: number) => handlePress(index),
              );

            if (Platform.OS === "android")
              UIManager.showPopupMenu(
                node,
                menuItems,
                () => console.log("Show Pop Up Menu Error"),
                (item: string, index: number | undefined) => handlePress(index),
              );
          }}
        />
      ),
    });
  }, [navigation, auth]);

  // TODO: Change the clients into a flatlist

  const clientMapFn = (client: Client, isChecked: boolean) => {
    if (!realmState?.dailyList) return;

    return (
      <View key={String(client._id)}>
        <ClientLI
          client={client}
          isChecked={isChecked}
          onCheckboxPress={() => {
            const dailyListClone = cloneDeep(realmState.dailyList);
            if (!dailyListClone) return;

            const contacts = dailyListClone.contacts;

            if (isChecked) {
              const index = contacts.findIndex(
                contact => contact.clientIdAsString === client._id.toString(),
              );
              contacts.splice(index, 1);
            } else
              contacts.push({
                clientIdAsString: client._id.toString(),
                timestampAsString: dayjs.utc().toISOString(),
                city,
                locationCategory,
                location,
                services: [],
              });

            realmState.setDailyList(dailyListClone);
          }}
          contact={
            isChecked
              ? realmState.dailyList.contacts.find(
                  contact => contact.clientIdAsString === client._id.toString(),
                )
              : undefined
          }
          onEditPress={
            isChecked
              ? contactClientIdAsString =>
                  navigation.navigate("ContactEditorNavigator", {
                    contactClientIdAsString,
                  })
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
        <LLTextInput
          value={realmState.dailyList.note.join("\n")}
          onChange={value => {
            const dailyListClone = cloneDeep(realmState.dailyList);
            if (!dailyListClone) return;

            dailyListClone.note = value.split("\n");
            realmState.setDailyList(dailyListClone);
          }}
          placeholder="NOTES"
          multiline={true}
          twStyles="mb-4"
        />
        <LocationPickers
          value={{city, locationCategory, location}}
          onChange={value => {
            setCity(value.city);
            setLocationCategory(value.locationCategory);
            setLocation(value.location);
          }}
          locations={realmState.locations}
        />
        <View className="space-y-4 my-6">
          {(() => {
            const selectedClients = [];
            const unselectedClients = [];

            const contactIds = [];
            for (const contact of realmState.dailyList.contacts)
              contactIds.push(contact.clientIdAsString);

            for (const client of realmState.clients)
              if (contactIds.includes(client._id.toString()))
                selectedClients.push(client);
              else unselectedClients.push(client);

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
