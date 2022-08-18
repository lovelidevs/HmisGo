import React, {useContext, useEffect, useState} from "react";
import {Alert, ScrollView, Text, View} from "react-native";

import {ObjectId} from "bson";
import {SafeAreaView} from "react-native-safe-area-context";
import Realm from "realm";

import {AuthContext} from "./Authentication/AuthProvider";

// TODO: Submit, New Client, Log Out
// TODO: Implement ActivityIndicators eventually

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

type Client = {
  _id: ObjectId;
  organization: string;
  lastName: string;
  firstName: string;
  DOB: string;
  alias?: string;
  hmisID?: string;
};

const MainView = () => {
  const [realm, setRealm] = useState<Realm | null>(null);
  const [clientsCollection, setClientsCollection] =
    useState<Realm.Collection<Realm.Object> | null>(null);

  const auth = useContext(AuthContext);

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

  return (
    <SafeAreaView className="p-6">
      <Text>OINKERVILLE</Text>
      <ScrollView>
        {clientsCollection &&
          clientsCollection.map(client => (
            <View key={String((client as unknown as Client)._id)}>
              <Text>{`${(client as unknown as Client).lastName} ${
                (client as unknown as Client).firstName
              }`}</Text>
            </View>
          ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default MainView;
