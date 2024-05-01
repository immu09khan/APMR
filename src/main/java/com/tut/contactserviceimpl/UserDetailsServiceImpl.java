package com.tut.contactserviceimpl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Component;

import com.tut.beans.User;
import com.tut.repositories.UserRepository;
import com.tut.securityChain.CustomUserDetails;

@Component
public class UserDetailsServiceImpl implements UserDetailsService {
	
	@Autowired
	private UserRepository userRepository;

	@Override
	public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
		User user = userRepository.findByEmail(username);
		if(user == null) {
			throw new UsernameNotFoundException("Could not found user !!" +username);
		}
		
		CustomUserDetails customUserDetails = new CustomUserDetails(user);
		
		return customUserDetails;
	}

}
