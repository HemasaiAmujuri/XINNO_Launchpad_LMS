import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import * as THREE from 'three';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent implements OnInit, OnDestroy {
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  
  registerForm!: FormGroup;
  loading = false;
  error = '';
  success = '';

  courseTypes = [
    { value: 'FULL_STACK', label: 'Full Stack Development' },
    { value: 'CRT', label: 'Campus Recruitment Training (CRT)' },
    { value: 'ORACLE', label: 'Oracle Database & PL/SQL' },
    { value: 'EPM', label: 'Enterprise Performance Management (EPM)' },
    { value: 'OIC', label: 'Oracle Integration Cloud (OIC)' }
  ];

  courseLevels = [
    { value: 'BEGINNER', label: 'Beginner' },
    { value: 'INTERMEDIATE', label: 'Intermediate' },
    { value: 'ADVANCED', label: 'Advanced' }
  ];

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private particles: THREE.Points[] = [];
  private lines: THREE.Line[] = [];
  private animationId: number = 0;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      courseType: ['', [Validators.required]],
      courseLevel: ['', [Validators.required]],
      batchName: ['', [Validators.required]],
      rollNumber: ['', [Validators.required]]
    }, {
      validators: this.passwordMatchValidator
    });

    this.initThreeJS();
    this.animate();
  }

  ngOnDestroy(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    if (this.renderer) {
      this.renderer.dispose();
    }
  }

  private initThreeJS(): void {
    const canvas = this.canvasRef.nativeElement;
    
    this.scene = new THREE.Scene();
    this.scene.background = null;
    
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.z = 50;
    
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    
    this.createSpiderWeb();
    
    window.addEventListener('resize', () => this.onWindowResize());
  }

  private createSpiderWeb(): void {
    const particleCount = 100;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities: THREE.Vector3[] = [];
    
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 100;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 100;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 100;
      
      velocities.push(new THREE.Vector3(
        (Math.random() - 0.5) * 0.1,
        (Math.random() - 0.5) * 0.1,
        (Math.random() - 0.5) * 0.1
      ));
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const material = new THREE.PointsMaterial({
      color: 0x8b5cf6,
      size: 2,
      transparent: true,
      opacity: 0.8
    });
    
    const points = new THREE.Points(geometry, material);
    this.scene.add(points);
    this.particles.push(points);
    
    (points as any).velocities = velocities;
  }

  private animate(): void {
    this.animationId = requestAnimationFrame(() => this.animate());
    
    this.particles.forEach(particle => {
      const positions = particle.geometry.attributes['position'].array as Float32Array;
      const velocities = (particle as any).velocities as THREE.Vector3[];
      
      for (let i = 0; i < positions.length / 3; i++) {
        positions[i * 3] += velocities[i].x;
        positions[i * 3 + 1] += velocities[i].y;
        positions[i * 3 + 2] += velocities[i].z;
        
        if (Math.abs(positions[i * 3]) > 50) velocities[i].x *= -1;
        if (Math.abs(positions[i * 3 + 1]) > 50) velocities[i].y *= -1;
        if (Math.abs(positions[i * 3 + 2]) > 50) velocities[i].z *= -1;
      }
      
      particle.geometry.attributes['position'].needsUpdate = true;
    });
    
    this.lines.forEach(line => this.scene.remove(line));
    this.lines = [];
    
    if (this.particles.length > 0) {
      const positions = this.particles[0].geometry.attributes['position'].array as Float32Array;
      const maxDistance = 15;
      
      for (let i = 0; i < positions.length / 3; i++) {
        for (let j = i + 1; j < positions.length / 3; j++) {
          const dx = positions[i * 3] - positions[j * 3];
          const dy = positions[i * 3 + 1] - positions[j * 3 + 1];
          const dz = positions[i * 3 + 2] - positions[j * 3 + 2];
          const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
          
          if (distance < maxDistance) {
            const lineGeometry = new THREE.BufferGeometry();
            const linePositions = new Float32Array([
              positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2],
              positions[j * 3], positions[j * 3 + 1], positions[j * 3 + 2]
            ]);
            lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
            
            const lineMaterial = new THREE.LineBasicMaterial({
              color: 0x8b5cf6,
              transparent: true,
              opacity: 0.3 * (1 - distance / maxDistance)
            });
            
            const line = new THREE.Line(lineGeometry, lineMaterial);
            this.scene.add(line);
            this.lines.push(line);
          }
        }
      }
    }
    
    this.camera.position.x = Math.sin(Date.now() * 0.0001) * 5;
    this.camera.position.y = Math.cos(Date.now() * 0.0001) * 5;
    this.camera.lookAt(this.scene.position);
    
    this.renderer.render(this.scene, this.camera);
  }

  private onWindowResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  passwordMatchValidator(g: FormGroup) {
    const password = g.get('password')?.value;
    const confirmPassword = g.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      Object.keys(this.registerForm.controls).forEach(key => {
        this.registerForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.loading = true;
    this.error = '';
    this.success = '';

    const formValue = {...this.registerForm.value};
    delete formValue.confirmPassword;

    this.authService.register(formValue).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success) {
          this.success = 'Registration successful! Redirecting to login...';
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        }
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.error || 'Registration failed. Please try again.';
      }
    });
  }

  get name() { return this.registerForm.get('name'); }
  get email() { return this.registerForm.get('email'); }
  get password() { return this.registerForm.get('password'); }
  get confirmPassword() { return this.registerForm.get('confirmPassword'); }
  get courseType() { return this.registerForm.get('courseType'); }
  get courseLevel() { return this.registerForm.get('courseLevel'); }
  get batchName() { return this.registerForm.get('batchName'); }
  get rollNumber() { return this.registerForm.get('rollNumber'); }
}

