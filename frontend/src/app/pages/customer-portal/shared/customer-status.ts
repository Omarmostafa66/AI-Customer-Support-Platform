import { Component, input } from '@angular/core';
import { Status } from '../../../models/resources';
export const CUSTOMER_STATUS_LABELS: Record<Status,string> = {OPEN:'Open',IN_PROGRESS:'In Progress',RESOLVED:'Resolved',CLOSED:'Closed'};
@Component({selector:'app-customer-status',standalone:true,template:'<span class="badge" [attr.data-status]="status()">{{ labels[status()] }}</span>',styles:[`.badge{display:inline-flex;padding:7px 11px;border-radius:8px;font-size:12px;font-weight:600;white-space:nowrap;background:#efedf1;color:#62616b}.badge[data-status=OPEN]{background:#fff2dc;color:#896020}.badge[data-status=IN_PROGRESS]{background:#eeedfc;color:#6256a1}.badge[data-status=RESOLVED]{background:#e8f3ec;color:#426f54}`]})
export class CustomerStatus { status=input.required<Status>(); readonly labels=CUSTOMER_STATUS_LABELS; }
