export interface HistoriaClinica {
	id_historia: string;
	id_paciente: string;
	id_usuario: string;
	diagnostico: string;
	tratamiento?: string | null;
	observaciones?: string | null;
	fecha_registro: string;
	estado: boolean;
	created_at?: string;
	updated_at?: string;
}
