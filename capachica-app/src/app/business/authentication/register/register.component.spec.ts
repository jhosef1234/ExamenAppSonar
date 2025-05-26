import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RegisterComponent } from './register.component';
import { AuthService } from '../../../core/services/auth.service';
import { SupabaseService } from '../../../core/services/supabase.service';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import Swal from 'sweetalert2';
import { of, throwError } from 'rxjs';
import type { SupabaseClient } from '@supabase/supabase-js';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let supabaseServiceSpy: jasmine.SpyObj<SupabaseService>;
  let router: Router;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['register']);
    supabaseServiceSpy = jasmine.createSpyObj('SupabaseService', ['getClient']);

    await TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes([]), RegisterComponent],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: SupabaseService, useValue: supabaseServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    spyOn(router, 'navigate');
    spyOn(Swal, 'fire');
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle password visibility', () => {
    expect(component.showPassword).toBeFalse();
    component.togglePasswordVisibility();
    expect(component.showPassword).toBeTrue();
  });

  it('should show error Swal if required fields are missing', () => {
    component.nombre = '';
    component.apellidos = '';
    component.email = '';
    component.password = '';
    component.confirmPassword = '';

    component.onSubmit();

    expect(Swal.fire).toHaveBeenCalledWith('Error', 'Por favor completa todos los campos requeridos correctamente.', 'error');
    expect(authServiceSpy.register).not.toHaveBeenCalled();
  });

  it('should register successfully without file and navigate to login', fakeAsync(() => {
    component.nombre = 'John';
    component.apellidos = 'Doe';
    component.email = 'john@doe.com';
    component.password = 'pass';
    component.confirmPassword = 'pass';
    authServiceSpy.register.and.returnValue(of({}));

    component.onSubmit();
    tick();

    expect(authServiceSpy.register).toHaveBeenCalledWith({
      email: 'john@doe.com',
      password: 'pass',
      nombre: 'John',
      apellidos: 'Doe',
      telefono: component.telefono,
      direccion: component.direccion,
      fotoPerfilUrl: '',
      fechaNacimiento: null,
      subdivisionId: 1
    });
    expect(Swal.fire).toHaveBeenCalledWith('Registrado', 'El usuario fue registrado correctamente.', 'success');
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  }));

  it('should show error Swal on register failure', fakeAsync(() => {
    component.nombre = 'Jane';
    component.apellidos = 'Doe';
    component.email = 'jane@doe.com';
    component.password = 'pass';
    component.confirmPassword = 'pass';
    authServiceSpy.register.and.returnValue(throwError(() => ({ status: 400 })));

    component.onSubmit();
    tick();

    expect(Swal.fire).toHaveBeenCalledWith('Error', 'No se pudo registrar el usuario.', 'error');
    expect(router.navigate).not.toHaveBeenCalled();
  }));

  it('should show error Swal and not register when image upload fails', fakeAsync(() => {
    component.nombre = 'Ann';
    component.apellidos = 'Smith';
    component.email = 'ann@smith.com';
    component.password = 'pass';
    component.confirmPassword = 'pass';
    const dummyFile = new File([''], 'avatar.png', { type: 'image/png' });
    component.selectedFile = dummyFile;

    // Mock Supabase client storage
    const bucketApi = {
      upload: jasmine.createSpy('upload').and.returnValue(Promise.resolve({ error: { message: 'Upload failed' } })),
      getPublicUrl: jasmine.createSpy('getPublicUrl').and.returnValue({ data: { publicUrl: 'url' } })
    };
    const storageStub = { from: jasmine.createSpy('from').and.returnValue(bucketApi) };
    const supabaseClientStub = { storage: storageStub } as unknown as SupabaseClient<any, any, any>;
    supabaseServiceSpy.getClient.and.returnValue(supabaseClientStub);

    component.onSubmit();
    tick();

    expect(Swal.fire).toHaveBeenCalledWith('Error', 'No se pudo subir la imagen.', 'error');
    expect(authServiceSpy.register).not.toHaveBeenCalled();
  }));
});
