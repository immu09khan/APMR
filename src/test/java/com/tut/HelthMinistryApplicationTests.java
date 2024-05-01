package com.tut;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import com.tut.beans.User;
import com.tut.repositories.UserRepository;

@SpringBootTest
class HelthMinistryApplicationTests {
	
	@Autowired
	private UserRepository userRepository;

	@Test
	void contextLoads() {
	}
	
	@Test
	public void testFindByEmail() {
		String email = "prakash@gmail.com";
		
		User user = userRepository.findByEmail(email);
		
		assertNotNull(user);
		
		assertEquals("Prakash Tripathi", user.getName());
	}

}
