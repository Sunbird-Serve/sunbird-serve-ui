import React, { useState, useRef } from "react";
import { useHistory } from "react-router";
import axios from "axios";
import "./RaiseNeed.css";

const configData = require('../../configure.js');

const speakText = (text) => {
  if ('speechSynthesis' in window && text) {
    window.speechSynthesis.cancel();
    const utterance = new window.SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  }
};

const RaiseNeedAI = () => {
  const history = useHistory();
  const [isRecording, setIsRecording] = useState(false);
  const [transcribedText, setTranscribedText] = useState("");
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [conversation, setConversation] = useState([]); // { sender: 'user'|'agent', text: string }
  const [userInput, setUserInput] = useState("");
  const recognitionRef = useRef(null);

  const startRecording = async () => {
    try {
      // Initialize speech recognition
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        throw new Error("Speech recognition is not supported in this browser.");
      }

      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join('');
        setTranscribedText(transcript);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setError(`Error: ${event.error}`);
        stopRecording();
      };

      recognitionRef.current.start();
      setIsRecording(true);
      setError(null);
    } catch (err) {
      setError("Error accessing microphone. Please ensure you have granted microphone permissions.");
      console.error("Error accessing microphone:", err);
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleFirstSubmit = async () => {
    if (!transcribedText.trim()) {
      setError("Please record your need description first");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    setConversation([{ sender: 'user', text: transcribedText }]);
    try {
      const response = await axios.post(configData.AGENT_RAISE_NEED, {
        prompt: transcribedText
      }, {
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      const agentMsg = response.data.message || "";
      setConversation(prev => [...prev, { sender: 'agent', text: agentMsg }]);
      speakText(agentMsg);
      setUserInput("");
    } catch (err) {
      setError('Failed to process your request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSend = async () => {
    if (!userInput.trim()) return;
    setIsSubmitting(true);
    setError(null);
    // Build the full conversation as prompt
    const messages = [
        ...conversation.map(msg => {
          return {
            role: msg.sender === 'user' ? 'user' : msg.sender === 'tool' ? 'tool' : 'assistant',
            type: 'text',
            content: msg.text
          };
        }),
        {
          role: 'user',
          type: 'text',
          content: userInput
        }
      ];
      const fullPrompt = JSON.stringify(messages);
      console.log(fullPrompt);
    setConversation(prev => [...prev, { sender: 'user', text: userInput }]);
    try {
      const response = await axios.post(configData.AGENT_RAISE_NEED, {
        prompt: fullPrompt
      }, {
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      const agentMsg = response.data.message || "";
      setConversation(prev => [...prev, { sender: 'agent', text: agentMsg }]);
      speakText(agentMsg);
      setUserInput("");
      if (response.data.toolUse) {
        history.push('/needs');
      }
    } catch (err) {
      setError('Failed to process your request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const gotoNeeds = () => {
    history.push("/needs");
  };

  return (
    <div className="wrapRaiseNeed row">
      <div className="raiseNeed col-10 offset-1 col-sm-8 offset-sm-2">
        <div className="raiseNeedBar">
          <div className="wrapNameNeed">
            <div className="needName">Voice Input</div>
            <div className="tagNeedName">
              Describe your need using voice
            </div>
          </div>
        </div>

        <div className="raiseNeedForm">
          <div className="formRNcatergory">VOICE INPUT</div>
          
          <div className="formTop row">
            <div className="col-12">
              <div className="itemFormNeed">
                <div className="voiceControls">
                  <button
                    className={`voiceButton ${isRecording ? 'recording' : ''}`}
                    onClick={isRecording ? stopRecording : startRecording}
                    disabled={isSubmitting}
                  >
                    {isRecording ? 'Stop Recording' : 'Start Recording'}
                  </button>
                  {isRecording && (
                    <div className="recordingIndicator">
                      Recording in progress...
                    </div>
                  )}
                </div>
                
                <div className="transcriptionBox">
                  <label>Transcribed Text:</label>
                  <div className="transcribedText">
                    {transcribedText || "Your transcribed text will appear here..."}
                  </div>
                </div>

                <div className="submitControls">
                  <button 
                    className="submitButton"
                    onClick={handleFirstSubmit}
                    disabled={!transcribedText.trim() || isSubmitting}
                  >
                    {isSubmitting ? 'Processing...' : 'Submit'}
                  </button>
                </div>

                {conversation.length > 0 && (
                  <div className="chat-container">
                    {conversation.map((msg, idx) => (
                      <div key={idx} className={`chat-bubble ${msg.sender}`}>{msg.text}</div>
                    ))}
                    {conversation.length === 0 ? (
                      <button onClick={handleFirstSubmit} className="btnSubmitNeed">Submit Voice Input</button>
                    ) : (
                      <div className="chat-input-row">
                        <input
                          type="text"
                          value={userInput}
                          onChange={e => setUserInput(e.target.value)}
                          className="chat-input"
                          placeholder="Type your message..."
                          disabled={isSubmitting}
                        />
                        <button onClick={handleSend} className="btnSendAgain" disabled={isSubmitting || !userInput.trim()}>
                          {isSubmitting ? <span className="sendagain-spinner"></span> : 'Send'}
                        </button>
                      </div>
                    )}
                    {error && <div className="error-message">{error}</div>}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="btnClose">
        <button onClick={gotoNeeds}>X</button>
      </div>
    </div>
  );
};

export default RaiseNeedAI; 