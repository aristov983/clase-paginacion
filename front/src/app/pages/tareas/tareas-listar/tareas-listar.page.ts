import { Component, computed, inject, linkedSignal, resource, signal } from '@angular/core';
import { debounce, form, FormField } from '@angular/forms/signals';
import { DatePipe } from '@angular/common';
import { Grupo, Orden } from '../../../model/usuario';
import {
  EstadoTarea,
  Prioridad,
  Tarea,
  TareasOrdenarPor,
  TareasPaginadas,
} from '../../../model/tarea';
import { TareasService } from '../../../services/tareas.service';

//Lo que el usuario escribe/elige en los filtros. Los selects trabajan con strings,
//por eso '' significa "todos".
type FiltrosTareas = {
  titulo: string;
  estado: '' | EstadoTarea;
  prioridad: '' | Prioridad;
  grupo: '' | Grupo;
  ordenar_por: TareasOrdenarPor;
};

const FILTROS_INICIALES: FiltrosTareas = {
  titulo: '',
  estado: '',
  prioridad: '',
  grupo: '',
  ordenar_por: 'creada',
};

const PAGINA_VACIA: TareasPaginadas = {
  data: [],
  meta: {
    total: 0,
    page: 1,
    limit: 10,
    last_page: 1,
  },
};

@Component({
  imports: [DatePipe, FormField],
  selector: 'app-tareas-listar',
  styleUrl: './tareas-listar.page.css',
  templateUrl: './tareas-listar.page.html',
})
export class TareasListarPage {
  private tareasService = inject(TareasService);

  //Filtros + campo de orden: modelo (signal) y formulario de signals sobre ese modelo.
  //El título se aplica 300 ms después de dejar de escribir, para no pedir en cada tecla.
  public filtros = signal<FiltrosTareas>({ ...FILTROS_INICIALES });
  public filtrosForm = form(this.filtros, (campos) => {
    debounce(campos.titulo, 300);
  });

  //lo que el usuario puede cambiar con botones/selects de la paginación
  public limit = signal(10);
  public orden = signal<Orden>('desc'); //las más nuevas primero

  //todo lo que, al cambiar, cambia el conjunto de resultados
  private criterios = computed(() => {
    const filtros = this.filtrosForm().value();
    return {
      limit: this.limit(),
      orden: this.orden(),
      ordenar_por: filtros.ordenar_por,
      titulo: filtros.titulo.trim() || undefined,
      estado: filtros.estado || undefined,
      prioridad: filtros.prioridad || undefined,
      grupo: filtros.grupo || undefined,
    };
  });

  //la página se escribe a mano (anterior/siguiente), pero vuelve a 1 sola cada vez que cambian los criterios
  public page = linkedSignal({ source: this.criterios, computation: () => 1 });

  //el resource se vuelve a ejecutar solo cuando cambia la página o algún criterio
  public tareasResource = resource({
    defaultValue: PAGINA_VACIA,
    params: () => ({ page: this.page(), ...this.criterios() }),
    loader: ({ params }) => this.tareasService.getPage(params),
  });

  //datos derivados de la respuesta (si la petición falla, value() lanza error: por eso hasValue())
  private respuesta = computed(() =>
    this.tareasResource.hasValue() ? this.tareasResource.value() : PAGINA_VACIA,
  );

  public tareas = computed<Tarea[]>(() => this.respuesta().data);

  public totalTareas = computed(() => this.respuesta().meta.total);

  public lastPage = computed(() => this.respuesta().meta.last_page);

  //'1:media' -> 'media' (el número del prefijo solo sirve para ordenar)
  public etiquetaPrioridad(prioridad: Prioridad) {
    return prioridad.split(':')[1];
  }

  public limpiarFiltros() {
    this.filtros.set({ ...FILTROS_INICIALES });
    this.orden.set('desc');
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
}

export default TareasListarPage;
