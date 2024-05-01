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
@Table(name = "article")
public class Article {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
	@Column(name = "firstName")
	private String firstName;
	
	@Column(name = "lastName")
	private String lastName;
	
	@Column(name = "fullName")
	private String fullName;
	
	@Column(name = "email", unique = true)
	private String email;
	
	@Column(name = "alternateEmail")
	private String alternateEmail;
	
	private String relatedTopics;
	
	private String menuscriptTitle;
	
	private String reviewersArea;
	
	private String articleTitle;
	
	private String subject;
	
	private String articleAbstract;
	
	private String content;
	
	private String expertArea;
	
	private String authorBio;
	
	private String country;
	
	private String pdfFile;
	
	private String profilePicture;
	
	@Column(name = "date")
	private String date;
	
	private String action;
	
	@Column(name = "status")
	private String status;
	

	public Article() {
		super();
		// TODO Auto-generated constructor stub
	}

	public Article(Long id, String firstName, String lastName, String fullName, String email, String alternateEmail,
			String relatedTopics, String menuscriptTitle, String reviewersArea, String articleTitle, String subject,
			String articleAbstract, String content, String expertArea, String authorBio, String country, String pdfFile,
			String profilePicture, String date, String action, String status) {
		super();
		this.id = id;
		this.firstName = firstName;
		this.lastName = lastName;
		this.fullName = fullName;
		this.email = email;
		this.alternateEmail = alternateEmail;
		this.relatedTopics = relatedTopics;
		this.menuscriptTitle = menuscriptTitle;
		this.reviewersArea = reviewersArea;
		this.articleTitle = articleTitle;
		this.subject = subject;
		this.articleAbstract = articleAbstract;
		this.content = content;
		this.expertArea = expertArea;
		this.authorBio = authorBio;
		this.country = country;
		this.pdfFile = pdfFile;
		this.profilePicture = profilePicture;
		this.date = date;
		this.action = action;
		this.status = status;
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
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

	public String getAlternateEmail() {
		return alternateEmail;
	}

	public void setAlternateEmail(String alternateEmail) {
		this.alternateEmail = alternateEmail;
	}

	public String getRelatedTopics() {
		return relatedTopics;
	}

	public void setRelatedTopics(String relatedTopics) {
		this.relatedTopics = relatedTopics;
	}

	public String getMenuscriptTitle() {
		return menuscriptTitle;
	}

	public void setMenuscriptTitle(String menuscriptTitle) {
		this.menuscriptTitle = menuscriptTitle;
	}

	public String getReviewersArea() {
		return reviewersArea;
	}

	public void setReviewersArea(String reviewersArea) {
		this.reviewersArea = reviewersArea;
	}

	public String getArticleTitle() {
		return articleTitle;
	}

	public void setArticleTitle(String articleTitle) {
		this.articleTitle = articleTitle;
	}

	public String getSubject() {
		return subject;
	}

	public void setSubject(String subject) {
		this.subject = subject;
	}

	public String getArticleAbstract() {
		return articleAbstract;
	}

	public void setArticleAbstract(String articleAbstract) {
		this.articleAbstract = articleAbstract;
	}

	public String getContent() {
		return content;
	}

	public void setContent(String content) {
		this.content = content;
	}

	public String getExpertArea() {
		return expertArea;
	}

	public void setExpertArea(String expertArea) {
		this.expertArea = expertArea;
	}

	public String getAuthorBio() {
		return authorBio;
	}

	public void setAuthorBio(String authorBio) {
		this.authorBio = authorBio;
	}

	public String getCountry() {
		return country;
	}

	public void setCountry(String country) {
		this.country = country;
	}

	public String getPdfFile() {
		return pdfFile;
	}

	public void setPdfFile(String pdfFile) {
		this.pdfFile = pdfFile;
	}

	public String getProfilePicture() {
		return profilePicture;
	}

	public void setProfilePicture(String profilePicture) {
		this.profilePicture = profilePicture;
	}

	public String getDate() {
		return date;
	}

	public void setDate(String date) {
		this.date = date;
	}

	public String getAction() {
		return action;
	}

	public void setAction(String action) {
		this.action = action;
	}

	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}
	
	@PrePersist
	public void prePersist() {
		
		DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
		LocalDateTime nowDateTime = LocalDateTime.now();
		this.date = nowDateTime.format(formatter);
	}

	@Override
	public String toString() {
		return "Article [id=" + id + ", firstName=" + firstName + ", lastName=" + lastName + ", fullName=" + fullName
				+ ", email=" + email + ", alternateEmail=" + alternateEmail + ", relatedTopics=" + relatedTopics
				+ ", menuscriptTitle=" + menuscriptTitle + ", reviewersArea=" + reviewersArea + ", articleTitle="
				+ articleTitle + ", subject=" + subject + ", articleAbstract=" + articleAbstract + ", content="
				+ content + ", expertArea=" + expertArea + ", authorBio=" + authorBio + ", country=" + country
				+ ", pdfFile=" + pdfFile + ", profilePicture=" + profilePicture + ", date=" + date + ", action="
				+ action + ", status=" + status + "]";
	}

}
