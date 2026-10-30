import { inject, Service } from '@angular/core';
import { Usuario, UsuariosPaginados, UsuariosQuery } from '../model/usuario';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

@Service()
export class UsuariosService {
  private baseUrl = environment.apiUrl + '/usuarios';
  private _httpClient = inject(HttpClient);

  public async getAll() {
    const users = await firstValueFrom(
      this._httpClient.get<{ data: Usuario[]; meta: any }>(this.baseUrl),
    );
    return users.data;
  }

  public async getById(id: number) {
    return await firstValueFrom(this._httpClient.get<Usuario>(`${this.baseUrl}/${id}`));
  }

  public async add(nuevoUsuario: Usuario) {
    return firstValueFrom(this._httpClient.post<Usuario>(this.baseUrl, nuevoUsuario));
  }

  public async update(id: number, usuarioModificado: Usuario) {
    return firstValueFrom(
      this._httpClient.put<Usuario>(`${this.baseUrl}/${id}`, usuarioModificado),
    );
  }

  public async remove(id: number) {
    return firstValueFrom(this._httpClient.delete<Usuario>(`${this.baseUrl}/${id}`));
  }

  public async getPage(query: UsuariosQuery) {
    const params: Record<string, string | number | boolean> = {
      page: query.page,
      limit: query.limit,
      orden: query.orden,
      ordenar_por: query.ordenar_por,
    };
    // Los filtros vacíos no se envían
    if (query.nombre) {
      params['nombre'] = query.nombre;
    }
    if (query.grupo) {
      params['grupo'] = query.grupo;
    }
    if (query.activo !== undefined) {
      params['activo'] = query.activo;
    }

    return await firstValueFrom(this._httpClient.get<UsuariosPaginados>(this.baseUrl, { params }));
  }
}
