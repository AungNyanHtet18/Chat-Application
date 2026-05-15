package com.dev.anh.chat.message;

import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import lombok.RequiredArgsConstructor;

@Controller
@RequiredArgsConstructor
public class ChatController {

	private final ChatMessageService chatMessageService;
	private final SimpMessagingTemplate messagingTemplate;
	
	@MessageMapping("/chat")
	private void processMessage(
			@Payload ChatMessage chatMessage) {
		
		 var savedMsg = chatMessageService.save(chatMessage);
		 
		 // Armin/queue/messages //Armin subscribing this specific queue
		 messagingTemplate.convertAndSendToUser(
				 			chatMessage.getRecipientId(), 
				 			"/queue/messages",
				 			ChatNotification.builder()
				 					.id(savedMsg.getId())
				 					.senderId(savedMsg.getSenderId())
				 					.recipientId(savedMsg.getRecipientId())
				 					.content(savedMsg.getContent())
				 					.build());
	}
	
	@GetMapping("/messages/{senderId}/{recipientId}")
	public ResponseEntity<List<ChatMessage>> findChatMessages(
			@PathVariable String senderId,
			@PathVariable String recipientId) {
		
	  return ResponseEntity.ok(chatMessageService.findChatMessage(senderId, recipientId));
	}
	
}