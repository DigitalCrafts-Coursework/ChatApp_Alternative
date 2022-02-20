const characterImages = document.querySelectorAll(".image-container img");

characterImages.forEach((character) => {
  const smallCharacterImage = document.querySelector(".small-character-image");
  character.addEventListener("click", (e) => {
    selectedCharacter = e.target.src;
    console.log("clicked");
    smallCharacterImage.innerHTML = `<img class="image4" src="${selectedCharacter}" alt="">`;
  });
});
