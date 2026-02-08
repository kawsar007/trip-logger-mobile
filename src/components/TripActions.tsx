import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native';

type Props = {
  // onEdit: () => void;
  onDelete: () => void;
}

export default function TripActions({ onDelete }: Props) {
  const confirmDelete = () => {
    Alert.alert(
      'Delete Trip',
      'Are you sure you want to delete this trip? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: onDelete,
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* <TouchableOpacity onPress={onEdit} style={styles.button}>
        <Ionicons name="pencil" size={20} color={COLORS.primary} />
      </TouchableOpacity> */}

      <TouchableOpacity onPress={confirmDelete} style={styles.button}>
        <Ionicons name="trash" size={20} color="#dc3545" />
      </TouchableOpacity>
    </View>
  )
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  button: {
    padding: 8,
  },
});