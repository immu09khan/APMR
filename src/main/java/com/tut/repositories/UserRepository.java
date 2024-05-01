package com.tut.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.tut.beans.User;

public interface UserRepository extends JpaRepository<User, Long> {
	
	@Query("select u from User u where u.email = :email")
	public User findByEmail(@Param("email") String email);

}
