import { Component, input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Ticket } from '../../../models/resources';
import { CustomerStatus } from './customer-status';
@Component({selector:'app-customer-ticket-cards',standalone:true,imports:[DatePipe,RouterLink,CustomerStatus],templateUrl:'./customer-ticket-cards.html',styleUrls:['./customer-ui.css','./customer-tickets.css']})
export class CustomerTicketCards { tickets=input<Ticket[]>([]); compact=input(false); }
