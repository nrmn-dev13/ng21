import { Component, computed, Input, input, Output, EventEmitter } from '@angular/core';
import { User } from './user.model';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [],
  templateUrl: './user.component.html',
  styleUrl: './user.component.css'
})
export class UserComponent {

  @Input ({required: true}) user! : User;
  @Input ({required: true}) selected! : boolean;
  // @Input({required: true}) id!: string;
  // @Input({required: true}) avatar!: string;
  // @Input({required: true}) name!: string;

  // @Output() mendefinisikan event yang bisa didengar oleh parent component.
  // EventEmitter<string> artinya event ini akan mengirim nilai bertipe string (yaitu id user).
  // Nama property (selectUser) harus cocok dengan binding di template parent: (selectUser)="..."
  @Output() selectUser = new EventEmitter<string>();

  // avatar = input.required<string>();
  // name = input.required<string>();

  // imagePath = computed(() => `assets/users/${this.avatar()}`);

  get imagePath() {
    return `assets/users/${this.user.avatar}`;
  }

  // Method ini dipanggil saat tombol diklik (lihat template: (click)="handleClick()").
  // .emit() mengirimkan nilai (this.id) ke parent melalui event selectUser.
  // Nilai yang di-emit akan diterima parent sebagai $event di templatenya.
  handleClick() {
    this.selectUser.emit(this.user.id);
  }
}
