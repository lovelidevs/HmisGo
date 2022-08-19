import React, {useState} from "react";
import {Button, Text, View} from "react-native";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import DatePicker from "react-native-date-picker";
import {SafeAreaView} from "react-native-safe-area-context";

import LLTextInput from "./LLComponents/LLTextInput";

dayjs.extend(utc);

const NewClientView = () => {
  const [lastName, setLastName] = useState<string>("");
  const [firstName, setFirstName] = useState<string>("");
  const [dob, setDob] = useState<dayjs.Dayjs | null>(null);
  const [alias, setAlias] = useState<string>("");
  const [hmisID, setHmisID] = useState<string>("");

  const [dobOpen, setDobOpen] = useState<boolean>(false);

  // TODO: Add confirm or cancel buttons

  return (
    <>
      <SafeAreaView className="p-6">
        <View>
          <LLTextInput
            value={lastName}
            onChange={(value: string) => setLastName(value)}
            placeholder="Last Name"
          />
          <LLTextInput
            value={firstName}
            onChange={(value: string) => setFirstName(value)}
            placeholder="First Name"
          />
          <View className="flex flex-row flex-nowrap justify-center items-baseline space-x-4">
            <Text className="text-black">DOB:</Text>
            <View>
              <Button
                title={dob ? dob.local().format("MMMM D, YYYY") : "SELECT"}
                onPress={() => setDobOpen(true)}
              />
            </View>
          </View>
          <LLTextInput
            value={alias}
            onChange={(value: string) => setAlias(value)}
            placeholder="Alias"
          />
          <LLTextInput
            value={hmisID}
            onChange={(value: string) => setHmisID(value)}
            placeholder="HMIS ID"
          />
        </View>
      </SafeAreaView>
      <DatePicker
        modal
        mode="date"
        open={dobOpen}
        date={dob ? dob.toDate() : dayjs.utc().toDate()}
        onConfirm={date => {
          setDobOpen(false);
          setDob(dayjs(date).utc());
        }}
        onCancel={() => setDobOpen(false)}
      />
    </>
  );
};

export default NewClientView;
