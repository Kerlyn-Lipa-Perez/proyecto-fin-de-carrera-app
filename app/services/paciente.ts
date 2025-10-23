import { Paciente } from "@/app/interfaces/Paciente";
import { supabase } from "@/lib/supabase";

export const _createPaciente = async (paciente: Paciente) => {
    const {data ,error} = await supabase.from('paciente').insert(paciente).select();
    
    if (error) {
	    throw error;
	}
    if (data) {
		return data;
	}

			
};

export const _getPaciente = async (id : string) => {
    const {data ,error} = await supabase.from('paciente').select('*').eq('id_paciente', id).single();
    console.log("data",data);
    if (error) {
		throw error;
	}

	if (error) throw error;
	
	return data;

};

export const _getAllPacientes = async (): Promise<Paciente[]> => {
	const { data, error } = await supabase
		.from("paciente")
		.select("*")
		.order("nombre", { ascending: true });

	if (error) {
		throw new Error(error.message);
	}

	if (data) {
		return data;
	}

	return [];
};

export const _updatePaciente = async (paciente: Paciente) => {
     const { data, error } = await supabase
				.from("paciente")
				.update(paciente)
				.eq("id_paciente", paciente.id_paciente)
				.select();

			if (error) {
				throw error;
			}

			return data;
};

export const _deletePaciente = async (id: string) => {
     const { error } = await supabase.from("paciente").delete().eq("id_paciente", id);

			if (error) {
				throw error;
			}
};