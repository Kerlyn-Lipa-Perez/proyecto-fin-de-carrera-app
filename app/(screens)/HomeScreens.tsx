import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { router } from 'expo-router';
import {
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Alert,
    ActivityIndicator
} from 'react-native';
import type { AuthError } from '@supabase/supabase-js';
import { supabase } from "@/lib/supabase";

interface Feature {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    description: string;
    color: string;
}

export default function HomeScreens(): React.JSX.Element {
    const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false);

    const features: Feature[] = [
        {
            icon: 'people',
            title: 'Registro de Pacientes',
            description: 'Crea y gestiona perfiles de pacientes de forma segura y eficiente.',
            color: '#4A90E2',
        },
        {
            icon: 'document-text',
            title: 'Historial Clínico',
            description: 'Mantén un registro detallado de las sesiones y la evolución de cada paciente.',
            color: '#5B9FF8',
        },
        {
            icon: 'analytics',
            title: 'Análisis y Datos',
            description: 'Visualiza datos y obtén insights para un mejor seguimiento terapéutico.',
            color: '#6BA8FF',
        },
    ];

    const handleStart = (): void => {
        try {
            router.push('/(screens)/ListaPacientes');
        } catch (error) {
            console.error('Error al navegar:', error);
            Alert.alert('Error', 'No se pudo navegar a la lista de pacientes');
        }
    };

    const handleLogout = async (): Promise<void> => {
        Alert.alert(
            'Cerrar Sesión',
            '¿Estás seguro que deseas cerrar sesión?',
            [
                {
                    text: 'Cancelar',
                    style: 'cancel',
                },
                {
                    text: 'Cerrar Sesión',
                    style: 'destructive',
                    onPress: async (): Promise<void> => {
                        try {
                            setIsLoggingOut(true);
                            const { error }: { error: AuthError | null } = await supabase.auth.signOut();

                            if (error) {
                                throw error;
                            }

                            console.log('Sesión cerrada exitosamente');
                        } catch (error) {
                            console.error('Error al cerrar sesión:', error);
                            const errorMessage: string = error instanceof Error
                                ? error.message
                                : 'No se pudo cerrar la sesión. Por favor intenta de nuevo.';

                            Alert.alert('Error', errorMessage);
                        } finally {
                            setIsLoggingOut(false);
                        }
                    },
                },
            ]
        );
    };

    return (
        <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.container}>
                <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />

                {/* Botón de Logout en la esquina superior derecha */}
                <TouchableOpacity
                    style={styles.logoutButton}
                    onPress={handleLogout}
                    activeOpacity={0.7}
                    disabled={isLoggingOut}
                >
                    {isLoggingOut ? (
                        <ActivityIndicator size="small" color="#EF4444" />
                    ) : (
                        <Ionicons
                            name="log-out-outline"
                            size={24}
                            color="#EF4444"
                        />
                    )}
                </TouchableOpacity>

                <View style={styles.content}>
                    {/* Logo y Header */}
                    <View style={styles.header}>
                        <View style={styles.logoContainer}>
                            <Ionicons name="medical" size={40} color="#FFFFFF" />
                        </View>

                        <Text style={styles.title}>Bienvenido a PsicoApp</Text>

                        <Text style={styles.subtitle}>
                            Tu herramienta profesional para la gestión de pacientes, diseñada para simplificar tu día a día.
                        </Text>
                    </View>

                    {/* Features List */}
                    <View style={styles.featuresContainer}>
                        {features.map((feature: Feature, index: number) => (
                            <View key={index} style={styles.featureCard}>
                                <View style={[styles.iconContainer, { backgroundColor: `${feature.color}15` }]}>
                                    <Ionicons name={feature.icon} size={28} color={feature.color} />
                                </View>

                                <View style={styles.featureContent}>
                                    <Text style={styles.featureTitle}>{feature.title}</Text>
                                    <Text style={styles.featureDescription}>{feature.description}</Text>
                                </View>

                                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                            </View>
                        ))}
                    </View>

                    {/* Button */}
                    <TouchableOpacity
                        style={styles.button}
                        onPress={handleStart}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.buttonText}>
                            Comenzar
                        </Text>
                        <Ionicons name="arrow-forward" size={20} color="#FFFFFF" style={styles.buttonIcon} />
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 40,
        paddingBottom: 20,
    },
    logoutButton: {
        position: 'absolute',
        top: 50,
        right: 24,
        zIndex: 10,
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logoContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#4A90E2',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#1A1A1A',
        marginBottom: 12,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 24,
        paddingHorizontal: 10,
    },
    featuresContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    featureCard: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    featureContent: {
        flex: 1,
        justifyContent: 'center',
    },
    featureTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1A1A1A',
        marginBottom: 6,
    },
    featureDescription: {
        fontSize: 14,
        color: '#6B7280',
        lineHeight: 20,
    },
    button: {
        backgroundColor: '#4A90E2',
        borderRadius: 12,
        paddingVertical: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#4A90E2',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
        marginBottom: 50,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '600',
        marginRight: 8,
    },
    buttonIcon: {
        marginLeft: 4,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
    },
});