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
import {SafeAreaView} from "react-native-safe-area-context";
import Realm from "realm";
import {useTailwind} from "tailwindcss-react-native";

import {AuthContext} from "./Authentication/AuthProvider";
import ClientLI from "./ClientLI";
import {Service} from "./ClientServiceEditor/ClientServiceEditor";
import LocationPickers, {LocationDocument} from "./LocationPickers";
import {RootStackParamList} from "./NavigationStack";
import {Client} from "./NewClientView";

export type DailyList = {
  _id: ObjectId;
  organization: string;
  creator: string;
  note: string[] | null;
  contacts: Contact[] | null;
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

  const [clients, setClients] = useState<Client[] | null>(null);

  const [locations, setLocations] = useState<LocationDocument | null>(null);

  const [city, setCity] = useState<string>("");
  const [locationCategory, setLocationCategory] = useState<string>("");
  const [location, setLocation] = useState<string>("");

  const clientsCollection = useRef<Realm.Collection<Realm.Object> | null>(null);
  const locationsCollection = useRef<Realm.Collection<Realm.Object> | null>(
    null,
  );

  const auth = useContext(AuthContext);

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

  return (
    <SafeAreaView className={`px-6 ${Platform.OS === "android" && "pt-6"}`}>
      <ScrollView
        contentContainerStyle={tw(
          "flex flex-col flex-nowrap justify-start items-stretch",
        )}>
        <LocationPickers
          value={{city, locationCategory, location}}
          onChange={value => {
            setCity(value.city);
            setLocationCategory(value.locationCategory);
            setLocation(value.location);
          }}
          locations={locations}
        />
        <View className="space-y-2 mt-4">
          {clients &&
            clients.map(client => (
              <View key={String(client._id)}>
                <ClientLI client={client} isActive={false} />
              </View>
            ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default MainView;
