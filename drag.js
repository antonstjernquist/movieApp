$(window).on('load', function(){

  /* Drag And Drop Image */
  document.addEventListener("drop", function( event ) {
      // prevent default action (open as link for some elements)
      event.preventDefault();
      // move dragged elem to the selected drop target
      console.log(event.dataTransfer.files);
      if ( event.target.className == "imagePlaceHolder" ) {
          if(event.dataTransfer.files.length != 0){

            let file = event.dataTransfer.files[0];

            if(file.type.startsWith('image/')){

              console.log('IMAGE FOUND')
              event.target.innerHTML = "";
              event.target.style.background = 'url('+window.URL.createObjectURL(file)+')';
              event.target.style.backgroundSize = 'cover';
            } else {
              console.log('Something else was dropped here. Reset background.');
              event.target.style.background = "#333";
            }
          }
      } else {
        console.log('Expected: dropImageDiv, Found: ', event.target.innerHTML);
      }

  }, false);

  document.addEventListener("dragenter", function( event ) {
       // highlight potential drop target when the draggable element enters it
       if ( event.target.className == "imagePlaceHolder") {
          event.target.style.background = "#ecd668";
          console.log('FOUND IT');
       }

   }, false);

   document.addEventListener("dragleave", function( event ) {
        // highlight potential drop target when the draggable element enters it
        if ( event.target.className == "imagePlaceHolder" ) {
            event.target.style.background = "#333";
        }

    }, false);
});

/* events fired on the drop targets */
document.addEventListener("dragover", function( event ) {
    // prevent default to allow drop
    event.preventDefault();
}, false);
