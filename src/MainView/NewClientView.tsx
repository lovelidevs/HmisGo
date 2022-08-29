import React, {useContext, useState} from "react";
import {Alert, Button, Platform, View} from "react-native";

import {NativeStackScreenProps} from "@react-navigation/native-stack";
import "react-native-get-random-values";
import {ObjectId} from "bson";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import {SafeAreaView} from "react-native-safe-area-context";

import {AuthContext} from "../Authentication/AuthProvider";
import LLDateInput from "../LLComponents/LLDateInput";
import LLTextInput from "../LLComponents/LLTextInput";
import {RootStackParamList} from "../NavigationStack";

dayjs.extend(utc);

export type Client = {
  _id: ObjectId;
  organization: string;
  lastName: string;
  firstName: string;
  DOB: string;
  alias?: string;
  hmisID?: string;
  serviceHistory?: ClientContact[];
};

export type ClientContact = {
  date: string;
  time?: string;
  city?: string;
  locationCategory?: string;
  location?: string;
  services?: ClientService[];
};

export type ClientService = {
  service: string;
  text?: string;
  count?: number;
  units?: string;
  list?: string[];
};

const NewClientView = ({
  navigation,
}: NativeStackScreenProps<RootStackParamList, "NewClient">) => {
  const [lastName, setLastName] = useState<string>("");
  const [firstName, setFirstName] = useState<string>("");
  const [DOB, setDOB] = useState<dayjs.Dayjs | null>(null);
  const [alias, setAlias] = useState<string>("");
  const [hmisID, setHmisID] = useState<string>("");

  const auth = useContext(AuthContext);

  return (
    <SafeAreaView className={`px-6 ${Platform.OS === "android" && "pt-6"}`}>
      <View className="flex flex-col flex-nowrap justify-start items-stretch space-y-2">
        <View>
          <LLTextInput
            value={lastName}
            onChange={(value: string) => setLastName(value)}
            placeholder="Last Name"
          />
        </View>
        <View>
          <LLTextInput
            value={firstName}
            onChange={(value: string) => setFirstName(value)}
            placeholder="First Name"
          />
        </View>
        <View>
          <LLDateInput
            value={DOB}
            onChange={(value: dayjs.Dayjs) => setDOB(value)}
            placeholder="Date of Birth"
          />
        </View>
        <View>
          <LLTextInput
            value={alias}
            onChange={(value: string) => setAlias(value)}
            placeholder="Alias"
          />
        </View>
        <View>
          <LLTextInput
            value={hmisID}
            onChange={(value: string) => setHmisID(value)}
            placeholder="HMIS ID"
          />
        </View>
        <View className="pt-4 flex flex-row flex-wrap justify-evenly items-center">
          <Button
            title="SUBMIT"
            onPress={() => {
              if (!lastName) return Alert.alert("", "last name required");
              if (!firstName) return Alert.alert("", "first name required");
              if (!DOB) return Alert.alert("", "date of birth required");

              if (!auth?.realm) return;

              let properties: object = {
                organization: auth.organization,
                _id: new ObjectId(),
                lastName: lastName.trim(),
                firstName: firstName.trim(),
                DOB: DOB.local().format("YYYY-MM-DD"),
              };

              if (alias) properties = {...properties, alias: alias.trim()};
              if (hmisID) properties = {...properties, hmisID: hmisID.trim()};

              try {
                let clientObject: Realm.Object | undefined;
                auth.realm.write(() => {
                  clientObject = auth.realm?.create("client", properties);
                });

                if (clientObject) {
                  const client = clientObject as unknown as Client;
                  Alert.alert(
                    "",
                    `${client.firstName} ${client.lastName} added`,
                    [{text: "OK", onPress: () => navigation.goBack()}],
                  );
                }
              } catch (error) {
                Alert.alert("", String(error));
              }
            }}
          />
          <Button title="CANCEL" onPress={() => navigation.goBack()} />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default NewClientView;
