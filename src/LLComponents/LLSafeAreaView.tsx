import React, {ReactNode} from "react";
import {Platform, View} from "react-native";

import {SafeAreaView} from "react-native-safe-area-context";

const LLSafeAreaView = ({children}: {children: ReactNode}) => {
  return (
    <SafeAreaView>
      <View className={Platform.OS === "android" ? "mt-6" : ""} />
      {children}
    </SafeAreaView>
  );
};

export default LLSafeAreaView;
