import { useState } from "react";
import {useForm,Controller} from 'react-hook-form'
import {Link,router} from 'expo-router'
import {z} from 'zod';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaViewBase, ActivityIndicator } from 'react-native'
import { Ionicons } from "@expo/vector-icons";
import {zodResolver} from '@hookform/resolvers/zod'
import { supabase } from "@/lib/supabase";

// Esquema de validación con Zod
const SigninSchema = z.object({
    email: z.string().email("Correo electrónico inválido"),
    password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

type SignInForm = z.infer<typeof SigninSchema>;

export default function Signin() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<SignInForm>({
        resolver: zodResolver(SigninSchema),
    });

    const onSubmit = async (data: SignInForm) => {
        try {
            setLoading(true);
            setError(null);

            // Iniciar sesión en Supabase
            const { error: loginError } = await supabase.auth.signInWithPassword({
                email: data.email,
                password: data.password,
            });

            if (loginError) throw loginError;

            // Redirigir a la pantalla principal
            router.push("/home");
        } catch (error) {
            setError(error instanceof Error ? error.message : String(error));
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaViewBase style={styles.container}>
            <Text style={styles.title}>¡Bienvenido de nuevo!</Text>
            <Text style={styles.subtitle}>
                Inicia sesión para acceder a todas las funciones de la app.
            </Text>

            {/* Campo de correo */}
            <Controller
                control={control}
                name="email"
                render={({ field: { onChange, value } }) => (
                    <View style={styles.inputContainer}>
                        <Ionicons name="mail-outline" size={20} color="#888" />
                        <TextInput
                            style={styles.input}
                            placeholder="Correo electrónico"
                            placeholderTextColor="#aaa"
                            value={value}
                            onChangeText={onChange}
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />
                    </View>
                )}
            />
            {errors.email && (
                <Text style={styles.errorText}>{errors.email.message}</Text>
            )}

            {/* Campo de contraseña */}
            <Controller
                control={control}
                name="password"
                render={({ field: { onChange, value } }) => (
                    <View style={styles.inputContainer}>
                        <Ionicons name="lock-closed-outline" size={20} color="#888" />
                        <TextInput
                            style={styles.input}
                            placeholder="Contraseña"
                            placeholderTextColor="#aaa"
                            secureTextEntry
                            value={value}
                            onChangeText={onChange}
                        />
                    </View>
                )}
            />
            {errors.password && (
                <Text style={styles.errorText}>{errors.password.message}</Text>
            )}

            {error && <Text style={styles.errorText}>{error}</Text>}

            {/* Botón de iniciar sesión */}
            <TouchableOpacity
                style={styles.button}
                onPress={handleSubmit(onSubmit)}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.buttonText}>Iniciar sesión</Text>
                )}
            </TouchableOpacity>

            {/* Enlace para registrarse */}
            <Text style={styles.footerText}>
                ¿No tienes una cuenta?{" "}
                <Link href="/signup" style={styles.link}>
                    Regístrate
                </Link>
            </Text>
        </SafeAreaViewBase>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        justifyContent: "center",
        paddingHorizontal: 25,
    },
    title: {
        fontSize: 22,
        fontWeight: "700",
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 14,
        color: "#666",
        marginBottom: 25,
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#f5f5f5",
        borderRadius: 10,
        paddingHorizontal: 10,
        marginBottom: 15,
    },
    input: {
        flex: 1,
        padding: 12,
        fontSize: 16,
    },
    button: {
        backgroundColor: "#000",
        padding: 15,
        borderRadius: 10,
        alignItems: "center",
        marginTop: 10,
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
    errorText: {
        color: "red",
        fontSize: 13,
        marginBottom: 10,
    },
    footerText: {
        textAlign: "center",
        marginTop: 20,
        color: "#666",
    },
    link: {
        color: "#4f46e5",
        fontWeight: "500",
    },
});
