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

import {Picker} from "@react-native-picker/picker";
import {NativeStackScreenProps} from "@react-navigation/native-stack";
import {ObjectId} from "bson";
import {SafeAreaView} from "react-native-safe-area-context";
import Realm from "realm";
import {styled, useTailwind} from "tailwindcss-react-native";

import {AuthContext} from "./Authentication/AuthProvider";
import ClientLI from "./ClientLI";
import {RootStackParamList} from "./NavigationStack";

export type Client = {
  _id: ObjectId;
  organization: string;
  lastName: string;
  firstName: string;
  DOB: string;
  alias?: string;
  hmisID?: string;
};

type LocationDocument = {
  _id: ObjectId;
  organization: string;
  cities?: City[];
};

type City = {
  uuid: string;
  city: string;
  categories?: LocationCategory[];
};

type LocationCategory = {
  uuid: string;
  category: string;
  locations?: Location[];
};

type Location = {
  uuid: string;
  location: string;
  places?: string[];
};

const StyledPicker = styled(Picker);
const StyledPickerItem = styled(Picker.Item);

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
  // TODO: Break out the location selects into their own component
  // useTailwind instead of StyledPicker
  // TODO: logout is still busted, but it works if I tap the screen. Doesn't make sense. Try on iOS, shows scroll wheel on login too

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
        <View className="flex flex-col flex-nowrap justify-start items-stretch space-y-4">
          <View className="rounded-lg border">
            <StyledPicker
              selectedValue={city}
              onValueChange={itemValue => {
                setCity(itemValue as string);
                setLocationCategory("");
                setLocation("");
              }}
              dropdownIconColor="black"
              tw="text-black">
              <StyledPickerItem
                key=""
                label={city ? "" : "SELECT CITY"}
                value={""}
              />
              {locations.cities?.map(value => (
                <StyledPickerItem
                  key={value.uuid}
                  label={value.city}
                  value={value.uuid}
                />
              ))}
            </StyledPicker>
          </View>
          <View className="rounded-lg border">
            <StyledPicker
              selectedValue={locationCategory}
              onValueChange={itemValue => {
                setLocationCategory(itemValue as string);
                setLocation("");
              }}
              dropdownIconColor="black"
              tw="text-black">
              <StyledPickerItem
                key=""
                label={locationCategory ? "" : "SELECT LOCATION CATEGORY"}
                value={""}
              />
              {(() => {
                const tempCity = locations.cities?.find(
                  value => value.uuid === city,
                );
                if (!tempCity) return;

                return tempCity.categories?.map(value => (
                  <StyledPickerItem
                    key={value.uuid}
                    label={value.category}
                    value={value.uuid}
                  />
                ));
              })()}
            </StyledPicker>
          </View>
          <View className="rounded-lg border">
            <StyledPicker
              selectedValue={location}
              onValueChange={itemValue => setLocation(itemValue as string)}
              dropdownIconColor="black"
              tw="text-black">
              <StyledPickerItem
                key=""
                label={location ? "" : "SELECT LOCATION"}
                value={""}
              />
              {(() => {
                const tempCity = locations.cities?.find(
                  value => value.uuid === city,
                );
                if (!tempCity) return;

                const tempCategories = tempCity.categories?.find(
                  value => value.uuid === locationCategory,
                );
                if (!tempCategories) return;

                return tempCategories.locations?.map(value => {
                  const items = [
                    <StyledPickerItem
                      key={value.uuid}
                      label={value.location}
                      value={value.location}
                    />,
                  ];

                  if (!value.places) return items;

                  for (const place of value.places)
                    items.push(
                      <StyledPickerItem
                        key={value.uuid + place}
                        label={value.location + ": " + place}
                        value={value.location + ": " + place}
                      />,
                    );

                  return items;
                });
              })()}
            </StyledPicker>
          </View>
        </View>
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
