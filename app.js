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

$(window).on('load', function(){
  console.log("Window loaded");

  /* Add EventListener for addMovie */
  $(document).on('click', '#addmovieBtn', function(event) {
    setupAddMovie();

  });


  /* Display Movies */
  let moviePerPage = 5;
  let i = 0;
  /* Display 5 movies for now */

  db.ref('movies/').limitToLast(10).on('child_added', function(snapshot) {

    pageLoaded();

    let data = snapshot.val();
    let dataKey = snapshot.key;

    let post = new Poster(data.title, data.director, data.year, data.imageurl, data.time);
    post.setKey(dataKey);

    //console.log('POST: ', post);
      displayPoster(post);
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

  /* Show this when loaded */
  $('.arrow, .pageNumbers, .topbar, #addmovie').removeClass('hidden');

  /* Hide this when loaded */
  $('.spinner').addClass('hidden');

}

function displayPoster(post){

    let movieDiv = document.createElement('div');
    movieDiv.className = 'movieDiv';

    movieDiv.innerHTML = `
    <img draggable="false" src="${post.imageurl}" alt="Movie Poster">
    <p>Titel: ${post.title}</p>
    <p>Årtal: ${post.year}</p>
    <p>Regissör: ${post.director}</p>`;

    $('#movieHolder').prepend(movieDiv);
}

function setupAddMovie(){

  let addMovieDiv = $('#addmovie');

  addMovieDiv.html(`
    <div class="imagePlaceHolder"><span> No image selected <br /> <br />Drag and drop</span></div>
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

    let post = new Poster(title, director, year, 'http://dummyimage.com/100x150.jpg/222/fff');
    console.log('ADDED POST IS: ', post);
    post.push();

    $(document).off('click', '#movieToDbBtn');
    addMovieDiv.attr('id', 'addmovie');
    resetAddMovie();
  });

  $(document).on('click', '#closeAddMovieBtn', function(){
    addMovieDiv.attr('id', 'addmovie');
    resetAddMovie();
  })
}

function resetAddMovie(){

  let addMovieDiv = $('#addmovie');

  addMovieDiv.html(`<i id="addmovieBtn" class="fas fa-plus fa-6x"></i>`);

}
