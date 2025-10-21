import { useColorScheme } from '@/hooks/use-color-scheme';
import AuthProvider from '@/providers/AuthProvider';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';


export const unstable_settings = {
  initialRouteName: 'index',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{
          headerShown: false, 
          animation: 'slide_from_right',

        }}>
          <Stack.Screen name='(auth)' />
          <Stack.Screen name='(screens)/HomeScreens' options={{ headerShown: false }} />

          <Stack.Screen name='(screens)/OlvidarContrasena' options={{ headerShown: false }} />
          <Stack.Screen name='(screens)/ListaPacientes' options={{ headerShown: false }} />
          <Stack.Screen name='(screens)/PacienteDetail' options={{ headerShown: false, presentation: 'card', }} />
   
         
          
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </AuthProvider>
  );
}
