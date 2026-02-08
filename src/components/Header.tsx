import { StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../theme/colors';

export default function Header({ title }: { title: string }) {
  return (
    <View style={styles.header}>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingVertical: 16, backgroundColor: COLORS.primary, alignItems: 'center' },
  title: { color: 'white', fontSize: 20, fontWeight: 'bold' },
});