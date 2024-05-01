package com.tut.beans;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

@Entity
@Table(name = "contact")
public class Contact {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private int id;
	
	@Column(name = "firstname")
	private String firstName;
	
	@Column(name = "lastname")
	private String lastName;
	
	@Column(name = "fullName")
	private String fullName;
	
	@Column(name = "Description")
	private String description;
	
	@Column(name = "email", unique = true)
	private String email;
	
	@Column(name = "message")
	private String message;
	
	@Column(name = "date")
	private String date;

	public Contact() {
		super();
		// TODO Auto-generated constructor stub
	}

	public Contact(int id, String firstName, String lastName, String fullName, String description, String email, String message, String date) {
		super();
		this.id = id;
		this.firstName = firstName;
		this.lastName = lastName;
		this.fullName = fullName;
		this.description = description;
		this.email = email;
		this.message = message;
		this.date = date;
	}

	public int getId() {
		return id;
	}

	public void setId(int id) {
		this.id = id;
	}

	public String getFirstName() {
		return firstName;
	}

	public void setFirstName(String firstName) {
		this.firstName = firstName;
	}

	public String getLastName() {
		return lastName;
	}

	public void setLastName(String lastName) {
		this.lastName = lastName;
	}

	public String getFullName() {
		return fullName;
	}

	public void setFullName(String fullName) {
		this.fullName = fullName;
	}

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public String getMessage() {
		return message;
	}

	public void setMessage(String message) {
		this.message = message;
	}

	public String getDate() {
		return date;
	}

	public void setDate(String date) {
		this.date = date;
	}
	
	@PrePersist
	public void prePersist() {
		
		DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
		LocalDateTime nowDateTime = LocalDateTime.now();
		this.date = nowDateTime.format(formatter);
	}

	@Override
	public String toString() {
		return "Contact [id=" + id + ", firstName=" + firstName + ", lastName=" + lastName + ", fullName=" + fullName + ", email=" + email
				+ ", description=" + description + ", message=" + message + ", date=" + date + "]";
	}

}
