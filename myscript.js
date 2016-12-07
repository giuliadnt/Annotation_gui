var OVERLAPPING_ITEMS = 100;
var MAX_ITEMS = 1000; 

function resetForm() {
    $('#R_').prop('checked', false);
    $('#Non_R').prop('checked', false);
    $('#POS').prop('checked', false);
}

function storeToTable(annotatorId, currentIndex, selected) {
  $('#Data_to_Store tr:last').after('<tr><td>' + annotatorId + '</td><td>'+currentIndex+'</td><td>'+selected+'</td></tr>');
}

function getNextTweet() {
  var pairToReturn = {};

  var seenItems = $.seenItemIdx - 1;
  var indexToUse = -1;
  // If the annotator has seen more than OVERLAPPING_ITEMS tweets
  if (seenItems >= OVERLAPPING_ITEMS) {
    // choose the next tweet randomly (beyond the first 100)
    indexToUse = OVERLAPPING_ITEMS + Math.round(($.tweetList.length - OVERLAPPING_ITEMS) * Math.random());
    console.log("Visiting randomly:" + indexToUse);
  }
  else
  // else
  {
    // get the next one normally
    indexToUse += $.seenItemIdx + 1;
    console.log("Visiting normally:" + indexToUse);
  }
    
  pairToReturn.fullTweet = $.tweetList[indexToUse];
  pairToReturn.noEmoji = $.noEmojiList[indexToUse];

  return pairToReturn;
}

function fillInFormWith(pair) {
  $('#full_tweet').html(pair.fullTweet);
  $('#tweet_no_emoji').html(pair.noEmoji);  
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
    Cookies.set("annotatorId", toReturn);
  }

  // Return the retrieved id
  return toReturn;
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

  // Show first item
  $('#full_tweet').html($.tweetList[0]);
  $('#tweet_no_emoji').html($.noEmojiList[0]);
  
  $.seenItemIdx = 1; // Initialize next item index
  // Assign click event to submission button
  $('#sub').on('click', function(e){
    e.preventDefault(); // Disable actual submission

    // Get submitted data
    var selected = $("input[name='Tag']:checked").val();
    // Store to table
    storeToTable(getAnnotatorID(), $.seenItemIdx - 1, selected);
    
    // Reset form
    resetForm();

    // Get next tweet and fill in the related controls
    fillInFormWith(getNextTweet());
  
    // Increase next item count
    $.seenItemIdx += 1;

    // Check if we have reached the end
    if ($.seenItemIdx >= MAX_ITEMS) {
      // If so, then move to a thank you page
      window.location.href = 'Zlast_page.html';
    } //if()

  }); //$('#sub').on
  
}); //$.getJSON*/

