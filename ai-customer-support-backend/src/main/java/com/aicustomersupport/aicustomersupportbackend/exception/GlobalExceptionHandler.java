package com.aicustomersupport.aicustomersupportbackend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // Validation errors
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationExceptions(
            MethodArgumentNotValidException ex) {

        Map<String, String> errors = new HashMap<>();

        ex.getBindingResult()
                .getFieldErrors()
                .forEach(error ->
                        errors.put(
                                error.getField(),
                                error.getDefaultMessage()
                        )
                );

        return buildResponse(
                HttpStatus.BAD_REQUEST,
                "Validation failed",
                errors
        );
    }

    // Access denied (authenticated user without required role)
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Map<String, Object>> handleAccessDeniedException(
            AccessDeniedException ex) {

        return buildResponse(
                HttpStatus.FORBIDDEN,
                "You do not have permission to access this resource.",
                null
        );
    }

    // Authentication errors
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<Map<String, Object>> handleAuthenticationException(
            AuthenticationException ex) {

        return buildResponse(
                HttpStatus.UNAUTHORIZED,
                "Authentication is required to access this resource.",
                null
        );
    }

    // Illegal arguments
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalArgumentException(
            IllegalArgumentException ex) {

        return buildResponse(
                HttpStatus.BAD_REQUEST,
                ex.getMessage(),
                null
        );
    }

    // Resource not found / business rule errors
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, Object>> handleRuntimeException(
            RuntimeException ex) {

        String message = ex.getMessage();

        if (message == null || message.isBlank()) {
            message = "An unexpected error occurred";
        }

        if (message.toLowerCase().contains("not found")) {

            return buildResponse(
                    HttpStatus.NOT_FOUND,
                    message,
                    null
            );
        }

        if (message.toLowerCase().contains("not allowed")
                || message.toLowerCase().contains("not authorized")) {

            return buildResponse(
                    HttpStatus.FORBIDDEN,
                    message,
                    null
            );
        }

        return buildResponse(
                HttpStatus.BAD_REQUEST,
                message,
                null
        );
    }

    private ResponseEntity<Map<String, Object>> buildResponse(
            HttpStatus status,
            String message,
            Object errors
    ) {

        Map<String, Object> response = new HashMap<>();

        response.put("status", status.value());
        response.put("message", message);

        if (errors != null) {
            response.put("errors", errors);
        }

        return ResponseEntity
                .status(status)
                .body(response);
    }
}