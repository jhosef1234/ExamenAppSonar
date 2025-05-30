import { Component } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { SupabaseService } from '../../../core/services/supabase.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {

  nombre: string = '';
  apellidos: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  telefono?: string;
  direccion?: string;
  selectedFile?: File;
  fechaNacimiento: Date | null = null;
  subdivisionId: number = 1;

  showPassword: boolean = false;
  silenceErrors: boolean = false; // para tests

  constructor(
    private authService: AuthService,
    private supabaseService: SupabaseService,
    private router: Router
  ) {}

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  async onSubmit() {
    // Validar campos vacíos
    if (!this.nombre || !this.apellidos || !this.email || !this.password || !this.confirmPassword) {
      Swal.fire('Error', 'Por favor completa todos los campos requeridos correctamente.', 'error');
      return;
    }

    // Validar que las contraseñas coincidan
    if (this.password !== this.confirmPassword) {
      Swal.fire('Error', 'Las contraseñas no coinciden.', 'error');
      return;
    }

    // Subir la imagen si existe
    let fotoPerfilUrl = '';
    if (this.selectedFile) {
      const supabaseClient = this.supabaseService.getClient();
      const { error: uploadError } = await supabaseClient
        .storage
        .from('avatars')
        .upload(`public/${this.selectedFile.name}`, this.selectedFile);

      if (uploadError) {
        Swal.fire('Error', 'No se pudo subir la imagen.', 'error');
        return;
      }

      const { data } = supabaseClient.storage.from('avatars').getPublicUrl(`public/${this.selectedFile.name}`);
      fotoPerfilUrl = data.publicUrl;
    }

    // Registrar usuario
    this.authService.register({
      email: this.email,
      password: this.password,
      nombre: this.nombre,
      apellidos: this.apellidos,
      telefono: this.telefono,
      direccion: this.direccion,
      fotoPerfilUrl: fotoPerfilUrl,
      fechaNacimiento: this.fechaNacimiento,
      subdivisionId: this.subdivisionId
    }).subscribe({
      next: () => {
        Swal.fire('Registrado', 'El usuario fue registrado correctamente.', 'success');
        this.router.navigate(['/login']);
      },
      error: () => {
        Swal.fire('Error', 'No se pudo registrar el usuario.', 'error');
      }
    });
  }
}
