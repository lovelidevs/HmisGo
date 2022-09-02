import React, {useContext, useState} from "react";
import {Alert, View} from "react-native";

import {NativeStackScreenProps} from "@react-navigation/native-stack";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import {SafeAreaView} from "react-native-safe-area-context";

import LLButton from "../LLComponents/LLButton";
import LLDateInput from "../LLComponents/LLDateInput";
import LLTextInput from "../LLComponents/LLTextInput";
import {RootStackParamList} from "../NavigationStack";
import {ClientContext} from "../Realm/ClientProvider";

dayjs.extend(utc);

const NewClientView = ({
  navigation,
}: NativeStackScreenProps<RootStackParamList, "NewClient">) => {
  const [lastName, setLastName] = useState<string>("");
  const [firstName, setFirstName] = useState<string>("");
  const [DOB, setDOB] = useState<dayjs.Dayjs | null>(null);
  const [alias, setAlias] = useState<string>("");
  const [hmisID, setHmisID] = useState<string>("");

  const clientContext = useContext(ClientContext);

  return (
    <SafeAreaView className="px-6">
      <View className="h-full flex flex-col flex-nowrap justify-center items-stretch space-y-2">
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
          <LLButton
            title="SUBMIT"
            onPress={() => {
              try {
                const client = clientContext?.createClient(
                  lastName,
                  firstName,
                  DOB ? DOB : undefined,
                  alias,
                  hmisID,
                );

                if (client) navigation.goBack();
                else Alert.alert("Error", "Unable to create client");
              } catch (error) {
                Alert.alert("", String(error));
              }
            }}
          />
          <LLButton title="CANCEL" onPress={() => navigation.goBack()} />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default NewClientView;
