import React, { useState, useEffect, useRef } from 'react';
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalStep, setModalStep] = useState(1);
  const [customerName, setCustomerName] = useState('');
  const [lastNameInitial, setLastNameInitial] = useState('');
  const [artistName, setArtistName] = useState('');
  const [songName, setSongName] = useState('');
  const [djNotes, setDjNotes] = useState('');
  const [message, setMessage] = useState('');
  const [additionalSingers, setAdditionalSingers] = useState([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  

  // useRefs for input fields
  const customerNameRef = useRef(null);
  const lastNameInitialRef = useRef(null);
  const artistNameRef = useRef(null);
  const songNameRef = useRef(null);

  useEffect(() => {
    // Focus the first input field when the modal step changes
    switch (modalStep) {
      case 1:
        if (customerNameRef.current) {
          customerNameRef.current.focus();
        }
        break;
      case 2:
        if (artistNameRef.current) {
          artistNameRef.current.focus();
        }
        break;
      case 3:
        if (songNameRef.current) {
          songNameRef.current.focus();
        }
        break;
      default:
        break;
    }
  }, [modalStep]);

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
          completed: false,
          additionalSingers
        });
        setMessage('Request submitted successfully!');
        setCustomerName('');
        setLastNameInitial('');
        setArtistName('');
        setSongName('');
        setDjNotes('');
        setAdditionalSingers([]);
        setIsModalOpen(false);
        setShowConfirmation(true); // Show confirmation modal
      } catch (error) {
        setMessage('Error submitting request: ' + error.message);
      }
    } else {
      setMessage('Please fill in all required fields.');
    }
  };

  const openModal = () => {
    setIsModalOpen(true);
    setModalStep(1); // Start at the first step
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalStep(1);
  };

  const nextStep = () => {
    setModalStep(modalStep + 1);
  };

  const prevStep = () => {
    setModalStep(modalStep - 1);
  };

  const addSinger = () => {
    if (additionalSingers.length < 6) {
      setAdditionalSingers([...additionalSingers, { name: '', lastName: '' }]);
    }
  };

  const removeSinger = (index) => {
    const updatedSingers = [...additionalSingers];
    updatedSingers.splice(index, 1);
    setAdditionalSingers(updatedSingers);
  };

  const updateSinger = (index, field, value) => {
    const updatedSingers = [...additionalSingers];
    updatedSingers[index][field] = value;
    setAdditionalSingers(updatedSingers);
  };

  const canContinue = () => {
    switch (modalStep) {
      case 1:
        return customerName !== '' && lastNameInitial !== '';
      case 2:
        return artistName !== '';
      case 3:
        return songName !== '';
      default:
        return true;
    }
  };

  const renderModalContent = () => {
    switch (modalStep) {
      case 1:
        return (
          <div>
            <h2> Put in all singers full first name and last inititals otherwise
                we will not call your song. If using an alilas or group name, please include real name
                so we an keep queue.
            </h2>
            <input
              type="text"
              placeholder="Your Name(s)"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              required
              ref={customerNameRef}
            />
            <input
              type="text"
              placeholder="Last Name Initials"
              value={lastNameInitial}
              onChange={(e) => setLastNameInitial(e.target.value)}
              required
              ref={lastNameInitialRef}
            />
            {additionalSingers.map((singer, index) => (
              <div key={index}>
               <br></br> <input
                  type="text"
                  placeholder={`Singer ${index + 2} Name`}
                  value={singer.name}
                  onChange={(e) => updateSinger(index, 'name', e.target.value)}
                />
                <input
                  type="text"
                  placeholder={`Singer ${index + 2} Last Initial`}
                  value={singer.lastName}
                  onChange={(e) => updateSinger(index, 'lastName', e.target.value)}
                />
                <button  className="deleteSinger" type="button" onClick={() => removeSinger(index)}>
                  Remove Singer
                </button>
              </div>
            ))}
                  <button type="button" onClick={nextStep} className="continue-button" disabled={!canContinue()}>
                Continue →
              </button> <br></br>
            <button type="button" onClick={addSinger} disabled={additionalSingers.length >= 6}>
              Add A Singer
            </button>
            <div>

            <br></br><br></br>
              <button  className="deleteSinger2"  type="button" onClick={closeModal}>
                Exit
              </button>
            </div>
          </div>
        );
      case 2:
        return (
          <div>
            <h2>Artist/Band Name</h2>
            <input
              type="text"
              placeholder="Artist Name"
              value={artistName}
              onChange={(e) => setArtistName(e.target.value)}
              required
              ref={artistNameRef}
            />
            <div>
            <button type="button" onClick={nextStep} className="continue-button" disabled={!canContinue()}>
                Continue →
              </button>
              <button type="button" onClick={prevStep}>
              ← Back
              </button>
              
            </div>
          </div>
        );
      case 3:
        return (
          <div>
            <h2>Song Title</h2>
            <input
              type="text"
              placeholder="Song Name"
              value={songName}
              onChange={(e) => setSongName(e.target.value)}
              required
              ref={songNameRef}
            />
            <div>
            <button type="button" onClick={nextStep} className="continue-button" disabled={!canContinue()}>
                Continue →
              </button>
              <button type="button" onClick={prevStep}>
              ← Back
              </button>
             
            </div>
          </div>
        );
      case 4:
        return (
          <div>
            <h2>DJ Notes</h2>
            <input
              type="text"
              placeholder="Any notes for DJ?"
              value={djNotes}
              onChange={(e) => setDjNotes(e.target.value)}
            />
            <div>
            <button type="submit" onClick={handleSubmit}>
                Submit Request!
              </button>
            <button type="button" onClick={prevStep}>
            ← Back
              </button>
      
       
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <h2 className="warn" > If we are very busy and you hop on to sing with a Duo or group this maybe counted as "your turn " and separate requests are rotated back into the queue. This is to try and give everyone a chance to sing.
        We do not skip songs for others to cut ahead including for bdays, anniversaries, holy prophecies, no exceptions. Please do not ask. Please review guidelines at the bottom of app as well.
        Thanks! Drink Chymes! Party naked. Go Bills!
      </h2>
      <h1> -----------------</h1>
      <h1> Welcome To Mr.Goodbar Karaoke</h1>
      <img className="logo" src={logo} alt="Logo" />
      <h4>Presented by Miah and Mucks</h4>
      <h4>Requests may begin at scheduled start time</h4>
      <a style={{ fontSize: '2em' }} href="https://www.karafun.com/karaoke-song-list.html">CLICK FOR OUR SONG LIST. Click Green Button Below to Start the Actual Request.</a>
      <h3>Begin a song request by clicking the button below. This link is for The Songlist contains many of our available tracks to sing, though we have plenty more not listed. As long as it is not too obscure or too new, there is a good chance we have it! </h3>
      <h1>Please Enter Your Song Request and Review Guidelines Below</h1>
      <form onSubmit={handleSubmit}>


        <button type="button" onClick={openModal}>
        → Click Here to Request a Song ←
        </button>
        {message && <p>{message}</p>} 
      </form>
      <br></br>
      <h1> ↑ Request Your Song Here ↑ </h1>
      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={closeModal}>
              &times;
            </span>
            {renderModalContent()}
          </div>
    
        </div>
      )}

      {showConfirmation && (
        <div className="modal">
          <div className="modal-confirm">
            <h2>Your song request has been received by Miah/Mucks! Please press confirm.</h2>
            <button onClick={() => setShowConfirmation(false)}>Confirm</button>
          </div>
        </div>
      )}

      <div>      <h2>  We do Private Karaoke Parties! Contact a manager to learn how to get started! </h2>
      <h2>--------------------------------------------------</h2> <br></br><br></br>
        <h1>Karaoke Song Idea Generator. Type in songs/artists you like to get suggestions! Mix up artists and songs for best recommendations.</h1>
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
        <button onClick={handleGetSongIdeas}>What Song Should I Sing?!</button>
        <h2>Suggestions will appear here!</h2>
        <ul>
          {songIdeas.map((idea, index) => (
            <li className="songRec" key={index}>{idea}</li>
          ))}
        </ul>
        <h2>--------------------------------------------------</h2>
        <h2> Help up make this a succesful evening by following these rules and guidelines</h2>
          
        <ol className="guidelines">
       <li>Do not drop or swing the microphones. They're more expensive then they look.</li>
       <li>Harrasing Host and Staff. Understand that people may have been waiting a long time to sing before you arrived. We aim to get everyone a chance to sing, but sometimes time constraints happen. Sometimes people request the same song you were going to do, it happens. Sometimes wait times are well over an hour, etc. Being disrespectful, demanding, insulting, distracting and/or arguing with the host will not help you get on stage quicker and may result in being asked to leave the venue by security. Please treat everyone in the venue with respect and be patient ( we do not control the space-time continuum though we are working on it ), thank you and have fun!</li>
          <li>Include your actual name with Last Name Inital somewhere on the signup form. You may put Aliases and funny names to call your group of friends under the signup and that is what we will display, just make sure to include some actual names, so we can keep our queue organized.</li>
          <li>Please be respectful and do not spam the request app. Multiple requests from the same device within a 30 second span are automatically deleted by the program.</li>
          <li>On busy nights, be sure to keep an ear out for your name when the host calls it. We may only give 1-2 announcements on a busy night and if there is no response, your song could be deleted.</li>
          <li>If you sing with a group, that may very well count as your turn pending on how busy we are. Your solo song may be sent to the back of the queue in this situation.</li>
          <li>Do not leave drinks on the DJ table. Karaoke equipment and spilt sugary drinks don't mix.</li>
          <li>Do not come on stage to sing, stand, or dance if it is not your turn and/or do not have permisson from the current singer.</li>
          <li>Try to leave stairway to stage clear for upcoming singers when possible.</li>
          <li>Belt it!</li>
        </ol>
        <h2>--------------------------------------------------</h2>
        <br></br> <br></br>
      </div>
    </>
  );
};

export default CustomerRequestForm;