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

let genreToggled = new Set();
let platformToggled = new Set();
let yearToggled = new Set();

/* When the user clicks on the button, 
toggle between hiding and showing the dropdown content */
function showDropDownToggles(elementId) {
  closeMenu();
  toggles = document.getElementById(elementId);
  toggles.classList.toggle("show");
  // change position of dropdown if it is too close to the bottom of the screen
  if(toggles.getBoundingClientRect().bottom >= window.innerHeight) {
    toggles.style.top = "auto";
    toggles.style.bottom = "0";
  }
  
  // Close the dropdown menu if the user clicks outside of it
  window.onclick = function(event) {
    if (!event.target.matches('.dropbtn') && !event.target.matches('.toggle')) {
        closeMenu();
    }
  }
}

// function that gets the genres, platforms, publishers, and years from the data
// and displays them in the dropdown menus
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
    checkboxContainer.innerHTML += '<div class="checkbox"><input checked=true class="toggle genre" type="checkbox" id="'+d+'" name="'+d+'" value="'+d+'"><label class="text" for="'+d+'">'+d+'</label><br></div>';
  });

  checkboxContainer = document.getElementById("platformDropdown");
  platforms.forEach(d => {
    checkboxContainer.innerHTML += '<div class="checkbox"><input checked=true class="toggle platform" type="checkbox" id="'+d+'" name="'+d+'" value="'+d+'"><label class="text" for="'+d+'">'+d+'</label><br></div>';
  });

  checkboxContainer = document.getElementById("yearDropdown");
  years.forEach(d => {
    checkboxContainer.innerHTML += '<div class="checkbox"><input checked=true class="toggle year" type="checkbox" id="'+d+'" name="'+d+'" value="'+d+'"><label class="text" for="'+d+'">'+d+'</label><br></div>';
  });

  toggles = document.getElementsByClassName("toggle");
  togglesArray = Array.from(toggles);
  togglesArray.forEach(d => {
    d.onclick = function(mouseEvent) {
      toggle = mouseEvent.target;
      if (toggle.checked) {
        if (toggle.classList.contains("genre")) {
          genreToggled.add(toggle.value);
        } else if (toggle.classList.contains("platform")) {
          platformToggled.add(toggle.value);
        } else if (toggle.classList.contains("year")) {
          yearToggled.add(toggle.value);
        }
      } else {
        if (toggle.classList.contains("genre")) {
          genreToggled.delete(toggle.value);
        } else if (toggle.classList.contains("platform")) {
          platformToggled.delete(toggle.value);
        } else if (toggle.classList.contains("year")) {
          yearToggled.delete(toggle.value);
        }
      }
      filterData(sales);
    }
  });

}

// function that filters the data based on the toggles
function filterData(sales) {
  let filteredData = sales.filter(d => {
    if (genreToggled.size > 0) {
      if (!genreToggled.has(d.Genre)) {
        return false;
      }
    }
    if (platformToggled.size > 0) {
      if (!platformToggled.has(d.Platform)) {
        return false;
      }
    }
    if (yearToggled.size > 0) {
      if (!yearToggled.has(d.Year)) {
        return false;
      }
    }
    return true;
  });
  let colorPalette = d3.interpolateGreens;
  drawChoro(filteredData, colorPalette);
}
