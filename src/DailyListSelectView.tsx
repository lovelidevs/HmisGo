import React, {useContext, useEffect} from "react";
import {Alert, ScrollView, Text, View} from "react-native";

import {NativeStackScreenProps} from "@react-navigation/native-stack";
import "react-native-get-random-values";
import {ObjectId} from "bson";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import {SafeAreaView} from "react-native-safe-area-context";

import {AuthContext} from "./Authentication/AuthProvider";
import LogoutIcon from "./Icons/logout.svg";
import LLActivityIndicatorView from "./LLComponents/LLActivityIndicatorView";
import LLButton from "./LLComponents/LLButton";
import LLHeaderButton from "./LLComponents/LLHeaderButton";
import {DailyList} from "./MainView/MainView";
import {RootStackParamList} from "./NavigationStack";
import {RealmStateContext} from "./RealmStateProvider";

dayjs.extend(utc);

const DailyListSelectView = ({
  navigation,
}: NativeStackScreenProps<RootStackParamList, "ListSelect">) => {
  const auth = useContext(AuthContext);
  const realmState = useContext(RealmStateContext);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <LLHeaderButton onPress={() => auth?.logOut()}>
          <LogoutIcon width="100%" height="100%" />
        </LLHeaderButton>
      ),
    });
  }, [navigation, auth]);

  if (!realmState || !auth?.realm) return <LLActivityIndicatorView />;

  return (
    <SafeAreaView>
      <ScrollView>
        <View
          className={`h-full p-6 flex flex-col flex-nowrap justify-start items-stretch ${
            realmState.dailyListKeys && "space-y-4"
          }`}>
          <View className="">
            <LLButton
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
                className={
                  "p-2 bg-white text-lg text-black rounded-lg border border-gray-300"
                }
                onPress={() => {
                  realmState.setDailyListId(key._id);
                  navigation.navigate("HmisGo");
                }}>
                <Text className="font-bold">
                  <Text>Join </Text>
                  <Text className={"text-cyan-300"}>{key.creator + "\n"}</Text>
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
