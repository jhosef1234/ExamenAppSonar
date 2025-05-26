import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { PasswordRecoveryComponent } from './password-recovery.component';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import Swal from 'sweetalert2';
import { of, throwError } from 'rxjs';

describe('PasswordRecoveryComponent', () => {
  let component: PasswordRecoveryComponent;
  let fixture: ComponentFixture<PasswordRecoveryComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let router: Router;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['requestPasswordReset']);

    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes([]),
        PasswordRecoveryComponent
      ],
      providers: [
        { provide: AuthService, useValue: authServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PasswordRecoveryComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);

    spyOn(router, 'navigate');
    spyOn(Swal, 'fire');

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have empty email by default', () => {
    expect(component.email).toBe('');
  });

  it('should navigate to /verificacioncodigo on successful verification', fakeAsync(() => {
    const response = { success: true };
    authServiceSpy.requestPasswordReset.and.returnValue(of(response));
    component.email = 'test@example.com';

    component.verificar();
    tick();

    expect(authServiceSpy.requestPasswordReset).toHaveBeenCalledWith('test@example.com');
    expect(router.navigate).toHaveBeenCalledWith(['/verificacioncodigo']);
  }));

  it('should show error Swal on request failure', fakeAsync(() => {
    authServiceSpy.requestPasswordReset.and.returnValue(throwError(() => ({ status: 500 })));
    component.email = 'user@domain.com';

    component.verificar();
    tick();

    expect(Swal.fire).toHaveBeenCalledWith(jasmine.objectContaining({
      icon: 'error',
      title: 'Error',
      text: 'Hubo un problema al solicitar el reseteo de la contraseña. Por favor, intenta nuevamente.',
      confirmButtonText: 'Aceptar'
    }));
    expect(router.navigate).not.toHaveBeenCalled();
  }));

  it('should show warning Swal when email is empty', () => {
    component.email = '';

    component.verificar();

    expect(Swal.fire).toHaveBeenCalledWith(jasmine.objectContaining({
      icon: 'warning',
      title: 'Advertencia',
      text: 'Por favor, ingresa un correo electrónico válido.',
      confirmButtonText: 'Aceptar'
    }));
    expect(authServiceSpy.requestPasswordReset).not.toHaveBeenCalled();
    expect(router.navigate).not.toHaveBeenCalled();
  });
});
