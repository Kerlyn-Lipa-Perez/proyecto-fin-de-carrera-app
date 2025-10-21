import { useState, useEffect } from "react";
import { useLocalSearchParams, router } from "expo-router";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "@/lib/supabase";
import { Paciente } from "../interfaces/Paciente";
import { HistoriaClinica } from "../interfaces/HistoriaClinica";


export default function PacienteDetailScreen() {
    const { id_paciente } = useLocalSearchParams<{ id_paciente: string }>();
    const [paciente, setPaciente] = useState<Paciente | null>(null);
    const [historias, setHistorias] = useState<HistoriaClinica[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id_paciente) fetchData();
    }, [id_paciente]);

    const fetchData = async () => {
        try {
            setLoading(true);

            const { data: pacienteData, error: pacienteError } = await supabase
                .from("paciente")
                .select("*")
                .eq("id", id_paciente)
                .single();

            if (pacienteError) throw pacienteError;
            setPaciente(pacienteData);

            const { data: historiasData, error: historiasError } = await supabase
                .from("historia_clinica")
                .select("*")
                .eq("id_paciente", id_paciente)
                .order("fecha_registro", { ascending: false });

            if (historiasError) throw historiasError;
            setHistorias(historiasData || []);
        } catch (error) {
            console.error("Error al cargar datos:", error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (d: string) =>
        new Date(d).toLocaleDateString("es-PE", {
            day: "2-digit",
            month: "long",
            year: "numeric",
        });

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#2563EB" />
                <Text style={styles.loadingText}>Cargando información...</Text>
            </View>
        );
    }

    if (!paciente) {
        return (
            <View style={styles.center}>
                <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
                <Text style={{ color: "#EF4444", marginTop: 10 }}>
                    Paciente no encontrado
                </Text>
                <TouchableOpacity onPress={() => router.back()}>
                    <Text style={{ color: "#2563EB", marginTop: 12 }}>Volver</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#FFF" />
                </TouchableOpacity>
                <Text style={styles.headerText}>Detalle del Paciente</Text>
                <View style={{ width: 24 }} />
            </View>

            <View style={styles.profile}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                        {paciente.nombre.charAt(0)}
                        {paciente.apellido.charAt(0)}
                    </Text>
                </View>
                <Text style={styles.name}>
                    {paciente.nombre} {paciente.apellido}
                </Text>
                <Text style={styles.subtext}>DNI: {paciente.dni}</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Datos del Paciente</Text>
                <Text style={styles.item}>📅 Fecha de Nacimiento: {formatDate(paciente.fecha_nacimiento)}</Text>
                <Text style={styles.item}>⚧ Sexo: {paciente.sexo}</Text>
                {paciente.telefono && <Text style={styles.item}>📞 Teléfono: {paciente.telefono}</Text>}
                {paciente.correo && <Text style={styles.item}>✉️ Correo: {paciente.correo}</Text>}
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Historias Clínicas</Text>
                {historias.length > 0 ? (
                    historias.map((historia) => (
                        <View key={historia.id_historia} style={styles.card}>
                            <Text style={styles.cardDate}>{formatDate(historia.fecha_registro)}</Text>
                            <Text style={styles.cardText}>🩺 Diagnóstico: {historia.diagnostico}</Text>
                            {historia.tratamiento && (
                                <Text style={styles.cardText}>💊 Tratamiento: {historia.tratamiento}</Text>
                            )}
                            {historia.observaciones && (
                                <Text style={styles.cardText}>🗒️ Observaciones: {historia.observaciones}</Text>
                            )}
                            <Text
                                style={[
                                    styles.estado,
                                    { color: historia.estado ? "#10B981" : "#6B7280" },
                                ]}
                            >
                                {historia.estado ? "Activa" : "Cerrada"}
                            </Text>
                        </View>
                    ))
                ) : (
                    <Text style={styles.empty}>No hay historias clínicas registradas.</Text>
                )}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F3F4F6" },
    center: { flex: 1, justifyContent: "center", alignItems: "center" },
    loadingText: { marginTop: 8, color: "#6B7280" },
    header: {
        backgroundColor: "#2563EB",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingTop: 50,
        paddingBottom: 16,
        paddingHorizontal: 16,
    },
    headerText: { color: "#FFF", fontWeight: "600", fontSize: 16 },
    profile: { alignItems: "center", paddingVertical: 20 },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: "#E0E7FF",
        justifyContent: "center",
        alignItems: "center",
    },
    avatarText: { fontSize: 28, fontWeight: "700", color: "#2563EB" },
    name: { fontSize: 20, fontWeight: "700", marginTop: 8, color: "#1F2937" },
    subtext: { color: "#6B7280", fontSize: 14 },
    section: { paddingHorizontal: 16, marginBottom: 24 },
    sectionTitle: { fontWeight: "700", fontSize: 18, marginBottom: 10 },
    item: { fontSize: 15, color: "#1F2937", marginBottom: 4 },
    card: {
        backgroundColor: "#FFF",
        borderRadius: 10,
        padding: 12,
        marginBottom: 10,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    cardDate: { fontSize: 13, fontWeight: "600", color: "#6B7280" },
    cardText: { marginTop: 6, color: "#1F2937" },
    estado: { marginTop: 8, fontWeight: "700" },
    empty: { color: "#6B7280", fontStyle: "italic", marginTop: 8 },
});
