// function that closes menu
function closeMenu() {
  let dropdowns = document.getElementsByClassName("dropdown-content");
  let i;
  for (i = 0; i < dropdowns.length; i++) {
    let openDropdown = dropdowns[i];
    if (openDropdown.classList.contains('show')) {
      openDropdown.classList.remove('show');
    }
  }
}

var genreToggled = new Set();
var platformToggled = new Set();
var yearToggled = new Set();

var genres = new Set();
var platforms = new Set();
var years = new Set();

var allData;

/* When the user clicks on the button, 
toggle between hiding and showing the dropdown content */
function showDropDownToggles(elementId) {
  closeMenu();
  let toggles = document.getElementById(elementId);
  toggles.classList.toggle("show");

  let buttonHeight = document.getElementsByClassName("dropbtn")[0].getBoundingClientRect().height;
  // change position of dropdown if it is too close to the bottom of the screen
  if (toggles.getBoundingClientRect().bottom >= window.innerHeight) {
    toggles.style.top = "auto";
    toggles.style.bottom = buttonHeight + "px";
  }
  let header = document.getElementById("header");

  if (toggles.getBoundingClientRect().top <= header.getBoundingClientRect().bottom) {
    toggles.style.top = buttonHeight + "px";
    toggles.style.bottom = "auto";
  }

  // Close the dropdown menu if the user clicks outside of it
  window.onclick = function (event) {
    if (!event.target.matches('.dropbtn') && !event.target.matches('.toggle') && !event.target.matches('.base_toggle')) {
      closeMenu();
    }
  }
}

// function that gets the genres, platforms, publishers, and years from the data
// and displays them in the dropdown menus
function displayInteractive(sales) {
  // get all the genres, platforms and years
  allData = sales;
  sales.forEach(d => {
    if (d.Genre != "N/A") {
      genres.add(d.Genre);
    }
    if (d.Platform != "N/A") {
      platforms.add(d.Platform);
    }
    if (d.Year != "N/A") {
      years.add(d.Year);
    }
  });

  // sort the genres, platforms and years
  genres = Array.from(genres).sort();
  platforms = Array.from(platforms).sort();
  years = Array.from(years).sort();

  // display the genres, platforms and years in the dropdown menus
  checkboxContainer = document.getElementById("genreDropdown");
  genres.forEach(d => {
    checkboxContainer.innerHTML += '<div class="checkbox"><input checked=true class="toggle" type="checkbox" id="' + d + '" name="genre" value="' + d + '"><label class="text" for="' + d + '">' + d + '</label><br></div>';
  });
  genreToggled = new Set(genres);

  checkboxContainer = document.getElementById("platformDropdown");
  platforms.forEach(d => {
    checkboxContainer.innerHTML += '<div class="checkbox"><input checked=true class="toggle" type="checkbox" id="' + d + '" name="platform" value="' + d + '"><label class="text" for="' + d + '">' + d + '</label><br></div>';
  });
  platformToggled = new Set(platforms);

  checkboxContainer = document.getElementById("yearDropdown");
  years.forEach(d => {
    checkboxContainer.innerHTML += '<div class="checkbox"><input checked=true class="toggle" type="checkbox" id="' + d + '" name="year" value="' + d + '"><label class="text" for="' + d + '">' + d + '</label><br></div>';
  });
  yearToggled = new Set(years);

  // add event listeners to the toggles
  // when a toggle is clicked, add or remove the value of the toggle to the corresponding set
  toggles = document.getElementsByClassName("toggle");
  toggles = Array.from(toggles);
  toggles.forEach(d => {
    d.onclick = function (d) {
      toggle = d.target;
      toggle_name = toggle.getAttribute("name");
      if (toggle.checked) {
        eval(toggle_name + "Toggled.add(toggle.value)");
      } else {
        eval(toggle_name + "Toggled.delete(toggle.value)");
      }
      filterData(allData);
    }
  });

}

// function that filters the data based on the toggles
function filterData(data) {
  let filteredData = data.filter(d => {
    if (!genreToggled.has(d.Genre)) {
      return false;
    }
    if (!platformToggled.has(d.Platform)) {
      return false;
    }
    if (!yearToggled.has(d.Year)) {
      return false;
    }
    return true;
  });
  updateChoro(filteredData);
}

function toggleAll(toggle, toggle_name) {
  toggles = document.getElementsByClassName("toggle");
  toggles = Array.from(toggles);
  if (toggle.checked) {
    eval(toggle_name + "Toggled = new Set(" + toggle_name + "s)");
    toggles.forEach(d => {
      if (d.getAttribute("name") == toggle_name) {
        d.checked = true;
      }
    });
  } else {
    toggles.forEach(d => {
      if (d.getAttribute("name") == toggle_name) {
        d.checked = false;
      }
    });
    eval(toggle_name + "Toggled = new Set()");
  }
  filterData(allData);
}

function getToggledGenres() {
  return genreToggled;
}

function getToggledPlatforms() {
  return platformToggled;
}

function getToggledYears() {
  return yearToggled;
}

