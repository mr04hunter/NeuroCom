export function initTypingAnimation(username) {
  let text = "Online Chatting App Developed By @mr_hunter01"; 
  if (username) {
    text = "Welcome " + username 
  }
  const typingElement = document.getElementById('typing');
  
  if (!typingElement) return; // Ensure the element exists

  let index = 0;
  
  function type() {
    if (index < text.length) {
      typingElement.textContent += text.charAt(index);
      index++;
      setTimeout(type, 50); // Call type() again after 50ms
    }
  }

  type(); // Start the typing animation
}