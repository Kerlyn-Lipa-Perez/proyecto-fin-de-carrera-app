import { useState, useEffect } from "react";
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
    Alert
} from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from '@hookform/resolvers/zod';
import { _createPaciente, _updatePaciente, _getPaciente } from "@/app/services/paciente";
import { Paciente } from "@/app/interfaces/Paciente";
import { supabase } from "@/lib/supabase";

// Función para validar fecha en formato DD/MM/YYYY
const validarFechaFormato = (fecha: string): boolean => {
    const regex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
    if (!regex.test(fecha)) return false;

    const [dia, mes, anio] = fecha.split('/').map(Number);
    const date = new Date(anio, mes - 1, dia);

    return date.getFullYear() === anio &&
        date.getMonth() === mes - 1 &&
        date.getDate() === dia &&
        date <= new Date();
};

// Esquema de validación con Zod
const PacienteSchema = z.object({
    dni: z.string()
        .min(8, "El DNI debe tener 8 caracteres")
        .max(8, "El DNI debe tener 8 caracteres"),
    nombre: z.string()
        .min(2, "El nombre debe tener al menos 2 caracteres")
        .max(50, "El nombre es demasiado largo"),
    apellido: z.string()
        .min(2, "El apellido debe tener al menos 2 caracteres")
        .max(50, "El apellido es demasiado largo"),
    fecha_nacimiento: z.string()
        .refine(validarFechaFormato, {
            message: "Formato de fecha inválido (DD/MM/YYYY)"
        }),
    sexo: z.enum(["M", "F", "Otro"], {
        errorMap: () => ({ message: "Selecciona un sexo válido" })
    }),
    telefono: z.string()
        .min(9, "El teléfono debe tener 9 dígitos")
        .max(9, "El teléfono debe tener 9 dígitos"),
    correo: z.string()
        .email("Correo electrónico inválido")
        .optional()
        .or(z.literal("")),
});

type PacienteForm = z.infer<typeof PacienteSchema>;

