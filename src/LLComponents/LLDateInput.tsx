import React, {useState} from "react";
import {Text, View} from "react-native";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import DatePicker from "react-native-date-picker";

dayjs.extend(utc);

const LLDateInput = ({
  value,
  onChange,
  placeholder,
  twStyles,
}: {
  value: dayjs.Dayjs | null;
  onChange: (value: dayjs.Dayjs) => void;
  placeholder?: string;
  twStyles?: string;
}) => {
  const [open, setOpen] = useState<boolean>(false);

  return (
    <>
      <View className="rounded-lg border border-gray-300 overflow-hidden">
        <Text
          onPress={() => setOpen(true)}
          className={`text-lg p-2 bg-white ${twStyles}`}>
          {value ? (
            <Text className="text-black">
              {value.local().format("M/D/YYYY")}
            </Text>
          ) : (
            <Text className="text-gray-300">{placeholder}</Text>
          )}
        </Text>
      </View>
      <DatePicker
        modal
        mode="date"
        open={open}
        date={value ? value.toDate() : dayjs.utc().toDate()}
        onConfirm={date => {
          setOpen(false);
          onChange(dayjs(date).utc());
        }}
        onCancel={() => setOpen(false)}
      />
    </>
  );
};

export default LLDateInput;
