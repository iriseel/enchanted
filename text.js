let animationDelay = 0;

function wrapLettersWithSpan() {
    // Get all elements with the class "invitation"
    const invitationElements = document.querySelectorAll('.instruction');
    
    // Iterate through each "invitation" element
    invitationElements.forEach(invitationElement => {
      // Get the text content of the element
      const text = invitationElement.textContent.trim();
  
      // Replace the text content with wrapped letters
      const letters = text.split("");
      const spannedText = letters.map(letter => `<span class="animated-text">${letter}</span>`).join("");
      invitationElement.innerHTML = spannedText;
    });

  document.querySelectorAll('.animated-text').forEach(letter => { 
    animationDelay+=100;
    letter.style.animationDelay = `${animationDelay}ms`;
  });
  }
  
  // Call the function to wrap letters with span elements when the page loads
  window.addEventListener("DOMContentLoaded", wrapLettersWithSpan);


// const letters = document.querySelectorAll('.animated-text');

// document.addEventListener("mousemove", function(event) {
//     const mouseX = event.clientX;
//     const mouseY = event.clientY;

// letters.forEach(letter => {
//     const letterRect = letter.getBoundingClientRect();
//     const letterX = letterRect.left + letterRect.width / 2;
//     const letterY = letterRect.top + letterRect.height / 2;
//     const deltaX = nose_x * 586/.496 - letterX;
//     const deltaY = nose_y * 505/.55 - letterY;
//     const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
//     const maxDistance = Math.min(window.innerWidth, window.innerHeight) / 2;
//     const scaleFactor = Math.max(0.2, 1 - distance / maxDistance);
//     const letterTransformX = deltaX * scaleFactor;
//     const letterTransformY = deltaY * scaleFactor;
//     console.log(nose_x * 586/.496, nose_y * 505/.55, mouseX, mouseY)

//     letter.style.transform = `translate(${letterTransformX}px, ${letterTransformY}px)`;
//   });

// });
