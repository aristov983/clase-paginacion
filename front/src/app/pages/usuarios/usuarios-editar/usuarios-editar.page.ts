import { Component, computed, inject, input, resource } from '@angular/core';

import { UsuariosService } from '../../../services/usuarios.service';
import { UsuarioForm } from '../../../components/usuario/usuario.form';
import { Usuario } from '../../../model/usuario';
import { Router } from '@angular/router';
import { NotificationService } from '../../../shared/services/notification.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  imports: [UsuarioForm],
  selector: 'app-usuarios-editar',
  styleUrl: './usuarios-editar.page.css',
  templateUrl: './usuarios-editar.page.html',
})
export class UsuariosEditarPage {
  private readonly usuariosService = inject(UsuariosService);
  private readonly router = inject(Router);
  private readonly notificationService = inject(NotificationService);

  public id_usuario = input.required<number, string>({
    transform: (value) => Number(value),
  });

  public usuarioResource = resource({
    params: () => {
      const id_usuario = this.id_usuario();
      if (!id_usuario) return undefined;
      return { id_usuario: id_usuario }; //este objeto se puede resumir
    },
    loader: async ({ params }) => {
      return this.usuariosService.getById(params.id_usuario);
    },
  });

  public usuario = computed(() => this.usuarioResource.value());

  public async onGuardarUsuario(usuario: Usuario) {
    try {
      await this.usuariosService.update(this.id_usuario(), usuario);
      this.router.navigate(['/', 'usuarios']);
    } catch (error: any) {
      this.notificationService.addErrorFromError(error);
    }
  }
}

export default UsuariosEditarPage;
