package com.dev.anh.chat.message;

import java.util.ArrayList;
import java.util.List;
import org.springframework.stereotype.Service;
import com.dev.anh.chat.room.ChatRoomService;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ChatMessageService {

	private final ChatMessageRepository chatRepository;
	private final ChatRoomService chatRoomService;
	
	public ChatMessage save(ChatMessage chatMessage) {
		var chatId = chatRoomService.getChatRoomId(
					chatMessage.getSenderId(), 
					chatMessage.getRecipientId(), 
					true).orElseThrow();
		
		chatMessage.setChatId(chatId);
		chatRepository.save(chatMessage);
	    
		return chatMessage;		
	}
	
	public List<ChatMessage> findChatMessage(
			   String senderId, String recipientId) {
		var chatId = chatRoomService.getChatRoomId(
								senderId, 
								recipientId, 
								false);
		
		 return chatId.map(chatRepository::findByChatId).orElse(new ArrayList<>());
	}
	
}
