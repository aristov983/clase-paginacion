import { Grupo, Meta, Orden } from './usuario';

export type Prioridad = '0:baja' | '1:media' | '2:alta';

export type EstadoTarea = 'Abierta' | 'Cerrada';

export type Tarea = {
  id_tarea: number;
  id_creador: number;
  grupo: Grupo;
  titulo: string;
  descripcion: string | null;
  prioridad: Prioridad;
  creada: string;
  terminada?: string | null;
  estado: EstadoTarea;
};

export type TareasOrdenarPor = 'id_tarea' | 'titulo' | 'prioridad' | 'creada' | 'estado';

export type TareasQuery = {
  page: number;
  limit: number;
  orden: Orden;
  ordenar_por: TareasOrdenarPor;
  titulo?: string;
  estado?: EstadoTarea;
  prioridad?: Prioridad;
  grupo?: Grupo;
};

export type TareasPaginadas = {
  data: Tarea[];
  meta: Meta;
};
