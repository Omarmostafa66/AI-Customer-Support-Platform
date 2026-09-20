package com.aicustomersupport.aicustomersupportbackend.account;

import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/account")
@CrossOrigin(origins = "http://localhost:4200")
@PreAuthorize("isAuthenticated()")
public class AccountController {

    private final AccountService accountService;


    public AccountController(
            AccountService accountService
    ) {

        this.accountService =
                accountService;
    }


    // =========================================================
    // Get Current Account
    // =========================================================

    /**
     * Get the currently authenticated user's account.
     */
    @GetMapping("/me")
    public ResponseEntity<AccountResponse> getMyAccount() {

        return ResponseEntity.ok(
                accountService.getCurrentAccount()
        );
    }


    // =========================================================
    // Update Current Account
    // =========================================================

    /**
     * Update the currently authenticated user's
     * editable profile information.
     *
     * Email changes are intentionally rejected by
     * AccountService because the email is used as
     * the JWT identity.
     */
    @PutMapping("/me")
    public ResponseEntity<AccountResponse> updateMyAccount(
            @Valid @RequestBody UpdateAccountRequest request
    ) {

        return ResponseEntity.ok(
                accountService.updateCurrentAccount(
                        request
                )
        );
    }


    // =========================================================
    // Change Password
    // =========================================================

    /**
     * Change the currently authenticated user's password.
     */
    @PutMapping("/me/password")
    public ResponseEntity<?> changePassword(
            @Valid @RequestBody ChangePasswordRequest request
    ) {

        accountService.changePassword(
                request
        );

        return ResponseEntity.ok(
                new MessageResponse(
                        "Password changed successfully."
                )
        );
    }


    // =========================================================
    // Upload Avatar
    // =========================================================

    /**
     * Upload or replace profile avatar.
     */
    @PostMapping(
            value = "/me/avatar",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<AvatarResponse> uploadAvatar(
            @RequestParam("file") MultipartFile file
    ) {

        return ResponseEntity.ok(
                accountService.uploadAvatar(
                        file
                )
        );
    }


    // =========================================================
    // Get Avatar
    // =========================================================

    /**
     * Return the currently authenticated user's avatar.
     *
     * Angular loads this endpoint through HttpClient
     * so the JWT Authorization header is attached by
     * the auth interceptor.
     */
    @GetMapping("/me/avatar")
    public ResponseEntity<byte[]> getAvatar() {

        AccountService.AvatarData avatar =
                accountService.getAvatar();


        if (!avatar.hasImage()) {

            return ResponseEntity
                    .notFound()
                    .build();
        }


        return ResponseEntity.ok()
                .header(
                        HttpHeaders.CONTENT_TYPE,
                        avatar.getContentType()
                )
                .header(
                        HttpHeaders.CACHE_CONTROL,
                        "no-store, no-cache, must-revalidate"
                )
                .header(
                        HttpHeaders.PRAGMA,
                        "no-cache"
                )
                .body(
                        avatar.getData()
                );
    }


    // =========================================================
    // Delete Avatar
    // =========================================================

    /**
     * Remove profile avatar.
     */
    @DeleteMapping("/me/avatar")
    public ResponseEntity<Void> deleteAvatar() {

        accountService.deleteAvatar();

        return ResponseEntity
                .noContent()
                .build();
    }


    // =========================================================
    // Message Response
    // =========================================================

    private record MessageResponse(
            String message
    ) {
    }
}