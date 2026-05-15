'use strict'

const usernamePage = document.getElementById('username-page')
const chatPage = document.getElementById('chat-page')
const userNameForm = document.getElementById('usernameForm')
const messageForm = document.getElementById('messageForm')
const chatArea = document.getElementById('chat-messages')
const messageInput = document.getElementById('message')

const logout = document.getElementById('logout')

let stompClient = null;
let nickName = null;
let fullName = null;
let selectName = null;
let selectedUserId = null;

function connect(event) {
	nickName = document.querySelector('#nickname').value.trim()
	fullName = document.querySelector('#fullname').value.trim()

	if(nickName && fullName) {
		 usernamePage.classList.add('hidden')
		 chatPage.classList.remove('hidden')

		 const socket = new SockJS('/ws')
		 stompClient = Stomp.over(socket)
		 stompClient.connect({}, onConnected, onError)
	}
	
	 event.preventDefault()

}

function onConnected() {
	stompClient.subscribe(`/user/${nickName}/queue/messages`, onMessageReceived)
    stompClient.subscribe(`/user/public`, onMessageReceived)

	// register the connected user
	stompClient.send('/app/user.addUser',
					  {},
					  JSON.stringify({nickName: nickName, 
									  fullName: fullName,
									  status: 'ONLINE'})
	)

	// find and display the connected users
	findAndDisplayConnectedUsers().then()	
}

async function findAndDisplayConnectedUsers() {
	const connectedUserResponse = await fetch('/users')
	let connectedUsers = await connectedUserResponse.json()

	connectedUsers = connectedUsers.filter(user => user.nickName !== nickName);
	const connectedUsersList = document.getElementById('connectedUsers')
	connectedUsersList.innerHTML = ''

	connectedUsers.forEach(user => {
		 appendUserElement(user, connectedUsersList) 

		 if(connectedUsers.indexOf(user) < connectedUsers.length -1) {
			
			// Add a separator
			const separator = document.createElement('li')
			separator.classList.add('separator')
			connectedUsersList.appendChild(separator)
		 }
	})
}

function appendUserElement(user, connectedUsersList) {
	  const listIem = document.createElement('li')
	  listIem.classList.add('user-item')
	  listIem.id = user.nickName
	  
	  const userImage = document.createElement('img')
	  userImage.src = '../image/user_icon.png'
	  userImage.alt = user.fullName

	  const usernameSpan = document.createElement('span')
	  usernameSpan.textContent = user.fullName;
	  
	  const recievedMsgs = document.createElement('span')
	  recievedMsgs.textContent = '0'
	  recievedMsgs.classList.add('nbr-msg', 'hidden')

	  listIem.appendChild(userImage)
	  listIem.appendChild(usernameSpan)
	  listIem.appendChild(recievedMsgs)

	  listIem.addEventListener('click', userItemClick)

	  connectedUsersList.appendChild(listIem)
}

function userItemClick(event) {
	document.querySelectorAll('.user-item').forEach(item => {
		 item.classList.remove('active')
	 })

	messageForm.classList.remove('hidden')

	const clickedUser = event.currentTarget;
	clickedUser.classList.add('active')  //only the selected item is active
	
	selectedUserId = clickedUser.getAttribute('id')
	fetchAndDisplayUserChat().then();

	const nbrMsg = clickedUser.querySelector('.nbr-msg')
	nbrMsg.classList.add('hidden')
}


async function fetchAndDisplayUserChat() {
	 const userChatResponse = await fetch(`/messages/${nickName}/${selectedUserId}`)
	 const userChat = await userChatResponse.json()
	 chatArea.innerHTML = ''
	 userChat.forEach(chat => {
		 displayMessage(chat.senderId, chat.content)
	 })

	 //Auto-scroll a chat box to the bottom.User always sees newest message  
	 //No need to manually scroll
	 chatArea.scrollTop = chatArea.scrollHeight 
}

function displayMessage(senderId, content) {
	 const messageContainer = document.createElement('div')
	 messageContainer.classList.add('message')
	 if(senderId == nickName) {
		 messageContainer.classList.add('sender')
	 }else {
		 messageContainer.classList.add('receiver')
	 }

	 const message = document.createElement('p')
	 message.textContent = content
	 
	 messageContainer.appendChild(message)
	 chatArea.appendChild(messageContainer)

}

function onError() {
	 
}

function sendMessage(event) {
	const messageContent = messageInput.value.trim()

	if(messageContent && stompClient) {
		 const chatMessage = {
			 senderId: nickName,
			 recipientId: selectedUserId,
			 content: messageContent,
			 timestamp: new Date()
		 }

		 stompClient.send('/app/chat', {}, JSON.stringify(chatMessage))
		 displayMessage(nickName, messageContent) 
	}

	chatArea.scrollTop = chatArea.scrollHeight 
	event.preventDefault()

}

function onMessageReceived() {
	 
}

userNameForm.addEventListener('submit',connect, true)
messageForm.addEventListener('submit', sendMessage, true)

