import React from 'react';
import {
  View,
  StyleSheet,
} from 'react-native';

interface GridProps {
  children: React.ReactNode;
  columns?: number;
  gap?: number;
  style?: any;
}

export const Grid: React.FC<GridProps> = ({
  children,
  columns = 2,
  gap = 16,
  style,
}) => {
  return (
    <View
      style={[
        styles.container,
        {
          gap: gap,
        },
        style,
      ]}
    >
      {React.Children.map(children, (child, index) => (
        <View
          style={{
            width: `${100 / columns}%`,
          }}
        >
          {child}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});