import React, { useState, useEffect } from 'react';
import VolunteerProfileInfoView from './VolunteerProfileInfoView';
import VolunteerProfileInfoEdit from './VolunteerProfileInfoEdit';


function VolunteerProfileInfo() {
  const [userData, setUserData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetch('http://ecs-integrated-239528663.ap-south-1.elb.amazonaws.com/api/v1/user/1-aa94ae28-b9d5-41cc-a978-faee247a4526')
      .then((response) => response.json())
      .then((data) => setUserData(data))
      .catch((error) => console.error('Error fetching user data:', error));
  }, []);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSaveClick = (editedData) => {
    // Perform PUT request to update user data on the API
    fetch('http://localhost:3031/Users/guidus01', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(editedData),
    })
      .then((response) => response.json())
      .then((data) => {
        // Update the userData state with the edited data
        setUserData(data);
        setIsEditing(false);
      })
      .catch((error) => console.error('Error updating user data:', error));
  };

  const handleDiscordClick = () => {
    // Add your Discord functionality here
    console.log('Discord button clicked');
  };

  return (
    <div>
      {isEditing ? (
        <VolunteerProfileInfoEdit
          userData={userData}
          onSaveClick={handleSaveClick}
          onDiscordClick={handleDiscordClick}
        />
      ) : (
        <VolunteerProfileInfoView onEditClick={handleEditClick} userData={userData} />
      )}
    </div>
  );
}

export default VolunteerProfileInfo;