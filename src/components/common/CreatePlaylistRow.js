import React from 'react';
import AlbumDisplay from './AlbumDisplay';
import AlbumDisplayPlaceholder from './AlbumDisplayPlaceholder';
import TermButtons from './TermButtons';

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
                                    <TermButtons getMusicInfo={props.getMusicInfo} accessToken={props.accessToken} setTopTracks={props.setTopTracks} topTracks={props.topTracks} setSelectedTerm={props.setSelectedTrackTerm} type="tracks" settings={{ playlist: true }} setLoadingProgress={props.setLoadingProgress} />
                                </div>
                                <button className="spotButton" onClick={() => (props.createPlaylist(props.userProfile, props.accessToken, props.topTracks[props.selectedPlaylistTerm], props.setLoadingProgress, props.selectedPlaylistTerm))}>Create Playlist</button>
                            </div>
                        </div>
                        {props.topTracks[props.selectedPlaylistTerm].length > 0 ? (
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

export default CreatePlaylistRow;