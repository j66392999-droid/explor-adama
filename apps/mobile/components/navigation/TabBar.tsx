import React, { useRef, useState } from 'react';
import {
  Animated,
  View,
  TouchableOpacity,
  StyleSheet,
  LayoutChangeEvent,
} from 'react-native';
import { Text } from '../ui/Typography/Text';
import { useTheme } from '../../shared/hooks/ui/useTheme';
import { useBottomTabs } from '../../shared/hooks/ui/useBottomTabs';

interface Tab {
  key: string;
  title: string;
  icon?: React.ReactNode;
}

interface TabBarProps {
  tabs?: Tab[];
  activeTab?: string;
  onTabPress?: (tabKey: string) => void;
  style?: any;
  // Accept navigation/tab props passed by expo-router / react-navigation
  state?: any;
  descriptors?: any;
  navigation?: any;
  activeTintColor?: string;
  inactiveTintColor?: string;
}

export const TabBar: React.FC<TabBarProps> = (props) => {
  // Support two shapes of props:
  // - direct `tabs` array (custom usage)
  // - react-navigation shape: { state, descriptors, navigation }
  const { tabs: tabsProp, style } = props;
  const { colors } = useTheme();
  const ctx = useBottomTabs();
  const [height, setHeight] = useState(64);
  const animatedValue = ctx?.animatedValue ?? new Animated.Value(0);
  const translateY = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, height],
  });

  const handleLayout = (e: LayoutChangeEvent) => {
    const h = e.nativeEvent.layout.height || 64;
    setHeight(h);
  };

  // Build tabs list from props.state.routes when tabs aren't provided
  let tabs: Tab[] | undefined = tabsProp;
  const { state, descriptors, navigation } = props as any;

  if (!tabs && state?.routes) {
    // Only include routes that expose a tabBarIcon (skip hidden/navigation-only routes like `profile`)
    const visibleRoutes = state.routes.filter((r: any) => {
      const desc = descriptors?.[r.key] || {};
      const options = desc.options || {};
      return typeof options.tabBarIcon === 'function';
    });

    tabs = visibleRoutes.map((r: any) => {
      const desc = descriptors?.[r.key] || {};
      const options = desc.options || {};
      const title = options.title || options.tabBarLabel || r.name;

      // safe: options.tabBarIcon is a function (we filtered above)
      let icon: React.ReactNode | undefined;
      try {
        const color = state.index === state.routes.indexOf(r)
          ? (props.activeTintColor ?? colors.primary)
          : (props.inactiveTintColor ?? colors.text);
        icon = options.tabBarIcon({ color });
      } catch (e) {
        // ignore icon render errors
      }

      return { key: r.name, title, icon } as Tab;
    });
  }

  // If still no tabs, render nothing to avoid crashing
  if (!tabs || tabs.length === 0) {
    return null;
  }

  const activeTab = props.activeTab ?? (state?.routes?.[state.index]?.name as string);
  const onTabPress = props.onTabPress ?? ((tabKey: string) => navigation?.navigate(tabKey));

  return (
    <Animated.View
      onLayout={handleLayout}
      style={[
        styles.animatedContainer,
        { backgroundColor: colors.background, transform: [{ translateY }] },
        style,
      ]}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;

        // Render icon-only. If icon is a React element (e.g. Ionicons), clone it and override color/size.
        let iconNode: React.ReactNode = null;
        if (tab.icon && React.isValidElement(tab.icon)) {
          const origProps: any = (tab.icon as any).props || {};
          const origSize = typeof origProps.size === 'number' ? origProps.size : 20;
          const size = Math.round(origSize * (isActive ? 1.12 : 1));
          const color = isActive
            ? (props.activeTintColor ?? colors.primary)
            : (props.inactiveTintColor ?? (colors.textTertiary ?? colors.text));

          try {
            iconNode = React.cloneElement(tab.icon as React.ReactElement<any>, ({
              color,
              size,
            } as any));
          } catch (e) {
            iconNode = tab.icon;
          }
        } else if (tab.icon) {
          iconNode = tab.icon;
        }

        return (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tab,
              isActive && [styles.activeTab, { borderTopColor: colors.primary }],
            ]}
            onPress={() => onTabPress(tab.key)}
          >
            {iconNode ? <View style={styles.icon}>{iconNode}</View> : null}
          </TouchableOpacity>
        );
      })}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  animatedContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    // no border to avoid the unwanted white line
    borderTopWidth: 0,
    // ensure it sits above content
    elevation: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: -2 },
  },
  container: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    flexDirection: 'column',
    justifyContent: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
  },
  icon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  activeTabText: {
    fontWeight: '600',
  },
});