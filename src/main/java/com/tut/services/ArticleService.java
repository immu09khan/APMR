package com.tut.services;

import java.util.List;

import com.tut.beans.Article;

public interface ArticleService {
	
	public Article createArticle(Article article);
	
	public List<Article> getAllArticle();
	
	public Article findArticleByEmail(String email);


}
