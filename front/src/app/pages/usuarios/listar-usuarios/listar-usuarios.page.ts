import {
  Component,
  computed,
  ElementRef,
  inject,
  OnInit,
  resource,
  signal,
  viewChild,
} from '@angular/core';
import { Orden, Usuario, UsuariosPaginados } from '../../../model/usuario';
import { Router, RouterLink } from '@angular/router';
import { UsuariosService } from '../../../services/usuarios.service';
import { DatePipe, UpperCasePipe } from '@angular/common';
@Component({
  selector: 'app-listar-usuarios',
  styleUrl: './listar-usuarios.page.css',
  templateUrl: './listar-usuarios.page.html',
  imports: [DatePipe, RouterLink],
})
export class ListarUsuariosPage implements OnInit {
  private router = inject(Router);
  private usuarioService = inject(UsuariosService); //Inyección de dependencias.

  //lo que el usuario puede cambiar
  public page = signal(1);
  public limit = signal(5);
  public orden = signal<Orden>('asc');
  public nombre = signal('');

  //el resource se vuelve a ejecutar solo cuando cambia page, limit o orden
  public usuariosResource = resource({
    defaultValue: {
      data: [],
      meta: {
        total: 0,
        page: 1,
        limit: 10,
        last_page: 1,
      },
    } as UsuariosPaginados,
    params: () => ({
      page: this.page(),
      limit: this.limit(),
      orden: this.orden(),
      nombre: this.nombre(),
    }),
    loader: ({ params }) => {
      return this.usuarioService.getPage(params.page, params.limit, params.orden, params.nombre);
    },
  });

  //datos derivados de la respuesta
  public usuarios = computed<Usuario[]>(() => this.usuariosResource.value().data);

  public totalUsuarios = computed(() => this.usuariosResource.value().meta.total);

  public lastPage = computed(() => this.usuariosResource.value().meta.last_page);

  public async ngOnInit(): Promise<void> {}

  public goToCrear() {
    this.router.navigate(['/', 'usuarios', 'create']);
  }

  public buscar(texto: string) {
    this.nombre.set(texto.trim());
    this.page.set(1);
  }

  public cambiarOrden(orden: Orden) {
    this.orden.set(orden);
    this.page.set(1); //reinicio la página a 1
  }

  public paginaAnterior() {
    this.page.update((p) => p - 1);
  }

  public paginaSiguiente() {
    this.page.update((p) => p + 1);
  }

  public async borrarUsuario(id_usuario: number) {
    await this.usuarioService.remove(id_usuario);
    this.usuariosResource.reload();
  }
}

export default ListarUsuariosPage;
