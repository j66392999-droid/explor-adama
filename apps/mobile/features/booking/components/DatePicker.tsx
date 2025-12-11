import React, { useState, useRef } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../../components/ui/Typography/Text';
import { useTheme } from '../../../shared/hooks/ui/useTheme';
import { formatDate, getDayOfWeek } from '../../../shared/utils/formatters';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');
const DAY_WIDTH = (width - 40) / 7;

interface DatePickerProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
  minDate?: string;
  maxDate?: string;
  disabledDates?: string[];
  style?: any;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  selectedDate,
  onDateChange,
  minDate = new Date().toISOString().split('T')[0],
  maxDate,
  disabledDates = [],
  style,
}) => {
  const { colors } = useTheme();
  const scrollViewRef = useRef<ScrollView>(null);
  
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Generate dates for the next 3 months
  const generateDates = () => {
    const dates: Array<{
      date: Date;
      dateString: string;
      isSelected: boolean;
      isDisabled: boolean;
      isToday: boolean;
    }> = [];

    const today = new Date();
    const startDate = new Date(today);
    const endDate = new Date(today);
    endDate.setMonth(today.getMonth() + 3);

    const minDateObj = new Date(minDate);
    const maxDateObj = maxDate ? new Date(maxDate) : null;

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateString = d.toISOString().split('T')[0];
      
      let isDisabled = false;
      
      if (d < minDateObj) {
        isDisabled = true;
      }
      
      if (maxDateObj && d > maxDateObj) {
        isDisabled = true;
      }
      
      if (disabledDates.includes(dateString)) {
        isDisabled = true;
      }

      dates.push({
        date: new Date(d),
        dateString,
        isSelected: dateString === selectedDate,
        isDisabled,
        isToday: dateString === today.toISOString().split('T')[0],
      });
    }

    return dates;
  };

  const dates = generateDates();

  const handleDateSelect = (dateString: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onDateChange(dateString);
  };

  const scrollToSelectedDate = () => {
    const selectedIndex = dates.findIndex(d => d.dateString === selectedDate);
    if (selectedIndex > -1 && scrollViewRef.current) {
      const offset = selectedIndex * DAY_WIDTH;
      scrollViewRef.current.scrollTo({ x: offset, animated: true });
    }
  };

  React.useEffect(() => {
    setTimeout(scrollToSelectedDate, 100);
  }, [selectedDate]);

  const renderDate = (dateInfo: typeof dates[0]) => {
    const day = dateInfo.date.getDate();
    const month = dateInfo.date.getMonth() + 1;
    const dayOfWeek = getDayOfWeek(dateInfo.dateString).substring(0, 3);

    return (
      <TouchableOpacity
        key={dateInfo.dateString}
        style={[
          styles.dateContainer,
          dateInfo.isSelected && [styles.selectedDate, { backgroundColor: colors.primary }],
          dateInfo.isToday && !dateInfo.isSelected && styles.todayDate,
          dateInfo.isDisabled && styles.disabledDate,
        ]}
        onPress={() => !dateInfo.isDisabled && handleDateSelect(dateInfo.dateString)}
        disabled={dateInfo.isDisabled}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.dayOfWeek,
            dateInfo.isSelected && styles.selectedText,
            dateInfo.isDisabled && styles.disabledText,
          ]}
        >
          {dayOfWeek}
        </Text>
        
        <View
          style={[
            styles.dateCircle,
            dateInfo.isSelected && { backgroundColor: colors.onPrimary },
          ]}
        >
          <Text
            style={[
              styles.dateNumber,
              dateInfo.isSelected && styles.selectedText,
              dateInfo.isDisabled && styles.disabledText,
            ]}
          >
            {day}
          </Text>
        </View>
        
        <Text
          style={[
            styles.month,
            dateInfo.isSelected && styles.selectedText,
            dateInfo.isDisabled && styles.disabledText,
          ]}
        >
          {month}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <Text style={styles.monthTitle}>
          {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </Text>
        <TouchableOpacity onPress={scrollToSelectedDate}>
          <Ionicons name="today" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {dates.map(renderDate)}
      </ScrollView>

      <View style={styles.selectedInfo}>
        <Text style={styles.selectedLabel}>Selected Date:</Text>
        <Text style={[styles.selectedDateText, { color: colors.primary }]}>
          {formatDate(selectedDate, 'long')}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  scrollContent: {
    paddingRight: 20,
  },
  dateContainer: {
    width: DAY_WIDTH,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  selectedDate: {
    borderRadius: 12,
  },
  todayDate: {
    backgroundColor: 'rgba(0,122,255,0.1)',
  },
  disabledDate: {
    opacity: 0.4,
  },
  dayOfWeek: {
    fontSize: 12,
    marginBottom: 4,
    opacity: 0.7,
  },
  dateCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  dateNumber: {
    fontSize: 18,
    fontWeight: '600',
  },
  month: {
    fontSize: 12,
    opacity: 0.7,
  },
  selectedText: {
    color: 'white',
  },
  disabledText: {
    opacity: 0.4,
  },
  selectedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
    gap: 8,
  },
  selectedLabel: {
    fontSize: 14,
    opacity: 0.6,
  },
  selectedDateText: {
    fontSize: 16,
    fontWeight: '600',
  },
});