import React from "react";
import {ActivityIndicator} from "react-native";

import {SafeAreaView} from "react-native-safe-area-context";

const LLActivityIndicatorView = () => {
  return (
    <SafeAreaView className="h-full flex flex-col flex-nowrap justify-center items-center">
      <ActivityIndicator size="large" />
    </SafeAreaView>
  );
};

export default LLActivityIndicatorView;
