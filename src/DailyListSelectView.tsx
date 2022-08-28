import React, {useContext} from "react";
import {Alert, Button, ScrollView, Text, View} from "react-native";

import {NativeStackScreenProps} from "@react-navigation/native-stack";
import {ObjectId} from "bson";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import {SafeAreaView} from "react-native-safe-area-context";

import {AuthContext} from "./Authentication/AuthProvider";
import LLActivityIndicatorView from "./LLComponents/LLActivityIndicatorView";
import {DailyList} from "./MainView";
import {RootStackParamList} from "./NavigationStack";
import {RealmStateContext} from "./RealmStateProvider";

dayjs.extend(utc);

const DailyListSelectView = ({
  navigation,
}: NativeStackScreenProps<RootStackParamList, "ListSelect">) => {
  const auth = useContext(AuthContext);
  const realmState = useContext(RealmStateContext);

  if (!realmState || !auth?.realm) return <LLActivityIndicatorView />;

  return (
    <SafeAreaView>
      <ScrollView>
        <View
          className={`h-full p-6 flex flex-col flex-nowrap justify-start items-stretch ${
            realmState.dailyListKeys && "space-y-4"
          }`}>
          <View className="">
            <Button
              title="Create New Daily List"
              onPress={() => {
                if (!auth.realm) return;

                const newDailyList: DailyList = {
                  _id: new ObjectId(),
                  organization: auth.organization ? auth.organization : "",
                  creator: auth.email ? auth.email.split("@")[0] : "",
                  timestamp: dayjs.utc().toISOString(),
                  note: [],
                  contacts: [],
                };

                try {
                  auth.realm.write(() => {
                    auth.realm?.create("dailylist", newDailyList);
                  });

                  realmState.setDailyListId(newDailyList._id);
                  navigation.navigate("HmisGo");
                } catch (error) {
                  Alert.alert("", String(error));
                }
              }}
            />
          </View>
          {realmState.dailyListKeys &&
            realmState.dailyListKeys.map(key => (
              <Text
                key={key.creator + key.timestamp}
                className="p-2 bg-white text-lg text-black rounded-lg border border-orange-400"
                onPress={() => {
                  realmState.setDailyListId(key._id);
                  navigation.navigate("HmisGo");
                }}>
                <Text className="font-bold">
                  <Text>Join </Text>
                  <Text className="text-orange-400">{key.creator + "\n"}</Text>
                </Text>
                <Text>
                  {"created @ " + dayjs(key.timestamp).format("h:mm A on M/D")}
                </Text>
              </Text>
            ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default DailyListSelectView;
