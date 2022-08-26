import React, {useContext} from "react";
import {Button, Platform} from "react-native";

import {NativeStackScreenProps} from "@react-navigation/native-stack";
import {ObjectId} from "bson";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import {SafeAreaView} from "react-native-safe-area-context";

import {AuthContext} from "./Authentication/AuthProvider";
import {RootStackParamList} from "./NavigationStack";
import {RealmStateContext} from "./RealmStateProvider";

dayjs.extend(utc);

const ListSelectView = ({
  navigation,
}: NativeStackScreenProps<RootStackParamList, "ListSelect">) => {
  const auth = useContext(AuthContext);
  const realmState = useContext(RealmStateContext);

  return (
    <SafeAreaView className={`px-6 ${Platform.OS === "android" && "pt-6"}`}>
      <Button
        title="Create New Daily List"
        onPress={() => {
          realmState?.setDailyList({
            _id: new ObjectId(),
            organization: auth?.organization ? auth.organization : "",
            creator: auth?.email ? auth.email.split("@")[0] : "",
            timestamp: dayjs.utc(),
            note: [""],
            contacts: [],
          });
          navigation.navigate("HmisGo");
        }}
      />
    </SafeAreaView>
  );
};

export default ListSelectView;
