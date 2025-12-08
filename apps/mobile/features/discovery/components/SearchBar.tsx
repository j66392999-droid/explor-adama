import React, { useState, useCallback } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { Text } from '../../../components/ui/Typography/Text';
import { useTheme } from '../../../shared/hooks/ui/useTheme';
import { AutoCompleteResult } from '../types/discovery.types';

interface SearchBarProps {
  onSearch: (query: string) => void;
  onAutoCompleteSelect?: (result: AutoCompleteResult) => void;
  placeholder?: string;
  autoFocus?: boolean;
  showAutoComplete?: boolean;
  style?: any;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  onAutoCompleteSelect,
  placeholder = 'Search places, events...',
  autoFocus = false,
  showAutoComplete = true,
  style,
}) => {
  const { colors, spacing } = useTheme();
  const [query, setQuery] = useState('');
  const [autoCompleteResults, setAutoCompleteResults] = useState<AutoCompleteResult[]>([]);
  const [isAutoCompleting, setIsAutoCompleting] = useState(false);

  const handleSearch = useCallback(() => {
    if (query.trim()) {
      onSearch(query.trim());
      setAutoCompleteResults([]);
    }
  }, [query, onSearch]);

  const handleAutoComplete = useCallback(async (text: string) => {
    setQuery(text);
    
    if (text.length < 2 || !showAutoComplete) {
      setAutoCompleteResults([]);
      return;
    }
    
    setIsAutoCompleting(true);
    // Simulate API call - replace with actual autoComplete hook
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // FIXED: Use the correct type values (uppercase)
    const mockResults = [
      { id: '1', name: 'Restaurants', type: 'CATEGORY', data: null },
      { id: '2', name: 'Coffee Shops', type: 'CATEGORY', data: null },
      { id: '3', name: 'Adama Museum', type: 'PLACE', data: null },
      { id: '4', name: 'Music Festival', type: 'EVENT', data: null },
      { id: '5', name: 'Tourism', type: 'TAG', data: null },
    ].filter(item => item.name.toLowerCase().includes(text.toLowerCase())) as AutoCompleteResult[];
    
    setAutoCompleteResults(mockResults);
    setIsAutoCompleting(false);
  }, [showAutoComplete]);

  const handleResultSelect = useCallback((result: AutoCompleteResult) => {
    setQuery(result.name);
    setAutoCompleteResults([]);
    onAutoCompleteSelect?.(result);
  }, [onAutoCompleteSelect]);

  const renderAutoCompleteItem = useCallback(({ item }: { item: AutoCompleteResult }) => (
    <TouchableOpacity
      style={[
        styles.autoCompleteItem,
        { backgroundColor: colors.surface },
      ]}
      onPress={() => handleResultSelect(item)}
    >
      <View style={styles.resultIcon}>
        <Text>
          {item.type === 'PLACE' ? '🏛️' : 
           item.type === 'EVENT' ? '🎪' : 
           item.type === 'CATEGORY' ? '🏷️' : '🔖'}
        </Text>
      </View>
      <Text style={styles.resultText}>{item.name}</Text>
      <Text style={styles.resultType}>
        {item.type.toLowerCase()}
      </Text>
    </TouchableOpacity>
  ), [colors, handleResultSelect]);

  return (
    <View style={[styles.container, style]}>
      <View style={[
        styles.searchContainer,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}>
        <TextInput
          style={[
            styles.input,
            { color: colors.text },
          ]}
          placeholder={placeholder}
          placeholderTextColor={colors.textSecondary}
          value={query}
          onChangeText={handleAutoComplete}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
          autoFocus={autoFocus}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TouchableOpacity
          style={styles.searchButton}
          onPress={handleSearch}
          disabled={!query.trim()}
        >
          <Text style={[
            styles.searchButtonText,
            { color: query.trim() ? colors.primary : colors.textSecondary },
          ]}>
            Search
          </Text>
        </TouchableOpacity>
      </View>

      {autoCompleteResults.length > 0 && (
        <View style={[
          styles.autoCompleteContainer,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}>
          <FlatList
            data={autoCompleteResults}
            renderItem={renderAutoCompleteItem}
            keyExtractor={item => item.id}
            keyboardShouldPersistTaps="handled"
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 16,
  },
  searchButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchButtonText: {
    fontWeight: '600',
    fontSize: 16,
  },
  autoCompleteContainer: {
    position: 'absolute',
    top: 52,
    left: 0,
    right: 0,
    borderWidth: 1,
    borderRadius: 8,
    maxHeight: 200,
    zIndex: 1000,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  autoCompleteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  resultIcon: {
    marginRight: 12,
  },
  resultText: {
    flex: 1,
    fontSize: 16,
  },
  resultType: {
    fontSize: 12,
    opacity: 0.6,
    textTransform: 'capitalize',
  },
});