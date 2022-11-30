import React from "react";
import {View, Text, Pressable} from "react-native";

import dayjs from "dayjs";

import {DailyListKey} from "./Realm/DailyListProvider";

export const DailyListSelectItem = ({
  dailyListKey,
  onPress,
}: {
  dailyListKey: DailyListKey;
  onPress: () => void;
}) => {
  return (
    <Pressable onPress={onPress}>
      <View className="flex flex-col flex-nowrap justify-start items-stretch p-2 bg-white border border-gray-300 rounded-lg">
        <View className="flex flex-row flex-nowrap justify-between items-baseline">
          <Text className="font-bold text-lg">
            <Text className="text-black">Join </Text>
            <Text className={"text-cyan-300"}>{dailyListKey.creator}</Text>
          </Text>
          <Text
            className={`${
              dailyListKey.status && dailyListKey.status === "SUBMITTED"
                ? "text-red-500"
                : "text-green-500"
            } font-bold text-lg`}>
            {dailyListKey.status ? dailyListKey.status : "ACTIVE"}
          </Text>
        </View>
        <Text className="text-lg text-black">
          {"created @ " + dayjs(dailyListKey.timestamp).format("h:mm A on M/D")}
        </Text>
      </View>
    </Pressable>
  );
};

export default DailyListSelectItem;
