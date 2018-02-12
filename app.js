// Initialize Firebase
var config = {
  apiKey: "AIzaSyBHv2bb-G1oVtUaVn5xlpKPRxTRHWd3zGY",
  authDomain: "movieapp-68e9c.firebaseapp.com",
  databaseURL: "https://movieapp-68e9c.firebaseio.com",
  projectId: "movieapp-68e9c",
  storageBucket: "",
  messagingSenderId: "18919260171"
};
firebase.initializeApp(config);
const db = firebase.database();
/*Test*/
/* End of Firebase initlialization */

/* Global Variable for Displayed movies */
var downloadedMovies = [],
  category = "title"; // Contains posts.

/* Set some debug shit here */
if (localStorage.getItem('moviesPerPage') == null) {
  localStorage.setItem('moviesPerPage', '5');
}

$(window).on('load', function() {
  console.log("Window loaded");

  $("#radio01").prop("checked", true);
  console.log($('#radio01').val());
  console.log("FIIIIIIIIIIIIIIIIIIREd");
  // Search EventListener
  $('#search').keypress(function(event) {
    if (event.which == 13) {
      let results = index.search($('#search').val(), {
        fields: {
          title: {
            boost: 3
          },
          director: {
            boost: 3
          },
          year: {
            boost: 3
          },
          imageurl: {
            boost: 1
          },
          time: {
            boost: 1
          }
        }
      });
      console.log(results);
      displayMoviePosters(true, results);
    }
  });

  // Den visar inte första filmen om man har mer än 5 per page, Bläddra sida funkar inte.

  /* Add EventListener for addMovie */
  $(document).on('click', '#addmovieBtn', function(event) {
    setupAddMovie();

  });

  /* Add EventListener for moviesPerPage */
  $(document).on('click', '.sortitem, .mpp', function(event) {
    setupMoviesPerPage(event.target, false);
    displayMoviePosters();
  });

  $('.sortitem, .mpp').contextmenu(function(event) {
    event.preventDefault();
    setupMoviesPerPage(event.target, true);
    displayMoviePosters();
  });

  /*Add EventListener for sort by category */
  let counter = 1;
  $(document).on('click', '#sort', function(event) {
    counter < 3 ? counter++ : counter = 1;
    switch (counter) {
      case 1:
        category = "title";
        $('.category').text("Title");
        displayMoviePosters();
        break;
      case 2:
        category = "year";
        $('.category').text("Year");
        displayMoviePosters();
        break;
      case 3:
        category = "director";
        $('.category').text("Director");
        displayMoviePosters();
        break;
    }

  });

  /* Add EventListener for sync */
  $(document).on('click', '#sync', function(event) {
    console.log('Sync was pressed! Reloading the movies.');
    displayMoviePosters();
  });

  /* Display Movies */
  let moviesPerPage = Number.parseInt(localStorage.getItem('moviesPerPage'));
  let i = 0;
  let once = true;
  /* Display 5 movies for now */

  db.ref('movies/').on('child_added', function(snapshot) {

    if (once) {
      pageLoaded();
      setTimeout(function() {
        /* setPage */
        setPage(1);
        addMovieDiv();
      }, 200);
      once = false;
    }


    let data = snapshot.val();
    let dataKey = snapshot.key;

    let post = new Poster(data.title, data.director, data.year, data.imageurl, data.time);
    post.setKey(dataKey);
    index.addDoc(post);
    // Display the post here for now.
    if (i < moviesPerPage) {
      displayPoster(post);
      i++;
    }


    //Post it to the downloadedMovies
    downloadedMovies.push(post);
    // post.push();
  });


  //End of callback
});

/* Classes */

