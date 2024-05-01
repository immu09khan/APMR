package com.tut.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.tut.beans.Article;

public interface ArticleRepository extends JpaRepository<Article, Long> {
	
	@Query("SELECT a FROM Article a ORDER BY a.id DESC")
	public List<Article> getAllArticleInReverseOrder();
	
	@Query("SELECT a FROM Article a where a.email = :email")
	Article findByEmail(String email);

}
