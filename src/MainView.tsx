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

// TODO: Submit, New Client, Log Out
// TODO: Implement ActivityIndicators eventually
// TODO: Add a menu button to the header

const clientSchema = {
  name: "client",
  properties: {
    _id: "objectId",
    DOB: "string",
    alias: "string?",
    firstName: "string",
    hmisID: "string?",
    lastName: "string",
    organization: "string",
  },
  primaryKey: "_id",
};

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
  const [realm, setRealm] = useState<Realm | null>(null);
  const [clientsCollection, setClientsCollection] =
    useState<Realm.Collection<Realm.Object> | null>(null);

  const auth = useContext(AuthContext);

  const menuButton = useRef<Button>(null);

  useEffect(() => {
    (async () => {
      if (!auth?.user || !auth.organization) return;

      try {
        setRealm(
          await Realm.open({
            schema: [clientSchema],
            sync: {
              user: auth.user,
              partitionValue: auth.organization,
            },
          }),
        );
      } catch (error) {
        Alert.alert("", String(error));
      }
    })();
  }, [auth?.user, auth?.organization]);

  useEffect(() => {
    if (!realm) return;

    try {
      const results = realm.objects("client");
      results.addListener(collection => setClientsCollection(collection));
      setClientsCollection(results);
    } catch (error) {
      Alert.alert("", String(error));
    }
  }, [realm]);

  useEffect(() => {
    return () => {
      if (realm) realm.close();
      if (clientsCollection) clientsCollection.removeAllListeners();
    };
  }, [realm, clientsCollection]);

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

  return (
    <SafeAreaView className="px-6">
      <ScrollView className="space-y-2">
        {clientsCollection &&
          clientsCollection.map(client => (
            <View key={String((client as unknown as Client)._id)}>
              <ClientLI client={client as unknown as Client} isActive={false} />
            </View>
          ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default MainView;
