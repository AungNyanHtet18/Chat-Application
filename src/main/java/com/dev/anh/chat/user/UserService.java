package com.dev.anh.chat.user;

import java.util.List;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {

	private final UserRepository userRepository;
	
	public void saveUser(User user){
		user.setStatus(Status.ONLINE);
		userRepository.save(user);
	}
	
	public void disConnectUser(User user){
		var storedUser = userRepository.findById(user.getNickName()).orElse(null);
		
		if(storedUser != null) {
			user.setStatus(Status.OFFLINE);
			userRepository.save(user);
		}
	}
	
	public List<User> findConnectedUser(){
	   return userRepository.findAllByStatus(Status.ONLINE);
	}
}
