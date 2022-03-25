import React, { useState } from "react";



export function SearchPhotos() {

    const PHOTO_BUCKET = "a2photobucket";

    const [query, setQuery] = useState("");
    const [labels, setlabels] = useState("");
    const [imageSelected, setImage] = useState(null);
    const [pics, setPics] = useState([]);
    const [listening, setListening] = useState(false);

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.lang = 'en-US';

    recognition.onstart = function() {
        console.log("Listening...");
    };

    recognition.onend= function() {
        console.log("Stop Listening!");
    };

    recognition.onresult= function(event) {
        const current = event.resultIndex;
        const transcript = event.results[current][0].transcript.toLowerCase().trim();
        if(transcript==="stop") {
            recognition.stop();
        }
        else {
            console.log('else:',query)
            setQuery(transcript);
        };
        console.log(transcript)
    };

    function vioceInput(e){
        e.preventDefault()
        if (!listening){
            recognition.start();
            setListening(true);
        } else {
            recognition.stop();
            setListening(false);
        }
        
    };


    const searchPhotos = async (e) => {
        if (e){
            e.preventDefault()
        };
        console.log(`search for ${query}`);
        await fetch(`https://ri9wp1d2z2.execute-api.us-east-1.amazonaws.com/a2/search?q=${query}`,
                {headers:{
                    "x-api-key": 'jiVJQZYBAQa7DAi0PNYHj8lDrVHG5ADn1tYgS3Xu',
                }
                }
            )
            .then(response => response.json())
            .then(data => setPics(data));
        console.log(pics)
        setQuery("")
    };

    const fileSelectHandeler = event => {
        setImage(event.target.files[0])
    }

    function uuidv4() {
        // ref:https://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid
        return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
          (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
        );
    }

    const uploadPhotos = async (e) => {
        e.preventDefault()
        if (imageSelected) {
            console.log(`upload`);
            await fetch(`https://ri9wp1d2z2.execute-api.us-east-1.amazonaws.com/a2/${PHOTO_BUCKET}/${uuidv4()}.${imageSelected.name.split('.').slice(-1)[0]}`,
                    {
                        method: "put",
                        headers:{
                        "Content-Type": `image/png`,
                        "x-amz-meta-customLabels": labels,
                        "x-api-key": 'jiVJQZYBAQa7DAi0PNYHj8lDrVHG5ADn1tYgS3Xu',
                        },
                        body: imageSelected
                    }
                )
        }
        setlabels("")
    };


    return (
        <>
        <form className="form" onSubmit={searchPhotos}> 
            <label className="label" htmlFor="query"> </label>
            <input
                required
                type="text"
                name="query"
                className="input"
                placeholder={`Try "dog" or "apple"`}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
            />
            <button type="submit" className="button">Search</button>
        </form>
        <button className="voice-button" onClick={vioceInput}>🎤</button>
        <br></br>
        
        <form className="form" onSubmit={uploadPhotos}>
            <input type="file" id="img" name="img" accept="image/png, image/jpg" onChange={fileSelectHandeler}/>
            <input
                type="text"
                name="labels"
                className="input"
                placeholder={`Labels, saperate by ,`}
                value={labels}
                onChange={(e) => setlabels(e.target.value)}
            />
            <button type="submit" className="button">Upload</button>
        </form>

        <br></br>
        <br></br>
        <div className="card-list">
            {
                pics.map((pic) => 
                <div className="card" key={pic} >
                <img
                    className="card--image"
                    src={pic}
                    width="50%"
                    height="50%"
                ></img>
                </div>)};
        </div>
    </>
    );
}