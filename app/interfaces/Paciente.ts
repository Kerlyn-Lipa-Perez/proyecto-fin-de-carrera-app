export interface Paciente {
    id_paciente: string;
    dni: string;
    nombre: string;
    apellido: string;
    fecha_nacimiento: string;
    sexo: string;
    telefono: string;
    correo?: string;
    id_usuario: string;
}