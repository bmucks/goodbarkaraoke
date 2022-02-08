import './App.css';
import React, {useState, useEffect} from "react";
import logo from './logo.jpg';
import firebase from "./firebase.js";
import "firebase/firestore";
import { v4 as uuidv4 } from 'uuid';
import moment from 'moment';

function App() {
  const [songs, setSongs] = useState([]);
  const [name, setName] = useState([]);
  const [stor, setStor] = useState([]);
  const [songTitle, setSongTitle] = useState([]);
  const [artist, setArtist] = useState([]);  const [notes, setNotes] = useState([]);
  const [style, setStyle] = useState(false);
  const [disBut, setDisBut] = useState(false);
  const [id, setId] = useState([]);

  const ref = firebase.firestore().collection("songs");
  

  function addSong(newSong) {
    if (newSong.name.length < 2 || newSong.songTitle.length < 2 || newSong.artist.length < 2)
    {
      alert('Entries must be greater than 1 charachter')
    }
    else if (disBut === true) { 
      alert('Please wait 30 seconds before requesting another song. Please no more than 2-3 request per person on queue at a time')
    }
    else {
     setDisBut(
        true
    );

    // **** here's the timeout ****
    setTimeout(() => setDisBut(false), 20000);
    ref.doc(newSong.id)
    .set(newSong)
    .catch((err) => {
      console.error(err)
    })
    alert('Request has been submitted and received by Miah and/or Mucks');
    setSongTitle([''])

  }

  } 






  function deleteSong(song) {
    ref.doc(song.id)
    .delete()
    .catch((err) => {
      console.error(err)
    })
    ref.orderBy('createdAt', 'desc').onSnapshot((querySnapshot) => {
      const items = [];
      querySnapshot.forEach((doc) => {
        items.push(doc.data())
      })
      setSongs(items)
      console.log(songs)
    })
  }

  
  function adminP() {
  

     setStyle(true)
     ref.orderBy('createdAt', 'desc').onSnapshot((querySnapshot) => {
      const items = [];
      querySnapshot.forEach((doc) => {
        items.push(doc.data())
      })
      setSongs(items)
      console.log(songs)
    })

  }

  return (
    <div className="App">
        <h1> Mr.Goodbar Karaoke 2022</h1>
    
       
      <div className="info">
        <form>
          <label>
         


            <textarea className="sub" type="text" name="name" onChange={(e) => notes(e.target.value)}/>
          </label><br></br>
          <br></br>
          <button display="none" className="sub" type="reset" defaultValue="Reset" 
           onClick={() => addSong( {name, songTitle, artist, notes,
             id: uuidv4(), createdAt:new Date() })}  >
          Submit Request
         </button>
        </form>
   
        <br/>

       

        
        <div className="divide"></div>
        <br></br>
        <button className="adminBut"type="reset" defaultValue="Reset"  onClick={() => adminP()} >
          Admin Only 
         </button>
         <div className="songgrid" style={{ display: style ? "grid" : "flex" }} >
        {songs.map((song, index) => (
        <div  style={{ display: style ? "block" : "block" }}  className="songcard" > 
          <h1>    { songs.length - index }</h1>
          <input type="checkbox"  className="check" />
       
          <span className= 'spanX 'onClick={(e) => deleteSong(song)} style={{color:'red'} }>x</span>
          <h2>Singer Name with last name inital: {song.name}</h2>
          <h2>Artist: {song.artist}</h2>
          <h2>Song:{song.songTitle}</h2>
          <h2>Singer Notes:{song.notes}</h2>
         
         
          <h2>{moment(song.createdAt.toDate()).calendar()}</h2>
          <h2>KJ Notes:{song.stor}</h2>
         
        
        
          <input type="text" placeholder="DJ Notes" className="djnotes" onChange={e => setStor(e)} />
         
        
          <br></br>
          </div>
         
      ))}
      </div>  
      <br></br>
      </div> 
      <div className="divide"></div>
    </div>
  );
}

export default App;
