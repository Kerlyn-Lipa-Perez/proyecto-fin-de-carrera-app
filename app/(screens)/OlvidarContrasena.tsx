import { useState } from "react";
import { useForm, Controller } from 'react-hook-form';
import { Link, router } from 'expo-router';
import { z } from 'zod';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Alert
} from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from "@/lib/supabase";

// Esquema de validación con Zod
const ForgotPasswordSchema = z.object({
    email: z.string().email("Correo electrónico inválido"),
});

type ForgotPasswordForm = z.infer<typeof ForgotPasswordSchema>;

export default function ForgotPassword() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<ForgotPasswordForm>({
        resolver: zodResolver(ForgotPasswordSchema),
    });

    const onSubmit = async (data: ForgotPasswordForm) => {
        try {
            setLoading(true);
            setError(null);

            // Enviar email de recuperación con Supabase
            const { error: resetError } = await supabase.auth.resetPasswordForEmail(
                data.email,
                {
                    redirectTo: 'your-app://reset-password', // Configura tu deep link
                }
            );

            if (resetError) throw resetError;

            // Mostrar mensaje de éxito
            Alert.alert(
                "Correo enviado",
                "Revisa tu correo electrónico para restablecer tu contraseña.",
                [
                    {
                        text: "OK",
                        onPress: () => router.push("/(auth)/signin"),
                    },
                ]
            );
        } catch (error) {
            setError(error instanceof Error ? error.message : String(error));
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.content}>
                    {/* Botón de retroceso */}
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => router.back()}
                    >
                        <Ionicons name="arrow-back" size={24} color="#1F2937" />
                    </TouchableOpacity>

                    {/* Título y descripción */}
                    <View style={styles.header}>
                        <Text style={styles.title}>Recuperar Contraseña</Text>
                        <Text style={styles.subtitle}>
                            Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
                        </Text>
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

                    {/* Error general */}
                    {error && <Text style={styles.errorText}>{error}</Text>}

                    {/* Botón de enviar */}
                    <TouchableOpacity
                        style={[styles.button, loading && styles.buttonDisabled]}
                        onPress={handleSubmit(onSubmit)}
                        disabled={loading}
                        activeOpacity={0.8}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.buttonText}>Enviar</Text>
                        )}
                    </TouchableOpacity>

                    {/* Enlace para volver al inicio de sesión */}
                    <TouchableOpacity
                        style={styles.backToLogin}
                        onPress={() => router.push("/(auth)/signin")}
                    >
                        <Text style={styles.backToLoginText}>
                            Volver al inicio de sesión
                        </Text>
                    </TouchableOpacity>
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
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'flex-start',
        marginBottom: 20,
    },
    header: {
        marginBottom: 40,
    },
    title: {
        fontSize: 28,
        fontWeight: "700",
        color: "#1F2937",
        marginBottom: 12,
    },
    subtitle: {
        fontSize: 15,
        color: "#6B7280",
        lineHeight: 22,
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
    backToLogin: {
        alignItems: "center",
        marginTop: 24,
        paddingVertical: 8,
    },
    backToLoginText: {
        color: "#2563EB",
        fontSize: 15,
        fontWeight: "500",
    },
});