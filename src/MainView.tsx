import React, {useContext, useEffect, useRef, useState} from "react";
import {
  ActionSheetIOS,
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
import {SafeAreaView} from "react-native-safe-area-context";
import Realm from "realm";

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

const MainView = ({
  navigation,
}: NativeStackScreenProps<RootStackParamList, "HmisGo">) => {
  const [clientsCollection, setClientsCollection] =
    useState<Realm.Collection<Realm.Object> | null>(null);
  const [clients, setClients] = useState<Client[] | null>(null);

  const auth = useContext(AuthContext);

  const menuButton = useRef<Button>(null);

  useEffect(() => {
    if (!auth?.realm) return;

    try {
      const results = auth.realm.objects("client");
      results.addListener(collection =>
        setClients([...(collection as unknown as Client[])]),
      );
      setClientsCollection(results);
    } catch (error) {
      Alert.alert("", String(error));
    }
  }, [auth?.realm]);

  useEffect(() => {
    return () => {
      if (clientsCollection) clientsCollection.removeAllListeners();
    };
  }, [clientsCollection]);

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

  // TODO: Add ActivityIndicator

  return (
    <SafeAreaView className={`px-6 ${Platform.OS === "android" && "pt-6"}`}>
      <ScrollView className="space-y-2">
        {clients &&
          clients.map(client => (
            <View key={String(client._id)}>
              <ClientLI client={client} isActive={false} />
            </View>
          ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default MainView;
