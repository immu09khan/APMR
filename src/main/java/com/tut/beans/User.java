package com.tut.beans;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

import com.tut.enumerated.Role;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Pattern;

@Entity
@Table(name="user")
public class User {
	
	@Id
	@Column(name="userId")
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
	@NotEmpty(message = "* username can't be blank")
	@Column(name="name")
	private String name;
	
	@NotEmpty(message = "* email address is not valid")
	@Pattern(regexp = "[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,3}")
	@Column(name="email", nullable = false, unique = true, length = 40)
	private String email;
	
	@NotEmpty(message = "* phone no is required")
	@Pattern(regexp="[0-9]+", message="* Phone number must contain only numbers")
	@Column(name="phone")
	private String phone;
	
	@NotEmpty(message = "* password can't be blank")
	@Column(name="password", nullable=false, length = 12)
	private String password;
	
	@NotEmpty(message = "* Re-Type password")
	@Column(name="Re_Password")
	private String re_password;
	
	@NotEmpty(message = "* please select gender")
	@Column(name="gender")
	private String gender;
	
	@NotEmpty(message = "* accept terms & condition")
	@Column(name="Terms_Condition")
	private String agree_term;
	
	@Column(name="date")
	private String date;
	
	@Enumerated(EnumType.STRING)
	@Column(name = "role")
	private Role role;

	public User() {
		super();
		// TODO Auto-generated constructor stub
	}

	public User(Long id, String name, String email, String phone, String password, String re_password, String gender,
			String agree_term, String date, Role role) {
		super();
		this.id = id;
		this.name = name;
		this.email = email;
		this.phone = phone;
		this.password = password;
		this.re_password = re_password;
		this.gender = gender;
		this.agree_term = agree_term;
		this.date = date;
		this.role = role;
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

	public String getPhone() {
		return phone;
	}

	public void setPhone(String phone) {
		this.phone = phone;
	}

	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
	}

	public String getRe_password() {
		return re_password;
	}

	public void setRe_password(String re_password) {
		this.re_password = re_password;
	}

	public String getGender() {
		return gender;
	}

	public void setGender(String gender) {
		this.gender = gender;
	}

	public String getAgree_term() {
		return agree_term;
	}

	public void setAgree_term(String agree_term) {
		this.agree_term = agree_term;
	}

	public String getDate() {
		return date;
	}

	public void setDate(String date) {
		this.date = date;
	}
	
	public Role getRole() {
		return role;
	}

	public void setRole(Role role) {
		this.role = role;
	}

	@PrePersist
	public void prePersist() {
		
		DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
		LocalDateTime nowDateTime = LocalDateTime.now();
		this.date = nowDateTime.format(formatter);
	}

	@Override
	public String toString() {
		return "User [id=" + id + ", name=" + name + ", email=" + email + ", phone=" + phone + ", password=" + password
				+ ", re_password=" + re_password + ", gender=" + gender + ", agree_term=" + agree_term + ", date="
				+ date + ", role=" + role + "]";
	}

}
