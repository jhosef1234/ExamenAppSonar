import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { VerificationCodeComponent } from './verification-code.component';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import Swal from 'sweetalert2';
import { of, throwError } from 'rxjs';

describe('VerificationCodeComponent', () => {
  let component: VerificationCodeComponent;
  let fixture: ComponentFixture<VerificationCodeComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let routerNavigate: jasmine.Spy;

  beforeEach(async () => {
    authService = jasmine.createSpyObj('AuthService', ['resetPassword']);

    spyOn(console, 'error'); // Silencia errores en consola durante tests

    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes([]),
        VerificationCodeComponent  // Componente standalone
      ],
      providers: [
        { provide: AuthService, useValue: authService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(VerificationCodeComponent);
    component = fixture.componentInstance;

    const realRouter = TestBed.inject(Router);
    routerNavigate = spyOn(realRouter, 'navigate');

    spyOn(Swal, 'fire');

    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should warn if token or newPassword is missing', () => {
    component.token = '';
    component.newPassword = '';
    component.verificarcodigo();

    expect(Swal.fire).toHaveBeenCalledWith(jasmine.objectContaining({
      icon: 'warning',
      title: 'Campos incompletos',
      text: 'Por favor, ingresa un token y una nueva contraseña.',
      confirmButtonText: 'Aceptar'
    }));
    expect(authService.resetPassword).not.toHaveBeenCalled();
    expect(routerNavigate).not.toHaveBeenCalled();
  });

  it('should reset password and navigate on success', fakeAsync(() => {
    component.token = 'abc123';
    component.newPassword = 'newpass';
    authService.resetPassword.and.returnValue(of({}));

    (Swal.fire as jasmine.Spy).and.callFake(() => ({
      then: (cb: () => void) => { cb(); return null; }
    } as any));

    component.verificarcodigo();
    tick();
    tick();

    expect(authService.resetPassword).toHaveBeenCalledWith('abc123', 'newpass');
    expect(Swal.fire).toHaveBeenCalledWith(jasmine.objectContaining({
      icon: 'success',
      title: '¡Contraseña reseteada!',
      text: 'Tu contraseña se ha actualizado correctamente.',
      confirmButtonText: 'Aceptar'
    }));
    expect(routerNavigate).toHaveBeenCalledWith(['/login']);
  }));

  it('should show error on reset failure', fakeAsync(() => {
    component.token = 'xyz';
    component.newPassword = 'pass123';
    authService.resetPassword.and.returnValue(throwError(() => new Error('fail')));

    component.verificarcodigo();
    tick();

    expect(Swal.fire).toHaveBeenCalledWith(jasmine.objectContaining({
      icon: 'error',
      title: '¡Error!',
      text: 'Hubo un problema al resetear la contraseña. Intenta de nuevo.',
      confirmButtonText: 'Aceptar'
    }));
    expect(routerNavigate).not.toHaveBeenCalled();
  }));
});
