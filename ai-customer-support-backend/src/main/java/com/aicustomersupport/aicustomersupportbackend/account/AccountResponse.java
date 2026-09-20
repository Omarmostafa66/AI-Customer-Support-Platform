package com.aicustomersupport.aicustomersupportbackend.account;

public class AccountResponse {

    private Long id;
    private String name;
    private String email;
    private String role;

    private String phoneNumber;
    private String address;

    private String gender;
    private Integer age;

    private String employeeRole;
    private Double salary;

    private boolean hasAvatar;

    public AccountResponse() {
    }

    public AccountResponse(
            Long id,
            String name,
            String email,
            String role,
            String phoneNumber,
            String address,
            String gender,
            Integer age,
            String employeeRole,
            Double salary,
            boolean hasAvatar
    ) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.role = role;
        this.phoneNumber = phoneNumber;
        this.address = address;
        this.gender = gender;
        this.age = age;
        this.employeeRole = employeeRole;
        this.salary = salary;
        this.hasAvatar = hasAvatar;
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

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
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

    public String getEmployeeRole() {
        return employeeRole;
    }

    public void setEmployeeRole(String employeeRole) {
        this.employeeRole = employeeRole;
    }

    public Double getSalary() {
        return salary;
    }

    public void setSalary(Double salary) {
        this.salary = salary;
    }

    public boolean isHasAvatar() {
        return hasAvatar;
    }

    public void setHasAvatar(boolean hasAvatar) {
        this.hasAvatar = hasAvatar;
    }
}