export default function PacienteFormScreen() {
    const params = useLocalSearchParams<{ id?: string }>();
    const pacienteId = params.id;
    const isEditMode = !!pacienteId;

    const [loading, setLoading] = useState<boolean>(false);
    const [loadingData, setLoadingData] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedSexo, setSelectedSexo] = useState<"M" | "F" | "Otro" | null>(null);

    const {
        control,
        handleSubmit,
        formState: { errors },
        setValue,
        reset,
    } = useForm<PacienteForm>({
        resolver: zodResolver(PacienteSchema),
        defaultValues: {
            dni: "",
            nombre: "",
            apellido: "",
            fecha_nacimiento: "",
            sexo: "M",
            telefono: "",
            correo: "",
        }
    });

    // Cargar datos del paciente si está en modo edición
    useEffect(() => {
        if (isEditMode && pacienteId) {
            loadPacienteData();
        }
    }, [pacienteId, isEditMode]);

    const loadPacienteData = async () => {
        try {
            setLoadingData(true);
            console.log('📥 Cargando datos del paciente:', pacienteId);

            const paciente = await _getPaciente(pacienteId!);

            if (paciente) {
                // Convertir fecha de YYYY-MM-DD a DD/MM/YYYY
                const fechaISO = paciente.fecha_nacimiento;
                const [anio, mes, dia] = fechaISO.split('-');
                const fechaFormateada = `${dia}/${mes}/${anio}`;

                // Establecer valores en el formulario
                setValue('dni', paciente.dni);
                setValue('nombre', paciente.nombre);
                setValue('apellido', paciente.apellido);
                setValue('fecha_nacimiento', fechaFormateada);
                setValue('sexo', paciente.sexo as "M" | "F" | "Otro");
                setValue('telefono', paciente.telefono);
                setValue('correo', paciente.correo || '');

                setSelectedSexo(paciente.sexo as "M" | "F" | "Otro");

                console.log('✅ Datos cargados correctamente');
            }
        } catch (error) {
            console.error('❌ Error al cargar paciente:', error);
            Alert.alert(
                'Error',
                'No se pudo cargar la información del paciente',
                [{ text: 'OK', onPress: () => router.back() }]
            );
        } finally {
            setLoadingData(false);
        }
    };

    // Convertir de DD/MM/YYYY a YYYY-MM-DD (formato ISO para Supabase)
    const convertirFechaAISO = (fecha: string): string => {
        const [dia, mes, anio] = fecha.split('/');
        return `${anio}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
    };

    const onSubmit = async (data: PacienteForm): Promise<void> => {
        try {
            setLoading(true);
            setError(null);

            // Obtener el ID del usuario actual
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                throw new Error("Usuario no autenticado");
            }

            // Convertir fecha a formato ISO antes de enviar
            const fechaISO = convertirFechaAISO(data.fecha_nacimiento);

            if (isEditMode && pacienteId) {
                // Modo edición
                const pacienteData: Paciente = {
                    id_paciente: pacienteId,
                    dni: data.dni.trim(),
                    nombre: data.nombre.trim(),
                    apellido: data.apellido.trim(),
                    fecha_nacimiento: fechaISO,
                    sexo: data.sexo,
                    telefono: data.telefono.trim(),
                    correo: data.correo?.trim(),
                    id_usuario: user.id,
                };

                console.log('📝 Actualizando paciente:', pacienteData);
                await _updatePaciente(pacienteData);

                Alert.alert(
                    "¡Éxito!",
                    "Paciente actualizado correctamente",
                    [
                        {
                            text: "OK",
                            onPress: () => router.back(),
                        },
                    ]
                );
            } else {
                // Modo creación
                const pacienteData: Omit<Paciente, 'id_paciente'> = {
                    dni: data.dni.trim(),
                    nombre: data.nombre.trim(),
                    apellido: data.apellido.trim(),
                    fecha_nacimiento: fechaISO,
                    sexo: data.sexo,
                    telefono: data.telefono.trim(),
                    correo: data.correo?.trim(),
                    id_usuario: user.id,
                };

                console.log('📝 Creando paciente:', pacienteData);
                await _createPaciente(pacienteData as Paciente);

                Alert.alert(
                    "¡Éxito!",
                    "Paciente registrado correctamente",
                    [
                        {
                            text: "OK",
                            onPress: () => router.back(),
                        },
                    ]
                );
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error al guardar paciente';
            setError(errorMessage);
            console.error('❌ Error al guardar paciente:', error);

            Alert.alert(
                'Error',
                `No se pudo ${isEditMode ? 'actualizar' : 'registrar'} el paciente. Por favor intenta de nuevo.`,
                [{ text: 'OK' }]
            );
        } finally {
            setLoading(false);
        }
    };

    const handleSexoSelect = (sexo: "M" | "F" | "Otro"): void => {
        setSelectedSexo(sexo);
        setValue("sexo", sexo);
    };

    // Formatear entrada de fecha automáticamente a DD/MM/YYYY
    const formatDateInput = (text: string): string => {
        const cleaned = text.replace(/\D/g, '');
        const limited = cleaned.slice(0, 8);

        let formatted = limited;

        if (limited.length >= 2) {
            formatted = limited.slice(0, 2);
            if (limited.length >= 4) {
                formatted += '/' + limited.slice(2, 4);
                if (limited.length >= 5) {
                    formatted += '/' + limited.slice(4, 8);
                }
            } else if (limited.length > 2) {
                formatted += '/' + limited.slice(2);
            }
        }

        return formatted;
    };

    if (loadingData) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2563EB" />
                <Text style={styles.loadingText}>Cargando datos del paciente...</Text>
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
                            style={styles.backButton}
                            onPress={() => router.back()}
                        >
                            <Ionicons name="arrow-back" size={24} color="#1F2937" />
                        </TouchableOpacity>
                        <Text style={styles.title}>
                            {isEditMode ? 'Editar Paciente' : 'Nuevo Paciente'}
                        </Text>
                        <View style={styles.placeholder} />
                    </View>

                    {/* Info Badge */}
                    {isEditMode && (
                        <View style={styles.infoBox}>
                            <Ionicons name="information-circle" size={20} color="#2563EB" />
                            <Text style={styles.infoText}>
                                Estás editando los datos del paciente
                            </Text>
                        </View>
                    )}

                    {/* Campo DNI */}
                    <View style={styles.fieldContainer}>
                        <Text style={styles.label}>DNI *</Text>
                        <Controller
                            control={control}
                            name="dni"
                            render={({ field: { onChange, value } }) => (
                                <View style={[
                                    styles.inputContainer,
                                    errors.dni && styles.inputError
                                ]}>
                                    <Ionicons
                                        name="card-outline"
                                        size={20}
                                        color="#9CA3AF"
                                        style={styles.icon}
                                    />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="12345678"
                                        placeholderTextColor="#9CA3AF"
                                        value={value}
                                        onChangeText={onChange}
                                        keyboardType="numeric"
                                        maxLength={8}
                                    />
                                </View>
                            )}
                        />
                        {errors.dni && (
                            <Text style={styles.errorText}>{errors.dni.message}</Text>
                        )}
                    </View>

                    {/* Campo Nombre */}
                    <View style={styles.fieldContainer}>
                        <Text style={styles.label}>Nombre *</Text>
                        <Controller
                            control={control}
                            name="nombre"
                            render={({ field: { onChange, value } }) => (
                                <View style={[
                                    styles.inputContainer,
                                    errors.nombre && styles.inputError
                                ]}>
                                    <Ionicons
                                        name="person-outline"
                                        size={20}
                                        color="#9CA3AF"
                                        style={styles.icon}
                                    />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Juan"
                                        placeholderTextColor="#9CA3AF"
                                        value={value}
                                        onChangeText={onChange}
                                        autoCapitalize="words"
                                    />
                                </View>
                            )}
                        />
                        {errors.nombre && (
                            <Text style={styles.errorText}>{errors.nombre.message}</Text>
                        )}
                    </View>

                    {/* Campo Apellido */}
                    <View style={styles.fieldContainer}>
                        <Text style={styles.label}>Apellido *</Text>
                        <Controller
                            control={control}
                            name="apellido"
                            render={({ field: { onChange, value } }) => (
                                <View style={[
                                    styles.inputContainer,
                                    errors.apellido && styles.inputError
                                ]}>
                                    <Ionicons
                                        name="person-outline"
                                        size={20}
                                        color="#9CA3AF"
                                        style={styles.icon}
                                    />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Pérez"
                                        placeholderTextColor="#9CA3AF"
                                        value={value}
                                        onChangeText={onChange}
                                        autoCapitalize="words"
                                    />
                                </View>
                            )}
                        />
                        {errors.apellido && (
                            <Text style={styles.errorText}>{errors.apellido.message}</Text>
                        )}
                    </View>

                    {/* Campo Fecha de Nacimiento */}
                    <View style={styles.fieldContainer}>
                        <Text style={styles.label}>Fecha de Nacimiento *</Text>
                        <Controller
                            control={control}
                            name="fecha_nacimiento"
                            render={({ field: { onChange, value } }) => (
                                <View style={[
                                    styles.inputContainer,
                                    errors.fecha_nacimiento && styles.inputError
                                ]}>
                                    <Ionicons
                                        name="calendar-outline"
                                        size={20}
                                        color="#9CA3AF"
                                        style={styles.icon}
                                    />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="DD/MM/YYYY (ej: 15/03/1990)"
                                        placeholderTextColor="#9CA3AF"
                                        value={value}
                                        onChangeText={(text) => {
                                            const formatted = formatDateInput(text);
                                            onChange(formatted);
                                        }}
                                        keyboardType="numeric"
                                        maxLength={10}
                                    />
                                </View>
                            )}
                        />
                        {errors.fecha_nacimiento && (
                            <Text style={styles.errorText}>{errors.fecha_nacimiento.message}</Text>
                        )}
                        <Text style={styles.helperText}>
                            Formato: DD/MM/YYYY (ejemplo: 15/03/1990)
                        </Text>
                    </View>

                    {/* Campo Sexo */}
                    <View style={styles.fieldContainer}>
                        <Text style={styles.label}>Sexo *</Text>
                        <Controller
                            control={control}
                            name="sexo"
                            render={({ field: { onChange } }) => (
                                <View style={styles.sexoContainer}>
                                    <TouchableOpacity
                                        style={[
                                            styles.sexoButton,
                                            selectedSexo === "M" && styles.sexoButtonSelected
                                        ]}
                                        onPress={() => handleSexoSelect("M")}
                                    >
                                        <Ionicons
                                            name="male"
                                            size={20}
                                            color={selectedSexo === "M" ? "#FFFFFF" : "#6B7280"}
                                        />
                                        <Text style={[
                                            styles.sexoButtonText,
                                            selectedSexo === "M" && styles.sexoButtonTextSelected
                                        ]}>
                                            Masculino
                                        </Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[
                                            styles.sexoButton,
                                            selectedSexo === "F" && styles.sexoButtonSelected
                                        ]}
                                        onPress={() => handleSexoSelect("F")}
                                    >
                                        <Ionicons
                                            name="female"
                                            size={20}
                                            color={selectedSexo === "F" ? "#FFFFFF" : "#6B7280"}
                                        />
                                        <Text style={[
                                            styles.sexoButtonText,
                                            selectedSexo === "F" && styles.sexoButtonTextSelected
                                        ]}>
                                            Femenino
                                        </Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[
                                            styles.sexoButton,
                                            selectedSexo === "Otro" && styles.sexoButtonSelected
                                        ]}
                                        onPress={() => handleSexoSelect("Otro")}
                                    >
                                        <Ionicons
                                            name="transgender"
                                            size={20}
                                            color={selectedSexo === "Otro" ? "#FFFFFF" : "#6B7280"}
                                        />
                                        <Text style={[
                                            styles.sexoButtonText,
                                            selectedSexo === "Otro" && styles.sexoButtonTextSelected
                                        ]}>
                                            Otro
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        />
                        {errors.sexo && (
                            <Text style={styles.errorText}>{errors.sexo.message}</Text>
                        )}
                    </View>

                    {/* Campo Teléfono */}
                    <View style={styles.fieldContainer}>
                        <Text style={styles.label}>Teléfono *</Text>
                        <Controller
                            control={control}
                            name="telefono"
                            render={({ field: { onChange, value } }) => (
                                <View style={[
                                    styles.inputContainer,
                                    errors.telefono && styles.inputError
                                ]}>
                                    <Ionicons
                                        name="call-outline"
                                        size={20}
                                        color="#9CA3AF"
                                        style={styles.icon}
                                    />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="987654321"
                                        placeholderTextColor="#9CA3AF"
                                        value={value}
                                        onChangeText={onChange}
                                        keyboardType="phone-pad"
                                        maxLength={9}
                                    />
                                </View>
                            )}
                        />
                        {errors.telefono && (
                            <Text style={styles.errorText}>{errors.telefono.message}</Text>
                        )}
                    </View>

                    {/* Campo Correo (Opcional) */}
                    <View style={styles.fieldContainer}>
                        <Text style={styles.label}>Correo Electrónico (opcional)</Text>
                        <Controller
                            control={control}
                            name="correo"
                            render={({ field: { onChange, value } }) => (
                                <View style={[
                                    styles.inputContainer,
                                    errors.correo && styles.inputError
                                ]}>
                                    <Ionicons
                                        name="mail-outline"
                                        size={20}
                                        color="#9CA3AF"
                                        style={styles.icon}
                                    />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="correo@ejemplo.com"
                                        placeholderTextColor="#9CA3AF"
                                        value={value}
                                        onChangeText={onChange}
                                        autoCapitalize="none"
                                        keyboardType="email-address"
                                    />
                                </View>
                            )}
                        />
                        {errors.correo && (
                            <Text style={styles.errorText}>{errors.correo.message}</Text>
                        )}
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
                            style={[styles.button, loading && styles.buttonDisabled]}
                            onPress={handleSubmit(onSubmit)}
                            disabled={loading}
                            activeOpacity={0.8}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <>
                                    <Ionicons
                                        name={isEditMode ? "save" : "checkmark-circle"}
                                        size={20}
                                        color="#FFFFFF"
                                        style={styles.buttonIcon}
                                    />
                                    <Text style={styles.buttonText}>
                                        {isEditMode ? 'Actualizar Paciente' : 'Guardar Paciente'}
                                    </Text>
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: "#F3F4F6",
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: "#6B7280",
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
    backButton: {
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
    helperText: {
        fontSize: 12,
        color: "#6B7280",
        marginTop: 4,
        marginLeft: 4,
    },
    sexoContainer: {
        flexDirection: "row",
        gap: 8,
    },
    sexoButton: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        paddingVertical: 14,
        gap: 6,
    },
    sexoButtonSelected: {
        backgroundColor: "#2563EB",
        borderColor: "#2563EB",
    },
    sexoButtonText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#6B7280",
    },
    sexoButtonTextSelected: {
        color: "#FFFFFF",
    },
    errorText: {
        color: "#EF4444",
        fontSize: 13,
        marginTop: 6,
        marginLeft: 4,
    },
    errorBanner: {
        backgroundColor: "#FEE2E2",
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
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
    button: {
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
    buttonText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "600",
    },
});