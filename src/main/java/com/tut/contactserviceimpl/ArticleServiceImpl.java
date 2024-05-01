package com.tut.contactserviceimpl;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.tut.beans.Article;
import com.tut.enumerated.ActionEnum;
import com.tut.repositories.ArticleRepository;
import com.tut.services.ArticleService;

import ch.qos.logback.core.joran.action.Action;

@Service
public class ArticleServiceImpl implements ArticleService {
	
	public static final Logger LOGGER = LoggerFactory.getLogger(ArticleServiceImpl.class);
	
	@Autowired
	private ArticleRepository articleRepository;

	@Override
	public Article createArticle(Article article) {
		LOGGER.info("Article Creating....{}", article);
		article.setFullName(article.getFirstName() +" "+ article.getLastName());
		article.setAction(ActionEnum.PENDING.toString());
		LOGGER.info("Article Created {}", article);
		return articleRepository.save(article);
	}

	@Override
	public List<Article> getAllArticle() {
		// TODO Auto-generated method stub
		return articleRepository.findAll();
	}

	@Override
	public Article findArticleByEmail(String email) {
		// TODO Auto-generated method stub
		return articleRepository.findByEmail(email);
	}

}
