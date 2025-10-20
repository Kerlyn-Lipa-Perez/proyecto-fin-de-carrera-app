import { useState, useEffect } from "react";
import { router } from 'expo-router';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    FlatList,
    Image,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "@/lib/supabase";

interface Patient {
    id: string;
    nombre: string;
    apellido: string;
    ultima_sesion: string;
    foto_url?: string;
}

export default function ListaPacientes() {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchPatients();
    }, []);

    useEffect(() => {
        filterPatients();
    }, [searchQuery, patients]);

    const fetchPatients = async () => {
        try {
            setLoading(true);

            // Obtener pacientes de Supabase
            const { data, error } = await supabase
                .from('pacientes')
                .select('*')
                .order('nombre', { ascending: true });

            if (error) throw error;

            setPatients(data || []);
            setFilteredPatients(data || []);

        } catch (error) {
            console.error('Error al cargar pacientes:', error);
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchPatients();
        setRefreshing(false);
    };

    const filterPatients = () => {
        if (searchQuery.trim() === "") {
            setFilteredPatients(patients);
        } else {
            const filtered = patients.filter((patient) =>
                `${patient.nombre} ${patient.apellido}`
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase())
            );
            setFilteredPatients(filtered);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const renderPatientItem = ({ item }: { item: Patient }) => (
        <TouchableOpacity
            style={styles.patientCard}
            //onPress={() => router.push(`/(screens)/PacienteDetail?id=${item.id}`)}
            activeOpacity={0.7}
        >
            <View style={styles.patientContent}>
                {/* Avatar */}
                <View style={styles.avatarContainer}>
                    {item.foto_url ? (
                        <Image
                            source={{ uri: item.foto_url }}
                            style={styles.avatar}
                        />
                    ) : (
                        <View style={[styles.avatar, styles.avatarPlaceholder]}>
                            <Text style={styles.avatarText}>
                                {item.nombre.charAt(0)}{item.apellido.charAt(0)}
                            </Text>
                        </View>
                    )}
                </View>

                {/* Info */}
                <View style={styles.patientInfo}>
                    <Text style={styles.patientName}>
                        {item.nombre} {item.apellido.charAt(0)}.
                    </Text>
                    <Text style={styles.patientSession}>
                        Última sesión: {formatDate(item.ultima_sesion)}
                    </Text>
                </View>

                {/* Arrow */}
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </View>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2563EB" />
                <Text style={styles.loadingText}>Cargando pacientes...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Pacientes</Text>
                <TouchableOpacity
                    style={styles.newButton}
                    onPress={() => router.push("/(screens)/PacienteFormScreen")}
                    activeOpacity={0.7}
                >
                    <Ionicons name="add" size={20} color="#2563EB" />
                    <Text style={styles.newButtonText}>Nuevo</Text>
                </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Buscar paciente"
                    placeholderTextColor="#9CA3AF"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            {/* Patients List */}
            {filteredPatients.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Ionicons name="people-outline" size={64} color="#D1D5DB" />
                    <Text style={styles.emptyText}>
                        {searchQuery ? "No se encontraron pacientes" : "No hay pacientes registrados"}
                    </Text>
                    {!searchQuery && (
                        <TouchableOpacity
                            style={styles.emptyButton}
                            onPress={() => router.push("/(screens)/PacienteFormScreen")}
                        >
                            <Text style={styles.emptyButtonText}>Agregar primer paciente</Text>
                        </TouchableOpacity>
                    )}
                </View>
            ) : (
                <FlatList
                    data={filteredPatients}
                    renderItem={renderPatientItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            tintColor="#2563EB"
                        />
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F3F4F6",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F3F4F6",
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: "#6B7280",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 24,
        paddingTop: 60,
        paddingBottom: 20,
        backgroundColor: "#FFFFFF",
    },
    title: {
        fontSize: 28,
        fontWeight: "700",
        color: "#1F2937",
    },
    newButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    newButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#2563EB",
    },
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        marginHorizontal: 24,
        marginTop: 16,
        marginBottom: 16,
        paddingHorizontal: 16,
        height: 48,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: "#1F2937",
    },
    listContent: {
        paddingHorizontal: 24,
        paddingBottom: 24,
    },
    patientCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    patientContent: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
    },
    avatarContainer: {
        marginRight: 16,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
    },
    avatarPlaceholder: {
        backgroundColor: "#E0E7FF",
        justifyContent: "center",
        alignItems: "center",
    },
    avatarText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#2563EB",
    },
    patientInfo: {
        flex: 1,
    },
    patientName: {
        fontSize: 17,
        fontWeight: "600",
        color: "#1F2937",
        marginBottom: 4,
    },
    patientSession: {
        fontSize: 14,
        color: "#6B7280",
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 40,
    },
    emptyText: {
        fontSize: 16,
        color: "#6B7280",
        textAlign: "center",
        marginTop: 16,
        marginBottom: 24,
    },
    emptyButton: {
        backgroundColor: "#2563EB",
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
    },
    emptyButtonText: {
        color: "#FFFFFF",
        fontSize: 15,
        fontWeight: "600",
    },
});