import React from 'react';
import {
  View,
  StyleSheet,
} from 'react-native';

interface FlexProps {
  children: React.ReactNode;
  direction?: 'row' | 'column';
  justify?: 'start' | 'end' | 'center' | 'between' | 'around';
  align?: 'start' | 'end' | 'center' | 'stretch';
  wrap?: 'wrap' | 'nowrap';
  gap?: number;
  style?: any;
}

export const Flex: React.FC<FlexProps> = ({
  children,
  direction = 'column',
  justify = 'start',
  align = 'start',
  wrap = 'nowrap',
  gap = 0,
  style,
}) => {
  const getJustifyContent = () => {
    switch (justify) {
      case 'start': return 'flex-start';
      case 'end': return 'flex-end';
      case 'center': return 'center';
      case 'between': return 'space-between';
      case 'around': return 'space-around';
      default: return 'flex-start';
    }
  };

  const getAlignItems = () => {
    switch (align) {
      case 'start': return 'flex-start';
      case 'end': return 'flex-end';
      case 'center': return 'center';
      case 'stretch': return 'stretch';
      default: return 'flex-start';
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          flexDirection: direction,
          justifyContent: getJustifyContent(),
          alignItems: getAlignItems(),
          flexWrap: wrap,
          gap: gap,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    display: 'flex',
  },
});