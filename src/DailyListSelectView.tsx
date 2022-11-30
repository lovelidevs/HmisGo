import React, {useContext, useEffect} from "react";
import {Alert, ScrollView, View} from "react-native";

import {NativeStackScreenProps} from "@react-navigation/native-stack";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import {SafeAreaView} from "react-native-safe-area-context";

import {AuthContext} from "./Authentication/AuthProvider";
import DailyListSelectItem from "./DailyListSelectItem";
import LogoutIcon from "./Icons/logout.svg";
import LLActivityIndicatorView from "./LLComponents/LLActivityIndicatorView";
import LLButton from "./LLComponents/LLButton";
import LLHeaderButton from "./LLComponents/LLHeaderButton";
import {RootStackParamList} from "./NavigationStack";
import {DailyListContext} from "./Realm/DailyListProvider";

dayjs.extend(utc);

const DailyListSelectView = ({
  navigation,
}: NativeStackScreenProps<RootStackParamList, "DailyListSelect">) => {
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
              <View key={key.creator + key.timestamp}>
                <DailyListSelectItem
                  dailyListKey={key}
                  onPress={() => {
                    dailyListContext.setDailyListId(key._id);
                    navigation.navigate("HmisGo");
                  }}
                />
              </View>
            ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default DailyListSelectView;
