import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/config';
import Switch from 'react-switch';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import './DJRequestQueue.css'; // Import the CSS file

const DJRequestQueue = () => {
  const [requests, setRequests] = useState([]);
  const [copiedField, setCopiedField] = useState(null);
  const [password, setPassword] = useState('');
  const [isPasswordCorrect, setIsPasswordCorrect] = useState(false);
  const [totalSongsInQueue, setTotalSongsInQueue] = useState(0);
  const [totalSongsNotInQueue, setTotalSongsNotInQueue] = useState(0);
  const [djNotes, setDjNotes] = useState('');
 

  useEffect(() => {
    if (isPasswordCorrect) {
      const unsubscribe = onSnapshot(collection(db, 'requests'), (snapshot) => {
        const requestsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        // Sort requests by timestamp in ascending order
        requestsData.sort((a, b) => a.timestamp?.toDate() - b.timestamp?.toDate());
        // Reverse the order of the requests
        const reversedRequests = [...requestsData].reverse();
        setRequests(reversedRequests);

        // Calculate totals
        const inQueueCount = requestsData.filter(request => !request.completed).length;
        const notInQueueCount = requestsData.filter(request => request.completed).length;

        setTotalSongsInQueue(inQueueCount);
        setTotalSongsNotInQueue(notInQueueCount);
      });

      return () => unsubscribe();
    }
  }, [isPasswordCorrect]);

  const handleToggleCompleted = async (id, completed) => {
    const requestDoc = doc(db, 'requests', id);
    await updateDoc(requestDoc, { completed: !completed });
  };

  const handleDelete = async (id) => {
    const requestDoc = doc(db, 'requests', id);
    await deleteDoc(requestDoc);
  };

  const handleCopy = (field) => {
    setCopiedField(field);
  };

  const handleKeypadClick = (number) => {
    setPassword(prevPassword => prevPassword + number);
  };

  const handleEnter = () => {
    if (password === '0111') {
      setIsPasswordCorrect(true);
    } else {
      alert('Incorrect password');
      setPassword('');
    }
  };

  const handleClear = () => {
    setPassword('');
  };




  if (!isPasswordCorrect) {
    return (
      <div className="keypad-container">
        <div className="password-input">
          <input
            type="password"
            value={password}
            readOnly
            placeholder="Enter Password"
          />
        </div>
        <div className="keypad">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map(number => (
            <button key={number} onClick={() => handleKeypadClick(number)}>
              {number}
            </button>
          ))}
          <button onClick={handleClear}>Clear</button>
          <button onClick={handleEnter}>Enter</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex' }}>
      <div className="requests-container">
        {requests.map((request, index) => (
          <div key={request.id} className="request-card">
            <p>#{requests.length - index} <br></br>
              Name:   <CopyToClipboard text={`${request.customerName} ${request.lastNameInitial} ${request.additionalSingers && request.additionalSingers.length > 0 ? ', ' + request.additionalSingers.map(singer => `${singer.name} ${singer.lastName}`).join(', ') : ''}`} onCopy={() => handleCopy(`name-${request.id}`)}>
                <span className={`copy-box ${copiedField === `name-${request.id}` ? 'copied' : ''}`}>
                  {request.customerName} {request.lastNameInitial}
                  {request.additionalSingers && request.additionalSingers.length > 0 && (
                    `, ${request.additionalSingers.map(singer => `${singer.name} ${singer.lastName}`).join(', ')}`
                  )}
                </span>
              </CopyToClipboard>
            </p>
            <p>Artist Name:
              <CopyToClipboard text={request.artistName} onCopy={() => handleCopy(`artist-${request.id}`)}>
                <span className={`copy-box ${copiedField === `artist-${request.id}` ? 'copied' : ''}`}>
                  {request.artistName}
                </span>
              </CopyToClipboard>
            </p>
            <p>Song Name:
              <CopyToClipboard text={request.songName} onCopy={() => handleCopy(`song-${request.id}`)}>
                <span className={`copy-box ${copiedField === `song-${request.id}` ? 'copied' : ''}`}>
                  {request.songName}
                </span>
              </CopyToClipboard>
            </p>
            <p>DJ Notes: {request.djNotes}</p>
            <p> {new Date(request.timestamp?.toDate()).toLocaleString()}</p>
            <label>
              In Queue:
              <Switch
                onChange={() => handleToggleCompleted(request.id, request.completed)}
                checked={request.completed}
                onColor= "#00FF00"
                offColor="#FF0000"  />
            </label>
            <button className="deleteCard" onClick={() => handleDelete(request.id)}>X</button>
          </div>
        ))}
      </div>
      <textarea
        style={{
          height: '1000px',
          width: '400px',
          marginLeft: '20px', // Add some spacing between the queue and the notes
          fontSize: '20px',
        }}
        placeholder="Additional Notes"
        value={djNotes}
        onChange={(e) => setDjNotes(e.target.value)}
      />
      <div>
        <p>Total Songs In Queue: {totalSongsNotInQueue}</p>
        <p>Total Songs Not In Queue: {totalSongsInQueue}</p>
 
      </div>
      <div className="divide"></div><ol>

      </ol>
    </div>
  );
};

export default DJRequestQueue;