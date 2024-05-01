package com.tut.services;

import java.util.List;

import com.tut.beans.Contact;

public interface ContactService {
	
	public Contact createContact(Contact contact);
	
	public List<Contact> getContact();

}
