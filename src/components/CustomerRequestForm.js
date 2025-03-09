import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import logo from './logo.jpg';

const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const CustomerRequestForm = () => {
  const [songIdeas, setSongIdeas] = useState([]);
  const [artist1, setArtist1] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [setAlert, setAlertIsOpen] = useState('');
  const [artist2, setArtist2] = useState(''); // Correct initialization
  async function handleGetSongIdeas() {
    try {
      const genAI = new GoogleGenerativeAI("AIzaSyAgJSoSgQaXXKUMj38gzBi5wZoe5MEpiss");
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `Suggest 12  songs based on a mix of following artists or songs in the search prompt. Try to capture the similarities of the songs and artists and give reccomendations based on a similar feel, search for deeper cuts. Try to find 1 kind of rare song, and 2  lesser known song among the 12 not typically a top 10 hit,but  dont mention it that it is rare. Dont talk about what the the list is trying to accomplish. Give a brief summary of the artist and song in the search fields and a summary of the reccomended songs and how they all relate. Do not repeat  artists and try to make sure song is in karafun catalog. Do not suggest more than 1 song from the same artist when listing reccomendations, example repeating hall and oates songs twice. Try to think outside the box .: ${artist1}, ${artist2}.`;

      const result = await model.generateContent(prompt);
      const ideas = result.response.text().trim().split('\n').filter(Boolean);
      setSongIdeas(ideas);

    } catch (error) {
      console.error('Error fetching song ideas:', error);
      setAlertMessage('Sorry, something went wrong while fetching song ideas.');
      setAlertIsOpen(true);
    }
  }

  const [customerName, setCustomerName] = useState('');
  const [lastNameInitial, setLastNameInitial] = useState('');
  const [artistName, setArtistName] = useState('');
  const [songName, setSongName] = useState('');
  const [djNotes, setDjNotes] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (customerName && lastNameInitial && artistName && songName) {
      try {
        await addDoc(collection(db, 'requests'), {
          customerName,
          lastNameInitial,
          artistName,
          songName,
          djNotes,
          timestamp: serverTimestamp(),
          completed: false
        });
        setMessage('Request submitted successfully!');
        setCustomerName('');
        setLastNameInitial('');
        setArtistName('');
        setSongName('');
        setDjNotes('');
      } catch (error) {
        setMessage('Error submitting request: ' + error.message);
      }
    } else {
      setMessage('Please fill in all required fields.');
    }
  };

  return (
    <>
      <h1 className="warn"> If we are very busy and you hop on to sing with a Duo or group this maybe counted as "your turn " and separate requests are rotated back into the queue. This is to try and give everyone a chance to sing.
        We do not skip songs for others to cut ahead including for bdays, anniversaries, holy prophecies, no exceptions. Please do not ask. Please review guidelines at the bottom of app as well.
        Thanks! Drink Chymes! Party naked. Go Bills!
      </h1>
      <h1> -----------------</h1>
      <h1> Welcome To Mr.Goodbar Karaoke</h1>
      <img className="logo" src={logo} alt="Logo" />
      <h4>Presented by Miah and Mucks</h4>
      <h4>Requests may begin at scheduled start time</h4>
      <a style={{ fontSize: '2em' }} href="https://www.karafun.com/karaoke-song-list.html">CLICK FOR OUR SONG LIST. Click Green Button Below to Start the Actual Request.</a>
      <h3>Begin a song request by clicking the green button below. This link is for The Songlist contains many of our available tracks to sing, though we have plenty more not listed. As long as it is not too obscure or too new, there is a good chance we have it! </h3>
      <h1>Please Enter Your Song Request and Review Guidelines Below</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Your Name(s)"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Last Name Initials corresponding with names above"
          value={lastNameInitial}
          onChange={(e) => setLastNameInitial(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Artist Name"
          value={artistName}
          onChange={(e) => setArtistName(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Song Name"
          value={songName}
          onChange={(e) => setSongName(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Any notes for DJ?"
          value={songName}
          onChange={(e) => setSongName(e.target.value)}
          
        />
        <button type="submit">Submit Request</button>
        {message && <p>{message}</p>}
      </form>
      <div>
        <h1>Karaoke Song Ideas. Type in songs/artists you like to get suggestions! Mix up artists and songs for best recommendations.</h1>
        <input
          type="text"
          placeholder="Any Favorite Artist"
          value={artist1}
          onChange={(e) => setArtist1(e.target.value)}
        />
        <input
          type="text"
          placeholder=" Any Favorite Song"
          value={artist2}
          onChange={(e) => setArtist2(e.target.value)}
        />
        <button onClick={handleGetSongIdeas}>Get Song Ideas</button>
        <h2>Suggestions will appear here!</h2>
        <ul>
          {songIdeas.map((idea, index) => (
            <li key={index}>{idea}</li>
          ))}
        </ul>
      </div>
    </>
  );
};

export default CustomerRequestForm;