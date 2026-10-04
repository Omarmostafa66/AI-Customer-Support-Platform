package com.aicustomersupport.aicustomersupportbackend.dto;

import com.aicustomersupport.aicustomersupportbackend.enums.TicketStatus;

public class TicketStatusUpdateRequest {

    private TicketStatus status;

    private String resolutionNote;


    public TicketStatusUpdateRequest() {
    }


    public TicketStatus getStatus() {
        return status;
    }

    public void setStatus(TicketStatus status) {
        this.status = status;
    }


    public String getResolutionNote() {
        return resolutionNote;
    }

    public void setResolutionNote(String resolutionNote) {
        this.resolutionNote = resolutionNote;
    }
}