const characterImages = document.querySelectorAll(".image-container img");
const hiddenInput = document.querySelector(".hidden");

characterImages.forEach((character) => {
  const smallCharacterImage = document.querySelector(".small-character-image");
  character.addEventListener("click", (e) => {
    selectedCharacter = e.target.src;
    console.log("clicked");
    smallCharacterImage.innerHTML = `<img class="image4" src="${selectedCharacter}" alt="">`;
    hiddenInput.src = selectedCharacter;
    hiddenInput.value = selectedCharacter;
  });
});
