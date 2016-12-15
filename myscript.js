
var OVERLAPPING_ITEMS = 100; //set to 100
var MAX_ITEMS = OVERLAPPING_ITEMS + 1000;  //set to 1000


//function exportTableToCSV from stackoverflow 
//http://stackoverflow.com/questions/7161113/how-do-i-export-html-table-data-as-csv-file
//$(document).ready(function () {

function exportTableToCSV($table, filename) {

    var $rows = $table.find('tr:has(td),tr:has(th)'),

        // Temporary delimiter characters unlikely to be typed by keyboard
        // This is to avoid accidentally splitting the actual contents
        tmpColDelim = String.fromCharCode(11), // vertical tab character
        tmpRowDelim = String.fromCharCode(0), // null character

        // actual delimiter characters for CSV format
        colDelim = '","',
        rowDelim = '"\r\n"',

        // Grab text from table into CSV formatted string
        csv = '"' + $rows.map(function (i, row) {
            var $row = $(row), $cols = $row.find('td,th');

            return $cols.map(function (j, col) {
                var $col = $(col), text = $col.text();

                return text.replace(/"/g, '""'); // escape double quotes

            }).get().join(tmpColDelim);

        }).get().join(tmpRowDelim)
            .split(tmpRowDelim).join(rowDelim)
            .split(tmpColDelim).join(colDelim) + '"',

        // Data URI
        csvData = 'data:application/csv;charset=utf-8,' + encodeURIComponent(csv);
        
        console.log(csv);
        
      if (window.navigator.msSaveBlob) { // IE 10+
        //alert('IE' + csv);
        window.navigator.msSaveOrOpenBlob(new Blob([csv], {type: "text/plain;charset=utf-8;"}), "csvname.csv")
      } 
      else {
        $(this).attr({ 'download': filename, 'href': csvData, 'target': '_blank' }); 
      }
}
    
    /*// This must be a hyperlink
    $("#save").on('click', function (event) {
      
        exportTableToCSV.apply(this, [$('#Data_to_Store'), 'export.csv']);
        window.location.href = 'Zlast_page.html'; 
        // IF CSV, don't do event.preventDefault() or return false
        // We actually need this to be a typical hyperlink
    });
*/
//});



function resetForm() {
    $('#R_').prop('checked', false);
    $('#Non_R').prop('checked', false);
    $('#POS').prop('checked', false);
}

/*function storeToTable(annotatorId, currentIndex, selected) {
  $('#Data_to_Store tr:last').after('<tr><td>' + annotatorId + '</td><td>'+currentIndex+'</td><td>'+selected+'</td></tr>');
}*/ //original function

function storeToTable() { //function without parameters
  $('#Data_to_Store tr:last').after('<tr><td>' + getAnnotatorID() + '</td><td>'+$.currentIndex+'</td><td>'+$.selected+'</td></tr>');
}

function firstSession() {
  return (Cookies.get("currentAnnotationID") === undefined);
}

function getNextTweet() {
  var indexToUse = -1;

  // Check if this is the first time
  if ($.currentIndex < 0)
  {
    // If so, then check whether this is not the first session
    if (!firstSession()) {
      // restore the state
      loadState();
      // Indicate the current index
      indexToUse = $.currentIndex;
    }
  }

  var pairToReturn = {};
  if (indexToUse <= -1) {
    // If the annotator has seen more than OVERLAPPING_ITEMS tweets
    if ($.seenItem >= OVERLAPPING_ITEMS) {
      // choose the next tweet randomly (beyond the first 100)
      indexToUse = OVERLAPPING_ITEMS + Math.round(($.tweetList.length - OVERLAPPING_ITEMS) * Math.random());
      console.log("Visiting randomly:" + indexToUse);
    }
    else
    // else
    {
      // get the next one normally
      indexToUse = $.currentIndex + 1;
      console.log("Visiting normally:" + indexToUse);
    }
  }
  else
  {
    console.log("Restored:" + indexToUse);
  }
  
  pairToReturn.itemIndex = indexToUse;  
  pairToReturn.fullTweet = $.tweetList[indexToUse];
  pairToReturn.noEmoji = $.noEmojiList[indexToUse];
    //return pairToReturn;
    
  return {ppair:pairToReturn, iddx:indexToUse};
}

function fillInFormWith(pair) {
  $('#full_tweet').html(pair.fullTweet);
  $('#tweet_no_emoji').html(pair.noEmoji);

  // Update current index
  $.currentIndex = pair.itemIndex;
}

function getAnnotatorID() {
  var toReturn;
  // Check whether we have stored the annotator id, in a cookie
  if (Cookies.get("annotatorId")) {
    // If so, get it
    toReturn = Cookies.get("annotatorId");
  }
  // else
  else {
    // Create a new (random) id
    toReturn = "A" + Math.round(Math.random() * 10000);
    // Store it in a cookie
    Cookies.set("annotatorId", toReturn, { expires: 40 });
  }

  // Return the retrieved id
  return toReturn;
}


function loadState() {
  // Restore from cookies
  $.seenItem = (Cookies.get("annotationNumber") === undefined) ? 0 : parseInt(Cookies.get("annotationNumber"));
  $.currentIndex = (Cookies.get("currentAnnotationID") === undefined) ? -1 : parseInt(Cookies.get("currentAnnotationID"));
}

function saveState() {
  // Store it in cookies
  //var inTwoMinutes = new Date(new Date().getTime() + 2 * 60 * 1000); //for testing
  //console.log(inTwoMinutes);
  Cookies.set("annotationNumber", $.seenItem, {expires: 40});
  Cookies.set("currentAnnotationID", $.currentIndex, {expires: 40});
}

$.getJSON('tweet_pairs3.json', function (data) {
  // Initialize pair lists GLOBALLY
  $.tweetList=[];
  $.noEmojiList=[];
  
  // For each pair
  $.each(data.Pairs, function (i, Pairs) {
    // Update the tweet and noEmoji lists 
    $.tweetList.push(Pairs.full_tweet);
    $.noEmojiList.push(Pairs.tweet_no_emoji);   
  }); //$.each(...)

  // Initialize index pointer and count
  $.currentIndex = -1;
  $.seenItem = 0;
  // Show first item
  var initTweet = getNextTweet();
  // Reset form
  resetForm();
  // Get next tweet and fill in the related controls
  fillInFormWith(initTweet.ppair);
  
  // Assign click event to submission button
  $('#sub').on('click', function(e){
    e.preventDefault(); // Disable actual submission

    // Get submitted data
    //var selected = $("input[name='Tag']:checked").val(); original var
    $.selected = $("input[name='Tag']:checked").val(); //var set as global

    // Store object: pairs and index
    var pairsAndIndex = getNextTweet();
    
    // Store to table: annotator id, pairs index, chosen class
    //storeToTable(getAnnotatorID(), pairsAndIndex.iddx, selected); original function with params
    storeToTable(); //changed function

    // Reset form
    resetForm();

    // Get next tweet and fill in the related controls
    fillInFormWith(pairsAndIndex.ppair);
  
    // Increase next item count
    $.seenItem += 1; 

    
    // Check if we have reached the end
    if ($.seenItem >= MAX_ITEMS) {

      // If so:
      //Disable submission
      $("#sub").attr("disabled", true);

    } //if()

    saveState();

  }); //$('#sub').on

  
  // This must be a hyperlink
  $("#save").on('click', function (event) {

      // Export the data
      exportTableToCSV.apply(this, [$('#Data_to_Store'), 'export.csv']);
      // Then move to the last page
      window.location.href = 'Zlast_page.html'; 
      // IF CSV, don't do event.preventDefault() or return false
      // We actually need this to be a typical hyperlink
  }); //$("#save").on
  
}); //$.getJSON*/









