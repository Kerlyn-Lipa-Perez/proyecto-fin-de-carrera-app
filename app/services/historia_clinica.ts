import { HistoriaClinica } from "@/app/interfaces/HistoriaClinica";
import { supabase } from "@/lib/supabase";

/**
 * Obtiene todas las historias clínicas de un paciente específico
 */
export const _getHistoriasByPaciente = async (
	id_paciente: string
): Promise<HistoriaClinica[]> => {
	try {
		const { data, error } = await supabase
			.from("historia_clinica")
			.select("*")
			.eq("id_paciente", id_paciente)
			.order("fecha_registro", { ascending: false });

		if (error) {
			throw error;
		}

		return data || [];
	} catch (error) {
		console.error("Error al obtener historias clínicas:", error);
		throw error;
	}
};

/**
 * Obtiene una historia clínica específica por ID
 */
export const _getHistoriaById = async (
	id_historia: string
): Promise<HistoriaClinica | null> => {
	try {
		const { data, error } = await supabase
			.from("historia_clinica")
			.select("*")
			.eq("id_historia", id_historia)
			.single();

		if (error) {
			throw error;
		}

		return data;
	} catch (error) {
		console.error("Error al obtener historia clínica:", error);
		throw error;
	}
};

/**
 * Crea una nueva historia clínica
 */
export const _createHistoria = async (
	historia: Omit<HistoriaClinica, "id_historia" | "created_at">
): Promise<HistoriaClinica> => {
	try {
		const { data, error } = await supabase
			.from("historia_clinica")
			.insert(historia)
			.select()
			.single();

		if (error) {
			throw error;
		}

		return data;
	} catch (error) {
		console.error("Error al crear historia clínica:", error);
		throw error;
	}
};

/**
 * Actualiza una historia clínica existente
 */
export const _updateHistoria = async (
	historia: Partial<HistoriaClinica> & { id_historia: string }
): Promise<HistoriaClinica> => {
	try {
		const { id_historia, ...updateData } = historia;

		const { data, error } = await supabase
			.from("historia_clinica")
			.update(updateData)
			.eq("id_historia", id_historia)
			.select()
			.single();

		if (error) {
			throw error;
		}

		return data;
	} catch (error) {
		console.error("Error al actualizar historia clínica:", error);
		throw error;
	}
};

/**
 * Elimina una historia clínica
 */
export const _deleteHistoria = async (id_historia: string): Promise<void> => {
	try {
		const { error } = await supabase
			.from("historia_clinica")
			.delete()
			.eq("id_historia", id_historia);

		if (error) {
			throw error;
		}
	} catch (error) {
		console.error("Error al eliminar historia clínica:", error);
		throw error;
	}
};
