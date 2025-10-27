import { useState, useCallback } from "react";
import { useLocalSearchParams, router, useFocusEffect } from "expo-router";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { _getPaciente } from "@/app/services/paciente";
import { _getHistoriasByPaciente } from "@/app/services/historia_clinica";
import { Paciente } from "@/app/interfaces/Paciente";
import { HistoriaClinica } from "@/app/interfaces/HistoriaClinica";

export default function PacienteDetail() {

    const params = useLocalSearchParams<{ id: string }>();
    const id = params.id;

    const [paciente, setPaciente] = useState<Paciente | null>(null);
    const [historias, setHistorias] = useState<HistoriaClinica[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingHistorias, setLoadingHistorias] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useFocusEffect(
        useCallback(() => {
            if (!id || id === 'undefined' || id === 'null') {
          
                Alert.alert(
                    'Error',
                    'ID de paciente no válido',
                    [{ text: 'OK', onPress: () => router.back() }]
                );
                return;
            }
            console.log(id)
            fetchData();
        }, [id])
    );

    const fetchData = async () => {
    
        if (!id || id === 'undefined' || id === 'null') {
            setError('ID de paciente no válido');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            console.log('🔍 Buscando paciente con ID:', id);

            // Obtener datos del paciente
            const pacienteData = await _getPaciente(id);

            if (!pacienteData) {
                throw new Error("Paciente no encontrado");
            }

            console.log('✅ Paciente encontrado:', pacienteData);
            setPaciente(pacienteData);

            // Cargar historias clínicas
            await loadHistorias(id);

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error al cargar datos';
            setError(errorMessage);
            console.error("❌ Error al cargar datos del paciente:", error);

            Alert.alert(
                'Error',
                'No se pudo cargar la información del paciente.',
                [{ text: 'OK', onPress: () => router.back() }]
            );
        } finally {
            setLoading(false);
        }
    };

    const loadHistorias = async (pacienteId: string) => {
        if (!pacienteId || pacienteId === 'undefined' || pacienteId === 'null') {
            return;
        }

        try {
            setLoadingHistorias(true);
            console.log('📋 Cargando historias para paciente:', pacienteId);
            const historiasData = await _getHistoriasByPaciente(pacienteId);
            console.log('✅ Historias cargadas:', historiasData.length);
            setHistorias(historiasData || []);
        } catch (error) {
            console.error("❌ Error al cargar historias clínicas:", error);
            setHistorias([]);
        } finally {
            setLoadingHistorias(false);
        }
    };

    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString("es-PE", {
                day: "2-digit",
                month: "long",
                year: "numeric",
            });
        } catch (error) {
            return dateString;
        }
    };

    const calculateAge = (birthDate: string): number => {
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }

        return age;
    };

    const handleEditPaciente = () => {
        if (!id) return;
        router.push(`/(screens)/PacienteFormScreen?id=${id}`);
    };

    const handleCreateHistoria = () => {
        if (!id) return;
        router.push(`/(screens)/HistoriaClinicaForm?pacienteId=${id}`);
    };

    //const handleHistoriaPress = (historiaId: string) => {
    //    router.push(`/(screens)/HistoriaClinicaDetail?id=${historiaId}`);
    //};

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#2563EB" />
                <Text style={styles.loadingText}>Cargando información...</Text>
            </View>
        );
    }

    if (error || !paciente) {
        return (
            <View style={styles.center}>
                <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
                <Text style={styles.errorText}>
                    {error || "Paciente no encontrado"}
                </Text>
                <TouchableOpacity
                    style={styles.errorButton}
                    onPress={() => router.back()}
                >
                    <Text style={styles.errorButtonText}>Volver</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.headerButton}
                    onPress={() => router.back()}
                >
                    <Ionicons name="arrow-back" size={24} color="#FFF" />
                </TouchableOpacity>
                <Text style={styles.headerText}>Detalle del Paciente</Text>
                <TouchableOpacity
                    style={styles.headerButton}
                    onPress={handleEditPaciente}
                >
                    <Ionicons name="create-outline" size={24} color="#FFF" />
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
            >
                {/* Profile Section */}
                <View style={styles.profileSection}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                            {paciente.nombre.charAt(0).toUpperCase()}
                            {paciente.apellido.charAt(0).toUpperCase()}
                        </Text>
                    </View>
                    <Text style={styles.name}>
                        {paciente.nombre} {paciente.apellido}
                    </Text>
                    <Text style={styles.dni}>DNI: {paciente.dni}</Text>
                </View>

                {/* Information Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Información Personal</Text>

                    <View style={styles.infoCard}>
                        <View style={styles.infoRow}>
                            <View style={styles.infoIconContainer}>
                                <Ionicons name="calendar-outline" size={20} color="#2563EB" />
                            </View>
                            <View style={styles.infoContent}>
                                <Text style={styles.infoLabel}>Fecha de Nacimiento</Text>
                                <Text style={styles.infoValue}>
                                    {formatDate(paciente.fecha_nacimiento)}
                                </Text>
                                <Text style={styles.infoSubtext}>
                                    {calculateAge(paciente.fecha_nacimiento)} años
                                </Text>
                            </View>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.infoRow}>
                            <View style={styles.infoIconContainer}>
                                <Ionicons
                                    name={paciente.sexo === "M" ? "male" : paciente.sexo === "F" ? "female" : "transgender"}
                                    size={20}
                                    color="#2563EB"
                                />
                            </View>
                            <View style={styles.infoContent}>
                                <Text style={styles.infoLabel}>Sexo</Text>
                                <Text style={styles.infoValue}>
                                    {paciente.sexo === "M" ? "Masculino" : paciente.sexo === "F" ? "Femenino" : "Otro"}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.infoRow}>
                            <View style={styles.infoIconContainer}>
                                <Ionicons name="call-outline" size={20} color="#2563EB" />
                            </View>
                            <View style={styles.infoContent}>
                                <Text style={styles.infoLabel}>Teléfono</Text>
                                <Text style={styles.infoValue}>{paciente.telefono}</Text>
                            </View>
                        </View>

                        {paciente.correo && (
                            <>
                                <View style={styles.divider} />
                                <View style={styles.infoRow}>
                                    <View style={styles.infoIconContainer}>
                                        <Ionicons name="mail-outline" size={20} color="#2563EB" />
                                    </View>
                                    <View style={styles.infoContent}>
                                        <Text style={styles.infoLabel}>Correo Electrónico</Text>
                                        <Text style={styles.infoValue}>{paciente.correo}</Text>
                                    </View>
                                </View>
                            </>
                        )}
                    </View>
                </View>

                {/* Clinical History Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Historias Clínicas</Text>
                        <TouchableOpacity
                            style={styles.addButton}
                            onPress={handleCreateHistoria}
                        >
                            <Ionicons name="add" size={20} color="#2563EB" />
                            <Text style={styles.addButtonText}>Nueva</Text>
                        </TouchableOpacity>
                    </View>

                    {loadingHistorias ? (
                        <View style={styles.loadingHistorias}>
                            <ActivityIndicator size="small" color="#2563EB" />
                            <Text style={styles.loadingHistoriasText}>Cargando historias...</Text>
                        </View>
                    ) : historias.length > 0 ? (
                        historias.map((historia) => (
                            <View
                                key={historia.id_historia}
                                style={styles.historiaCard}
                 
                            >
                                <View style={styles.historiaHeader}>
                                    <Text style={styles.historiaDate}>
                                        {formatDate(historia.fecha_registro)}
                                    </Text>
                                    <View style={[
                                        styles.estadoBadge,
                                        { backgroundColor: historia.estado ? "#DEF7EC" : "#F3F4F6" }
                                    ]}>
                                        <Text style={[
                                            styles.estadoText,
                                            { color: historia.estado ? "#03543F" : "#6B7280" }
                                        ]}>
                                            {historia.estado ? "Activa" : "Cerrada"}
                                        </Text>
                                    </View>
                                </View>

                                {/*{historia.motivo_consulta && (
                                    <Text style={styles.historiaMotivo}>
                                        📋 {historia.motivo_consulta}
                                    </Text>
                                )}*/}

                                {historia.diagnostico && (
                                    <Text style={styles.historiaTitle}>
                                        🩺 {historia.diagnostico}
                                    </Text>
                                )}

                                {historia.tratamiento && (
                                    <Text style={styles.historiaText}>
                                        💊 {historia.tratamiento}
                                    </Text>
                                )}

                                

                                {historia.observaciones && (
                                    <Text style={styles.historiaText}>
                                        📝 {historia.observaciones}
                                    </Text>
                                )}

                                {/*<View style={styles.historiaFooter}>
                                    <Text style={styles.viewMore}>Ver detalles</Text>
                                    <Ionicons name="chevron-forward" size={16} color="#2563EB" />
                                </View>*/}
                            </View>
                        ))
                    ) : (
                        <View style={styles.emptyHistoria}>
                            <Ionicons name="document-text-outline" size={48} color="#D1D5DB" />
                            <Text style={styles.emptyTitle}>
                                No hay historias clínicas registradas
                            </Text>
                            <Text style={styles.emptySubtext}>
                                Comienza a llevar un registro detallado de las consultas y evolución del paciente
                            </Text>
                            <TouchableOpacity
                                style={styles.createButton}
                                onPress={handleCreateHistoria}
                            >
                                <Ionicons name="add" size={20} color="#FFFFFF" />
                                <Text style={styles.createButtonText}>Crear primera historia</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {/* Estadísticas adicionales si hay historias */}
                {historias.length > 0 && (
                    <View style={styles.statsSection}>
                        <View style={styles.statsCard}>
                            <View style={styles.statItem}>
                                <Ionicons name="document-text" size={24} color="#2563EB" />
                                <Text style={styles.statValue}>{historias.length}</Text>
                                <Text style={styles.statLabel}>
                                    {historias.length === 1 ? 'Historia' : 'Historias'}
                                </Text>
                            </View>
                            <View style={styles.statDivider} />
                            <View style={styles.statItem}>
                                <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                                <Text style={styles.statValue}>
                                    {historias.filter(h => h.estado).length}
                                </Text>
                                <Text style={styles.statLabel}>Activas</Text>
                            </View>
                            <View style={styles.statDivider} />
                            <View style={styles.statItem}>
                                <Ionicons name="archive" size={24} color="#6B7280" />
                                <Text style={styles.statValue}>
                                    {historias.filter(h => !h.estado).length}
                                </Text>
                                <Text style={styles.statLabel}>Cerradas</Text>
                            </View>
                        </View>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F3F4F6"
    },
    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F3F4F6",
        padding: 24,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: "#6B7280"
    },
    errorText: {
        marginTop: 16,
        fontSize: 16,
        color: "#EF4444",
        textAlign: "center",
    },
    errorButton: {
        marginTop: 24,
        backgroundColor: "#2563EB",
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
    },
    errorButtonText: {
        color: "#FFFFFF",
        fontSize: 15,
        fontWeight: "600",
    },
    header: {
        backgroundColor: "#2563EB",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingTop: 50,
        paddingBottom: 16,
        paddingHorizontal: 16,
    },
    headerButton: {
        width: 40,
        height: 40,
        justifyContent: "center",
        alignItems: "center",
    },
    headerText: {
        color: "#FFF",
        fontWeight: "700",
        fontSize: 18,
        flex: 1,
        textAlign: "center",
    },
    scrollView: {
        flex: 1,
    },
    profileSection: {
        alignItems: "center",
        paddingVertical: 32,
        backgroundColor: "#FFFFFF",
        borderBottomWidth: 1,
        borderBottomColor: "#E5E7EB",
    },
    avatar: {
        width: 96,
        height: 96,
        borderRadius: 48,
        backgroundColor: "#E0E7FF",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 16,
    },
    avatarText: {
        fontSize: 36,
        fontWeight: "700",
        color: "#2563EB"
    },
    name: {
        fontSize: 24,
        fontWeight: "700",
        color: "#1F2937",
        marginBottom: 4,
    },
    dni: {
        color: "#6B7280",
        fontSize: 15,
        fontWeight: "500",
    },
    section: {
        paddingHorizontal: 16,
        marginTop: 24,
        marginBottom: 16,
    },
    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },
    sectionTitle: {
        fontWeight: "700",
        fontSize: 20,
        color: "#1F2937",
    },
    addButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    addButtonText: {
        fontSize: 15,
        fontWeight: "600",
        color: "#2563EB",
    },
    infoCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        padding: 16,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    infoRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
    },
    infoIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#EFF6FF",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    infoContent: {
        flex: 1,
    },
    infoLabel: {
        fontSize: 13,
        color: "#6B7280",
        marginBottom: 4,
    },
    infoValue: {
        fontSize: 16,
        fontWeight: "600",
        color: "#1F2937",
    },
    infoSubtext: {
        fontSize: 14,
        color: "#9CA3AF",
        marginTop: 2,
    },
    divider: {
        height: 1,
        backgroundColor: "#E5E7EB",
        marginVertical: 4,
    },
    loadingHistorias: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
    },
    loadingHistoriasText: {
        marginLeft: 12,
        fontSize: 14,
        color: "#6B7280",
    },
    historiaCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    historiaHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    historiaDate: {
        fontSize: 13,
        fontWeight: "600",
        color: "#6B7280"
    },
    estadoBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    estadoText: {
        fontSize: 12,
        fontWeight: "600",
    },
    historiaMotivo: {
        fontSize: 15,
        fontWeight: "600",
        color: "#4B5563",
        marginBottom: 8,
    },
    historiaTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#1F2937",
        marginBottom: 8,
    },
    historiaText: {
        fontSize: 14,
        color: "#6B7280",
        marginBottom: 5,
    },
    historiaFooter: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-end",
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: "#F3F4F6",
    },
    viewMore: {
        fontSize: 14,
        fontWeight: "600",
        color: "#2563EB",
        marginRight: 4,
    },
    emptyHistoria: {
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        padding: 40,
        alignItems: "center",
    },
    emptyTitle: {
        color: "#1F2937",
        fontSize: 16,
        fontWeight: "600",
        marginTop: 12,
        textAlign: "center",
    },
    emptySubtext: {
        color: "#6B7280",
        fontSize: 14,
        marginTop: 8,
        marginBottom: 24,
        textAlign: "center",
        lineHeight: 20,
    },
    createButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#2563EB",
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        gap: 8,
    },
    createButtonText: {
        color: "#FFFFFF",
        fontSize: 15,
        fontWeight: "600",
    },
    statsSection: {
        paddingHorizontal: 16,
        marginTop: 8,
        marginBottom: 24,
    },
    statsCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        padding: 20,
        flexDirection: "row",
        justifyContent: "space-around",
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    statItem: {
        alignItems: "center",
        flex: 1,
    },
    statValue: {
        fontSize: 24,
        fontWeight: "700",
        color: "#1F2937",
        marginTop: 8,
    },
    statLabel: {
        fontSize: 13,
        color: "#6B7280",
        marginTop: 4,
    },
    statDivider: {
        width: 1,
        backgroundColor: "#E5E7EB",
        marginHorizontal: 16,
    },
});