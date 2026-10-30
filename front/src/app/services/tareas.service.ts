import { inject, Service } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { TareasPaginadas, TareasQuery } from '../model/tarea';

@Service()
export class TareasService {
  private baseUrl = environment.apiUrl + '/tareas';
  private _httpClient = inject(HttpClient);

  public async getPage(query: TareasQuery) {
    const params: Record<string, string | number | boolean> = {
      page: query.page,
      limit: query.limit,
      orden: query.orden,
      ordenar_por: query.ordenar_por,
    };
    // Los filtros vacíos no se envían
    if (query.titulo) {
      params['titulo'] = query.titulo;
    }
    if (query.estado) {
      params['estado'] = query.estado;
    }
    if (query.prioridad) {
      params['prioridad'] = query.prioridad;
    }
    if (query.grupo) {
      params['grupo'] = query.grupo;
    }

    return await firstValueFrom(this._httpClient.get<TareasPaginadas>(this.baseUrl, { params }));
  }
}
