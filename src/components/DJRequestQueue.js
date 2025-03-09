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

  useEffect(() => {
    if (isPasswordCorrect) {
      const unsubscribe = onSnapshot(collection(db, 'requests'), (snapshot) => {
        const requestsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        // Sort requests by timestamp in ascending order
        requestsData.sort((a, b) => a.timestamp?.toDate() - b.timestamp?.toDate());
        setRequests(requestsData);
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
    <><div className="requests-container">
          {requests.map((request, index) => (
              <div key={request.id} className="request-card">
                  <p>{index + 1}. <br></br>
                      Name:   <CopyToClipboard text={`${request.customerName} ${request.lastNameInitial}`} onCopy={() => handleCopy(`name-${request.id}`)}>
                          <span className={`copy-box ${copiedField === `name-${request.id}` ? 'copied' : ''}`}>
                              {request.customerName} {request.lastNameInitial}
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
                          onColor="#00FF00"
                          offColor="#FF0000" />
                  </label>
                  <button onClick={() => handleDelete(request.id)}>Delete</button>
              </div>
          ))}
      </div><div className="divide"></div><ol>
              
          </ol></>
  );
};

export default DJRequestQueue;