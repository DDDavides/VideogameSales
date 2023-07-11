// function that closes menu
function closeMenu() {
  var dropdowns = document.getElementsByClassName("dropdown-content");
      var i;
      for (i = 0; i < dropdowns.length; i++) {
        var openDropdown = dropdowns[i];
        if (openDropdown.classList.contains('show')) {
          openDropdown.classList.remove('show');
        }
      }
} 

/* When the user clicks on the button, 
toggle between hiding and showing the dropdown content */
function showDropDownToggles(elementId) {
  closeMenu();
  toggles = document.getElementById(elementId);
  toggles.classList.toggle("show");
  if(toggles.getBoundingClientRect().bottom >= window.innerHeight) {
    toggles.style.top = "auto";
    toggles.style.bottom = "0";
    console.log("eccedoo");
  }
  else {
    console.log("NON eccedoo");
  }
    
  }
  
  // Close the dropdown menu if the user clicks outside of it
  window.onclick = function(event) {
    if (!event.target.matches('.dropbtn')) {
        closeMenu();
    }
  }

function displayInteractive(sales) {
  let genres = new Set();
  let platforms = new Set();
  let publishers = new Set();
  let years = new Set();
  sales.forEach(d => {
    if (d.Genre != "N/A") {
      genres.add(d.Genre);
    }
    
    if (d.Platform != "N/A") {
      platforms.add(d.Platform);
    }

    if (d.Publisher != "N/A") {
      publishers.add(d.Publisher);
    }

    if (d.Year != "N/A") {
      years.add(d.Year);
    }
    
  });
  
  genres = Array.from(genres).sort();
  platforms = Array.from(platforms).sort();
  publishers = Array.from(publishers).sort();
  years = Array.from(years).sort();
  checkboxContainer = document.getElementById("genreDropdown");
  genres.forEach(d => {
    checkboxContainer.innerHTML += '<div class="checkbox"><input type="checkbox" id="'+d+'" name="'+d+'" value="'+d+'"><label class="text" for="'+d+'">'+d+'</label><br></div>';
  });

  checkboxContainer = document.getElementById("platformDropdown");
  platforms.forEach(d => {
    checkboxContainer.innerHTML += '<div class="checkbox"><input type="checkbox" id="'+d+'" name="'+d+'" value="'+d+'"><label class="text" for="'+d+'">'+d+'</label><br></div>';
  });

  checkboxContainer = document.getElementById("yearDropdown");
  years.forEach(d => {
    checkboxContainer.innerHTML += '<div class="checkbox"><input type="checkbox" id="'+d+'" name="'+d+'" value="'+d+'"><label class="text" for="'+d+'">'+d+'</label><br></div>';
  });
  console.log(genres);
}