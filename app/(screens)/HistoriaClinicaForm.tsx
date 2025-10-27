import { useState } from "react";
import { useForm, Controller } from 'react-hook-form';
import { router, useLocalSearchParams } from 'expo-router';
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
    Alert,
    Switch
} from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from "@/lib/supabase";
import { _createHistoria } from "@/app/services/historia_clinica";


const HistoriaClinicaSchema = z.object({
    diagnostico: z.string()
        .min(5, "El diagnóstico debe tener al menos 10 caracteres")
        .max(500, "El diagnóstico es demasiado largo"),
    tratamiento: z.string()
        .max(1000, "El tratamiento es demasiado largo")
        .optional()
        .or(z.literal("")),
    observaciones: z.string()
        .max(1000, "Las observaciones son demasiado largas")
        .optional()
        .or(z.literal("")),
    estado: z.boolean(),
});

type HistoriaClinicaForm = z.infer<typeof HistoriaClinicaSchema>;

export default function HistoriaClinicaFormScreen() {
    const params = useLocalSearchParams<{ pacienteId: string }>();
    const pacienteId = params.pacienteId;

    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const {
        control,
        handleSubmit,
        formState: { errors },
        watch,
    } = useForm<HistoriaClinicaForm>({
        resolver: zodResolver(HistoriaClinicaSchema),
        defaultValues: {
            diagnostico: "",
            tratamiento: "",
            observaciones: "",
            estado: true,
        }
    });

    const estadoValue = watch("estado");

    const onSubmit = async (data: HistoriaClinicaForm): Promise<void> => {
        if (!pacienteId || pacienteId === 'undefined' || pacienteId === 'null') {
            Alert.alert('Error', 'ID de paciente no válido');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            // Obtener el ID del usuario actual (psicólogo)
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                throw new Error("Usuario no autenticado");
            }

            // Preparar datos de la historia clínica
            const historiaData = {
                id_paciente: pacienteId,
                id_usuario: user.id,
                diagnostico: data.diagnostico.trim(),
                tratamiento: data.tratamiento?.trim() || null,
                observaciones: data.observaciones?.trim() || null,
                fecha_registro: new Date().toISOString().split('T')[0], // YYYY-MM-DD
                estado: data.estado,
            };

            console.log('📝 Creando historia clínica:', historiaData);

            // Usar la función del servicio
            const nuevaHistoria = await _createHistoria(historiaData);

            console.log('✅ Historia clínica creada:', nuevaHistoria);

            // Mostrar mensaje de éxito
            Alert.alert(
                "¡Éxito!",
                "Historia clínica registrada correctamente",
                [
                    {
                        text: "OK",
                        onPress: () => router.back(),
                    },
                ]
            );
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error al crear historia clínica';
            setError(errorMessage);
            console.error('❌ Error al crear historia clínica:', error);

            Alert.alert(
                'Error',
                'No se pudo registrar la historia clínica. Por favor intenta de nuevo.',
                [{ text: 'OK' }]
            );
        } finally {
            setLoading(false);
        }
    };

    if (!pacienteId) {
        return (
            <View style={styles.errorContainer}>
                <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
                <Text style={styles.errorMessage}>ID de paciente no válido</Text>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Text style={styles.backButtonText}>Volver</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.content}>
                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity
                            style={styles.headerBackButton}
                            onPress={() => router.back()}
                        >
                            <Ionicons name="arrow-back" size={24} color="#1F2937" />
                        </TouchableOpacity>
                        <Text style={styles.title}>Nueva Historia Clínica</Text>
                        <View style={styles.placeholder} />
                    </View>

                    {/* Información */}
                    <View style={styles.infoBox}>
                        <Ionicons name="information-circle" size={20} color="#2563EB" />
                        <Text style={styles.infoText}>
                            Completa los datos de la historia clínica del paciente
                        </Text>
                    </View>

                    {/* Campo Diagnóstico */}
                    <View style={styles.fieldContainer}>
                        <Text style={styles.label}>Diagnóstico *</Text>
                        <Controller
                            control={control}
                            name="diagnostico"
                            render={({ field: { onChange, value } }) => (
                                <View style={[
                                    styles.textAreaContainer,
                                    errors.diagnostico && styles.inputError
                                ]}>
                                    <TextInput
                                        style={styles.textArea}
                                        placeholder="Describe el diagnóstico clínico..."
                                        placeholderTextColor="#9CA3AF"
                                        value={value}
                                        onChangeText={onChange}
                                        multiline
                                        numberOfLines={4}
                                        textAlignVertical="top"
                                    />
                                </View>
                            )}
                        />
                        {errors.diagnostico && (
                            <Text style={styles.errorText}>{errors.diagnostico.message}</Text>
                        )}
                        <Text style={styles.helperText}>
                            Mínimo 5 caracteres
                        </Text>
                    </View>

                    {/* Campo Tratamiento */}
                    <View style={styles.fieldContainer}>
                        <Text style={styles.label}>Tratamiento (opcional)</Text>
                        <Controller
                            control={control}
                            name="tratamiento"
                            render={({ field: { onChange, value } }) => (
                                <View style={[
                                    styles.textAreaContainer,
                                    errors.tratamiento && styles.inputError
                                ]}>
                                    <TextInput
                                        style={styles.textArea}
                                        placeholder="Plan de tratamiento y recomendaciones..."
                                        placeholderTextColor="#9CA3AF"
                                        value={value || ""}
                                        onChangeText={onChange}
                                        multiline
                                        numberOfLines={4}
                                        textAlignVertical="top"
                                    />
                                </View>
                            )}
                        />
                        {errors.tratamiento && (
                            <Text style={styles.errorText}>{errors.tratamiento.message}</Text>
                        )}
                    </View>

                    {/* Campo Observaciones */}
                    <View style={styles.fieldContainer}>
                        <Text style={styles.label}>Observaciones (opcional)</Text>
                        <Controller
                            control={control}
                            name="observaciones"
                            render={({ field: { onChange, value } }) => (
                                <View style={[
                                    styles.textAreaContainer,
                                    errors.observaciones && styles.inputError
                                ]}>
                                    <TextInput
                                        style={styles.textArea}
                                        placeholder="Notas adicionales u observaciones importantes..."
                                        placeholderTextColor="#9CA3AF"
                                        value={value || ""}
                                        onChangeText={onChange}
                                        multiline
                                        numberOfLines={3}
                                        textAlignVertical="top"
                                    />
                                </View>
                            )}
                        />
                        {errors.observaciones && (
                            <Text style={styles.errorText}>{errors.observaciones.message}</Text>
                        )}
                    </View>

                    {/* Campo Estado */}
                    <View style={styles.fieldContainer}>
                        <View style={styles.switchContainer}>
                            <View style={styles.switchLabelContainer}>
                                <Ionicons
                                    name={estadoValue ? "checkmark-circle" : "close-circle"}
                                    size={24}
                                    color={estadoValue ? "#10B981" : "#6B7280"}
                                />
                                <View>
                                    <Text style={styles.switchLabel}>Estado de la Historia</Text>
                                    <Text style={styles.switchSubtext}>
                                        {estadoValue ? "Historia activa" : "Historia cerrada"}
                                    </Text>
                                </View>
                            </View>
                            <Controller
                                control={control}
                                name="estado"
                                render={({ field: { onChange, value } }) => (
                                    <Switch
                                        value={value}
                                        onValueChange={onChange}
                                        trackColor={{ false: "#D1D5DB", true: "#93C5FD" }}
                                        thumbColor={value ? "#2563EB" : "#F3F4F6"}
                                        ios_backgroundColor="#D1D5DB"
                                    />
                                )}
                            />
                        </View>
                        <Text style={styles.helperText}>
                            Las historias activas pueden ser editadas posteriormente
                        </Text>
                    </View>

                    {/* Error general */}
                    {error && (
                        <View style={styles.errorBanner}>
                            <Text style={styles.errorText}>{error}</Text>
                        </View>
                    )}

                    {/* Botones de acción */}
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={() => router.back()}
                            disabled={loading}
                        >
                            <Text style={styles.cancelButtonText}>Cancelar</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.submitButton, loading && styles.buttonDisabled]}
                            onPress={handleSubmit(onSubmit)}
                            disabled={loading}
                            activeOpacity={0.8}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <>
                                    <Ionicons name="save" size={20} color="#FFFFFF" style={styles.buttonIcon} />
                                    <Text style={styles.submitButtonText}>Guardar Historia</Text>
                                </>
                            )}
                        </TouchableOpacity>
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
    },
    content: {
        paddingHorizontal: 24,
        paddingVertical: 20,
        paddingBottom: 40,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 24,
        marginTop: 40,
    },
    headerBackButton: {
        width: 40,
        height: 40,
        justifyContent: "center",
        alignItems: "flex-start",
    },
    title: {
        fontSize: 24,
        fontWeight: "700",
        color: "#1F2937",
        flex: 1,
        textAlign: "center",
    },
    placeholder: {
        width: 40,
    },
    infoBox: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#EFF6FF",
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
        gap: 12,
    },
    infoText: {
        flex: 1,
        fontSize: 14,
        color: "#1E40AF",
        lineHeight: 20,
    },
    fieldContainer: {
        marginBottom: 24,
    },
    label: {
        fontSize: 15,
        fontWeight: "600",
        color: "#1F2937",
        marginBottom: 8,
    },
    textAreaContainer: {
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        padding: 14,
    },
    textArea: {
        fontSize: 16,
        color: "#1F2937",
        minHeight: 80,
    },
    inputError: {
        borderColor: "#EF4444",
    },
    helperText: {
        fontSize: 12,
        color: "#6B7280",
        marginTop: 6,
        marginLeft: 4,
    },
    switchContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        padding: 16,
    },
    switchLabelContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        flex: 1,
    },
    switchLabel: {
        fontSize: 16,
        fontWeight: "600",
        color: "#1F2937",
    },
    switchSubtext: {
        fontSize: 13,
        color: "#6B7280",
        marginTop: 2,
    },
    errorContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F3F4F6",
        padding: 24,
    },
    errorBanner: {
        backgroundColor: "#FEE2E2",
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
    },
    errorText: {
        color: "#EF4444",
        fontSize: 14,
        textAlign: "center",
    },
    errorMessage: {
        fontSize: 16,
        color: "#EF4444",
        marginTop: 16,
        marginBottom: 24,
        textAlign: "center",
    },
    backButton: {
        backgroundColor: "#2563EB",
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
    },
    backButtonText: {
        color: "#FFFFFF",
        fontSize: 15,
        fontWeight: "600",
    },
    buttonContainer: {
        flexDirection: "row",
        gap: 12,
        marginTop: 8,
    },
    cancelButton: {
        flex: 1,
        backgroundColor: "#FFFFFF",
        borderWidth: 2,
        borderColor: "#E5E7EB",
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
    },
    cancelButtonText: {
        color: "#6B7280",
        fontSize: 16,
        fontWeight: "600",
    },
    submitButton: {
        flex: 1,
        backgroundColor: "#2563EB",
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
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
    buttonIcon: {
        marginRight: 8,
    },
    submitButtonText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "600",
    },
});