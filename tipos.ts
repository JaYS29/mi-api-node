export interface Tarea {
  id: number;
  titulo: string;
  completada: boolean;
}

export interface ErrorRespuesta {
  error: string;
}
// Lo que puede devolver una operación: una tarea, la lista, un error, o nada (null)
export type RespuestaTareas = Tarea | Tarea[] | ErrorRespuesta | null;
