import React, { createContext, useState, useEffect } from 'react';
import termDefaults from '../data/terms';
import Hero from '../components/Hero';
import Dashboard from '../components/Dashboard';
import { toast } from 'react-toastify';

export const DashboardContext = createContext(null);

export function DashboardContextProvider({ children }) {
    const [userProfile, setUserProfile] = useState({});
    const [accessToken, setAccessToken] = useState("");
    const [tokenActive, setTokenActive] = useState(false);
    const [selectedArtistTerm, setSelectedArtistTerm] = useState("medium_term");
    const [selectedTrackTerm, setSelectedTrackTerm] = useState("medium_term");
    const [selectedPlaylistTerm, setSelectedPlaylistTerm] = useState("medium_term");
    const [topArtists, setTopArtists] = useState(termDefaults);
    const [topTracks, setTopTracks] = useState(termDefaults);
    const [recommendedTracks, setRecommendedTracks] = useState(termDefaults);
    const [loadingProgress, setLoadingProgress] = useState(0);

    const onLoaderFinished = () => {
        setLoadingProgress(0)
    }

    let mainContent;
    if (userProfile.display_name !== undefined && tokenActive) {
        mainContent = <Dashboard />
    } else {
        mainContent = <Hero setLoadingProgress={setLoadingProgress} />
    }

    useEffect(() => {
        const parsedHash = new URLSearchParams(window.location.hash.substr(1));
        const accessToken = parsedHash.get('access_token');
        if (accessToken) {
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
    }, [])

    return (
        <DashboardContext.Provider
            value={{
                userProfile,
                setUserProfile,
                accessToken,
                setAccessToken,
                tokenActive,
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
                mainContent,
                onLoaderFinished
            }}
        >
            {children}
        </DashboardContext.Provider>
    );
}