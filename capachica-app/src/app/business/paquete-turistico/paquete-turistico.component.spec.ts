import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { PaqueteTuristicoComponent } from './paquete-turistico.component';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { PaqueteTuristicoService } from '../../core/services/paquetes-turisticos.service';
import { of, throwError } from 'rxjs';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('PaqueteTuristicoComponent', () => {
  let component: PaqueteTuristicoComponent;
  let fixture: ComponentFixture<PaqueteTuristicoComponent>;
  let paqueteService: jasmine.SpyObj<PaqueteTuristicoService>;
  let router: Router;

  beforeEach(fakeAsync(() => {
    paqueteService = jasmine.createSpyObj('PaqueteTuristicoService', ['listarPaquetesTuristicos', 'eliminarPaqueteTuristico']);

    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes([]),
        CommonModule,
        FormsModule,
        HttpClientModule,
        PaqueteTuristicoComponent
      ],
      providers: [
        { provide: PaqueteTuristicoService, useValue: paqueteService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(PaqueteTuristicoComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    spyOn(router, 'navigate');
    spyOn(Swal, 'fire').and.returnValue(Promise.resolve({ isConfirmed: true }) as any);
  }));

  it('should create', fakeAsync(() => {
    paqueteService.listarPaquetesTuristicos.and.returnValue(of([]));
    fixture.detectChanges();
    tick();
    expect(component).toBeTruthy();
  }));

  it('should call cargarPaquetes and populate paquetes', fakeAsync(() => {
    const paquetesMock = [
      { id: 1, nombre: 'Paquete 1', descripcion: 'Desc', precio: 100, estado: 'activo' },
      { id: 2, nombre: 'Paquete 2', descripcion: 'Desc', precio: 200, estado: 'inactivo' }
    ];
    paqueteService.listarPaquetesTuristicos.and.returnValue(of(paquetesMock));
    fixture.detectChanges();
    tick();
    expect(component.paquetes.length).toBe(2);
    expect(component.paquetesFiltrados.length).toBe(2);
    expect(component.isLoading).toBeFalse();
  }));

  it('should handle error on cargarPaquetes', fakeAsync(() => {
    paqueteService.listarPaquetesTuristicos.and.returnValue(throwError(() => new Error('fail')));
    fixture.detectChanges();
    tick();
    expect(component.paquetes.length).toBe(0);
    expect(component.isLoading).toBeTrue();
  }));

  it('should navigate on editar()', fakeAsync(() => {
    component.editar('5');
    expect(router.navigate).toHaveBeenCalledWith(['/editpaqueteturistico/5']);
  }));

  it('should call eliminar and reload data if confirmed', fakeAsync(() => {
    paqueteService.eliminarPaqueteTuristico.and.returnValue(of({}));
    paqueteService.listarPaquetesTuristicos.and.returnValue(of([]));
    component.eliminar(1);
    tick();
    expect(paqueteService.eliminarPaqueteTuristico).toHaveBeenCalledWith(1);
    expect(Swal.fire).toHaveBeenCalled();
  }));

  it('should handle error on eliminar()', fakeAsync(() => {
    paqueteService.eliminarPaqueteTuristico.and.returnValue(throwError(() => new Error('fail')));
    component.eliminar(2);
    tick();
    expect(Swal.fire).toHaveBeenCalledWith(jasmine.objectContaining({ icon: 'error' }));
  }));
});
