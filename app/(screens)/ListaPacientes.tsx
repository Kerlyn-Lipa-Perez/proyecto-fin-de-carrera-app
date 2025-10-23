import { useState, useEffect, useCallback } from "react";
import { router, useFocusEffect } from 'expo-router';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    RefreshControl,
    Alert,
} from 'react-native';
import { Ionicons } from "@expo/vector-icons";

import { _getAllPacientes } from "@/app/services/paciente";
import { Paciente } from "@/app/interfaces/Paciente";

export default function ListaPacientes() {
    const [patients, setPatients] = useState<Paciente[]>([]);
    const [filteredPatients, setFilteredPatients] = useState<Paciente[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useFocusEffect(
        useCallback(() => {
            fetchPatients();
        }, [])
    );

    useEffect(() => {
        filterPatients();
    }, [searchQuery, patients]);

    const fetchPatients = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await _getAllPacientes();

            if (data) {
                setPatients(data);
                setFilteredPatients(data);
            } else {
                setPatients([]);
                setFilteredPatients([]);
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error al cargar pacientes';
            setError(errorMessage);
            console.error('Error al cargar pacientes:', error);
            Alert.alert('Error', 'No se pudieron cargar los pacientes. Por favor intenta de nuevo.', [{ text: 'OK' }]);
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
                `${patient.nombre} ${patient.apellido} ${patient.dni}`
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase())
            );
            setFilteredPatients(filtered);
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

 
    const handlePatientPress = (paciente: Paciente) => {
        // Navegar al detalle del paciente
        router.push({
            pathname: '/(screens)/PacienteDetail',
            params: { id: paciente.id_paciente}
        });
        console.log('Paciente seleccionado:', paciente);
    };

    const renderPatientItem = ({ item }: { item: Paciente }) => (
        <TouchableOpacity
            style={styles.patientCard}
            onPress={() => handlePatientPress(item)}
            activeOpacity={0.7}
        >
            <View style={styles.patientContent}>
                <View style={styles.avatarContainer}>
                    <View style={[styles.avatar, styles.avatarPlaceholder]}>
                        <Text style={styles.avatarText}>
                            {item.nombre.charAt(0).toUpperCase()}
                            {item.apellido.charAt(0).toUpperCase()}
                        </Text>
                    </View>
                </View>

                <View style={styles.patientInfo}>
                    <Text style={styles.patientName}>
                        {item.nombre} {item.apellido}
                    </Text>
                    <View style={styles.patientDetails}>
                        <Text style={styles.patientSession}>DNI: {item.dni}</Text>
                        <Text style={styles.patientDivider}> • </Text>
                        <Text style={styles.patientSession}>{calculateAge(item.fecha_nacimiento)} años</Text>
                    </View>
                </View>

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
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Ionicons name="arrow-back" size={24} color="#1F2937" />
                </TouchableOpacity>

                <Text style={styles.title}>Pacientes</Text>

                <TouchableOpacity
                    style={styles.newButton}
                    onPress={() => router.push("/(screens)/PacienteFormScreen")}
                    activeOpacity={0.7}
                >
                    <Ionicons name="add" size={24} color="#2563EB" />
                </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Buscar por nombre, apellido o DNI"
                    placeholderTextColor="#9CA3AF"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery("")}>
                        <Ionicons name="close-circle" size={20} color="#9CA3AF" />
                    </TouchableOpacity>
                )}
            </View>

            {/* Contador */}
            {!loading && filteredPatients.length > 0 && (
                <View style={styles.counterContainer}>
                    <Text style={styles.counterText}>
                        {filteredPatients.length} {filteredPatients.length === 1 ? 'paciente' : 'pacientes'}
                        {searchQuery ? ' encontrado(s)' : ''}
                    </Text>
                </View>
            )}

            {filteredPatients.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Ionicons name="people-outline" size={64} color="#D1D5DB" />
                    <Text style={styles.emptyText}>
                        {searchQuery
                            ? "No se encontraron pacientes"
                            : "No hay pacientes registrados"}
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={filteredPatients}
                    renderItem={renderPatientItem}
                    keyExtractor={(item) => item.id_paciente}
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
    backButton: {
        width: 40,
        height: 40,
        justifyContent: "center",
        alignItems: "flex-start",
    },
    title: {
        fontSize: 28,
        fontWeight: "700",
        color: "#1F2937",
        flex: 1,
        textAlign: "center",
    },
    newButton: {
        width: 40,
        height: 40,
        justifyContent: "center",
        alignItems: "flex-end",
    },
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        marginHorizontal: 24,
        marginTop: 16,
        marginBottom: 8,
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
    counterContainer: {
        paddingHorizontal: 24,
        paddingVertical: 8,
    },
    counterText: {
        fontSize: 14,
        color: "#6B7280",
        fontWeight: "500",
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
    patientDetails: {
        flexDirection: "row",
        alignItems: "center",
    },
    patientSession: {
        fontSize: 14,
        color: "#6B7280",
    },
    patientDivider: {
        fontSize: 14,
        color: "#D1D5DB",
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 40,
        paddingTop: 60,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: "600",
        color: "#1F2937",
        textAlign: "center",
        marginTop: 16,
    },
    emptySubtext: {
        fontSize: 14,
        color: "#6B7280",
        textAlign: "center",
        marginTop: 8,
        marginBottom: 24,
    },
    emptyButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#2563EB",
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 12,
        shadowColor: "#2563EB",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    emptyButtonIcon: {
        marginRight: 8,
    },
    emptyButtonText: {
        color: "#FFFFFF",
        fontSize: 15,
        fontWeight: "600",
    },
    newButtonText:{
        
    }
});