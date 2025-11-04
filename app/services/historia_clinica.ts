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
		console.log("🔍 Buscando historia con ID:", id_historia);

		const { data, error } = await supabase
			.from("historia_clinica")
			.select("*")
			.eq("id_historia", id_historia)
			.single();

		if (error) {
		
			throw error;
		}

		console.log("✅ Historia encontrada:", data);
		return data;
	} catch (error) {

		throw error;
	}
};

/**
 * Crea una nueva historia clínica
 */
export const _createHistoria = async (historia: {
	id_paciente: string;
	id_usuario: string;
	diagnostico: string;
	tratamiento?: string | null;
	observaciones?: string | null;
	fecha_registro: string;
	estado: boolean;
}): Promise<HistoriaClinica> => {
	try {
		console.log("🔹 Datos a insertar:", historia);

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

		throw error;
	}
};

/**
 * Actualiza una historia clínica existente
 * Basado en la estructura de la tabla:
 * - id_historia (uuid, PK)
 * - id_paciente (uuid, FK)
 * - id_usuario (uuid, FK)
 * - diagnostico (text)
 * - tratamiento (text, nullable)
 * - observaciones (text, nullable)
 * - fecha_registro (date)
 * - estado (bool)
 * - created_at (timestamptz)
 * - updated_at (timestamptz)
 */
export const _updateHistoria = async (historia: {
	id_historia: string;
	diagnostico?: string;
	tratamiento?: string | null;
	observaciones?: string | null;
	estado?: boolean;
}): Promise<HistoriaClinica> => {
	try {
		const { id_historia, ...updateData } = historia;

		
		// PASO 1: Verificar que la historia existe

		const { data: existingData, error: checkError } = await supabase
			.from("historia_clinica")
			.select("*")
			.eq("id_historia", id_historia)
			.single();

		if (checkError) {
		
			throw new Error(
				`No se pudo verificar la historia: ${checkError.message}`
			);
		}

		if (!existingData) {
			
			throw new Error(`Historia clínica no encontrada con ID: ${id_historia}`);
		}

		console.log("✅ Historia encontrada:", existingData);

		// PASO 2: Realizar el UPDATE
		console.log("📍 PASO 2: Realizando UPDATE...");
		const { error: updateError } = await supabase
			.from("historia_clinica")
			.update(updateData)
			.eq("id_historia", id_historia);

		if (updateError) {
	
			throw new Error(`Error al actualizar: ${updateError.message}`);
		}

		console.log("✅ UPDATE ejecutado sin errores");

		// PASO 3: Obtener los datos actualizados
		
		const { data: updatedData, error: fetchError } = await supabase
			.from("historia_clinica")
			.select("*")
			.eq("id_historia", id_historia)
			.single();

		if (fetchError) {
			
			throw new Error(
				`Error al obtener datos actualizados: ${fetchError.message}`
			);
		}

		if (!updatedData) {
			
			throw new Error("No se pudo obtener la historia clínica actualizada");
		}



		return updatedData;
	} catch (error) {

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
