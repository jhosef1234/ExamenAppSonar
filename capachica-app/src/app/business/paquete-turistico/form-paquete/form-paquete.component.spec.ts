import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FormPaqueteComponent } from './form-paquete.component';
import { PaqueteTuristicoService } from '../../../core/services/paquetes-turisticos.service';
import { ServiciosService } from '../../../core/services/servicios.service';
import { EmprendimientoService } from '../../../core/services/emprendimiento.service';
import { SupabaseService } from '../../../core/services/supabase.service';
import { Router } from '@angular/router';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import Swal from 'sweetalert2';
import { of, throwError } from 'rxjs';
import { FormBuilder, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('FormPaqueteComponent', () => {
  let component: FormPaqueteComponent;
  let fixture: ComponentFixture<FormPaqueteComponent>;
  let paqueteService: jasmine.SpyObj<PaqueteTuristicoService>;
  let serviciosService: jasmine.SpyObj<ServiciosService>;
  let emprendimientoService: jasmine.SpyObj<EmprendimientoService>;
  let supabaseService: jasmine.SpyObj<SupabaseService>;
  let routerNavigate: jasmine.Spy;

  beforeEach(fakeAsync(async () => {
    paqueteService = jasmine.createSpyObj('PaqueteTuristicoService', ['crearPaqueteTuristico', 'actualizarPaqueteTuristico', 'obtenerPaqueteTuristico']);
    serviciosService = jasmine.createSpyObj('ServiciosService', ['listarServicios']);
    emprendimientoService = jasmine.createSpyObj('EmprendimientoService', ['listarEmprendimientos']);
    supabaseService = jasmine.createSpyObj('SupabaseService', ['getClient']);

    spyOn(console, 'error'); // Silencia errores en consola

    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes([]),
        ReactiveFormsModule,
        FormsModule,
        CommonModule,
        HttpClientTestingModule,
        FormPaqueteComponent
      ],
      providers: [
        FormBuilder,
        { provide: PaqueteTuristicoService, useValue: paqueteService },
        { provide: ServiciosService, useValue: serviciosService },
        { provide: EmprendimientoService, useValue: emprendimientoService },
        { provide: SupabaseService, useValue: supabaseService },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap({}) } }
        }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(FormPaqueteComponent);
    component = fixture.componentInstance;

    const router = TestBed.inject(Router);
    routerNavigate = spyOn(router, 'navigate');
    spyOn(Swal, 'fire');

    emprendimientoService.listarEmprendimientos.and.returnValue(of([{ id:1, nombre:'E1' }]));
    serviciosService.listarServicios.and.returnValue(of([{ id:11 }, { id:22 }]));

    fixture.detectChanges();
    tick();
  }));

  it('should create component and load dropdowns', () => {
    expect(component).toBeTruthy();
    expect(component.emprendimientos.length).toBe(1);
    expect(component.serviciosDisponibles.length).toBe(2);
    expect(component.isLoadingEmpr).toBeFalse();
    expect(component.isLoadingServ).toBeFalse();
  });

  it('getServiciosSeleccionados returns selected ids', () => {
    expect(component.getServiciosSeleccionados()).toEqual([]);
    const fa = component.paqueteForm.get('servicios') as any;
    fa.at(0).setValue(true);
    expect(component.getServiciosSeleccionados()).toEqual([11]);
  });

  it('should show error alert on invalid form', () => {
    component.paqueteForm.patchValue({ nombre: '', descripcion: '' });
    component.guardarPaquete();
    expect(Swal.fire).toHaveBeenCalledWith(jasmine.objectContaining({ icon: 'error', title: 'Formulario incompleto' }));
    expect(paqueteService.crearPaqueteTuristico).not.toHaveBeenCalled();
  });

  it('should navigate away on cancelar()', fakeAsync(() => {
    component.cancelar();
    tick();
    expect(routerNavigate).toHaveBeenCalledWith(['/paquetes']);
  }));

  it('should create paquete successfully', fakeAsync(() => {
    component.paqueteForm.patchValue({
      nombre: 'Paq', descripcion: 'Desc', precio: 100, estado: 'activo', emprendimientoId: '1'
    });
    const fa = component.paqueteForm.get('servicios') as any;
    fa.at(0).setValue(false);
    paqueteService.crearPaqueteTuristico.and.returnValue(of({}));

    component.guardarPaquete();
    tick();

    expect(paqueteService.crearPaqueteTuristico).toHaveBeenCalled();
    expect(Swal.fire).toHaveBeenCalledWith('Registrado', 'El paquete fue registrado correctamente.', 'success');
    expect(routerNavigate).toHaveBeenCalledWith(['/paquetes']);
  }));

  it('should show error if create fails', fakeAsync(() => {
    component.paqueteForm.patchValue({ nombre: 'P', descripcion: 'D', precio: 10, estado: 'activo', emprendimientoId: '1' });
    paqueteService.crearPaqueteTuristico.and.returnValue(throwError(() => new Error('fail')));

    component.guardarPaquete();
    tick();

    expect(Swal.fire).toHaveBeenCalledWith('Error', 'Ocurrió un problema al guardar el paquete.', 'error');
    expect(routerNavigate).not.toHaveBeenCalledWith(['/paquetes']);
  }));
});
