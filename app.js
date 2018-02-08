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

/* End of Firebase initlialization */

/* Global Variable for Displayed movies */
var downloadedMovies = []; // Contains posts.

/* Set some debug shit here */
if(localStorage.getItem('moviesPerPage') == null){
  localStorage.setItem('moviesPerPage', '5');
}

$(window).on('load', function(){
  console.log("Window loaded");

  /* Add EventListener for addMovie */
  $(document).on('click', '#addmovieBtn', function(event) {
    setupAddMovie();

  });

  /* Add EventListener for moviesPerPage */
  $(document).on('click', '.sortitem, .mpp', function(event) {
    setupMoviesPerPage(event.target, false);
  });

  $('.sortitem, .mpp').contextmenu(function(event) {
    event.preventDefault();
    setupMoviesPerPage(event.target, true);
  });

  /*Add EventListener for sort by category */
  $(document).on('click', '.sortitem, .category', function(event) {
    alert('.sortItem, .category');
  });

  /* Add EventListener for sync */
  $(document).on('click', '#sync', function(event){
    console.log('Sync was pressed! Reloading the movies.');
    displayMoviePosters();
  });

  /* Display Movies */
  let moviesPerPage = Number.parseInt(localStorage.getItem('moviesPerPage'));
  let i = 0;
  let once = true;
  /* Display 5 movies for now */

  db.ref('movies/').on('child_added', function(snapshot) {

    if(once){
      pageLoaded();
      setTimeout(function(){
        /* setPage */
        setPage(1);
      }, 200);
      once = false;
    }


    let data = snapshot.val();
    let dataKey = snapshot.key;

    let post = new Poster(data.title, data.director, data.year, data.imageurl, data.time);
    post.setKey(dataKey);

      // Display the post here for now.
      if(i < moviesPerPage){
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

class Poster{
  constructor(title, director, year, imageurl, time){
    this.title = title;
    this.director = director;
    this.year = year;
    this.imageurl = imageurl;
    this.time = time == null ? firebase.database.ServerValue.TIMESTAMP : time;
  }
  push(){
    db.ref('movies/').push(this);
  }
  remove(){
    if(this.key != null){
      db.ref('movies/').remove(this.key);
    } else {
      console.log('This poster cannot be removed since no key has been set!');
    }
  }
  setKey(key){
    this.key = key;
  }
}

/* Functions */

function pageLoaded(){

  /* Set moviesPerPage */
  $('.sortitem, .mpp').html('&nbsp;'+localStorage.getItem('moviesPerPage'));

  /* Show this when loaded */
  $('.arrow, .pageNumbers, #addmovie').removeClass('hidden');
  $('.topbar').css('display', 'flex');

  /* Hide this when loaded */
  $('.spinner').addClass('hidden');

}

/* Display movies based on category, filter, moviesPerPage and currentpage */
function displayMoviePosters(category, filter){
  /*

  category = What category to sort by. title/director/year/newest/oldest
  filter = offlinefilter, only show movies that contains this.   */

  $('.poster').remove(); // Remove all displayed posters.

  let mpp = Number.parseInt(localStorage.getItem('moviesPerPage')); // moviesPerPage
  let currentPage = Number.parseInt(localStorage.getItem('currentPage'));
  console.log('CURRENT PAGE IS: ',currentPage);

              // 5 * 1 = 5 - 5 = 0; 10 * 2 = 20 - 10 = 10 -> 10 * 2 = 20
  for(let i = (mpp * currentPage) - mpp; i < (mpp * currentPage); i++){
    if(i >= downloadedMovies.length){
      console.log('Out of range. This should be the last page.');
      break;

    } else {
      displayPoster(downloadedMovies[i]);
    }

      console.log('Number:',i)
  }

}

/* Set a page function */
function setPage(page){
  let mpp = Number.parseInt(localStorage.getItem('moviesPerPage'));
  let movieAmount = downloadedMovies.length;
  localStorage.setItem('currentPage', page);

  let pages = Math.ceil(movieAmount/mpp);
  console.log('Number of movies in our database:', movieAmount);
  console.log('Pages: ', Math.ceil(pages));

  //Create the arrows
  let leftArrow = document.createElement('span');
  leftArrow.className = 'arrow';
  leftArrow.innerHTML = '<i class="fas fa-caret-left fa-3x"></i>';
  leftArrow.addEventListener('click', function(){
    setPage(page-1);
  });


  let rightArrow = document.createElement('span');
  rightArrow.className = 'arrow';
  rightArrow.innerHTML = '<i class="fas fa-caret-right fa-3x"></i>';
  rightArrow.addEventListener('click', function(){
    setPage(page+1);
  });

  // Create the list.
  let spanNumbers = document.createElement('span');
  let list = document.createElement('ul');
  list.className = 'pageNumbers';
  spanNumbers.className = 'pageNumbers';

  for(let i = 1; i <= pages; i++){
    let listItem = document.createElement('li');

    listItem.innerText = i;
    // Set current.
    let added = false, current = false;
    //Append or not append? The number needs to be close to page!
    if(i > page-4 && i < page){
      added = true;
    } else if(i < page + 4  && i > page) {
      added = true;
    } else if (i == page){
      added = true;
      current = true;
    }

    if(added){
      if(current){
        listItem.className = 'current noselect';
      } else {
        listItem.className = 'noselect';
      }

      listItem.addEventListener('click', function(){
        setPage(i);
      });
      list.appendChild(listItem);
    }
  }
  spanNumbers.appendChild(list);

  //Clear botbar
  $('#botbar').html('');
  //append to botbar after some checks
  if(page != 1){ // If it's not the first page. Add left arrow
    $('#botbar').append(leftArrow)
  }

  //Always add the middle numbers
  $('#botbar').append(spanNumbers);

  if (page != pages){ // If it's not the last page. Add right arrow
    $('#botbar').append(rightArrow);
  }
}

/* Display a single moviePoster function */
function displayPoster(post){

    let movieDiv = document.createElement('div');
    movieDiv.className = 'movieDiv poster';

    movieDiv.innerHTML = `
    <img draggable="false" src="${post.imageurl}" alt="Movie Poster">
    <p>Titel: ${post.title}</p>
    <p>Årtal: ${post.year}</p>
    <p>Regissör: ${post.director}</p>`;

    $('#movieHolder').prepend(movieDiv);
}

/* Setup moviesPerPage function */
function setupMoviesPerPage(target, rightClick){

  let currentValue = target.innerText - 0;

  if(currentValue >= 50 && !rightClick){
    currentValue = 0;
  } else if(currentValue <= 5 && rightClick){
    currentValue = 55;
  }

  if(rightClick){
    target.innerHTML = '&nbsp;' + (currentValue - 5);
  } else {
    target.innerHTML = '&nbsp;' + (currentValue + 5);
  }
  localStorage.setItem('moviesPerPage', target.innerText - 0);
}

/* Add Movie Function */
function setupAddMovie(){

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
  $(document).on('click', '#movieToDbBtn', function (event){

    let title = $('#addMovieTitle').val();
    let director = $('#addMovieDirector').val();
    let year = $('#addMovieYear').val();


    // Random colored images for testing purposes.
    function getRandomNumber(min, max) {
      return Math.random() * (max - min) + min;
    }

    let bgColor = getRandomNumber(0, 555);
    let textColor = getRandomNumber(555,999999);

    // Create a movie and push it to the database
    let post = new Poster(title, director, year, 'http://dummyimage.com/100x150.jpg/'+bgColor+'/'+textColor);
    console.log('ADDED POST IS: ', post);
    post.push();

    $(document).off('click', '#movieToDbBtn');
    addMovieDiv.attr('id', 'addmovie');
    resetAddMovie();
  });

  /* Add EventListener to add a image btn */
  $(document).on('click', 'span.addImageBtn', function(){
    alert('Alert alert, find me here! Good night to you sir!');
  });

  /* Add EventListener to close the addMovie */
  $(document).on('click', '#closeAddMovieBtn', function(){
    addMovieDiv.attr('id', 'addmovie');
    resetAddMovie();
  })
}

/* Reset movie Function */
function resetAddMovie(){

  let addMovieDiv = $('#addmovie');

  addMovieDiv.html(`<i id="addmovieBtn" class="fas fa-plus fa-6x"></i>`);
  $(document).off('click', 'span.addImageBtn');
}
