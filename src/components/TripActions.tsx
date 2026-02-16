import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native';
import { COLORS } from '../theme/colors';

type Props = {
  onEdit: () => void;
  onDelete: () => void;
}

export default function TripActions({ onEdit, onDelete }: Props) {
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

      <TouchableOpacity onPress={onEdit} style={styles.button}>
        <Ionicons name="pencil" size={20} color={COLORS.primary} />
      </TouchableOpacity>
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
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
});