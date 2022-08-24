import React, {useContext, useEffect, useRef, useState} from "react";
import {
  ActionSheetIOS,
  ActivityIndicator,
  Alert,
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
import Realm from "realm";
import {useTailwind} from "tailwindcss-react-native";

import {AuthContext} from "./Authentication/AuthProvider";
import ClientLI from "./ClientLI";
import {Service} from "./ClientServiceEditor/ClientServiceEditor";
import LLTextInput from "./LLComponents/LLTextInput";
import LocationPickers, {LocationDocument} from "./LocationPickers";
import {RootStackParamList} from "./NavigationStack";
import {Client} from "./NewClientView";

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
  clientId: ObjectId;
  timestamp: dayjs.Dayjs;
  city: string;
  locationCategory: string;
  location: string;
  services: Service[] | null;
};

const MainView = ({
  navigation,
}: NativeStackScreenProps<RootStackParamList, "HmisGo">) => {
  const tw = useTailwind();
  const auth = useContext(AuthContext);

  const [clients, setClients] = useState<Client[] | null>(null);

  const [locations, setLocations] = useState<LocationDocument | null>(null);

  const [city, setCity] = useState<string>("");
  const [locationCategory, setLocationCategory] = useState<string>("");
  const [location, setLocation] = useState<string>("");

  const clientsCollection = useRef<Realm.Collection<Realm.Object> | null>(null);
  const locationsCollection = useRef<Realm.Collection<Realm.Object> | null>(
    null,
  );

  const [dailyList, setDailyList] = useState<DailyList>({
    _id: new ObjectId(),
    organization: auth?.organization ? auth.organization : "",
    creator: auth?.email ? auth.email.split("@")[0] : "",
    timestamp: dayjs.utc(),
    note: [""],
    contacts: [],
  });

  const menuButton = useRef<Button>(null);

  useEffect(() => {
    if (!auth?.realm) return;

    try {
      const results = auth.realm.objects("client").sorted([
        ["lastName", false],
        ["firstName", false],
        ["alias", false],
      ]);

      results.addListener(collection => {
        setClients(JSON.parse(JSON.stringify(collection)));
      });

      clientsCollection.current = results;
    } catch (error) {
      Alert.alert("", String(error));
    }

    try {
      const results = auth.realm.objects("location");

      results.addListener(collection => {
        setLocations(JSON.parse(JSON.stringify(collection))[0]);
      });

      locationsCollection.current = results;
    } catch (error) {
      Alert.alert("", String(error));
    }

    return () => {
      if (clientsCollection.current)
        clientsCollection.current.removeAllListeners();
      if (locationsCollection.current)
        locationsCollection.current.removeAllListeners();
    };
  }, [auth?.realm]);

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

  if (!clients || !locations)
    return (
      <SafeAreaView className="h-full flex flex-col flex-nowrap justify-center items-center">
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );

  const clientMapFn = (client: Client, isChecked: boolean) => (
    <View key={String(client._id)}>
      <ClientLI
        client={client}
        isChecked={isChecked}
        onPress={() => {
          const dailyListClone = cloneDeep(dailyList);
          const contacts = dailyListClone.contacts;

          if (isChecked) {
            const index = contacts.findIndex(
              contact => contact.clientId === client._id,
            );
            contacts.splice(index, 1);
          } else
            contacts.push({
              clientId: client._id,
              timestamp: dayjs.utc(),
              city,
              locationCategory,
              location,
              services: null,
            });

          setDailyList(dailyListClone);
        }}
      />
    </View>
  );

  return (
    <SafeAreaView className={`px-6 ${Platform.OS === "android" && "pt-6"}`}>
      <ScrollView
        contentContainerStyle={tw(
          "flex flex-col flex-nowrap justify-start items-stretch",
        )}>
        <LLTextInput
          value={dailyList.note.join("\n")}
          onChange={value => {
            const dailyListClone = cloneDeep(dailyList);
            dailyListClone.note = value.split("\n");
            setDailyList(dailyListClone);
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
          locations={locations}
        />
        <View className="space-y-4 my-6">
          {(() => {
            const selectedClients = [];
            const unselectedClients = [];

            const contactIds = [];
            for (const contact of dailyList.contacts)
              contactIds.push(contact.clientId);

            for (const client of clients)
              if (contactIds.includes(client._id)) selectedClients.push(client);
              else unselectedClients.push(client);

            selectedClients.sort((a, b) => {
              return (a.lastName + a.firstName + a.alias + a.hmisID)
                .toLowerCase()
                .localeCompare(
                  (b.lastName + b.firstName + b.alias + b.hmisID).toLowerCase(),
                );
            });

            selectedClients.map(client => clientMapFn(client, true));
            unselectedClients.map(client => clientMapFn(client, false));

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
