import React, { useEffect, useState, useContext } from 'react';
import SpotChart from './SpotChart.js';
import { toast } from 'react-toastify';
import termDefaults from '../data/terms';
import TermButtons from './common/TermButtons';
import { CardList } from './common/Cards';
import CreatePlaylistRow from './common/CreatePlaylistRow';
import { AudioFeatureList } from './common/AudioFeatures';
import AUDIO_FEATURES from '../data/audioFeatures';
import { DashboardContext } from '../context/DashboardContext';

function Dashboard() {
    const {
        userProfile,
        accessToken,
        setTokenActive,
        selectedArtistTerm,
        setSelectedArtistTerm,
        selectedTrackTerm,
        setSelectedTrackTerm,
        selectedPlaylistTerm,
        setSelectedPlaylistTerm,
        topArtists,
        setTopArtists,
        topTracks,
        setTopTracks,
        recommendedTracks,
        setRecommendedTracks,
        loadingProgress,
        setLoadingProgress,
     } = useContext(DashboardContext);

    const [genreData, setGenreData] = useState(termDefaults);
    const toastOptions = {
        autoClose: 8000
    }

    const trackAudioDataExists = topTracks[selectedTrackTerm].length > 0 && topTracks[selectedTrackTerm][0].audio_features;

    const handleTokenExpired = () => {
        toast.warn("Token has expired. Please sign in again.", toastOptions);
        setTokenActive(false);
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
        finishedGenres = Object.entries(genreObject).sort((a, b) => b[1] - a[1]).map((item) => ({ name: item[0], value: item[1] })); //Convert obj to arr, sorts by highest value and then maps into array that rechart can consume
        let updatedGenreData = { ...genreData };
        updatedGenreData[term] = finishedGenres;
        setGenreData(updatedGenreData);
    }

    const getMusicInfo = (type, term, token, settings) => {

        if (settings === undefined) {
            settings = {
                playlist: false,
                recommendation: false //reminant from when I had term buttons for recommendations -- might bring back later
            }
        }

        if (type === "artists" && topArtists[term].length > 0) {
            setSelectedArtistTerm(term);
            setLoadingProgress(100);
            return
        }

        if (type === "tracks" && topTracks[term].length > 0) {
            if (settings.playlist) {
                setSelectedPlaylistTerm(term);
            } else {
                setSelectedTrackTerm(term);
            }
            setLoadingProgress(100);
            return
        }

        let endpoint;
        if (type === "artists" || type === 'tracks') {
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
                if (type === "artists") {
                    let updatedTopArtists = { ...topArtists };
                    updatedTopArtists[term] = data.items;
                    setTopArtists(updatedTopArtists);
                    setSelectedArtistTerm(term);
                    getArtistRecommendations(data.items, token, term);
                    compileGenreData(data, term);
                    setLoadingProgress(100);
                }

                if (type === "tracks") {
                    let updatedTopTracks = { ...topTracks };
                    updatedTopTracks[term] = data.items;
                    setTopTracks(updatedTopTracks);
                    if (settings.playlist) {
                        setSelectedPlaylistTerm(term);
                    } else {
                        setSelectedTrackTerm(term);
                    }
                    getTrackAudioFeatures(data.items, updatedTopTracks, token, term); //have to pass the updatedTopTracks instead of using topTracks later because the closure won't update
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
        switch (term) {
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
                setLoadingProgress(100);
                toast.success("Playlist created!", toastOptions);

            })
            .catch((error) => {
                console.error('Error: ', error);
            })

    }

    const getArtistRecommendations = (artistInfo, token, term) => {

        let seedArtists = artistInfo.slice(0, 5).map((item) => (item.id));

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
                if (data.error && data.error.status === 400) { //Stop if invalid request
                    return
                }
                let updatedRecommendedTracks = { ...recommendedTracks };
                let updatedRecommendedTracksWithTerm = updatedRecommendedTracks[term].concat(data.tracks);
                updatedRecommendedTracks[term] = Array.from(new Set(updatedRecommendedTracksWithTerm.map(a => a.id)))
                    .map(id => {
                        return updatedRecommendedTracksWithTerm.find(a => a.id === id)
                    }); //Create new array of only unique ids. Use ids to filter out duplicate objects.
                setRecommendedTracks(updatedRecommendedTracks);
            })
            .catch((error) => {
                console.error('Error: ', error);
            })

    }

    const getTrackAudioFeatures = (tracksInfo, topTracks, token, term) => {

        let trackIds = tracksInfo.map((item) => item.id);

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
                let updatedTopTracks = { ...topTracks };
                updatedTopTracks[term] = updatedTopTracks[term].map((item, index) => { return { ...item, audio_features: data.audio_features[index] } });
                setTopTracks(updatedTopTracks); //append audio feature data to topTracks list
            })
            .catch((error) => {
                console.error('Error: ', error);
            })

    }

    useEffect(() => {

        if (accessToken) {

            getMusicInfo('artists', selectedArtistTerm, accessToken, { recommendation: true });
            getMusicInfo('tracks', selectedTrackTerm, accessToken, {});

        }
    }, [accessToken])

    return (
        <>
            <div className="dashboard musicInfo">
                <div className="container" id="slideAnimation">
                    <div className="cardHeader">
                        <h1 className="top"> My Top Artists </h1>
                        <TermButtons getMusicInfo={getMusicInfo} accessToken={accessToken} setTopArtists={setTopArtists} topArtists={topArtists} setSelectedTerm={setSelectedArtistTerm} setLoadingProgress={setLoadingProgress} type="artists" />
                    </div>
                    <div className="topArtistList">
                        {topArtists[selectedArtistTerm].length > 0 ? <CardList cardList={topArtists[selectedArtistTerm]} accessToken={accessToken} trackList={false} /> : ""}
                    </div>
                    <div className="cardHeader">
                        <h1 className="top"> My Top Genres </h1>
                    </div>
                    <SpotChart genreData={genreData[selectedArtistTerm]} />
                    <div className="cardHeader">
                        <h1 className="top"> My Top Tracks </h1>
                        <TermButtons getMusicInfo={getMusicInfo} accessToken={accessToken} setTopTracks={setTopTracks} topTracks={topTracks} setSelectedTerm={setSelectedTrackTerm} setLoadingProgress={setLoadingProgress} type="tracks" />
                    </div>
                    <div className="topArtistList">
                        {topTracks[selectedTrackTerm].length > 0 ? <CardList cardList={topTracks[selectedTrackTerm]} accessToken={accessToken} trackList={true} /> : ""}
                    </div>
                    <div className="featureContainer">
                        { trackAudioDataExists ?
                            AUDIO_FEATURES.map(({ title, feature}) => {
                                return (
                                    <AudioFeatureList topTracks={topTracks[selectedTrackTerm]} title={title} feature={feature} />   
                                );
                            })
                            : ""
                        }
                    </div>
                </div>
            </div>
            <CreatePlaylistRow topTracks={topTracks} selectedTrackTerm={selectedTrackTerm} selectedPlaylistTerm={selectedPlaylistTerm} loadingProgress={loadingProgress} setLoadingProgress={setLoadingProgress} createPlaylist={createPlaylist} getMusicInfo={getMusicInfo} accessToken={accessToken} userProfile={userProfile} setSelectedTerm={setSelectedTrackTerm} />
            <div className="dashboard">
                <div className="container" id="slideAnimation">
                    <div className="cardHeader">
                        <h1 className="top"> Songs You May Enjoy </h1>
                    </div>
                    <div className="topArtistList">
                        {recommendedTracks[selectedArtistTerm].length > 0 ? <CardList cardList={recommendedTracks[selectedArtistTerm]} accessToken={accessToken} trackList={true} recommended={true} getArtistRecommendations={() => getArtistRecommendations(topArtists[selectedArtistTerm], accessToken, selectedArtistTerm)} /> : ""}
                    </div>
                </div>
            </div>
        </>
    )
}

export default Dashboard;
