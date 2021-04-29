const got = require("got");

async function fetch_suggestions(query_string, callback) {
    if (query_string.length >= 5 || query_string.startsWith("wiki:")) {
        if(query_string.startsWith("wiki:")) { query_string = query_string.substr(5); }

        var query_matches = await got(`https://en.wikipedia.org/w/api.php?origin=*&action=query&list=search&format=json&srsearch=${query_string}`).json();

        if (!query_matches.query.search.length == 0) {
            var top_hit = query_matches.query.search.shift();
            var top_hit_thumbnail = await got(`https://en.wikipedia.org/w/api.php?origin=*&action=query&pageids=${top_hit.pageid}&format=json&prop=pageimages`).json();

            try {
                top_hit_thumbnail = top_hit_thumbnail.query.pages[top_hit.pageid].thumbnail.source;
            } catch (e) {
                top_hit_thumbnail = "";
            }

            var query_suggestions = [];

            query_suggestions.push({
                wiki_title: top_hit.title,
                wiki_snippet: top_hit.snippet,
                wiki_continue: `https://en.wikipedia.org/wiki/${top_hit.title}`,
                wiki_thumbnail: top_hit_thumbnail,
                wiki_related: [],
            });

            query_matches.query.search.forEach((match) => {
                query_suggestions[0].wiki_related.push({
                    wiki_title: match.title,
                    wiki_continue: `https://en.wikipedia.org/wiki/${match.title}`,
                });
            });

            callback(false, query_suggestions);
        } else {
            callback(true);
        }
    } else {
        callback(true);
    }
}

module.exports = fetch_suggestions;