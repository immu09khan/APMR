package com.tut.controllers;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;

import com.tut.beans.Article;
import com.tut.beans.Contact;
import com.tut.beans.User;
import com.tut.helper.Message;
import com.tut.services.ArticleService;
import com.tut.services.ContactService;
import com.tut.services.UserService;

import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;

@Controller
public class UserController {
	
	private static final Logger LOGGER = LoggerFactory.getLogger(UserController.class);
	
	@Autowired
	private UserService userService;
	
	@Autowired
	private ContactService contactService;
	
	@Autowired
	private ArticleService articleService;
	
	private static List<String> countryMapList = null;
	static {
		countryMapList = new ArrayList<>();
		countryMapList.addAll(Arrays.asList("Afghanistan","Albania","Algeria","Andorra","Angola","Antigua and Barbuda","Argentina,Armenia","Australia","Austria","Azerbaijan",
				"Bahamas","Bahrain","Bangladesh","Barbados","Belarus","Belgium","Belize","Benin","Bhutan","Bolivia","Bosnia and Herzegovina","Botswana","Brazil","Brunei","Bulgaria","Burkina Faso","Burundi",
				"Cabo Verde","Cambodia","Cameroon","Canada","Central African Republic","Chad","Chile","China","Colombia","Comoros","Congo, Democratic Republic of the","Costa Rica","Croatia","Cuba","Cyprus","Czech Republic",
				"Denmark","Djibouti","Dominica","Dominican Republic",
	            "East Timor (Timor-Leste)","Ecuador","Egypt","El Salvador","Equatorial Guinea","Eritrea","Estonia","Eswatini","Ethiopia",
	            "Fiji","Finland","France",
	            "Gabon","Gambia","Georgia","Germany","Ghana","Greece","Grenada","Guatemala","Guinea","Guinea-Bissau","Guyana",
	            "Haiti","Honduras","Hungary",
	            "Iceland","India","Indonesia","Iran","Iraq","Ireland","Israel","Italy",
	            "Jamaica","Japan","Jordan",
	            "Kazakhstan","Kenya","Kiribati","Korea, North","Korea, South","Kosovo","Kuwait","Kyrgyzstan",
	            "Laos","Latvia","Lebanon","Lesotho","Liberia","Libya","Liechtenstein","Lithuania","Luxembourg",
	            "Madagascar","Malawi","Malaysia","Maldives","Mali","Malta","Marshall Islands","Mauritania","Mauritius","Mexico","Micronesia","Moldova","Monaco","Mongolia","Montenegro","Morocco","Mozambique","Myanmar (Burma)",
	            "Namibia","Nauru","Nepal","Netherlands","New Zealand","Nicaragua","Niger","Nigeria","North Macedonia","Norway",
	            "Oman",
	            "Pakistan","Palau","Palestine","Panama","Papua New Guinea","Paraguay","Peru","Philippines","Poland","Portugal",
	            "Qatar",
	            "Romania","Russia","Rwanda","Saint Kitts and Nevis","Saint Lucia","Saint Vincent and the Grenadines","Samoa","San Marino",
	            "Sao Tome and Principe","Saudi Arabia","Senegal","Serbia","Seychelles","Sierra Leone","Singapore","Slovakia"
				));
	}
	
	private static List<String> subjectListMap = null;
	static {
		subjectListMap = new ArrayList<>();
		subjectListMap.addAll(Arrays.asList("Science","Physics","Social Science","Home Science","Technology","Laws","Doctorate",
				"Biology","Botony","Environment","Chemistry","Ancient History","Software","Drone Technology","Rocket Science",
				"History","Economics","World Economics","Medical Science"
				));
	}
	
	@GetMapping("/home")
	public String homePage() {
		
		return "home";
	}
	
	@GetMapping("/index")
	public String indexPage() {
		
		return "index";
	}
	
	@GetMapping("/page")
	public String startPage() {
		
		return "page";
	}
	
	@GetMapping("/dashboard")
	public String dashPage() {
		
		return "dashboard";
	}
	
	@GetMapping("/adminAccess")
	public String adminAccess() {
		
		return "adminLogin";
	}
	
	@GetMapping("/admin/login")
	public String processAdminLoginForm() {
		
		return "dashboard";
	}
	
	@GetMapping("/clientAccess")
	public String clientAccess() {
		
		return "clientAccess";
	}
	
	@GetMapping("/signup")
	public String signup(Model model) {
		User user = new User();
		model.addAttribute("user", user);
		
		return "signup";
	}
	
	@PostMapping("/register")
	public String submitForm(@Valid @ModelAttribute("user") User user, BindingResult result, Model model, HttpSession session) {
		
		try {
			if(result.hasErrors()) {
				System.out.println("Validation errors"+result.getAllErrors());
				return "signup";
			}
			
			User exitUser = userService.findByEmail(user.getEmail());
			if(exitUser != null && exitUser.getEmail() != null && !exitUser.getEmail().isEmpty()) {
				result.rejectValue("email", null, "* There is already an account registered with the same email");
				return "signup";
				
			}else {
			
			System.out.println(user);
			userService.createUser(user);
			session.setAttribute("message", new Message("Successfully register!!", "alert-success"));
			
			return "signup";
			
			}
		} catch (Exception e) {
			System.out.println(e);
			e.printStackTrace();
			session.setAttribute("message", new Message("something went wrong!!"+e.getMessage(), "alert-danger"));
			model.addAttribute("user", user);
			return "signup";
		}
	}
	
