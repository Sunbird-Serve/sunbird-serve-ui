import React, { useState } from 'react'
import VolunteerHeader from '../../components/VolunteerHeader/VolunteerHeader'
import VolunteerFooter from '../../components/VolunteerFooter/VolunteerFooter'
import VolunteerExplore from '../../components/VolunteerExplore/VolunteerExplore'
import VolunteerProfile from '../../components/VolunteerProfile/VolunteerProfile'

function ExplorePage() {
  const [activeComponent, setActiveComponent] = useState('explore');
  
  const toggleComponent = () => {
    setActiveComponent(activeComponent === 'explore' ? 'profile' : 'explore');
  }
  
  return (
    <div className="exploreNeeds">
      <div className="vHeader">
        <VolunteerHeader activeComponent={activeComponent} onToggle={toggleComponent}/>
      </div>
      <div className="wrapContent row mt-5 mt-sm-0 pl-5">
        {activeComponent === 'explore' ? <VolunteerExplore /> : <VolunteerProfile />}
      </div>
      <div>
        <VolunteerFooter />
      </div>
    </div>
  )
}

export default ExplorePage