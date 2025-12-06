import React, { JSX } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ThemeMode, useThemeMode, useThemeActions } from '../hooks/ui/useTheme';

export const ThemeModeSetting = (): JSX.Element => {
  const { mode } = useThemeMode();
  const { setTheme } = useThemeActions();

  const options: ThemeMode[] = ['light', 'dark', 'auto'];

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Theme</Text>
      <View style={styles.optionsRow}>
        {options.map((opt) => {
          const selected = mode === opt;
          return (
            <TouchableOpacity
              key={opt}
              style={[styles.option, selected && styles.optionSelected]}
              onPress={() => setTheme(opt)}
              accessibilityRole="button"
              accessibilityState={{ selected }}
            >
              <Text style={[styles.optionText, selected && styles.optionTextSelected]}>
                {opt === 'auto' ? 'Auto' : opt.charAt(0).toUpperCase() + opt.slice(1)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  optionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  option: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    marginRight: 8,
  },
  optionSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  optionText: {
    color: '#222',
    fontSize: 14,
  },
  optionTextSelected: {
    color: '#fff',
  },
});

export default ThemeModeSetting;
