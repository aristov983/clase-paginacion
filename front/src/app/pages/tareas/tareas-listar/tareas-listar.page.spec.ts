import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TareasListarPage } from './tareas-listar.page';
import { TareasPaginadas } from '../../../model/tarea';

const respuesta = (page = 1, last_page = 5): TareasPaginadas => ({
  data: [
    {
      id_tarea: 7,
      id_creador: 1,
      grupo: 'admin',
      titulo: 'Preparar informe',
      descripcion: 'Informe mensual',
      prioridad: '2:alta',
      creada: '2026-10-01T10:00:00.000Z',
      terminada: null,
      estado: 'Abierta',
    },
  ],
  meta: { total: 33, page, limit: 10, last_page },
});

describe('TareasListarPage', () => {
  let component: TareasListarPage;
  let fixture: ComponentFixture<TareasListarPage>;
  let http: HttpTestingController;

  //atiende la petición pendiente y devuelve sus parámetros
  const atender = (page = 1) => {
    const req = http.expectOne((r) => r.url.endsWith('/tareas'));
    req.flush(respuesta(page));
    return req.request.params;
  };

  //simula que el usuario elige una opción (signal forms escucha el evento 'input')
  //no se espera whenStable acá: la petición queda pendiente hasta que el test la atienda
  const elegir = (id: string, valor: string) => {
    const select = fixture.nativeElement.querySelector(`#${id}`) as HTMLSelectElement;
    select.value = valor;
    select.dispatchEvent(new Event('input'));
    fixture.detectChanges();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TareasListarPage],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(TareasListarPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => http.verify());

  it('should create', async () => {
    atender();
    await fixture.whenStable();
    expect(component).toBeTruthy();
  });

  it('pide la primera página (más nuevas primero) y muestra las tareas', async () => {
    const params = atender();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(params.get('page')).toBe('1');
    expect(params.get('limit')).toBe('10');
    expect(params.get('orden')).toBe('desc');
    expect(params.get('ordenar_por')).toBe('creada');
    expect(params.has('titulo')).toBe(false);
    expect(params.has('estado')).toBe(false);
    expect(params.has('prioridad')).toBe(false);
    expect(params.has('grupo')).toBe(false);
    expect(fixture.nativeElement.textContent).toContain('Preparar informe');
    expect(fixture.nativeElement.textContent).toContain('Lista de tareas (33)');
    expect(component.etiquetaPrioridad('2:alta')).toBe('alta');
  });

  it('filtrar por estado, prioridad y grupo vuelve a la página 1', async () => {
    atender();
    await fixture.whenStable();

    component.page.set(2);
    fixture.detectChanges();
    expect(atender(2).get('page')).toBe('2');
    await fixture.whenStable();

    elegir('filtro-estado', 'Cerrada');
    const params = atender();
    expect(params.get('estado')).toBe('Cerrada');
    expect(params.get('page')).toBe('1');
    await fixture.whenStable();

    elegir('filtro-prioridad', '0:baja');
    atender();
    await fixture.whenStable();

    elegir('filtro-grupo', 'superadmin');
    const final = atender();
    expect(final.get('estado')).toBe('Cerrada');
    expect(final.get('prioridad')).toBe('0:baja');
    expect(final.get('grupo')).toBe('superadmin');
  });

  it('ordenar por prioridad en sentido ascendente', async () => {
    atender();
    await fixture.whenStable();

    elegir('orden-por', 'prioridad');
    atender();
    await fixture.whenStable();

    component.cambiarOrden('asc');
    fixture.detectChanges();
    const params = atender();
    expect(params.get('ordenar_por')).toBe('prioridad');
    expect(params.get('orden')).toBe('asc');
  });

  it('el título se envía recién después de dejar de escribir (debounce)', async () => {
    atender();
    await fixture.whenStable();

    const input = fixture.nativeElement.querySelector('input[type="text"]') as HTMLInputElement;
    input.value = 'informe';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    http.expectNone((r) => r.url.endsWith('/tareas'));

    await new Promise((resolve) => setTimeout(resolve, 400));
    fixture.detectChanges();
    expect(atender().get('titulo')).toBe('informe');
  });

  it('limpiar filtros vuelve a los valores iniciales', async () => {
    atender();
    await fixture.whenStable();

    elegir('filtro-estado', 'Abierta');
    atender();
    await fixture.whenStable();

    component.limpiarFiltros();
    fixture.detectChanges();
    const params = atender();
    expect(params.has('estado')).toBe(false);
    expect(params.get('orden')).toBe('desc');
    expect(params.get('ordenar_por')).toBe('creada');
  });

  it('si la petición falla muestra un mensaje en vez de romperse', async () => {
    http
      .expectOne((r) => r.url.endsWith('/tareas'))
      .flush('error', { status: 500, statusText: 'Server Error' });
    await fixture.whenStable();
    fixture.detectChanges();

    expect(component.tareas()).toEqual([]);
    expect(fixture.nativeElement.textContent).toContain('No se pudieron cargar las tareas.');
  });
});
