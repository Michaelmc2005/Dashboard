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
  let userToken = '';
  let userName = ''; // Variable to hold user name
  const db = firebase.firestore();
const auth = firebase.auth();

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
      .then(async (result) => {
        const user = result.user;
        console.log('Logged in user:', user);
  
        // Get the Firebase token
        const token = await result.user.getIdToken();
        userToken = token; // userToken should be a global variable
        // Update user name - split full name into parts, and take the first part
        const fullName = user.displayName;
        const nameParts = fullName.split(' ');
        userName = nameParts[0]; // Take just the first name
        
        loginButton.style.display = 'none'; // Hide login button
        setGreeting(); // Update greeting after login
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
  const createThing = document.getElementById('createClass-button');
  const thingsList = document.getElementById('thingsList');
  // Helper function to prompt for class name
  
function promptClassName() {
  const className = window.prompt('Enter class name:');
  return className || 'Unnamed Class'; // Default to 'Unnamed Class' if no input is given
}
const joinClassButton = document.getElementById('joinClass-button');
const joinModal = document.getElementById("joinModal");
const span = document.getElementsByClassName("close")[0];
const submitClassCode = document.getElementById("submitClassCode");
const classCodeInput = document.getElementById("classCode");

joinClassButton.onclick = () => {
  joinModal.style.display = "block";
}

submitClassCode.onclick = () => {
  const classCode = classCodeInput.value;
  const user = firebase.auth().currentUser;
  // Find the class with the given code in the database
  db.collection('things').where('code', '==', classCode).get()
    .then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        // doc.data() is never undefined for query doc snapshots
        console.log(doc.id, " => ", doc.data());

        // Add the current user's uid to the members array of the class
        db.collection('things').doc(doc.id).update({
          members: firebase.firestore.FieldValue.arrayUnion(user.uid)
        });
      });

      joinModal.style.display = "none";
    })
    .catch((error) => {
      console.log("Error getting documents: ", error);
    });
}

span.onclick = () => {
  joinModal.style.display = "none";
}

window.onclick = (event) => {
  if (event.target == joinModal) {
    joinModal.style.display = "none";
  }
}

const logoutButton = document.getElementById('logout-button');

logoutButton.addEventListener('click', () => {
  firebase.auth().signOut().then(() => {
    // Sign-out successful.
    console.log("User is signed out.");
    logoutButton.style.display = 'none';
    loginButton.style.display = 'block';
    document.getElementById('class-boxes').hidden = true;
  }).catch((error) => {
    // An error occurred
    console.log("Error in sign-out:", error);
  });
});

auth.onAuthStateChanged(user => {
  if (user) {
    // Database Reference
    thingsRef = db.collection('things')

    const modal = document.getElementById("myModal");
    const span = document.getElementsByClassName("close")[0];
    const submitClassName = document.getElementById("submitClassName");
    const classNameInput = document.getElementById("className");

    createThing.onclick = () => {
      modal.style.display = "block";
    }

    submitClassName.onclick = () => {
      const { serverTimestamp } = firebase.firestore.FieldValue;
      const className = classNameInput.value;
      document.querySelector('#className').value = '';
      thingsRef.add({
        uid: user.uid,
        name: className,
        code: faker.random.alphaNumeric(6), // Generate a random 6-character class code
        createdAt: serverTimestamp(),
        members: [user.uid], // Create an initial members array containing the creator's uid
      });
      

      modal.style.display = "none";
    }

    span.onclick = () => {
      modal.style.display = "none";
    }

    window.onclick = (event) => {
      if (event.target == modal) {
        modal.style.display = "none";
      }
    }
    logoutButton.style.display = 'block';
      // Query
      unsubscribe = thingsRef
          .where('members', 'array-contains', user.uid)
          .orderBy('createdAt')
          .onSnapshot(querySnapshot => {
              const classBoxes = document.getElementById('class-boxes'); // Get the container
              classBoxes.innerHTML = ''; // Clear the container
              
              // Map results to an array of div elements
              querySnapshot.docs.forEach(doc => {
                  const classBox = document.createElement('div');
                  classBox.classList.add('class-box'); // Add a CSS class to style the box
                  classBox.textContent = doc.data().name;
                  classBoxes.appendChild(classBox);
              });
          });

    } else {
      logoutButton.style.display = 'none';
      // Unsubscribe when the user signs out
      unsubscribe && unsubscribe();
    }
  });
  


  
});