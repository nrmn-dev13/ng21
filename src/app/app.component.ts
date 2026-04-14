import { Component } from '@angular/core';
import { HeaderComponent } from './header/header.component';
import { UserComponent } from './user/user.component';
import { TasksComponent } from './tasks/tasks.component';
import { DUMMY_USERS } from './dummy-users';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [HeaderComponent, UserComponent, TasksComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  users = DUMMY_USERS;
  selectedUserId: string | null = null;

  get selectedUser() {
    return this.users.find(user => user.id === this.selectedUserId) || null;
  }

  onSelectUser(userId: string) {
    console.log('Selected user ID:', userId);
    this.selectedUserId = userId;
  }
}
