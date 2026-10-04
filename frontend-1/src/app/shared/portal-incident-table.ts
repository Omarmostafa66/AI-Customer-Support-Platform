import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Incident } from '../models/resources';
@Component({
  selector: 'app-portal-incident-table',
  standalone: true,
  imports: [CommonModule, RouterLink],
  styleUrls: ['./management.css', './workspace.css', './workspace-data.css'],
  template: `<div class="table-card">
    @if (incidents().length === 0) {
      <p class="empty-message">No assigned incidents match this view.</p>
    } @else {
      <table>
        <thead>
          <tr>
            <th scope="col">Incident</th>
            <th scope="col">Status</th>
            <th scope="col">Category</th>
            <th scope="col">Created</th>
            <th scope="col">Resolved</th>
            <th scope="col">Actions</th>
          </tr>
        </thead>
        <tbody>
          @for (item of incidents(); track item.id) {
            <tr>
              <td>#{{ item.id }}</td>
              <td>
                <span class="badge" [attr.data-status]="item.status">{{ item.status }}</span>
              </td>
              <td>{{ item.category?.name || 'Not categorized' }}</td>
              <td>{{ (item.createdAt | date: 'medium') || '—' }}</td>
              <td>{{ (item.resolvedAt | date: 'medium') || '—' }}</td>
              <td><a [routerLink]="['/employee/incidents', item.id]">View / Update</a></td>
            </tr>
          }
        </tbody>
      </table>
    }
  </div>`,
})
export class PortalIncidentTable {
  incidents = input<Incident[]>([]);
}
