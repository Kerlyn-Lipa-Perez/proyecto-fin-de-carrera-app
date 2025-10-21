export interface HistoriaClinica {
	id_historia: string;
	id_paciente: string;
	motivo_consulta: string;
	diagnostico?: string;
	tratamiento?: string;
	observaciones?: string;
	fecha_registro: string;
	estado: boolean;
	created_at: string;
}
