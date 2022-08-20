import React, {useState} from "react";
import {Button, View} from "react-native";

import {NativeStackScreenProps} from "@react-navigation/native-stack";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import {SafeAreaView} from "react-native-safe-area-context";

import LLDateInput from "./LLComponents/LLDateInput";
import LLTextInput from "./LLComponents/LLTextInput";
import {RootStackParamList} from "./NavigationStack";

dayjs.extend(utc);

const NewClientView = ({
  navigation,
}: NativeStackScreenProps<RootStackParamList, "NewClient">) => {
  const [lastName, setLastName] = useState<string>("");
  const [firstName, setFirstName] = useState<string>("");
  const [dob, setDob] = useState<dayjs.Dayjs | null>(null);
  const [alias, setAlias] = useState<string>("");
  const [hmisID, setHmisID] = useState<string>("");

  // TODO: Add confirm or cancel buttons

  return (
    <SafeAreaView className="px-6">
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
            value={dob}
            onChange={(value: dayjs.Dayjs) => setDob(value)}
            placeholder="DOB"
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
          <Button title="SUBMIT" onPress={() => {}} />
          <Button title="CANCEL" onPress={() => navigation.goBack()} />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default NewClientView;
