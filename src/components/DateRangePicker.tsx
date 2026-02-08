import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { COLORS } from '../theme/colors';
import { DateRange } from '../types';

type Props = {
  range: DateRange;
  onChange: (range: DateRange) => void;
};

export default function DateRangePicker({ range, onChange }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.field}>
        <Text style={styles.label}>From</Text>
        <TextInput
          style={styles.input}
          value={range.from}
          onChangeText={(text) => onChange({ ...range, from: text })}
          placeholder="YYYY-MM-DD"
          placeholderTextColor="#999"
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>To</Text>
        <TextInput
          style={styles.input}
          value={range.to}
          onChangeText={(text) => onChange({ ...range, to: text })}
          placeholder="YYYY-MM-DD"
          placeholderTextColor="#999"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  field: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    color: '#555',
    marginBottom: 6,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    backgroundColor: '#fff',
  },
});