class Poster {
  constructor(title, director, year, imageurl, time) {
    this.title = title;
    this.director = director;
    this.year = year;
    this.imageurl = imageurl;
    this.time = time == null ? firebase.database.ServerValue.TIMESTAMP : time;
  }
  push() {
    db.ref('movies/').push(this);
  }
  remove() {
    console.log('The key of this post is:',this.key);
    if (this.key != null) {
      db.ref('movies/' + this.key).remove();

      // Remove it from the downloadedMovies Array, LOOL funkade på första försöket :s
      let removeIndex = downloadedMovies.findIndex(x => (x == this));
      downloadedMovies.splice(removeIndex,1);
      console.log('Movie removed successfully!');
    } else {
      console.log('This poster cannot be removed since no key has been set!');
    }
  }
  update(){
    db.ref('movies/' + this.key).set(this);
  }
  setImage(imageURL){
    this.imageurl = imageURL;
  }
  setKey(key) {
    this.key = key;
  }
}

/* Functions */
var index = elasticlunr(function() {
  this.addField('director');
  this.addField('imageurl');
  this.setRef('key');
  this.addField('time');
  this.addField('title');
  this.addField('year');
});

function pageLoaded() {

  /* Set moviesPerPage */
  $('.sortitem, .mpp').html(localStorage.getItem('moviesPerPage'));

  /* Show this when loaded */
  $('.arrow, .pageNumbers, #addmovie').removeClass('hidden');
  $('.topbar').css('display', 'flex');

  /* Hide this when loaded */
  $('.spinner').addClass('hidden');

}

/* Display movies based on category, filter, moviesPerPage and currentpage */
function displayMoviePosters(search = false, post) {
  /*
  category = What category to sort by. title/director/year/newest/oldest*/
  removeAddMovieDiv();


  if (typeof(category) == "string") {
    downloadedMovies.sort(function(a, b) {
      if (a[category] < b[category]) return -1;
      if (a[category] > b[category]) return 1;
      return 0
    })
  } else if (typeof(category) == "number") {
    downloadedMovies.sort(function(a, b) {
      return a - b;
    })
  }
  $('.poster').remove(); // Remove all displayed posters.
  let mpp = Number.parseInt(localStorage.getItem('moviesPerPage')); // moviesPerPage
  let currentPage = Number.parseInt(localStorage.getItem('currentPage'));
  console.log('CURRENT PAGE IS: ', currentPage);
  // 5 * 1 = 5 - 5 = 0; 10 * 2 = 20 - 10 = 10 -> 10 * 2 = 20

  for (let i = (mpp * currentPage) - mpp; i < (mpp * currentPage); i++) {
    if (i >= downloadedMovies.length) {
      console.log('Out of range. This should be the last page.');
      break;
    } else {
      if (search) {
        if (i >= post.length) {
          break
        };
        displayPoster(post[i].doc, search);
      } else {
        console.log('ELSE');
          if ($('input:radio[name=radio]:checked').val() == 1){
            displayPoster(downloadedMovies[i]);
          } else if ($('input:radio[name=radio]:checked').val() == 2){
            displayPoster(downloadedMovies[downloadedMovies.length - i - 1]);
          }
      }

    }
    console.log('Number:', i)
  }

  addMovieDiv();

}

/* Add addMovieDiv */

function addMovieDiv(){
  let addMovieDiv = document.createElement('div');
  addMovieDiv.setAttribute('id', 'addmovie');
  addMovieDiv.className = 'movieDiv';
  addMovieDiv.innerHTML = `<i id="addmovieBtn" class="fas fa-plus fa-6x"></i>`
  console.log('Run this');
  $('#movieHolder').append(addMovieDiv);
}

function removeAddMovieDiv(){
  $('#addmovie').remove();
}

