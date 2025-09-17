import React from 'react';
import styled from 'styled-components';

const ChristmasEventWrapper = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1000;
  overflow: hidden;
`;

const Snow = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1000;
  pointer-events: none;
  background-image: 
    url("https://s3-us-west-2.amazonaws.com/s.cdpn.io/191814/flake1.png"),
    url("https://s3-us-west-2.amazonaws.com/s.cdpn.io/191814/flake2.png"),
    url("https://s3-us-west-2.amazonaws.com/s.cdpn.io/191814/flake3.png");
  animation: snow 60s linear infinite;
  
  @keyframes snow {
    0% {
      background-position: 0px 0px, 0px 0px, 0px 0px;
    }
    50% {
      background-position: 500px 500px, 100px 200px, -100px 150px;
    }
    100% {
      background-position: 1000px 1000px, 200px 400px, -200px 300px;
    }
  }
`;

const Santa = styled.img`
  width: 150px;
  height: auto;
  position: fixed;
  z-index: 1001;
  animation: flyingSanta 60s linear infinite;
  transform-origin: center;

  @media (max-width: 768px) {
    width: 120px;
  }

  @media (max-width: 480px) {
    width: 90px;
  }

  @keyframes flyingSanta {
    0% {
      left: -150px;
      top: 50%;
      transform: scaleX(1);
    }
    /* Straight left to right */
    12% {
      left: 100%;
      top: 50%;
      transform: scaleX(1);
    }
    /* Reset position for diagonal up right to left */
    13% {
      left: 100%;
      top: 80%;
      transform: scaleX(-1);
    }
    /* Diagonal up right to left */
    25% {
      left: -150px;
      top: 20%;
      transform: scaleX(-1);
    }
    /* Reset for straight right to left */
    26% {
      left: 100%;
      top: 30%;
      transform: scaleX(-1);
    }
    /* Straight right to left */
    38% {
      left: -150px;
      top: 30%;
      transform: scaleX(-1);
    }
    /* Reset for diagonal down left to right */
    39% {
      left: -150px;
      top: 20%;
      transform: scaleX(1);
    }
    /* Diagonal down left to right */
    51% {
      left: 100%;
      top: 70%;
      transform: scaleX(1);
    }
    /* Reset for diagonal up left to right */
    52% {
      left: -150px;
      top: 70%;
      transform: scaleX(1);
    }
    /* Diagonal up left to right */
    64% {
      left: 100%;
      top: 20%;
      transform: scaleX(1);
    }
    /* Reset for diagonal down right to left */
    65% {
      left: 100%;
      top: 20%;
      transform: scaleX(-1);
    }
    /* Diagonal down right to left */
    77% {
      left: -150px;
      top: 70%;
      transform: scaleX(-1);
    }
    /* Reset for straight left to right high */
    78% {
      left: -150px;
      top: 15%;
      transform: scaleX(1);
    }
    /* Straight left to right high */
    90% {
      left: 100%;
      top: 15%;
      transform: scaleX(1);
    }
    /* Reset for straight right to left low */
    91% {
      left: 100%;
      top: 85%;
      transform: scaleX(-1);
    }
    /* Straight right to left low */
    99% {
      left: -150px;
      top: 85%;
      transform: scaleX(-1);
    }
    100% {
      left: -150px;
      top: 50%;
      transform: scaleX(1);
    }
  }
`;

const ChristmasEvent = () => {
  return (
    <ChristmasEventWrapper>
      <Snow />
      <Santa 
        src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/191814/santas.gif" 
        alt="Santa"
      />
    </ChristmasEventWrapper>
  );
};

export default ChristmasEvent;
