import React from 'react';

function AlbumDisplay(props) {

    const list = props.list;

    let imageRefs = [];
    let scrubbedList = [];
    for (var i in list) { // SCRUB OUT DUPLICATE ALBUM COVERS
        if (!imageRefs.includes(list[i].album.images[1].url)) {
            scrubbedList.push(list[i]);
            imageRefs.push(list[i].album.images[1].url);
        }
    }

    return (
        <div className="albumDisplay">
            {scrubbedList.slice(0, 6).map((item) => (
                <div key={item.name + item.track_number} className="imgContainer">
                    <img src={item.album.images[1].url} alt={item.name} />
                </div>
            ))}
        </div>
    )
}

export default AlbumDisplay;