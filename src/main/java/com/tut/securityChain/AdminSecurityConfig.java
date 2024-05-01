package com.tut.securityChain;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;

import com.tut.contactserviceimpl.UserDetailsServiceImpl;

@Configuration
@EnableWebSecurity
@Order(1)
public class AdminSecurityConfig {
	
	@Bean
	public UserDetailsService getUserDetailsService() {
		return new UserDetailsServiceImpl();
	}

	@Bean
	public PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
	}

	@Bean
	public DaoAuthenticationProvider authenticationProvider() {

		DaoAuthenticationProvider daoAuthenticationProvider = new DaoAuthenticationProvider();

		daoAuthenticationProvider.setUserDetailsService(this.getUserDetailsService());
		daoAuthenticationProvider.setPasswordEncoder(passwordEncoder());

		return daoAuthenticationProvider;
	}

	
	@Bean
    public SecurityFilterChain filterChain1(HttpSecurity httpSecurity) throws Exception {
		httpSecurity.csrf(csrf -> csrf.disable())
                .authorizeHttpRequests((authorize) ->
                        authorize.requestMatchers("/").permitAll()
                        		.requestMatchers("/register","/clientAccess","/articleForm","/aboutUs").permitAll()
                        		.requestMatchers("/js/**","/css/**","/img/**","/fonts/**","/files/**","/fonts/**").permitAll()
                                .requestMatchers("/plugins/**","/fontawesome/**","/themes/**","/css/**","/fevicon/**").permitAll()
                                .requestMatchers("/img/**","/icon/**","/picture/**","/images/**").permitAll()
                        		.requestMatchers("/index","/welcomeMessage","/theses","/securitylaw","/contact").permitAll()
                        		.requestMatchers("/articleForm/save","/contact/save","/article").permitAll()
                                .requestMatchers("/dashboard").hasAuthority("ADMIN").anyRequest()
                                //.requestMatchers("/dashboard","/admin/message").anyRequest().hasAuthority("ADMIN")
                                //.anyRequest().permitAll()
                ).formLogin(
                        form -> form
                                .loginPage("/adminAccess")
                                .loginProcessingUrl("/admin/login")
                                .defaultSuccessUrl("/dashboard", true)
                                .permitAll()
                ).logout(
                        logout -> logout
                                .logoutRequestMatcher(new AntPathRequestMatcher("/admin/logout"))
                                .logoutSuccessUrl("/adminAccess")
                                .invalidateHttpSession(true)
                                .deleteCookies("JSESSIONID")
                                .permitAll()
                );
		httpSecurity.authenticationProvider(authenticationProvider());
        return httpSecurity.build();
    }
	
}
