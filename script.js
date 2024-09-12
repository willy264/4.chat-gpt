const chatInput = document.querySelector("#chat-input");
const sendButton = document.querySelector("#send-btn");
const chatContainer = document.querySelector(".chat-container"); 
const lightToggler = document.querySelector('#theme-btn')
const deleteButton = document.querySelector('#delete-btn');
const suggestions = document.querySelectorAll('.suggestion')


let userText = null;
let isResponseGenerating = false;

const API_KEY = "AIzaSyDDuFUzuJ4xkVRiAuEqzKtlOsPOsZTxmT4"
const API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${API_KEY}`


// LOCAL STORAGE
const loadLocalStorageData = () => {
  const lightMode = (localStorage.getItem('themeColor') === 'light_mode');
  const savedChats = localStorage.getItem('savedChats')

  document.body.classList.toggle('light-mode', lightMode);
  lightToggler.innerText = lightMode ? 'dark_mode' : 'light_mode'

  chatContainer.innerHTML = savedChats || "";

  document.body.classList.toggle('hide-header', savedChats)
  chatContainer.scrollTo(0, chatContainer.scrollHeight);
}
loadLocalStorageData()


// LIGHT AND DARK MODE
lightToggler.addEventListener('click', () => {
  document.body.classList.toggle('light-mode')

  localStorage.setItem('themeColor', document.body.classList.contains('light-mode') ? 'light_mode' : 'dark_mode')

  lightToggler.innerHTML = document.body.classList.contains('light-mode') ? 'dark_mode' : 'light_mode'
})

const createElement = (html, ...classes) => {
    const chatDiv = document.createElement("div");
    chatDiv.classList.add("chat", ...classes); 
    chatDiv.innerHTML = html;
    return chatDiv; 
}


// USER INPUT
const handleOutgoingChat = () => {
    userText = chatInput.value.trim() || userText; 
    if(!userText || isResponseGenerating) return;

    isResponseGenerating = true

    const html = `<div class="chat-content">
                            <div class="chat-details">
                              <img src="images/download.png" alt="download">
                              <p class="text"></p>
                            </div>
                          </div>`;
            
  const outgoingChatDiv = createElement(html, "outgoing");
  outgoingChatDiv.querySelector('.text').innerText = userText
  chatContainer.appendChild(outgoingChatDiv);

  chatInput.value = '';
  chatContainer.scrollTo(0, chatContainer.scrollHeight);
  document.body.classList.add('hide-header')
  setTimeout(showLoadingAnime, 500)
}


// COPY ICON
const copyMessage = (copyIcon) => {
  const messageText = copyIcon.parentElement.querySelector('.text').innerText

  navigator.clipboard.writeText(messageText);
  copyIcon.innerText = 'done';
  setTimeout(() => copyIcon.innerText = 'content_copy', 1000);
}


// LOADING ANIMATION
const showLoadingAnime = () => {
  const html = `          
        <div class="chat-content">
          <div class="chat-details">
            <img src="images/user.png" alt="download">
            <p class="text"></p>
            <div class="typing-animation">
              <div class="typing-dot" style="--delay: 0.2s"></div>
              <div class="typing-dot" style="--delay: 0.3s"></div>
              <div class="typing-dot" style="--delay: 0.4s"></div>
            </div>
          </div>
          <span class="copied material-symbols-outlined" onclick="copyMessage(this) ">content_copy</span>
        </div>  `;


        
const incomingMessageDiv = createElement(html, "incoming", "loading");
chatContainer.appendChild(incomingMessageDiv);

chatContainer.scrollTo(0, chatContainer.scrollHeight);
generateAPIResponse(incomingMessageDiv)
}


// API
const generateAPIResponse = async (incomingMessageDiv) => {
  const textElement = incomingMessageDiv.querySelector(".text")


  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        contents: [{
          role: "user",
          parts: [{text: userText}]
        }]
      })
    }); 
    const data = await response.json();
    if (!response.ok) throw new Error(data.error.message)
    
    const apiResponse = data?.candidates[0].content.parts[0].text.replace(/\*\*(.*?)\*/g, '$1');

    showTypingEffect(apiResponse, textElement, incomingMessageDiv)

    // ERROR
  } catch (error) {
    isResponseGenerating = false
    textElement.innerText = error.message;
    textElement.classList.add('error')
  } finally {
    incomingMessageDiv.classList.remove('loading');
  }
  
}


// TYPING EFFECT
const showTypingEffect = (text, textElement, incomingMessageDiv) => {
  const words = text.split(' ')
  let currentWordIndex = 0;

  const typingInterval = setInterval(() => {
    textElement.innerText += (currentWordIndex === 0 ? '' : ' ') + words[currentWordIndex++];
    incomingMessageDiv.querySelector('.copied') .classList.add('hide')

    if (currentWordIndex === words.length) {
      clearInterval(typingInterval)
      isResponseGenerating = false
      incomingMessageDiv.querySelector('.copied') .classList.remove('hide')
      localStorage.setItem('savedChats', chatContainer.innerHTML)
    }
    chatContainer.scrollTo(0, chatContainer.scrollHeight);
  }, 75);
}


// DELETE BUTTON
deleteButton.addEventListener("click", () => {
  if(confirm("Are you sure you want to delete all the chats?")) {
    localStorage.removeItem("savedChats");
    loadLocalStorageData();
  }
})


// SUGGESTIONS CARD
suggestions.forEach(suggestion => {
  suggestion.addEventListener('click', () => {
    userText = suggestion.querySelector('.text').innerText;
    handleOutgoingChat();
  })
})


sendButton.addEventListener("click", handleOutgoingChat); 