/* Set a page function */
function setPage(page) {
  let mpp = Number.parseInt(localStorage.getItem('moviesPerPage'));
  let movieAmount = downloadedMovies.length;
  localStorage.setItem('currentPage', page);
  $("html, body").animate({ scrollTop: 0 }, 900);


  let pages = Math.ceil(movieAmount / mpp);
  console.log('Number of movies in our database:', movieAmount);
  console.log('Pages: ', Math.ceil(pages));

  //Create the arrows
  let leftArrow = document.createElement('span');
  leftArrow.className = 'arrow';
  leftArrow.innerHTML = '<i class="fas fa-caret-left fa-3x"></i>';
  leftArrow.addEventListener('click', function() {
    setPage(page - 1);
    displayMoviePosters();
  });


  let rightArrow = document.createElement('span');
  rightArrow.className = 'arrow';
  rightArrow.innerHTML = '<i class="fas fa-caret-right fa-3x"></i>';
  rightArrow.addEventListener('click', function() {
    setPage(page + 1);
    displayMoviePosters();
  });

  // Create the list.
  let spanNumbers = document.createElement('span');
  let list = document.createElement('ul');
  list.className = 'pageNumbers';
  spanNumbers.className = 'pageNumbers';

  for (let i = 1; i <= pages; i++) {
    let listItem = document.createElement('li');

    listItem.innerText = i;
    // Set current.
    let added = false,
      current = false;
    //Append or not append? The number needs to be close to page!
    if (i > page - 4 && i < page) {
      added = true;
    } else if (i < page + 4 && i > page) {
      added = true;
    } else if (i == page) {
      added = true;
      current = true;
    }

    if (added) {
      if (current) {
        listItem.className = 'current noselect';
      } else {
        listItem.className = 'noselect';
      }

      listItem.addEventListener('click', function() {
        setPage(i);
        displayMoviePosters();
      });
      list.appendChild(listItem);
    }
  }
  spanNumbers.appendChild(list);

  //Clear botbar
  $('#botbar').html('');
  //append to botbar after some checks
  if (page != 1) { // If it's not the first page. Add left arrow
    $('#botbar').append(leftArrow)
  }

  //Always add the middle numbers
  $('#botbar').append(spanNumbers);

  if (page != pages) { // If it's not the last page. Add right arrow
    $('#botbar').append(rightArrow);
  }
}

/* Display a single moviePoster function */
function displayPoster(post, search) {

  let movieDiv = document.createElement('div');
  movieDiv.className = 'movieDiv poster';

  movieDiv.innerHTML = `
    <img draggable="false" src="${post.imageurl}" alt="Movie Poster">
    <p>Titel: ${post.title}</p>
    <p>Årtal: ${post.year}</p>
    <p>Regissör: ${post.director}</p>`;

    let showMoreBtn = document.createElement('button');
    showMoreBtn.innerHTML = '<i class="fas fa-bars"></i>';
    showMoreBtn.className = 'showMoreBtn';


    let showMoreDiv = document.createElement('div');
    showMoreDiv.className = 'hidden';

    let editBtn = document.createElement('button');
    editBtn.className = 'showMoreBtn';
    editBtn.innerHTML = '<i class="fas fa-pencil-alt"></i>'

    let removeBtn = document.createElement('button');
    removeBtn.className = 'showMoreBtn';
    removeBtn.innerHTML = '<i class="fas fa-times"></i>'

    showMoreDiv.appendChild(editBtn);
    showMoreDiv.appendChild(removeBtn);

    /* Add addEventListener */
    showMoreBtn.addEventListener('click', function(){
      if(showMoreDiv.className != 'showMoreDiv'){
        showMoreDiv.className = 'showMoreDiv';
      } else {
        showMoreDiv.className = 'hidden';
      }

      editBtn.addEventListener('click', function(){
        if(editBtn.getAttribute('save')){
          editBtn.removeAttribute('save');

          // Save the changes.
          let newTitle = movieDiv.children[1].children[0];
          let newYear = movieDiv.children[2].children[0];
          let newDirector = movieDiv.children[3].children[0];

          // Change the DOM back!

          /* Start with some Checks */
          if(newTitle.value.length < 2){
            newTitle = newTitle.getAttribute('placeholder');
          } else {
            newTitle = newTitle.value;
          }
          if(newYear.value.length < 2){
            newYear = newYear.getAttribute('placeholder');
          } else {
            newYear = newYear.value;
          }
          if(newDirector.value.length < 2){
            newDirector = newDirector.getAttribute('placeholder');
          } else {
            newDirector = newDirector.value;
          }

          /* Set the values */
          movieDiv.children[1].innerText = 'Title: ' + newTitle;
          movieDiv.children[2].innerText = 'Year: ' + newYear;
          movieDiv.children[3].innerText = 'Director: ' + newDirector;

          /* Set back the button */
          editBtn.innerHTML = '<i class="fas fa-pencil-alt"></i>';


          /* Update in the database */
          post.title = newTitle;
          post.year = newYear;
          post.director = newDirector;

          // Update with the new values!
          post.update();

        } else {
          console.log('INNERHTML IS:',editBtn.innerText);
          movieDiv.children[1].innerHTML = `<input type="text" placeholder="${post.title}">`
          movieDiv.children[2].innerHTML = `<input type="text" placeholder="${post.year}">`
          movieDiv.children[3].innerHTML = `<input type="text" placeholder="${post.director}">`
          console.log(movieDiv.children);

          editBtn.setAttribute('save', 'true');
          editBtn.innerHTML = '<i class="fas fa-save"></i>';
        }

      });

      removeBtn.addEventListener('click', function(){
        post.remove();
        movieDiv.parentNode.removeChild(movieDiv);
      })
    });

  if (search) {
    movieDiv.className = 'movieDiv poster boxShadow';
    // LÄGGER TILL FILMERNA FÖRST finns bättre sätt att göra, typ använda displayMoviePosters med filter
  }
  // Lägg till knappen i movieDiv
  movieDiv.appendChild(showMoreBtn);
  movieDiv.appendChild(showMoreDiv);

  $('#movieHolder').append(movieDiv);


}

