var Twit = require('twit');

var T = new Twit(require('./.config.js'));

var nycId = {id: '2459115'}
var trends = [];
var	typos = [];

//add function to replace chars
String.prototype.replaceAt = function(index, char) {
	return this.substr(0, index) + char + this.substr(index+char.length);
};

(function getTrendingTags(){
	//get trends for the nyc area
	T.get('trends/place', nycId , function (error, data) {
		if (!error){
			for (var i = 0; i <10; i++){
				console.log(data[0].trends[i].name)
				// make sure its a hashtag (phrases are more likely to return a tweet that wasn't actually a typo)
				if (data[0].trends[i].name[0] === '#'){
					trends.push(data[0].trends[i].name);
				};
			};
			console.log(trends);
			getTypos();
		} else {
			console.log(error)
		}
	});
})();

function getTypos(){
	//pick a random trend from the list
	var rTrend = trends[Math.floor(Math.random()*trends.length)];
	console.log(rTrend);
	var word = rTrend.toLocaleLowerCase(),
			length = word.length;
			//make some typos!
			for(var i = 0; i < length; i++) {
						if((i + 1) !== length) {
							var tempWord = word,
								tempChar = tempWord[i];
							tempWord = tempWord.replaceAt(i, tempWord[i + 1]);
							tempWord = tempWord.replaceAt((i + 1), tempChar);
							typos.push(tempWord);
						} else if((i + 1) === length){
							retweetLatest();
						}
				}
}

function getMoreTypos(){
	var keyboard = {"1":["2","q"],"2":["1","q","w","3"],"3":["2","w","e","4"],"4":["3","e","r","5"],"5":["4","r","t","6"],"6":["5","t","y","7"],"7":["6","y","u","8"],"8":["7","u","i","9"],"9":["8","i","o","0"],"0":["9","o","p","-"],"-":["0","p"],"q":["1","2","w","a"],"w":["q","a","s","e","3","2"],"e":["w","s","d","r","4","3"],"r":["e","d","f","t","5","4"],"t":["r","f","g","y","6","5"],"y":["t","g","h","u","7","6"],"u":["y","h","j","i","8","7"],"i":["u","j","k","o","9","8"],"o":["i","k","l","p","0","9"],"p":["o","l","-","0"],"a":["z","s","w","q"],"s":["a","z","x","d","e","w"],"d":["s","x","c","f","r","e"],"f":["d","c","v","g","t","r"],"g":["f","v","b","h","y","t"],"h":["g","b","n","j","u","y"],"j":["h","n","m","k","i","u"],"k":["j","m","l","o","i"],"l":["k","p","o"],"z":["x","s","a"],"x":["z","c","d","s"],"c":["x","v","f","d"],"v":["c","b","g","f"],"b":["v","n","h","g"],"n":["b","m","j","h"],"m":["n","k","j"]};
	//pick a random trend from the list
	var rTrend = trends[Math.floor(Math.random()*trends.length)];
	console.log(rTrend);
	var word = rTrend.toLocaleLowerCase(),
			length = word.length;
	for(var i = 0; i < length; i++ ) {
		if (i === length-1 ) {
			var tempWord = word;
			keyboard[word[i]].forEach(function(character) {
				typos.push(tempWord.replaceAt(i, character).trim());
			});
			retweetLatest();
		} else if (keyboard[word[i]]) {
				var tempWord = word;
				keyboard[word[i]].forEach(function(character) {
					typos.push(tempWord.replaceAt(i, character).trim());
				});
		}
	}
}

function retweetLatest() {
	//pick a random typo from the array
	var typo = typos[Math.floor(Math.random()*typos.length)];
	T.get('search/tweets', {q: typo, count: 1, result_type: "recent", lang: "en"}, function (error, data) {
	  console.log(error, data);
	  // If it finds a match...
	  if (data.statuses[0]) {
			var retweetId = data.statuses[0].id_str;
			//retweet that one
			T.post('statuses/retweet/' + retweetId, { }, function (error, response) {
				if (response) {
					console.log('Success! Check your bot, it should have retweeted something.')
				} else if (error) {
					console.log('There was an error with Twitter:', error);
				}
			})
			//no matches? try again with different typos
	  } else {
			typos=[];
			getMoreTypos();
		}
	});
}

// setInterval(retweetLatest, 1000 * 60 * 60);
