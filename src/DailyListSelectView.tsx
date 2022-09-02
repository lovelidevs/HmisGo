import React, {useContext, useEffect} from "react";
import {Alert, ScrollView, Text, View} from "react-native";

import {NativeStackScreenProps} from "@react-navigation/native-stack";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import {SafeAreaView} from "react-native-safe-area-context";

import {AuthContext} from "./Authentication/AuthProvider";
import LogoutIcon from "./Icons/logout.svg";
import LLActivityIndicatorView from "./LLComponents/LLActivityIndicatorView";
import LLButton from "./LLComponents/LLButton";
import LLHeaderButton from "./LLComponents/LLHeaderButton";
import {RootStackParamList} from "./NavigationStack";
import {DailyListContext} from "./Realm/DailyListProvider";

dayjs.extend(utc);

const DailyListSelectView = ({
  navigation,
}: NativeStackScreenProps<RootStackParamList, "ListSelect">) => {
  const authContext = useContext(AuthContext);
  const dailyListContext = useContext(DailyListContext);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <LLHeaderButton onPress={() => authContext?.logOut()}>
          <LogoutIcon width="100%" height="100%" />
        </LLHeaderButton>
      ),
    });
  }, [navigation, authContext]);

  if (!dailyListContext) return <LLActivityIndicatorView />;

  return (
    <SafeAreaView>
      <ScrollView>
        <View
          className={`h-full p-6 flex flex-col flex-nowrap justify-start items-stretch ${
            dailyListContext.dailyListKeys && "space-y-4"
          }`}>
          <View className="">
            <LLButton
              title="Create New Daily List"
              onPress={() => {
                if (!dailyListContext)
                  return Alert.alert(
                    "",
                    "Unable to connect to daily list collection",
                  );

                try {
                  dailyListContext.setDailyListId(
                    dailyListContext.createDailyList(),
                  );
                  navigation.navigate("HmisGo");
                } catch (error) {
                  Alert.alert("", String(error));
                }
              }}
            />
          </View>
          {dailyListContext.dailyListKeys &&
            dailyListContext.dailyListKeys.map(key => (
              <Text
                key={key.creator + key.timestamp}
                className={
                  "p-2 bg-white text-lg text-black rounded-lg border border-gray-300"
                }
                onPress={() => {
                  dailyListContext.setDailyListId(key._id);
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
