const firebaseConfig = {
  apiKey: "AIzaSyAoSqKTUrNCvj-03W1tJF_izqRGDnfR5nY",
  authDomain: "socratique-51535.firebaseapp.com",
  projectId: "socratique-51535",
  storageBucket: "socratique-51535.appspot.com",
  messagingSenderId: "13244664859",
  appId: "1:13244664859:web:c690d586e20f67e7b6bcbe",
  measurementId: "G-XNKE05VS45"
};
firebase.initializeApp(firebaseConfig);

document.addEventListener('DOMContentLoaded', () => {
  const apiUrl = 'https://api.openai.com/v1/chat/completions';
  const classApiUrl = '/api/classes';
  const chatContainer = document.getElementById('chat-messages');
  const userInput = document.getElementById('user-input');
  const submitButton = document.getElementById('submit-button');
  const loginButton = document.getElementById('login-button');
    const greetingContainer = document.getElementById('greeting-container');

    let userName = ''; // Variable to hold user name

    function setGreeting() {
      const date = new Date();
      const hour = date.getHours();
      let greeting = 'Good ';
    
      if (hour < 12) {
        greeting += 'Morning';
      } else if (hour < 18) {
        greeting += 'Afternoon';
      } else {
        greeting += 'Evening';
      }
    
      // Add user name to the greeting if it exists
      if (userName) {
        greeting += ', ' + userName;
      }
    
      greetingContainer.textContent = greeting;
    }
    
  setGreeting(); // Set initial greeting

  loginButton.addEventListener('click', () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider)
      .then((result) => {
        const user = result.user;
        console.log('Logged in user:', user);
        
        // Update user name - split full name into parts, and take the first part
        const fullName = user.displayName;
        const nameParts = fullName.split(' ');
        userName = nameParts[0]; // Take just the first name
        
        loginButton.style.display = 'none'; // Hide login button
        setGreeting(); // Update greeting after login
        fetchClasses();
        // Redirect or perform other actions after login
      })
      .catch((error) => {
        console.error('Login error:', error);
      });
  });

  submitButton.addEventListener('click', handleUserInput);
  userInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
      handleUserInput();
    }
  });

  async function handleUserInput() {
    const prompt = userInput.value.trim();
    if (prompt) {
      addMessage('user', prompt);
      userInput.value = '';

      try {
        const apiKey = await getOpenAIKey();
        const response = await sendChatCompletion(apiKey, prompt);
        const message = response.choices[0].message.content;
        addMessage('ai', message);
      } catch (error) {
        console.error('Error:', error);
      }
    }
  }

  async function getOpenAIKey() {
    try {
      const response = await fetch('/api/openai-key');
      if (!response.ok) {
        throw new Error('Failed to fetch OpenAI API key from server.');
      }
      const data = await response.json();
      return data.apiKey;
    } catch (error) {
      throw new Error('Failed to retrieve OpenAI API key.');
    }
  }

  async function sendChatCompletion(apiKey, prompt) {
    const requestBody = {
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
    };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch chat completion from API.');
    }

    return response.json();
  }

  function addMessage(role, content) {
    const messageContainer = document.createElement('div');
    messageContainer.className = `message ${role}`;
    messageContainer.textContent = content;
    chatContainer.appendChild(messageContainer);
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }

  async function fetchClasses() {
    try {
      const response = await fetch(classApiUrl);
      if (!response.ok) {
        throw new Error('Failed to fetch classes from server.');
      }
      const classes = await response.json();
      displayClasses(classes);
    } catch (error) {
      console.error('Error:', error);
    }
  }

  function displayClasses(classes) {
    console.log('Received classes:', classes);
  
    const siteContainer = document.getElementById('site-container3');
    siteContainer.innerHTML = ''; 
  
    const heading = document.createElement('h2');
    heading.textContent = 'Your Labs';
    heading.style.background = 'linear-gradient(to right, #224499, #66ccff)';
    heading.style.webkitBackgroundClip = 'text';
    heading.style.webkitTextFillColor = 'transparent';
    siteContainer.appendChild(heading);
  
    if (classes && Array.isArray(classes.classes)) {
      const classArray = classes.classes;
  
      if (classArray.length > 0) {
        classArray.forEach((classData) => {
          const classElement = document.createElement('div');
          classElement.className = 'class';
          classElement.innerHTML = `
            <h3>${classData.className}</h3>
            <p>Teacher: ${classData.teacherName}</p>
          `;
          siteContainer.appendChild(classElement);
        });
      } else {
        const noClassesElement = document.createElement('p');
        noClassesElement.textContent = 'No classes found.';
        siteContainer.appendChild(noClassesElement);
      }
    } else {
      const errorElement = document.createElement('p');
      errorElement.textContent = 'Invalid response format for classes.';
      siteContainer.appendChild(errorElement);
    }
  }
  

  
});
