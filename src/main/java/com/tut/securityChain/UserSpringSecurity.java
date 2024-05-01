package com.tut.securityChain;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
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
@Order(2)
public class UserSpringSecurity {
	
	/*@Autowired
	@Qualifier("getUserDetailsService")
	private UserDetailsService userDetailsService;
	*/
	/*@Bean
	public UserDetailsService getUserDetailsService() {
		return new UserDetailsServiceImpl();
	}*/

	/*@Bean
	public PasswordEncoder passwordEncoder2() {
		return new BCryptPasswordEncoder();
	}

	@Bean
	public DaoAuthenticationProvider authenticationProvider2() {

		DaoAuthenticationProvider daoAuthenticationProvider = new DaoAuthenticationProvider();

		daoAuthenticationProvider.setUserDetailsService(this.userDetailsService);
		daoAuthenticationProvider.setPasswordEncoder(passwordEncoder2());

		return daoAuthenticationProvider;
	}

	
	
    protected void configure(HttpSecurity httpSecurity) throws Exception {
		httpSecurity.csrf(csrf -> csrf.disable())
                .authorizeHttpRequests((authorize) ->
                        authorize.requestMatchers("/clientAccess").permitAll()
                        		.requestMatchers("/register").permitAll()
                        		.requestMatchers("/js/**","/css/**","/img/**","/fonts/**").permitAll()
                                .requestMatchers("/plugins/**","/fontawesome/**","/css/**","/fevicon/**").permitAll()
                                .requestMatchers("/article","/articleForm").hasAuthority("USER").anyRequest()
                                //.anyRequest().permitAll()
                ).formLogin(
                        form -> form
                                .loginPage("/clientAccess")
                                .usernameParameter("email")
                                .loginProcessingUrl("/user/login")
                                .defaultSuccessUrl("/articleForm", true)
                                .permitAll()
                ).logout(
                        logout -> logout
                                .logoutRequestMatcher(new AntPathRequestMatcher("/logout"))
                                .logoutSuccessUrl("/clientAccess")
                                .invalidateHttpSession(true)
                                .deleteCookies("JSESSIONID")
                                .permitAll()
                );
		httpSecurity.authenticationProvider(authenticationProvider2());
        //return httpSecurity.build();
    }*/


}
