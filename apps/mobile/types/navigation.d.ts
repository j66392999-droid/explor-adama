import { RelativePathString, ExternalPathString } from 'expo-router';

declare module 'expo-router' {
  export interface RelativePathString {
    __typename: 'RelativePathString';
  }
  
  export interface ExternalPathString {
    __typename: 'ExternalPathString';
  }
}

// Extend the global type declarations
declare global {
  namespace ReactNavigation {
    interface RootParamList {
      index: undefined;
      onboarding: undefined;
      login: undefined;
      register: undefined;
      '(app)/(tabs)': undefined;
      '(auth)': undefined;
      modal: undefined;
      splash: undefined;
      '_sitemap': undefined;
    }
  }
}