import React from 'react';
import './LoginBanner.css';

const BannerLogin = ({volunteerStatus}) => {
    const handleVolunteerStatus = () => {
        volunteerStatus(true)
    }

    return(
        // Banner part in the login screen
        <div className='loginBanner row' >
            <div className='blurBanner'>
                <button onClick={handleVolunteerStatus} className="btnExplore">Explore Needs</button>
                <div className="bannerContent col-12 col-sm-10 offset-sm-1">
                    <div className="headBanner">
                        About Sunbird Serve
                    </div>
                    <div className="textBanner">
                        Sunbird Serve building block can enable efficient volunteer interactions that 
                        add significant value to society and overall human development. It enables 
                        relevant actors to crowdsource volunteers for their needs and participate in 
                        interactions towards realization of the value. It provides Reference Solution,
                        Volunteering Registries, and Volunteer Service to enable Request, 
                        Assignment, Nominations and Management of Needs & Deliverables. It 
                        defines specs for Needs and Volunteers to enable interoperability.
                    </div>
                </div>
            </div>
        </div>
    )
}

export default BannerLogin