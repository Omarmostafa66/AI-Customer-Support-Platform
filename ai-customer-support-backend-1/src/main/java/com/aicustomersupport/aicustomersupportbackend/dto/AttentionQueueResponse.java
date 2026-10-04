package com.aicustomersupport.aicustomersupportbackend.dto;

import com.aicustomersupport.aicustomersupportbackend.entity.Ticket;

import java.util.List;

public class AttentionQueueResponse {

    private long urgentTickets;
    private long highPriorityTickets;
    private long slaBreachedTickets;

    private List<Ticket> tickets;

    public AttentionQueueResponse() {
    }

    public long getUrgentTickets() {
        return urgentTickets;
    }

    public void setUrgentTickets(long urgentTickets) {
        this.urgentTickets = urgentTickets;
    }

    public long getHighPriorityTickets() {
        return highPriorityTickets;
    }

    public void setHighPriorityTickets(long highPriorityTickets) {
        this.highPriorityTickets = highPriorityTickets;
    }

    public long getSlaBreachedTickets() {
        return slaBreachedTickets;
    }

    public void setSlaBreachedTickets(long slaBreachedTickets) {
        this.slaBreachedTickets = slaBreachedTickets;
    }

    public List<Ticket> getTickets() {
        return tickets;
    }

    public void setTickets(List<Ticket> tickets) {
        this.tickets = tickets;
    }
}