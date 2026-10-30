import { Component, computed, inject, linkedSignal, resource, signal } from '@angular/core';
import { debounce, form, FormField } from '@angular/forms/signals';
import {
  Grupo,
  Orden,
  Usuario,
  UsuariosOrdenarPor,
  UsuariosPaginados,
} from '../../../model/usuario';
import { Router, RouterLink } from '@angular/router';
import { UsuariosService } from '../../../services/usuarios.service';
import { DatePipe } from '@angular/common';

//Lo que el usuario escribe/elige en los filtros. Los selects trabajan con strings,
//por eso '' significa "todos" y activo es 'true' | 'false' (se convierte al consultar).
type FiltrosUsuarios = {
  nombre: string;
  grupo: '' | Grupo;
  activo: '' | 'true' | 'false';
  ordenar_por: UsuariosOrdenarPor;
};

const FILTROS_INICIALES: FiltrosUsuarios = {
  nombre: '',
  grupo: '',
  activo: '',
  ordenar_por: 'id_usuario',
};

const PAGINA_VACIA: UsuariosPaginados = {
  data: [],
  meta: {
    total: 0,
    page: 1,
    limit: 10,
    last_page: 1,
  },
};

@Component({
  selector: 'app-listar-usuarios',
  styleUrl: './listar-usuarios.page.css',
  templateUrl: './listar-usuarios.page.html',
  imports: [DatePipe, RouterLink, FormField],
})
export class ListarUsuariosPage {
  private router = inject(Router);
  private usuarioService = inject(UsuariosService); //Inyección de dependencias.

  //Filtros + campo de orden: modelo (signal) y formulario de signals sobre ese modelo.
  //El nombre se aplica 300 ms después de dejar de escribir, para no pedir en cada tecla.
  public filtros = signal<FiltrosUsuarios>({ ...FILTROS_INICIALES });
  public filtrosForm = form(this.filtros, (campos) => {
    debounce(campos.nombre, 300);
  });

  //lo que el usuario puede cambiar con botones/selects de la paginación
  public limit = signal(10);
  public orden = signal<Orden>('asc');

  //todo lo que, al cambiar, cambia el conjunto de resultados
  private criterios = computed(() => {
    const filtros = this.filtrosForm().value();
    return {
      limit: this.limit(),
      orden: this.orden(),
      ordenar_por: filtros.ordenar_por,
      nombre: filtros.nombre.trim() || undefined,
      grupo: filtros.grupo || undefined,
      activo: filtros.activo === '' ? undefined : filtros.activo === 'true',
    };
  });

  //la página se escribe a mano (anterior/siguiente), pero vuelve a 1 sola cada vez que cambian los criterios
  public page = linkedSignal({ source: this.criterios, computation: () => 1 });

  //el resource se vuelve a ejecutar solo cuando cambia la página o algún criterio
  public usuariosResource = resource({
    defaultValue: PAGINA_VACIA,
    params: () => ({ page: this.page(), ...this.criterios() }),
    loader: ({ params }) => this.usuarioService.getPage(params),
  });

  //datos derivados de la respuesta (si la petición falla, value() lanza error: por eso hasValue())
  private respuesta = computed(() =>
    this.usuariosResource.hasValue() ? this.usuariosResource.value() : PAGINA_VACIA,
  );

  public usuarios = computed<Usuario[]>(() => this.respuesta().data);

  public totalUsuarios = computed(() => this.respuesta().meta.total);

  public lastPage = computed(() => this.respuesta().meta.last_page);

  public goToCrear() {
    this.router.navigate(['/', 'usuarios', 'create']);
  }

  public limpiarFiltros() {
    this.filtros.set({ ...FILTROS_INICIALES });
    this.orden.set('asc');
  }

  public cambiarOrden(orden: Orden) {
    this.orden.set(orden); //la página vuelve a 1 sola (linkedSignal)
  }

  public cambiarLimite(valor: string) {
    this.limit.set(Number(valor));
  }

  public paginaAnterior() {
    this.page.update((p) => p - 1);
  }

  public paginaSiguiente() {
    this.page.update((p) => p + 1);
  }

  public async borrarUsuario(id_usuario: number) {
    await this.usuarioService.remove(id_usuario);
    //si era el único de la última página, retrocedo para no quedar en una página vacía
    if (this.usuarios().length === 1 && this.page() > 1) {
      this.page.update((p) => p - 1);
    } else {
      this.usuariosResource.reload();
    }
  }
}

export default ListarUsuariosPage;
