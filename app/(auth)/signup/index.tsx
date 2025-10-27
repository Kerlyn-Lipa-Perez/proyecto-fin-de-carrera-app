import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, router } from 'expo-router';
import { useState } from "react";
import { Controller, useForm } from 'react-hook-form';
import { ActivityIndicator, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View, KeyboardAvoidingView, ScrollView } from 'react-native';
import { z } from 'zod';

const SignupSchema = z.object({
    name: z.string().min(4,"El nombre debe tener al menos 4 caracteres"),
    email: z.string().email("Correo electrónico inválido"),
    password: z.string().min(6,"La contraseña debe tener al menos 6 caracteres")

})

type SignUpForm = z.infer<typeof SignupSchema>;

export default function Signup(){

    const [loading,setLoading] = useState(false);
    const [error,setError] = useState<string | null>(null);

    const {control,handleSubmit,formState:{errors}} = useForm<SignUpForm>({
        resolver: zodResolver(SignupSchema)
    });

    const onSubmit = async (data:SignUpForm) => {
        try{

            setLoading(true);
            setError(null);

            //Logica de registro
            const {error:singupError} = await supabase.auth.signUp({
                email: data.email,
                password: data.password,
                options:{
                    data:{
                        name: data.name
                    }
                }
              
            });
            if (singupError){
                throw singupError;

            }

            const {error : loginError} = await supabase.auth.signInWithPassword({
                email: data.email,
                password: data.password
            })

            if (loginError){
                throw loginError;
            }


        }catch(error){

            setError(error instanceof Error ? error.message : String(error) );

        } finally{
            setLoading(false);
        }
    }



    


  return (
    <KeyboardAvoidingView
     
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          {/* Título */}
          <Text style={styles.title}>Crear Cuenta</Text>

          {/* Campo de Nombre */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Nombre</Text>
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, value } }) => (
                <View style={[
                  styles.inputContainer,
                  errors.name && styles.inputError
                ]}>
                  <Ionicons
                    name="person-outline"
                    size={20}
                    color="#9CA3AF"
                    style={styles.icon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Tu nombre completo"
                    placeholderTextColor="#9CA3AF"
                    value={value}
                    onChangeText={onChange}
                    autoCapitalize="words"
                  />
                </View>
              )}
            />
            {errors.name && (
              <Text style={styles.errorText}>{errors.name.message}</Text>
            )}
          </View>

          {/* Campo de Email */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Email</Text>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, value } }) => (
                <View style={[
                  styles.inputContainer,
                  errors.email && styles.inputError
                ]}>
                  <Ionicons
                    name="mail-outline"
                    size={20}
                    color="#9CA3AF"
                    style={styles.icon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="tu@email.com"
                    placeholderTextColor="#9CA3AF"
                    value={value}
                    onChangeText={onChange}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    autoComplete="email"
                  />
                </View>
              )}
            />
            {errors.email && (
              <Text style={styles.errorText}>{errors.email.message}</Text>
            )}
          </View>

          {/* Campo de Contraseña */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Contraseña</Text>
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, value } }) => (
                <View style={[
                  styles.inputContainer,
                  errors.password && styles.inputError
                ]}>
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color="#9CA3AF"
                    style={styles.icon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="••••••••"
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry
                    value={value}
                    onChangeText={onChange}
                    autoComplete="password"
                  />
                </View>
              )}
            />
            {errors.password && (
              <Text style={styles.errorText}>{errors.password.message}</Text>
            )}
          </View>

          {/* Error general */}
          {error && <Text style={styles.errorText}>{error}</Text>}

          {/* Botón de registro */}
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSubmit(onSubmit)}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#040404ff" />
            ) : (
              <Text style={styles.buttonText}>Registrarse</Text>
            )}
          </TouchableOpacity>

          {/* Enlace para iniciar sesión */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              ¿Ya tienes una cuenta?{" "}
            </Text>
            <Link href="/(auth)/signin" asChild>
              <TouchableOpacity>
                <Text style={styles.link}>Iniciar sesión</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: 24,
    paddingVertical: 40,
    maxWidth: 420,
    width: '100%',
    alignSelf: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1F2937",
    textAlign: "center",
    marginBottom: 40,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 14,
    height: 52,
  },
  inputError: {
    borderColor: "#EF4444",
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#1F2937",
    height: '100%',
  },
  errorText: {
    color: "#EF4444",
    fontSize: 13,
    marginTop: 6,
    marginLeft: 4,
  },
  button: {
    backgroundColor: "#2563EB",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
    shadowColor: "#2563EB",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
  },
  footerText: {
    fontSize: 14,
    color: "#6B7280",
  },
  link: {
    color: "#2563EB",
    fontSize: 14,
    fontWeight: "600",
  },
});