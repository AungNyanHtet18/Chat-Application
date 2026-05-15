package com.dev.anh.chat.user;

import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import lombok.RequiredArgsConstructor;

@Controller
@RequiredArgsConstructor
public class UserController {

	private final UserService userService;
	
	@MessageMapping("/user.addUser")
	@SendTo("/user/public")
	public User addUser(@Payload User user){
		userService.saveUser(user);
		return user;
	}
	
	@MessageMapping("/user.disConnectUser")
	@SendTo("/user/public")
	public User disConnectUser(@Payload User user){
	   userService.disConnectUser(user);
	   return user;
	}
	
	@GetMapping("/users")
	public ResponseEntity<List<User>> findConnectedUser(){
		return ResponseEntity.ok(userService.findConnectedUser());
	}
}
