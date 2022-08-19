import React, {useContext, useState} from "react";
import {Alert, Button, View} from "react-native";

import {SafeAreaView} from "react-native-safe-area-context";

import LLTextInput from "../LLComponents/LLTextInput";
import {AuthContext} from "./AuthProvider";

const Login = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const authContext = useContext(AuthContext);

  return (
    <SafeAreaView className="p-6">
      <View className="h-full flex flex-col flex-nowrap justify-center items-stretch space-y-4">
        <View>
          <LLTextInput
            value={email}
            onChange={value => setEmail(value)}
            placeholder="email"
            type="email"
          />
        </View>
        <View>
          <LLTextInput
            value={password}
            onChange={value => setPassword(value)}
            placeholder="password"
            type="password"
          />
        </View>
        <View>
          {/* TODO: https://reactnative.dev/docs/pressable */}
          <Button title="Forgot Password?" onPress={() => {}} />
        </View>
        <View className="flex flex-row flex-wrap justify-evenly items-center">
          <Button
            title="Log In"
            onPress={async () => {
              try {
                await authContext?.logIn(email, password);
              } catch (error) {
                Alert.alert("", String(error));
              }
            }}
          />
          <Button title="Sign Up" onPress={() => {}} />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Login;