/* Setup moviesPerPage function */
function setupMoviesPerPage(target, rightClick) {

  let currentValue = target.innerText - 0;

  if (currentValue >= 50 && !rightClick) {
    currentValue = 0;
  } else if (currentValue <= 5 && rightClick) {
    currentValue = 55;
  }

  if (rightClick) {
    target.innerHTML = (currentValue - 5);
  } else {
    target.innerHTML = (currentValue + 5);
  }
  localStorage.setItem('moviesPerPage', target.innerText - 0);
}

/* Add Movie Function */
function setupAddMovie() {

  let addMovieDiv = $('#addmovie');

  addMovieDiv.html(`
    <div class="imagePlaceHolder">
      <span>No image selected</span>
      <span>Drag and drop a image here</span>
      <span>or</span>

    </div>
    <div class="addFileDiv">
      <span class="addImageBtn"><i class="fas fa-plus fa-2x"></i> <span class="somtingelse"> Add image</span></span>
    </div>
    <input id="addMovieTitle" type="text" placeholder="Titel..">
    <input id="addMovieYear" type="text" placeholder="Årtal..">
    <input id="addMovieDirector" type="text" placeholder="Regissör..">
    <div class="btns">
      <button class="add" id="movieToDbBtn">Add</button>
      <button class="close" id="closeAddMovieBtn">Close</button>
    </div>
  `);

  addMovieDiv.removeAttr('id'); // Remove the ID

  /* Add EventListener for the add Button */
  $(document).on('click', '#movieToDbBtn', function(event) {

    let title = $('#addMovieTitle').val();
    let director = $('#addMovieDirector').val();
    let year = $('#addMovieYear').val();
    let imageURL = $('.imagePlaceHolder').attr('imageurl');

    // if(!imageURL){
    //   imageURL = 'http://dummyimage.com/100x150.jpg/' + bgColor + '/' + textColor;
    // }

    // Create a movie and push it to the database
    let post = new Poster(title, director, year, imageurl);
    console.log('ADDED POST IS: ', post);
    post.push();

    $(document).off('click', '#movieToDbBtn');
    addMovieDiv.attr('id', 'addmovie');
    resetAddMovie();
  });

  /* Add EventListener to add a image btn */
  $(document).on('click', 'span.addImageBtn', function() {
    let imageDiv = document.createElement('div');
    imageDiv.className = 'imageDiv';

    let inputField = document.createElement('input');
    inputField.className = 'imageInputField';
  });

  /* Add EventListener to close the addMovie */
  $(document).on('click', '#closeAddMovieBtn', function() {
    addMovieDiv.attr('id', 'addmovie');
    resetAddMovie();
  })
}

/* Reset movie Function */
function resetAddMovie() {

  let addMovieDiv = $('#addmovie');

  addMovieDiv.html(`<i id="addmovieBtn" class="fas fa-plus fa-6x"></i>`);
  $(document).off('click', 'span.addImageBtn');
}
