package com.tut.services;

import java.util.List;

import com.tut.beans.User;

public interface UserService {
	
	User createUser(User user);
	
	List<User> getAllUser();
	
	User updateUser(Long id);
	
	void deleteUser(Long id);
	
	User findByEmail(String email);

}
