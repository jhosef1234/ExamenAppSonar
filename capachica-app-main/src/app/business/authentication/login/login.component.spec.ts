import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import Swal from 'sweetalert2';
import { of, throwError } from 'rxjs';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let router: Router;

  beforeEach(async () => {
    // Spy for AuthService
    authServiceSpy = jasmine.createSpyObj('AuthService', ['login']);

    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes([]),
        // Import the standalone component and its dependencies
        LoginComponent
      ],
      providers: [
        { provide: AuthService, useValue: authServiceSpy }
      ]
    }).compileComponents();

    // Create component instance
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;

    // Inject real Router and spy on navigate
    router = TestBed.inject(Router);
    spyOn(router, 'navigate');

    // Spy SweetAlert
    spyOn(Swal, 'fire');

    // Clear storage before each test
    localStorage.clear();

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have empty email and password by default', () => {
    expect(component.email).toBe('');
    expect(component.password).toBe('');
    expect(component.showPassword).toBeFalse();
  });

  it('should toggle password visibility', () => {
    component.togglePasswordVisibility();
    expect(component.showPassword).toBeTrue();
    component.togglePasswordVisibility();
    expect(component.showPassword).toBeFalse();
  });

  it('should navigate to menu on volverAlMenu', () => {
    component.volverAlMenu();
    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });

  describe('login()', () => {
    const dummyToken = 'ABC123';
    const dummyUser: any = { roles: [] };
    const successResponse: any = { access_token: dummyToken, usuario: dummyUser };

    beforeEach(() => {
      component.email = 'user@test.com';
      component.password = 'pass';
    });

    it('should login successfully as SuperAdmin', fakeAsync(() => {
      dummyUser.roles = ['SuperAdmin'];
      authServiceSpy.login.and.returnValue(of(successResponse));

      component.login();
      tick();

      expect(authServiceSpy.login).toHaveBeenCalledWith('user@test.com', 'pass');
      expect(localStorage.getItem('token')).toBe(dummyToken);
      expect(JSON.parse(localStorage.getItem('usuario')!)).toEqual(dummyUser);
      expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
      expect(Swal.fire).toHaveBeenCalledWith(jasmine.objectContaining({
        icon: 'success',
        title: '¡Bienvenido!',
        text: 'Has iniciado sesión como SuperAdmin.',
        confirmButtonText: 'Aceptar'
      }));
    }));

    it('should login successfully as Emprendedor', fakeAsync(() => {
      dummyUser.roles = ['Emprendedor'];
      authServiceSpy.login.and.returnValue(of(successResponse));

      component.login();
      tick();

      expect(router.navigate).toHaveBeenCalledWith(['/emprendimiento']);
      expect(Swal.fire).toHaveBeenCalledWith(jasmine.objectContaining({
        icon: 'success',
        title: '¡Bienvenido!',
        text: 'Has iniciado sesión como Emprendedor.',
        confirmButtonText: 'Aceptar'
      }));
    }));

    it('should login successfully with no specific role', fakeAsync(() => {
      dummyUser.roles = ['Usuario'];
      authServiceSpy.login.and.returnValue(of(successResponse));

      component.login();
      tick();

      expect(router.navigate).toHaveBeenCalledWith(['/']);
      expect(Swal.fire).toHaveBeenCalledWith(jasmine.objectContaining({
        icon: 'success',
        title: '¡Bienvenido!',
        text: 'Has iniciado sesión correctamente.',
        confirmButtonText: 'Aceptar'
      }));
    }));

    it('should show error on login failure', fakeAsync(() => {
      authServiceSpy.login.and.returnValue(throwError(() => ({ status: 401 })));

      component.login();
      tick();

      expect(Swal.fire).toHaveBeenCalledWith(jasmine.objectContaining({
        icon: 'error',
        title: '¡Error!',
        text: 'Hubo un problema al iniciar sesión. Verifica tus credenciales.',
        confirmButtonText: 'Aceptar'
      }));
    }));
  });
});
