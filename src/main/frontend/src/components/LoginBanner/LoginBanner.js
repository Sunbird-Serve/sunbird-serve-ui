import React from 'react';
import './LoginBanner.css';

const BannerLogin = () => {
    return(
        <div className='loginBanner row' >
            <div className="headBanner col-12 col-sm-8 offset-sm-2">
                Serve-Vriddhi
            </div>
            <div className="textBanner col-10 offset-1 col-sm-8 offset-sm-2">
                Sunbird Serve building block can enable efficient volunteer interactions that add significant value
                to society and overall human development. It enables relevant actors to crowdsource volunteers for 
                their needs and participate in interactions towards realization of the value
            </div>
        </div>
    )
}

export default BannerLogin