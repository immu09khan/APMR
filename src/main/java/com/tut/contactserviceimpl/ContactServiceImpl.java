package com.tut.contactserviceimpl;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.tut.beans.Contact;
import com.tut.repositories.ContactRepository;
import com.tut.services.ContactService;

@Service
public class ContactServiceImpl implements ContactService {
	
	private static final Logger LOGGER = LoggerFactory.getLogger(ContactServiceImpl.class);
	
	@Autowired
	private ContactRepository contactRepository;

	@Override
	public Contact createContact(Contact contact) {
		LOGGER.info("Contact Creating...{}", contact);
		contact.setFullName(contact.getFirstName() +" "+ contact.getLastName());
		LOGGER.info("Contact Created {}", contact);
		return contactRepository.save(contact);
	}

	@Override
	public List<Contact> getContact() {
		// TODO Auto-generated method stub
		return contactRepository.findAllOrderedByIdDescending();
	}

}
