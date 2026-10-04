package com.aicustomersupport.aicustomersupportbackend.account;

public class AvatarResponse {

    private boolean hasAvatar;
    private String avatarUrl;

    public AvatarResponse() {
    }

    public AvatarResponse(
            boolean hasAvatar,
            String avatarUrl
    ) {
        this.hasAvatar = hasAvatar;
        this.avatarUrl = avatarUrl;
    }

    public boolean isHasAvatar() {
        return hasAvatar;
    }

    public void setHasAvatar(boolean hasAvatar) {
        this.hasAvatar = hasAvatar;
    }

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }
}