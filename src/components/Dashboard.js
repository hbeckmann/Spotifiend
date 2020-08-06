import React, {useEffect, useState} from 'react';
import SpotChart from './SpotChart.js';

function Dashboard(props) {

  let loadingProgress = props.loadingProgress;
  let setLoadingProgress = props.setLoadingProgress;
  let onLoaderFinished = props.onLoaderFinished;

  const [genreData, setGenreData] = useState(
    {
      short_term: [],
      medium_term: [],
      long_term: []
    });
  const toastOptions = {
    autoClose: 8000
  }

  const handleTokenExpired = () => {
    props.toast.warn("Token has expired. Please sign in again.", toastOptions);
    props.setTokenActive(false);
  }

  const compileGenreData = (data, term) => {
    let finishedGenres = [];
    let genreObject = {};
    let unsortedGenres = data.items.map((item) => item.genres);
    unsortedGenres.map((artist) => {
       return artist.map((item) => {
         if (genreObject[item] >= 1) {
           return genreObject[item] = genreObject[item] + 1;
         } else {
           return genreObject[item] = 1;
         }
       })
    });
    finishedGenres = Object.entries(genreObject).sort((a, b) => b[1] - a[1] ).map((item) => ({name: item[0], value: item[1]}) ); //Convert obj to arr, sorts by highest value and then maps into array that rechart can consume
    let updatedGenreData = { ...genreData };
    updatedGenreData[term] = finishedGenres;
    setGenreData(updatedGenreData);
    console.log("GENRE DATA", finishedGenres);
  }

  const getMusicInfo = (type, term, token, settings) => {

    if (settings === undefined) {
      settings = {
        playlist: false,
        recommendation: false //reminant from when I had term buttons for recommendations -- might bring back later
      }
    }

    if(type === "artists" && props.topArtists[term].length > 0) {
      props.setSelectedArtistTerm(term);
      setLoadingProgress(100);
      return
    }

    if(type === "tracks" && props.topTracks[term].length > 0) {
      if(settings.playlist) {
        props.setSelectedPlaylistTerm(term);
      } else {
        props.setSelectedTrackTerm(term);
      }
      setLoadingProgress(100);
      return
    }

    let endpoint;
    if(type === "artists" || type === 'tracks') {
      console.log(`Fetching top ${type}`);
      endpoint = `https://api.spotify.com/v1/me/top/${type}?time_range=${term}&limit=50`;
    } else {
      console.error("Incorrect music type");
      return
    }

    fetch(endpoint, {
      headers: {
        "Authorization": "Bearer " + token,
        'Content-Type': 'application/json'
      }
    })
    .then(response => {
      if (response.status === 401) {
        handleTokenExpired();
        setLoadingProgress(100);
      }
      return response.json()
    })
    .then(data => {
      console.log(data);
      if(type === "artists") {
        let updatedTopArtists = { ...props.topArtists };
        updatedTopArtists[term] = data.items;
        props.setTopArtists(updatedTopArtists);
        props.setSelectedArtistTerm(term);
        getArtistRecommendations(data.items, token, term);
        compileGenreData(data, term);
        setLoadingProgress(100);
      }

      if(type === "tracks") {
        let updatedTopTracks = { ...props.topTracks };
        updatedTopTracks[term] = data.items;
        props.setTopTracks(updatedTopTracks);
        if(settings.playlist) {
          props.setSelectedPlaylistTerm(term);
        } else {
          props.setSelectedTrackTerm(term);
        }
        getTrackAudioFeatures(data.items, updatedTopTracks, token, term); //have to pass the updatedTopTracks instead of using props.topTracks later because the closure won't update
        setLoadingProgress(100);
      }

    })
    .catch((error) => {
      console.error('Error: ', error);
      setLoadingProgress(100);
    })
  }

  const createPlaylist = (userProfile, token, trackList, setLoadingProgress, term) => {

    let termName;
    switch(term) {
      case "short_term":
        termName = "Short Term";
        break;
      case "medium_term":
        termName = "Medium Term";
        break;
      case "long_term":
        termName = "Long Term";
        break;
      default:
        termName = "LongTerm";
    }

    setLoadingProgress(40);
    let reqBody = {
      name: `My ${termName} Favorites`
    };

    fetch(`https://api.spotify.com/v1/users/${userProfile.id}/playlists`, {
      method: 'POST',
      headers: {
        "Authorization": "Bearer " + token,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(reqBody)
    })
    .then(response => {
      if (response.status === 401) {
        handleTokenExpired();
      }
      return response.json()
    })
    .then(data => {
      console.log(data);
      setLoadingProgress(60);
      addPlaylistItems(data, token, trackList, setLoadingProgress);
    })
    .catch((error) => {
      console.error('Error: ', error);
    })

  }

  const addPlaylistItems = (playlistInfo, token, trackList, setLoadingProgress) => {

    setLoadingProgress(70);

    let reqBody = trackList.map((item) => item.uri);

    fetch(`https://api.spotify.com/v1/playlists/${playlistInfo.id}/tracks`, {
      method: 'POST',
      headers: {
        "Authorization": "Bearer " + token,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(reqBody)
    })
    .then(response => {
      if (response.status === 401) {
        handleTokenExpired();
      }
      return response.json()
    })
    .then(data => {
      console.log(data);
      setLoadingProgress(100);
      props.toast.success("Playlist created!", toastOptions);

    })
    .catch((error) => {
      console.error('Error: ', error);
    })

  }

  const getArtistRecommendations = (artistInfo, token, term) => {

    let seedArtists = artistInfo.slice(0,5).map((item) => (item.id));
    console.log("GET ARTIST recommendations");

    fetch(`https://api.spotify.com/v1/recommendations?seed_artists=${seedArtists.toString()}&min_popularity=50&market=US`, {
      headers: {
        "Authorization": "Bearer " + token,
        'Content-Type': 'application/json'
      }
    })
    .then(response => {
      if (response.status === 401) {
        handleTokenExpired();
      }
      return response.json()
    })
    .then(data => {
      console.log("Recommended artist: ", data);
      if (data.error && data.error.status === 400) { //Stop if invalid request
        return
      }
      let updatedRecommendedTracks = { ...props.recommendedTracks };
      console.log("UPDATED RECOMMENDED TRACKS: ", updatedRecommendedTracks[term]);
      let updatedRecommendedTracksWithTerm = updatedRecommendedTracks[term].concat(data.tracks);
      updatedRecommendedTracks[term] = Array.from(new Set(updatedRecommendedTracksWithTerm.map(a => a.id)))
        .map(id => {
          return updatedRecommendedTracksWithTerm.find(a => a.id === id)
        }); //Create new array of only unique ids. Use ids to filter out duplicate objects.
      props.setRecommendedTracks(updatedRecommendedTracks);
      console.log("ARTIST_TERM: ", term, "  RECOMMENDED_TRACKS_ARRAY: ", updatedRecommendedTracks);
    })
    .catch((error) => {
      console.error('Error: ', error);
    })

  }

  const getTrackAudioFeatures = (tracksInfo, topTracks, token, term) => {

    let trackIds = tracksInfo.map((item) => item.id);

     console.log("Get Audio Features: ", tracksInfo);
    fetch(`https://api.spotify.com/v1/audio-features/?ids=${trackIds.toString()}`, {
      headers: {
        "Authorization": "Bearer " + token,
        'Content-Type': 'application/json'
      }
    })
    .then(response => {
      if (response.status === 401) {
        handleTokenExpired();
      }
      return response.json()
    })
    .then(data => {
      if (data.error && data.error.status === 400) { //Stop if invalid request
        return
      }
      console.log(data);
      let updatedTopTracks = { ...topTracks };
      updatedTopTracks[term] = updatedTopTracks[term].map((item, index) => { return {...item, audio_features: data.audio_features[index]} });
      console.log("Audio Feature Data: ", updatedTopTracks);
      props.setTopTracks(updatedTopTracks); //append audio feature data to topTracks list
    })
    .catch((error) => {
      console.error('Error: ', error);
    })

  }

  useEffect(() => {

    if(props.accessToken) {

      getMusicInfo('artists', props.selectedArtistTerm, props.accessToken, { recommendation: true});
      getMusicInfo('tracks', props.selectedTrackTerm, props.accessToken, {});

    }
  },[props.accessToken])

  // useEffect(() => {
  //
  //   getTrackAudioFeatures(props.topTracks[props.selectedTrackTerm], props.accessToken, props.selectedTrackTerm);
  //
  // },[props.topTracks])

  return (
    <>
      <div className="dashboard musicInfo">
        <div className="container" id="slideAnimation">
          <div className="cardHeader">
            <h1 className="top"> My Top Artists </h1>
            <TermButtons getMusicInfo={getMusicInfo} accessToken={props.accessToken} setTopArtists={props.setTopArtists} topArtists={props.topArtists} setSelectedTerm={props.setSelectedArtistTerm} setLoadingProgress={setLoadingProgress} type="artists"/>
          </div>
          <div className="topArtistList">
            { props.topArtists[props.selectedArtistTerm].length > 0 ? <CardList cardList={props.topArtists[props.selectedArtistTerm]} accessToken={props.accessToken} trackList={false} /> : "" }
          </div>
          <div className="cardHeader">
            <h1 className="top"> My Top Genres </h1>
          </div>
          <SpotChart genreData={genreData[props.selectedArtistTerm]} />
          <div className="cardHeader">
            <h1 className="top"> My Top Tracks </h1>
            <TermButtons getMusicInfo={getMusicInfo} accessToken={props.accessToken} setTopTracks={props.setTopTracks} topTracks={props.topTracks} setSelectedTerm={props.setSelectedTrackTerm} setLoadingProgress={setLoadingProgress} type="tracks"/>
          </div>
          <div className="topArtistList">
            { props.topTracks[props.selectedTrackTerm].length > 0 ? <CardList cardList={props.topTracks[props.selectedTrackTerm]} accessToken={props.accessToken} trackList={true} /> : "" }
          </div>
          <div className="featureContainer">
            { props.topTracks[props.selectedTrackTerm].length > 0 && props.topTracks[props.selectedTrackTerm][0].audio_features ? <AudioFeatureList topTracks={props.topTracks[props.selectedTrackTerm]} title={"Best Danceability"} feature={"danceability"} /> : "" }
            { props.topTracks[props.selectedTrackTerm].length > 0 && props.topTracks[props.selectedTrackTerm][0].audio_features ? <AudioFeatureList topTracks={props.topTracks[props.selectedTrackTerm]} title={"Highest Energy"} feature={"energy"} /> : "" }
            { props.topTracks[props.selectedTrackTerm].length > 0 && props.topTracks[props.selectedTrackTerm][0].audio_features ? <AudioFeatureList topTracks={props.topTracks[props.selectedTrackTerm]} title={"Fastest Tempo"} feature={"tempo"} /> : "" }
            { props.topTracks[props.selectedTrackTerm].length > 0 && props.topTracks[props.selectedTrackTerm][0].audio_features ? <AudioFeatureList topTracks={props.topTracks[props.selectedTrackTerm]} title={"Loudest Tracks"} feature={"loudness"} /> : "" }
            { props.topTracks[props.selectedTrackTerm].length > 0 && props.topTracks[props.selectedTrackTerm][0].audio_features ? <AudioFeatureList topTracks={props.topTracks[props.selectedTrackTerm]} title={"Most Upbeat"} feature={"valence"} /> : "" }
            { props.topTracks[props.selectedTrackTerm].length > 0 && props.topTracks[props.selectedTrackTerm][0].audio_features ? <AudioFeatureList topTracks={props.topTracks[props.selectedTrackTerm]} title={"Highest Speechiness"} feature={"speechiness"} /> : "" }
          </div>
        </div>
      </div>
      <CreatePlaylistRow topTracks={props.topTracks} selectedTrackTerm={props.selectedTrackTerm} selectedPlaylistTerm={props.selectedPlaylistTerm} loadingProgress={loadingProgress} setLoadingProgress={setLoadingProgress} createPlaylist={createPlaylist} getMusicInfo={getMusicInfo} accessToken={props.accessToken} userProfile={props.userProfile} setSelectedTerm={props.setSelectedTrackTerm} setLoadingProgress={setLoadingProgress} />
      <div className="dashboard">
        <div className="container" id="slideAnimation">
          <div className="cardHeader">
            <h1 className="top"> Songs You May Enjoy </h1>
          </div>
          <div className="topArtistList">
            { props.recommendedTracks[props.selectedArtistTerm].length > 0 ? <CardList cardList={props.recommendedTracks[props.selectedArtistTerm]} accessToken={props.accessToken} trackList={true} recommended={true} getArtistRecommendations={() => getArtistRecommendations(props.topArtists[props.selectedArtistTerm], props.accessToken, props.selectedArtistTerm)} /> : "" }
          </div>
        </div>
      </div>
    </>
  )

}

function CardList(props) {

  const cardList = props.cardList;

  return (
    <>
      {cardList.map((item) => (
        <Card key={item.name + item.track_number} cardInfo={item} accessToken={props.accessToken} trackList={props.trackList} />
      ))}
      { props.recommended ? <FindMoreCard getArtistRecommendations={props.getArtistRecommendations} /> : "" }
    </>
  )

}

function Card(props) {

  const cardInfo = props.cardInfo;
  let imgSrc;
  let detailsText = "";

  if(props.trackList) {
    imgSrc = cardInfo.album.images[0].url;
    detailsText = cardInfo.artists[0].name;
  } else {
    imgSrc = cardInfo.images[0].url;
  }

  return (
    <a href={cardInfo.external_urls.spotify} rel="noreferrer noopener" target="_blank">
      <div className="card">
        <div className="cardImgContainer">
          <img src={imgSrc} alt={cardInfo.name} className="cardImg" />
        </div>
        <div className="cardText">
          <h3>{cardInfo.name}</h3>
          <h4>{detailsText}</h4>
        </div>
      </div>
    </a>
  )

}

function FindMoreCard(props) {

  return (
    <div className="card" onClick={() => props.getArtistRecommendations()}>
      <div className="cardImgContainer">
        <img src="./images/add2.png" alt="Find more songs" className="cardImg" />
      </div>
      <div className="cardText">
        <h3>Find More Songs</h3>
      </div>
    </div>
  )

}

function AudioFeatureList(props) {

  let sortedTracks = props.topTracks.slice().sort((a, b) => b.audio_features[props.feature] - a.audio_features[props.feature] ).slice(0, 6);

  return (
    <div className="audioFeatureList">
      <h1>{props.title}</h1>
      {sortedTracks.map((item) => (
        <AudioFeatureRow key={item.name + " feature " + item.id} item={item} feature={props.feature} />
      ))}
    </div>
  )

}

function AudioFeatureRow(props) {

  let item = props.item;

  return (
    <a href={item.external_urls.spotify} rel="noreferrer noopener" target="_blank">
      <div className="audioFeatureRow">
        <div className="featureLeft">
          <div key={item.name + item.track_number + "feature"} className="imgContainer">
            <img src={item.album.images[1].url} alt={item.name} />
          </div>
          <div className="featureTitle">
            <h3>{item.name}</h3>
            <h4>{item.artists[0].name}</h4>
          </div>
        </div>
        <div className="featureValue">
          { props.feature === "loudness" ? <h2>{item.audio_features[props.feature] + " dB"}</h2> : <h2>{item.audio_features[props.feature]}</h2> }
        </div>
      </div>
    </a>
  )

}

function AlbumDisplay(props) {

  const list = props.list;

  let imageRefs = [];
  let scrubbedList = [];
  for (var i in list) { // SCRUB OUT DUPLICATE ALBUM COVERS
    if(!imageRefs.includes(list[i].album.images[1].url)) {
      scrubbedList.push(list[i]);
      imageRefs.push(list[i].album.images[1].url);
    }
  }

  return (
    <div className="albumDisplay">
      {scrubbedList.slice(0,6).map((item) => (
        <div key={item.name + item.track_number} className="imgContainer">
          <img src={item.album.images[1].url} alt={item.name} />
        </div>
      ))}
    </div>
  )

}

function AlbumDisplayPlaceholder() {

  return (
    <div className="albumDisplay">
      <div className="imgContainer">
      </div>
      <div className="imgContainer">
      </div>
      <div className="imgContainer">
      </div>
      <div className="imgContainer">
      </div>
      <div className="imgContainer">
      </div>
      <div className="imgContainer">
      </div>
    </div>
  )

}

function CreatePlaylistRow(props) {

  return (
    <>
      <div className="dashboard gradientBG">
        <div className="container">
          <div className="createPlaylistRow">
            <div className="textBlock">
              <h1>
                Save it for later
              </h1>
              <h2>
                Combine your top tracks into a playlist
              </h2>
              <div className="createPlaylistButtons">
                <div className="playlistTerms">
                  <TermButtons getMusicInfo={props.getMusicInfo} accessToken={props.accessToken} setTopTracks={props.setTopTracks} topTracks={props.topTracks} setSelectedTerm={props.setSelectedTrackTerm} type="tracks" settings={{playlist: true}} setLoadingProgress={props.setLoadingProgress} />
                </div>
                <button className="spotButton" onClick={() => (props.createPlaylist(props.userProfile, props.accessToken, props.topTracks[props.selectedPlaylistTerm], props.setLoadingProgress, props.selectedPlaylistTerm))}>Create Playlist</button>
              </div>
            </div>
            { props.topTracks[props.selectedPlaylistTerm].length > 0 ? (
              <AlbumDisplay list={props.topTracks[props.selectedPlaylistTerm]} />
            ) : (
              <AlbumDisplayPlaceholder />
            )}
          </div>
        </div>
      </div>
    </>
  )

}

function TermButtons(props) {

  let settings;
  if(props.settings === undefined) {
    settings = {};
  } else {
    settings = props.settings;
  }

  const [activeArr, setActiveArr] = useState(
    [
      {
        name:'Short Term',
        term: 'short_term',
        status:''
      },
      {
        name:'Mid Term',
        term: 'medium_term',
        status:'active'
      },
      {
        name:'Long Term',
        term: 'long_term',
        status:''
      }
    ]);

  let activateTerm = (index) => {
    let updatedArr = [];
    for(let i in activeArr) {
      updatedArr.push({});
      updatedArr[i].name = activeArr[i].name;
      updatedArr[i].term = activeArr[i].term;
      if(Number(i) === Number(index)) {
        updatedArr[i].status = "active";
      } else {
        updatedArr[i].status = "";
      }
    }
    setActiveArr(updatedArr);
  }

  return (
    <div className="termButtons">
      {activeArr.map((item, index) => (
        <TermButton key={item.name} name={item.name} status={item.status} onClick={() => {
           activateTerm(index);
           props.setLoadingProgress(80);
           props.getMusicInfo(props.type, item.term, props.accessToken, settings)
         }} />
      ))}
    </div>
  )

}

function TermButton(props) {

  return (
    <a onClick={props.onClick}><h4 className={props.status} >{props.name}</h4></a>
  )

}

export default Dashboard;
