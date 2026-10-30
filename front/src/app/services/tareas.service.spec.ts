import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TareasService } from './tareas.service';

describe('TareasService', () => {
  let service: TareasService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(TareasService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getPage envía solo paginación y orden cuando no hay filtros', async () => {
    const promesa = service.getPage({ page: 1, limit: 10, orden: 'desc', ordenar_por: 'creada' });

    const req = http.expectOne((r) => r.url.endsWith('/tareas'));
    expect(req.request.params.keys().sort()).toEqual(['limit', 'orden', 'ordenar_por', 'page']);
    req.flush({ data: [], meta: { total: 0, page: 1, limit: 10, last_page: 1 } });
    await promesa;
  });

  it('getPage envía los filtros titulo, estado, prioridad y grupo', async () => {
    const promesa = service.getPage({
      page: 3,
      limit: 20,
      orden: 'asc',
      ordenar_por: 'prioridad',
      titulo: 'urgente',
      estado: 'Abierta',
      prioridad: '2:alta',
      grupo: 'user',
    });

    const req = http.expectOne((r) => r.url.endsWith('/tareas'));
    expect(req.request.params.get('page')).toBe('3');
    expect(req.request.params.get('limit')).toBe('20');
    expect(req.request.params.get('orden')).toBe('asc');
    expect(req.request.params.get('ordenar_por')).toBe('prioridad');
    expect(req.request.params.get('titulo')).toBe('urgente');
    expect(req.request.params.get('estado')).toBe('Abierta');
    expect(req.request.params.get('prioridad')).toBe('2:alta');
    expect(req.request.params.get('grupo')).toBe('user');
    req.flush({ data: [], meta: { total: 0, page: 3, limit: 20, last_page: 3 } });
    await promesa;
  });
});
