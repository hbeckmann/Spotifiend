import React from 'react';

function Hero(props) {

  let location = `https://accounts.spotify.com/authorize?client_id=bb789d3b0efb474c821885182e1140f8&redirect_uri=${window.location.origin}/&scope=user-read-private%20user-read-email%20playlist-modify-public%20user-top-read&response_type=token`;

  return (
    <div className="heroSection">
      <div>
      </div>
      <div className="heroText">
        <h1>YOUR SPOTIFY STATS</h1>
        <h1>EXACTLY HOW YOU NEED THEM.</h1>
        <h3>Visualize your listening habits  |  See your favorite artists, tracks and genres  |  Create playlists and find new music you'll love.</h3>
        <a href={location} onClick={() => props.setLoadingProgress(90)}><button className="spotButton"> GET STARTED </button></a>
      </div>
    </div>
  )

}

export default Hero;
