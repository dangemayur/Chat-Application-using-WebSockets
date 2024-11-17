const socket = io(); 

const clientTotal = document.getElementById('client-total');
const messageContainer = document.getElementById('message-container');
const nameInput = document.getElementById('name-input');
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');


socket.on('clients-total', (data) => {
    clientTotal.innerHTML = `Total Clients: ${data}`;
});

messageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    sendMessage();
});


function sendMessage() {
    const name = nameInput.value.trim();
    const message = messageInput.value.trim();

    if (!name || !message) {
        alert('Both name and message are required!');
        return;
    }

   
    const data = {
        name,
        message,
        dateTime: new Date(),
    };


    socket.emit('message', data);


    addMessageToUI(true, data);


    messageInput.value = '';
}


socket.on('chat-message', (data) => {
    addMessageToUI(false, data);
});

function addMessageToUI(isOwnMessage, data) {
    const element = document.createElement('li');
    element.classList.add(isOwnMessage ? 'message-right' : 'message-left');
    element.innerHTML = `
        <p class="message">
            ${sanitizeInput(data.message)}
            <span>${sanitizeInput(data.name)} ⦿ ${moment(data.dateTime).fromNow()}</span>
        </p>
    `;

    messageContainer.appendChild(element);

  
    messageContainer.scrollTop = messageContainer.scrollHeight;
}


function sanitizeInput(input) {
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
}

messageInput.addEventListener('focus', (e) => {
    socket.emit('feedback', { feedback: `${nameInput.value} is typing a message...` });
});

messageInput.addEventListener('keypress', (e) => {
    socket.emit('feedback', { feedback: `${nameInput.value} is typing a message` });
});

messageInput.addEventListener('blur', (e) => {
    socket.emit('feedback', { feedback: '' }); 
});


socket.on('feedback', (data) => {
    const feedbackElement = document.getElementById('feedback'); 
    if (data.feedback) {
        feedbackElement.innerHTML = data.feedback;
        feedbackElement.style.display = 'block'; 
    } else {
        feedbackElement.style.display = 'none'; 
    }
});
