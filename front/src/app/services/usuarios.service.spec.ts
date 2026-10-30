import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { UsuariosService } from './usuarios.service';

describe('UsuariosService', () => {
  let service: UsuariosService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(UsuariosService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getPage envía solo paginación y orden cuando no hay filtros', async () => {
    const promesa = service.getPage({
      page: 1,
      limit: 10,
      orden: 'asc',
      ordenar_por: 'id_usuario',
    });

    const req = http.expectOne((r) => r.url.endsWith('/usuarios'));
    expect(req.request.params.keys().sort()).toEqual(['limit', 'orden', 'ordenar_por', 'page']);
    req.flush({ data: [], meta: { total: 0, page: 1, limit: 10, last_page: 1 } });
    await promesa;
  });

  it('getPage envía los filtros nombre, grupo y activo (incluido activo=false)', async () => {
    const promesa = service.getPage({
      page: 2,
      limit: 5,
      orden: 'desc',
      ordenar_por: 'apellidos',
      nombre: 'ana',
      grupo: 'admin',
      activo: false,
    });

    const req = http.expectOne((r) => r.url.endsWith('/usuarios'));
    expect(req.request.params.get('page')).toBe('2');
    expect(req.request.params.get('limit')).toBe('5');
    expect(req.request.params.get('orden')).toBe('desc');
    expect(req.request.params.get('ordenar_por')).toBe('apellidos');
    expect(req.request.params.get('nombre')).toBe('ana');
    expect(req.request.params.get('grupo')).toBe('admin');
    expect(req.request.params.get('activo')).toBe('false');
    req.flush({ data: [], meta: { total: 0, page: 2, limit: 5, last_page: 1 } });
    await promesa;
  });
});
