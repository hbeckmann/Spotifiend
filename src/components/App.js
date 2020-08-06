import React, {useState, useEffect} from 'react';
import './App.css';
import Header from './common/Header';
import Hero from './Hero';
import Dashboard from './Dashboard';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LoadingBar from 'react-top-loading-bar';
import CookieConsent from 'react-cookie-consent';

function App() {

  const [userProfile, setUserProfile] = useState({});
  const [accessToken, setAccessToken] = useState("");
  const [tokenActive, setTokenActive] = useState(false);
  const [selectedArtistTerm, setSelectedArtistTerm] = useState("medium_term");
  const [selectedTrackTerm, setSelectedTrackTerm] = useState("medium_term");
  const [selectedPlaylistTerm, setSelectedPlaylistTerm] = useState("medium_term");
  const [topArtists, setTopArtists] = useState(
    {
      short_term: [],
      medium_term: [],
      long_term: []
    });
  const [topTracks, setTopTracks] = useState(
    {
      short_term: [],
      medium_term: [],
      long_term: []
    });
  const [recommendedTracks, setRecommendedTracks] = useState(
    {
      short_term: [],
      medium_term: [],
      long_term: []
    });
  const [loadingProgress, setLoadingProgress] = useState(0);

  const onLoaderFinished = () => {
    setLoadingProgress(0)
  }

  let mainContent;
  if(userProfile.display_name !== undefined && tokenActive) {
    mainContent = <Dashboard
      userProfile={userProfile}
      accessToken={accessToken}
      selectedArtistTerm={selectedArtistTerm}
      setSelectedArtistTerm={setSelectedArtistTerm}
      selectedTrackTerm={selectedTrackTerm}
      setSelectedTrackTerm={setSelectedTrackTerm}
      selectedPlaylistTerm={selectedPlaylistTerm}
      setSelectedPlaylistTerm={setSelectedPlaylistTerm}
      topArtists={topArtists}
      setTopArtists={setTopArtists}
      topTracks={topTracks}
      setTopTracks={setTopTracks}
      recommendedTracks={recommendedTracks}
      setRecommendedTracks={setRecommendedTracks}
      setTokenActive={setTokenActive}
      toast={toast}
      loadingProgress={loadingProgress}
      setLoadingProgress={setLoadingProgress}
      onLoaderFinished={onLoaderFinished} />
  } else {
    mainContent = <Hero setLoadingProgress={setLoadingProgress} />
  }


  useEffect(() => {
    const parsedHash = new URLSearchParams(window.location.hash.substr(1));
    const accessToken = parsedHash.get('access_token')
    if(accessToken) {
      console.log(accessToken);
      setAccessToken(accessToken);
      setTokenActive(true);
      fetch("https://api.spotify.com/v1/me", {
        headers: {
          "Authorization": "Bearer " + accessToken,
          'Content-Type': 'application/json'
        }
      })
      .then(response => {
        if (response.status === 401) {
          toast.warn("Token has expired. Please sign in again.", { autoClose: 8000 });
          setTokenActive(false);
        }
        return response.json()
      })
      .then(data => {
        console.log(data);
        setUserProfile(data);
      })
      .catch((error) => {
        console.error('Error: ', error);
      })
    }
  },[])

  return (
    <div className="App">
      <Header userProfile={userProfile} tokenActive={tokenActive} setLoadingProgress={setLoadingProgress} />
      <ToastContainer
        position="top-right"
        autoClose={8000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        />
      {mainContent}
      <CookieConsent
        style={{ background: "black" }}
        buttonStyle={{ background: "#1DB954", color: "white" }}
      >This website uses cookies to enhance the user experience -- by using this site you agree to the <a rel="noreferrer noopener" target="_blank" style={{color: "#1DB954", cursor: "pointer"}} href="https://www.cookiepolicygenerator.com/live.php?token=V3aCHeOj993Dumoh2ERu4aBnoN07eBB4">cookie policy.</a></CookieConsent>
      <div className="loadingHolder">
        <LoadingBar
          className="test"
          progress={loadingProgress}
          height={10}
          color='#1db954'
          onLoaderFinished={() => onLoaderFinished()}
        />
      </div>
    </div>
  );
}

export default App;
