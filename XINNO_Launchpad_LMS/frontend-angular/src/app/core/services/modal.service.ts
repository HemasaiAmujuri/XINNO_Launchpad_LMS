import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ModalType = 'login' | 'register' | null;

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  private modalSubject = new BehaviorSubject<ModalType>(null);
  public modal$ = this.modalSubject.asObservable();

  openModal(type: ModalType) {
    this.modalSubject.next(type);
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
  }

  closeModal() {
    this.modalSubject.next(null);
    // Restore body scroll
    document.body.style.overflow = 'auto';
  }

  getCurrentModal(): ModalType {
    return this.modalSubject.value;
  }
}
