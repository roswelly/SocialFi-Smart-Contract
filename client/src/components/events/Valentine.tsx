import React from 'react';
import styled, { keyframes } from 'styled-components';

/* 
  The main full-screen container.
  (Note: The background color has been removed.)
*/
const EventWrapper = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: hidden;
  z-index: 1000;
`;

/* 
  The falling heart drops from above, passes through the target (center), 
  and disappears below. The keyframes include a “hit” (a brief shrink) effect.
*/
const fallAnimation = keyframes`
  0% {
    top: -10vh;
    opacity: 0;
    transform: scale(1);
  }
  10% {
    opacity: 1;
  }
  50% {
    top: 50vh; /* at the target */
    opacity: 1;
    transform: scale(1);
  }
  55% {
    transform: scale(0.8); /* simulate a hit impact */
  }
  100% {
    top: 110vh;
    opacity: 0;
    transform: scale(1);
  }
`;

const FallingHeart = styled.div`
  position: absolute;
  left: 50vw;
  width: 40px;
  height: 40px;
  margin-left: -20px; /* center horizontally */
  animation: ${fallAnimation} 4s linear infinite;

  /* Render the heart using an inline SVG as a background */
  &::before {
    content: '';
    display: block;
    width: 100%;
    height: 100%;
    background-image: url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 32 29.6' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill='%23FF3366' d='M23.6,0c-2.9,0-5.6,1.4-7.6,3.6C13.9,1.4,11.2,0,8.4,0C3.8,0,0,3.8,0,8.4c0,4.3,3.4,7.8,8.6,12.4l7,6.1c0.4,0.3,1,0.3,1.4,0l7-6.1C28.6,16.2,32,12.7,32,8.4C32,3.8,28.2,0,23.6,0z'/%3E%3C/svg%3E");
    background-size: contain;
    background-repeat: no-repeat;
  }
`;

/* 
  The target indicator shows where the arrow is meant to hit.
  Here it’s a dashed circle at the center of the viewport.
*/
const TargetIndicator = styled.div`
  position: absolute;
  top: 50vh;
  left: 50vw;
  width: 60px;
  height: 60px;
  margin-left: -30px;
  margin-top: -30px;
  border: 2px dashed #FF3366;
  border-radius: 50%;
  pointer-events: none;
`;

/* 
  Cupid’s container is positioned in the lower-left quadrant 
  so that its arrow can travel to the target.
  A gentle floating animation gives it a zero‑gravity feel.
*/
const CupidContainer = styled.div`
  position: absolute;
  left: 25vw;
  top: 70vh;
  width: 80px;
  height: 80px;
  animation: float 3s ease-in-out infinite;

  @keyframes float {
    0% { transform: translateY(0); }
    50% { transform: translateY(-15px); }
    100% { transform: translateY(0); }
  }
`;

/* 
  CupidIconWrapper sets the size for our Cupid graphic.
*/
const CupidIconWrapper = styled.div`
  width: 100%;
  height: 100%;
`;

/* 
  A refined Cupid SVG drawn with basic shapes.
  (Feel free to improve this graphic or replace it with your own.)
*/
const CupidIcon: React.FC = () => (
  <svg width="80" height="80" viewBox="0 0 64 64">
    {/* Head */}
    <circle cx="32" cy="12" r="6" fill="#FFD1DC" />
    {/* Torso as a heart‐like shape */}
    <path d="M20 22 Q32 32 44 22 Q32 42 20 22" fill="#FF69B4" />
    {/* Wings */}
    <path d="M12 22 Q20 16 20 22" stroke="#FFB6C1" strokeWidth="2" fill="none" />
    <path d="M52 22 Q44 16 44 22" stroke="#FFB6C1" strokeWidth="2" fill="none" />
    {/* Bow */}
    <line x1="20" y1="22" x2="44" y2="22" stroke="#FF1493" strokeWidth="2" />
    {/* A resting arrow on the bow */}
    <line x1="32" y1="12" x2="32" y2="22" stroke="#000" strokeWidth="2" />
  </svg>
);

/* 
  The arrow fires from Cupid toward the target.
  Using viewport units in the translation ensures the arrow reaches the target (center of the screen).
  In this animation, the arrow appears briefly, moves from (0,0) to (25vw, -20vh) (relative to Cupid),
  then fades out.
*/
const shootArrow = keyframes`
  0% {
    opacity: 0;
    transform: translate(0, 0) rotate(0deg);
  }
  10% {
    opacity: 1;
  }
  45% {
    opacity: 1;
    transform: translate(25vw, -20vh) rotate(45deg);
  }
  50% {
    opacity: 1;
    transform: translate(25vw, -20vh) rotate(45deg);
  }
  55% {
    opacity: 0;
  }
  100% {
    opacity: 0;
  }
`;

const ArrowWrapper = styled.div`
  position: absolute;
  /* Start the arrow at Cupid’s approximate center */
  top: 30px;
  left: 40px;
  transform-origin: left center;
  animation: ${shootArrow} 4s linear infinite;
`;

/* 
  A simple arrow drawn with SVG.
*/
const ArrowSVG: React.FC = () => (
  <svg width="40" height="10" viewBox="0 0 40 10">
    <line x1="0" y1="5" x2="30" y2="5" stroke="#000" strokeWidth="2" />
    <polygon points="30,0 40,5 30,10" fill="#000" />
  </svg>
);

/* 
  The ValentineEvent component brings everything together.
  The falling heart, the target indicator, Cupid (with a floating animation), and the arrow firing in sync.
*/
const ValentineEvent: React.FC = () => {
  return (
    <EventWrapper>
      <TargetIndicator />
      <FallingHeart />
      <CupidContainer>
        <CupidIconWrapper>
          <CupidIcon />
        </CupidIconWrapper>
        <ArrowWrapper>
          <ArrowSVG />
        </ArrowWrapper>
      </CupidContainer>
    </EventWrapper>
  );
};

export default ValentineEvent;
