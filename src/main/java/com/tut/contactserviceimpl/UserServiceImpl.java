package com.tut.contactserviceimpl;

import java.util.List;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.tut.beans.User;
import com.tut.enumerated.Role;
import com.tut.repositories.UserRepository;
import com.tut.services.UserService;

@Service
public class UserServiceImpl implements UserService {
	
	private static final Logger LOGGER = LoggerFactory.getLogger(UserServiceImpl.class);
	
	@Autowired
	private UserRepository userRepository;
	
	@Autowired
	private PasswordEncoder passwordEncoder;

	@Override
	public User createUser(User user) {
		LOGGER.info("User Creating...{}", user);
		user.setPassword(passwordEncoder.encode(user.getPassword()));
		user.setRole(Role.USER);
		LOGGER.info("User Created {}", user);
		return userRepository.save(user);
		
	}

	@Override
	public List<User> getAllUser() {
		// TODO Auto-generated method stub
		return userRepository.findAll();
	}

	@Override
	public User updateUser(Long id) {
		
		Optional<User> optional = userRepository.findById(id);
		User user = null;
		if(optional.isPresent()) {
			user = optional.get();
		}else {
			throw new RuntimeException("User not Found!!!" + id);
		}
		return user;
	}

	@Override
	public void deleteUser(Long id) {
		// TODO Auto-generated method stub
		
	}

	@Override
	public User findByEmail(String email) {
		// TODO Auto-generated method stub
		return userRepository.findByEmail(email);
	}
	

}
