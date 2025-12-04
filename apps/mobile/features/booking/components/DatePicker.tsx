import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Text } from '../../../components/ui/Typography/Text';
import { useTheme } from '../../../shared/hooks/ui/useTheme';

interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
  minDate?: string;
  maxDate?: string;
  label?: string;
  disabled?: boolean;
  style?: any;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  minDate,
  maxDate,
  label = 'Select Date',
  disabled = false,
  style,
}) => {
  const { colors } = useTheme();
  const [showPicker, setShowPicker] = useState(false);

  const selectedDate = value ? new Date(value) : new Date();
  const minDateObj = minDate ? new Date(minDate) : new Date();
  const maxDateObj = maxDate ? new Date(maxDate) : undefined;

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowPicker(false);

    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().split('T')[0];
      onChange(formattedDate);
    }
  };

  const showDatePicker = () => {
    if (!disabled) {
      setShowPicker(true);
    }
  };

  const formatDisplayDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <View style={[styles.container, style]}>
      {label && (
        <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      )}
      
      <TouchableOpacity
        style={[
          styles.pickerButton,
          { 
            backgroundColor: colors.surface,
            borderColor: disabled ? colors.border : colors.primary,
            opacity: disabled ? 0.6 : 1,
          }
        ]}
        onPress={showDatePicker}
        disabled={disabled}
      >
        <Text style={[
          styles.pickerText,
          { color: value ? colors.text : colors.text + '80' }
        ]}>
          {value ? formatDisplayDate(value) : 'Select a date...'}
        </Text>
        
        <Text style={[styles.calendarIcon, { color: colors.primary }]}>
          📅
        </Text>
      </TouchableOpacity>

      {showPicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
          minimumDate={minDateObj}
          maximumDate={maxDateObj}
          style={styles.dateTimePicker}
        />
      )}

      {/* For Android, we need to show the picker in a different way */}
      {Platform.OS === 'android' && showPicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
          minimumDate={minDateObj}
          maximumDate={maxDateObj}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
    fontWeight: '600',
    fontSize: 14,
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: 8,
    height: 48,
  },
  pickerText: {
    fontSize: 16,
    flex: 1,
  },
  calendarIcon: {
    fontSize: 20,
    marginLeft: 8,
  },
  dateTimePicker: {
    width: '100%',
  },
});