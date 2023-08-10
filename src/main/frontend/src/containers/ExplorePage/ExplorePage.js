import React, { useState } from 'react'
import VHeader from '../../components/VHeader/VHeader'
import VExplore from '../../components/VExplore/VExplore'
import VProfile from '../../components/VProfile/VProfile'

function ExplorePage() {
  const [activeComponent, setActiveComponent] = useState('explore');
  
  const toggleComponent = () => {
    setActiveComponent(activeComponent === 'explore' ? 'profile' : 'explore');
  }
  
  return (
    <div className="exploreNeeds">
      <div className="vHeader">
        <VHeader activeComponent={activeComponent} onToggle={toggleComponent}/>
      </div>
      <div className="wrapContent row mt-5 mt-sm-0 pl-5">
        {activeComponent === 'explore' ? <VExplore /> : <VProfile />}
      </div>
    </div>
  )
}

export default ExplorePage