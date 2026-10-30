import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { ListarUsuariosPage } from './listar-usuarios.page';
import { UsuariosPaginados } from '../../../model/usuario';

const respuesta = (page = 1, last_page = 5): UsuariosPaginados => ({
  data: [
    {
      id_usuario: 1,
      username: 'admin',
      nombres: 'Ana',
      apellidos: 'Pérez',
      fecha_nacimiento: '1990-01-01',
      grupos: ['admin'],
      activo: true,
    },
  ],
  meta: { total: 42, page, limit: 10, last_page },
});

describe('ListarUsuariosPage', () => {
  let component: ListarUsuariosPage;
  let fixture: ComponentFixture<ListarUsuariosPage>;
  let http: HttpTestingController;

  //atiende la petición pendiente y devuelve sus parámetros
  const atender = (page = 1) => {
    const req = http.expectOne((r) => r.url.endsWith('/usuarios'));
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
      imports: [ListarUsuariosPage],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(ListarUsuariosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => http.verify());

  it('should create', async () => {
    atender();
    await fixture.whenStable();
    expect(component).toBeTruthy();
  });

  it('pide la primera página sin filtros y muestra los usuarios', async () => {
    const params = atender();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(params.get('page')).toBe('1');
    expect(params.get('limit')).toBe('10');
    expect(params.get('orden')).toBe('asc');
    expect(params.get('ordenar_por')).toBe('id_usuario');
    expect(params.has('nombre')).toBe(false);
    expect(params.has('grupo')).toBe(false);
    expect(params.has('activo')).toBe(false);
    expect(fixture.nativeElement.textContent).toContain('Pérez');
    expect(fixture.nativeElement.textContent).toContain('Lista de usuarios (42)');
  });

  it('filtrar por grupo y estado vuelve a la página 1 y envía los filtros', async () => {
    atender();
    await fixture.whenStable();

    component.page.set(3);
    fixture.detectChanges();
    expect(atender(3).get('page')).toBe('3');
    await fixture.whenStable();

    elegir('filtro-grupo', 'admin');
    const params = atender();
    expect(params.get('grupo')).toBe('admin');
    expect(params.get('page')).toBe('1');
    expect(component.page()).toBe(1);
    await fixture.whenStable();

    elegir('filtro-activo', 'false');
    const params2 = atender();
    expect(params2.get('grupo')).toBe('admin');
    expect(params2.get('activo')).toBe('false');
  });

  it('ordenar por otro campo y en sentido descendente', async () => {
    atender();
    await fixture.whenStable();

    elegir('orden-por', 'apellidos');
    expect(atender().get('ordenar_por')).toBe('apellidos');
    await fixture.whenStable();

    component.cambiarOrden('desc');
    fixture.detectChanges();
    const params = atender();
    expect(params.get('ordenar_por')).toBe('apellidos');
    expect(params.get('orden')).toBe('desc');
  });

  it('el nombre se envía recién después de dejar de escribir (debounce)', async () => {
    atender();
    await fixture.whenStable();

    const input = fixture.nativeElement.querySelector('input[type="text"]') as HTMLInputElement;
    input.value = '  ana ';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    http.expectNone((r) => r.url.endsWith('/usuarios'));

    await new Promise((resolve) => setTimeout(resolve, 400));
    fixture.detectChanges();
    expect(atender().get('nombre')).toBe('ana');
  });

  it('limpiar filtros vuelve a los valores iniciales', async () => {
    atender();
    await fixture.whenStable();

    elegir('filtro-grupo', 'user');
    atender();
    await fixture.whenStable();

    component.limpiarFiltros();
    fixture.detectChanges();
    const params = atender();
    expect(params.has('grupo')).toBe(false);
    expect(params.get('ordenar_por')).toBe('id_usuario');
  });

  it('si la petición falla muestra un mensaje en vez de romperse', async () => {
    http
      .expectOne((r) => r.url.endsWith('/usuarios'))
      .flush('error', { status: 500, statusText: 'Server Error' });
    await fixture.whenStable();
    fixture.detectChanges();

    expect(component.usuarios()).toEqual([]);
    expect(fixture.nativeElement.textContent).toContain('No se pudieron cargar los usuarios.');
  });
});
