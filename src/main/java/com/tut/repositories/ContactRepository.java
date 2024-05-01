package com.tut.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.tut.beans.Contact;

public interface ContactRepository extends JpaRepository<Contact, Integer> {
	
	@Query("SELECT c FROM Contact c ORDER BY c.id DESC")
    List<Contact> findAllOrderedByIdDescending();

}
