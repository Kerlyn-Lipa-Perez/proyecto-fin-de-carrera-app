import { useColorScheme } from '@/hooks/use-color-scheme';
import AuthProvider from '@/providers/AuthProvider';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';


export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {


  return (
    <AuthProvider>
      <Stack screenOptions={{
        headerShown: false, 
      }}>
        <Stack.Screen name='signin/index' options={{ headerShown: false }} />
        <Stack.Screen name='signup/index' options={{ headerShown: false }} />

        </Stack>
        <StatusBar style="auto" />

    </AuthProvider>
  );
}