	@GetMapping("/contact")
	public String contact() {
		
		return "contact";
	}
	
	@PostMapping("/contact/save")
	public String createContact(@Valid @ModelAttribute("contact") Contact contact, BindingResult result, Model model, HttpSession session) {
		try {
			if(result.hasErrors()) {
				System.out.println("Validation errors"+result.getAllErrors());
				return "contact";
			}else {
		
				System.out.println(contact);
				contactService.createContact(contact);
				session.setAttribute("message", new Message("Thank you for contacting us, we will rearch ASAP", "alert-danger"));
				
				return "redirect:/contact";
			}
		}catch (Exception e) {
			System.out.println(e);
			e.printStackTrace();
			session.setAttribute("message", new Message("something went wrong!!"+e.getMessage(), "alert-danger"));
			contactService.createContact(contact);
			return "redirect:/contact";
		}

	}
	
	@GetMapping("/admin/message")
	public String messageUs(Model model) {
		model.addAttribute("contactList", contactService.getContact());
		
		return "messageUs";
	}
	
	@GetMapping("/securitylaw")
	public String securityLaw() {
		
		return "securitylaw";
	}
	
	@GetMapping("/article")
	public String article(Model model) {
		model.addAttribute("articleList", articleService.getAllArticle());
		System.out.println(articleService.getAllArticle());
		return "article";
	}
	
	@GetMapping("/welcomeMessage")
	public String welcomeMessage() {
		
		return "welcomeMessage";
	}
	
	@GetMapping("/theses")
	public String featuredTheses() {
		
		return "theses";
	}
	
	@GetMapping("/aboutUs")
	public String aboutUs() {
		
		return "aboutUs";
	}
	
	@GetMapping("/user/login")
	public String userLoginProcessForm() {
		
		return "articleForm";
	}
	
	@GetMapping("/articleForm")
	public String articleSubmit(Article article, Model model) {
		
		model.addAttribute("countryListDropdown", countryMapList);
		model.addAttribute("subjectDropDown", subjectListMap);
	
		return "articleForm";
	}
	
	@PostMapping("/articleForm/save")
	public String submitArticle(@ModelAttribute("article") Article article, BindingResult result, 
			@RequestParam("file") MultipartFile file, @RequestParam("file2") MultipartFile file2,
			Model model, HttpSession session) {
		try {
			if(result.hasErrors()) {
				System.out.println("Validation errors: " + result.getAllErrors());
				model.addAttribute("article", article);
	            return "article";
			}
			
			Article exitarticle = articleService.findArticleByEmail(article.getEmail());
			if(exitarticle != null && exitarticle.getEmail() != null && !exitarticle.getEmail().isEmpty()) {
				result.rejectValue("email", null, "* There is already an account registered with the same email");
				return "article";
			}
			if(file.isEmpty() || file2.isEmpty()) {
				LOGGER.error("Image files are empty!");
				System.out.println("image not found!!!"+file);
				System.out.println("image not found!!!"+file2);
				return "article";
			}else {
				/*article.setPdfFile(file.getOriginalFilename());
				File saveFile = new ClassPathResource("static/dbpdf/").getFile();
				Path path = Paths.get(saveFile.getAbsolutePath()+File.separator+file.getOriginalFilename());
				Files.copy(file.getInputStream(), path, StandardCopyOption.REPLACE_EXISTING);
				
				//for second file upload
				article.setProfilePicture(file2.getOriginalFilename());
				File saveFile2 = new ClassPathResource("static/dbpdf").getFile();
				Path path2 = Paths.get(saveFile2.getAbsolutePath()+File.separator+file2.getOriginalFilename());
				Files.copy(file2.getInputStream(), path2, StandardCopyOption.REPLACE_EXISTING);
				articleService.createArticle(article);
				session.setAttribute("message", new Message("Successfully register!!","alert-success"));
				System.out.println("image uploaded successfully!!!");
				return "redirect:/articleForm";*/
				
				// Construct file paths
	            File saveFile1 = new File("src/main/resources/static/dbpdf/" + file.getOriginalFilename());
	            File saveFile2 = new File("src/main/resources/static/dbpicture/" + file2.getOriginalFilename());
	            
	            // Copy files
	            Files.copy(file.getInputStream(), saveFile1.toPath(), StandardCopyOption.REPLACE_EXISTING);
	            Files.copy(file2.getInputStream(), saveFile2.toPath(), StandardCopyOption.REPLACE_EXISTING);
	            
	            // Set file names in the article object
	            article.setPdfFile(file.getOriginalFilename());
	            article.setProfilePicture(file2.getOriginalFilename());
	            
	            articleService.createArticle(article);
	            session.setAttribute("message", new Message("Successfully registered!", "alert-success"));
	            LOGGER.info("Image files uploaded successfully!");
	            return "redirect:/articleForm";
			}
			
		}catch(Exception e) {
			System.out.println(e);
			e.printStackTrace();
			session.setAttribute("message", new Message("something went wrong!!"+e.getMessage(),"alert-danger"));
			model.addAttribute("article", article);
			return "article";
		}
		
	}
	
	@GetMapping("/admin/logout")
	public String adminLogout() {
		return "redirect:/adminAccess";
	}

}
