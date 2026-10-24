import { inject, Service } from '@angular/core';
import { Usuario } from '../model/usuario';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

@Service()
export class UsuariosService {
  private baseUrl = environment.apiUrl + '/usuarios';
  private _httpClient = inject(HttpClient);

  public async getAll() {
    const users = await firstValueFrom(this._httpClient.get<{ data: Usuario[], meta: any }>(this.baseUrl));
    return users.data
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
}
