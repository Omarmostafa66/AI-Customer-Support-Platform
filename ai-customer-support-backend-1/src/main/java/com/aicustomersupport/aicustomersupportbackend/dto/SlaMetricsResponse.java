package com.aicustomersupport.aicustomersupportbackend.dto;

public class SlaMetricsResponse {

    private long totalTickets;

    private long withinSla;

    private long breached;

    private long resolvedWithinSla;

    private long resolvedAfterSla;

    private double averageFirstResponseMinutes;

    private double averageResolutionMinutes;

    private double slaCompliancePercentage;


    public SlaMetricsResponse() {
    }


    public long getTotalTickets() {
        return totalTickets;
    }

    public void setTotalTickets(long totalTickets) {
        this.totalTickets = totalTickets;
    }


    public long getWithinSla() {
        return withinSla;
    }

    public void setWithinSla(long withinSla) {
        this.withinSla = withinSla;
    }


    public long getBreached() {
        return breached;
    }

    public void setBreached(long breached) {
        this.breached = breached;
    }


    public long getResolvedWithinSla() {
        return resolvedWithinSla;
    }

    public void setResolvedWithinSla(long resolvedWithinSla) {
        this.resolvedWithinSla = resolvedWithinSla;
    }


    public long getResolvedAfterSla() {
        return resolvedAfterSla;
    }

    public void setResolvedAfterSla(long resolvedAfterSla) {
        this.resolvedAfterSla = resolvedAfterSla;
    }


    public double getAverageFirstResponseMinutes() {
        return averageFirstResponseMinutes;
    }

    public void setAverageFirstResponseMinutes(
            double averageFirstResponseMinutes
    ) {
        this.averageFirstResponseMinutes =
                averageFirstResponseMinutes;
    }


    public double getAverageResolutionMinutes() {
        return averageResolutionMinutes;
    }

    public void setAverageResolutionMinutes(
            double averageResolutionMinutes
    ) {
        this.averageResolutionMinutes =
                averageResolutionMinutes;
    }


    public double getSlaCompliancePercentage() {
        return slaCompliancePercentage;
    }

    public void setSlaCompliancePercentage(
            double slaCompliancePercentage
    ) {
        this.slaCompliancePercentage =
                slaCompliancePercentage;
    }
}