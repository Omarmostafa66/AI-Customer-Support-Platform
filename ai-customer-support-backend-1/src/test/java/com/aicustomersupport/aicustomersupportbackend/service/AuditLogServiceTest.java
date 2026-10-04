package com.aicustomersupport.aicustomersupportbackend.service;

import com.aicustomersupport.aicustomersupportbackend.entity.AuditLog;
import com.aicustomersupport.aicustomersupportbackend.repository.AuditLogRepository;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Mockito;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class AuditLogServiceTest {

    @Test
    public void testLog_createsAndSavesAuditLog() {
        AuditLogRepository repository = Mockito.mock(AuditLogRepository.class);
        AuditLogService service = new AuditLogService(repository);

        service.log("CREATE_TICKET", "TICKET", "123", "Ticket 123 created");

        ArgumentCaptor<AuditLog> captor = ArgumentCaptor.forClass(AuditLog.class);
        Mockito.verify(repository).save(captor.capture());

        AuditLog savedLog = captor.getValue();
        assertEquals("CREATE_TICKET", savedLog.getAction());
        assertEquals("TICKET", savedLog.getEntityType());
        assertEquals("123", savedLog.getEntityId());
        assertEquals("Ticket 123 created", savedLog.getDetails());
    }
}
