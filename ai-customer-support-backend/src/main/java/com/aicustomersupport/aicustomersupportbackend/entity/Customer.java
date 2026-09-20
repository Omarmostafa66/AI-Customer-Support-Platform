package com.aicustomersupport.aicustomersupportbackend.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Entity
@Table(
        name = "customers",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = "email")
        }
)
public class Customer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    @NotBlank(message = "Name is required")
    @Column(nullable = false)
    private String name;


    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    @Column(nullable = false, unique = true)
    private String email;


    @NotBlank(message = "Password is required")
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    @Column(nullable = false)
    private String password;


    @NotBlank(message = "Phone number is required")
    @Column(name = "phone_number", nullable = false)
    private String phoneNumber;


    @NotBlank(message = "Address is required")
    @Column(nullable = false)
    private String address;


    @NotBlank(message = "Gender is required")
    @Column(nullable = false)
    private String gender;


    @NotNull(message = "Age is required")
    @Min(value = 0, message = "Age must be greater than or equal to 0")
    @Column(nullable = false)
    private Integer age;


    /*
     * Profile avatar.
     *
     * The image itself is stored as binary data in PostgreSQL.
     * The column is lazy-loaded so normal customer queries
     * do not unnecessarily load the image into memory.
     */
    @Column(
            name = "avatar",
            columnDefinition = "bytea"
    )
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private byte[] avatar;


    /*
     * MIME type of the uploaded avatar.
     *
     * Examples:
     * image/jpeg
     * image/png
     * image/webp
     */
    @Column(name = "avatar_content_type")
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String avatarContentType;


    public Customer() {
    }


    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }


    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }


    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }


    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }


    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }


    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }


    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }


    public Integer getAge() {
        return age;
    }

    public void setAge(Integer age) {
        this.age = age;
    }


    public byte[] getAvatar() {
        return avatar;
    }

    public void setAvatar(byte[] avatar) {
        this.avatar = avatar;
    }


    public String getAvatarContentType() {
        return avatarContentType;
    }

    public void setAvatarContentType(String avatarContentType) {
        this.avatarContentType = avatarContentType;
    }
}