import React from 'react';
import '../../styles/css/Pageloader.css';

interface PageLoaderProps {
  text?: string;
}

const AtaaLogo = () => (
  <svg
    width="148"
    height="68"
    viewBox="0 0 88 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="pl-logo"
  >
    <g filter="url(#a)">
      <path
        d="M83.5143 28.488H79.0703L78.6303 26.596C76.6943 28.2093 74.729 29.016 72.7343 29.016C68.305 29.016 66.0903 26.86 66.0903 22.548C66.0903 20.4067 67.0143 18.7347 68.8623 17.532C70.7397 16.3 73.5117 15.684 77.1783 15.684H78.1023V15.596C78.1023 14.3347 77.8383 13.4693 77.3103 13C76.7823 12.5307 75.829 12.296 74.4503 12.296C72.5143 12.296 70.7397 12.912 69.1263 14.144C69.1263 12.296 61.4693 8.92268 61 7.98401C62.672 6.69335 70.7543 9.12801 71.9863 8.68801C73.2477 8.21868 74.7437 7.98401 76.4743 7.98401C81.1677 7.98401 83.5143 10.9173 83.5143 16.784V28.488ZM77.9263 19.072H77.2663C75.5943 19.072 74.245 19.3653 73.2183 19.952C72.1917 20.5387 71.6783 21.316 71.6783 22.284C71.6783 24.1027 72.4703 25.012 74.0543 25.012C75.0223 25.012 75.873 24.7334 76.6063 24.176C77.3397 23.6187 77.7797 22.9147 77.9263 22.064V19.072Z"
        fill="white"
      />
    </g>
    <g filter="url(#b)">
      <path
        d="M60.9998 33.136L58.1841 28.488L57.7441 26.596C55.8081 28.2093 53.8428 29.016 51.8481 29.016C47.4188 29.016 45.2041 26.86 45.2041 22.548C45.2041 20.4067 46.1281 18.7347 47.9761 17.532C49.8534 16.3 52.6254 15.684 56.2921 15.684H57.2161V15.596C57.2161 14.3347 56.9521 13.4693 56.4241 13C55.8961 12.5307 54.9428 12.296 53.5641 12.296C51.6281 12.296 49.8534 12.912 48.2401 14.144C47.7121 13.176 47.2134 12.2227 46.7441 11.284C48.4161 9.99334 49.8681 9.12801 51.1001 8.68801C52.3614 8.21868 53.8574 7.98401 55.5881 7.98401C60.2814 7.98401 62.6281 10.9173 62.6281 16.784L60.9998 33.136ZM57.0401 19.072H56.3801C54.7081 19.072 53.3588 19.3653 52.3321 19.952C51.3054 20.5387 50.7921 21.316 50.7921 22.284C50.7921 24.1027 51.5841 25.012 53.1681 25.012C54.1361 25.012 54.9868 24.7333 55.7201 24.176C56.4534 23.6187 56.8934 22.9147 57.0401 22.064V19.072Z"
        fill="white"
      />
    </g>
    <g filter="url(#c)">
      <path
        d="M42.7323 12.956H37.0123V22.856C37.0123 24.3227 37.4963 25.056 38.4643 25.056C39.3443 25.056 40.4443 24.6747 41.7643 23.912L43.6123 26.728C41.5297 28.3707 39.227 29.192 36.7043 29.192C33.1843 29.192 31.4243 27.256 31.4243 23.384V12.956H28.6523V8.512H31.4683V4.948C32.935 4.156 34.7977 3.17333 37.0563 2V8.512H42.7323V12.956Z"
        fill="white"
      />
    </g>
    <g filter="url(#d)">
      <path
        d="M15 2.56799L29.344 28.488H23.492C22.9933 27.0213 22.3773 25.0853 21.644 22.68H11.656C11.2453 24 10.6147 25.936 9.764 28.488H4L15 2.56799ZM20.016 4.06799C19.1947 6.38533 14.7653 13.7333 13.328 17.928H20.016C18.6373 13.88 20.8373 6.53199 20.016 4.06799Z"
        fill="white"
      />
    </g>
    <defs>
      <filter id="a" x="57" y="5.60254" width="30.5146" height="29.4135" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
        <feFlood floodOpacity="0" result="BackgroundImageFix" />
        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
        <feOffset dy="2" /><feGaussianBlur stdDeviation="2" />
        <feComposite in2="hardAlpha" operator="out" />
        <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.15 0" />
        <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_95_7" />
        <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_95_7" result="shape" />
      </filter>
      <filter id="b" x="41.2041" y="5.98401" width="25.4238" height="33.152" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
        <feFlood floodOpacity="0" result="BackgroundImageFix" />
        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
        <feOffset dy="2" /><feGaussianBlur stdDeviation="2" />
        <feComposite in2="hardAlpha" operator="out" />
        <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.15 0" />
        <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_95_7" />
        <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_95_7" result="shape" />
      </filter>
      <filter id="c" x="24.6523" y="0" width="22.96" height="35.192" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
        <feFlood floodOpacity="0" result="BackgroundImageFix" />
        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
        <feOffset dy="2" /><feGaussianBlur stdDeviation="2" />
        <feComposite in2="hardAlpha" operator="out" />
        <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.15 0" />
        <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_95_7" />
        <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_95_7" result="shape" />
      </filter>
      <filter id="d" x="0" y="0.567993" width="33.3438" height="33.92" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
        <feFlood floodOpacity="0" result="BackgroundImageFix" />
        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
        <feOffset dy="2" /><feGaussianBlur stdDeviation="2" />
        <feComposite in2="hardAlpha" operator="out" />
        <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.15 0" />
        <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_95_7" />
        <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_95_7" result="shape" />
      </filter>
    </defs>
  </svg>
);

const BotIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="5" width="10" height="8" rx="2" stroke="#10a37f" strokeWidth="1.2" />
    <path d="M6 5V3.5a2 2 0 0 1 4 0V5" stroke="#10a37f" strokeWidth="1.2" strokeLinecap="round" />
    <circle cx="6" cy="9" r=".8" fill="#10a37f" />
    <circle cx="10" cy="9" r=".8" fill="#10a37f" />
  </svg>
);

const SendIcon = () => (
  <svg viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M13 7.5L2 2l2.5 5.5L2 13l11-5.5Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
  </svg>
);

export default function PageLoader({ text = 'Loading…' }: PageLoaderProps) {
  return (
    <div className="pl-root" role="status" aria-label={text}>

      {/* ── centre loader card ── */}
      <div className="pl-card">
        <AtaaLogo />

        {/* dual-ring spinner */}
        <div className="pl-spinner">
          <div className="pl-ring" />
          <div className="pl-arc" />
          <div className="pl-arc-inner" />
          <div className="pl-core" />
        </div>

        {/* bouncing dots */}
        <div className="pl-dots">
          <span className="pl-dot" />
          <span className="pl-dot" />
          <span className="pl-dot" />
        </div>

        {/* sweep progress bar */}
        <div className="pl-bar">
          <div className="pl-bar-fill" />
        </div>

        {/* subtle status text */}
        <span className="pl-status">Loading…</span>
      </div>

      {/* ── floating chat widget ── */}
      <div className="pl-chat" aria-hidden="true">

        {/* header */}
        <div className="pl-chat-header">
          <div className="pl-chat-avatar">
            <BotIcon />
          </div>
          <div>
            <div className="pl-chat-name">Ataa Assistant</div>
            <div className="pl-chat-sub">Always here to help</div>
          </div>
          <div className="pl-status-badge" />
        </div>

        {/* messages */}
        <div className="pl-chat-msgs">
          <div className="pl-msg">
            <div className="pl-msg-avatar bot">A</div>
            <div className="pl-bubble bot">
              Hey! We're getting everything ready for you.
            </div>
          </div>

          <div className="pl-msg pl-msg-user">
            <div className="pl-msg-avatar user">U</div>
            <div className="pl-bubble user">
              Sounds good, take your time.
            </div>
          </div>

          {/* typing indicator */}
          <div className="pl-typing">
            <div className="pl-msg-avatar bot">A</div>
            <div className="pl-typing-bubble">
              <span className="pl-typing-dot" />
              <span className="pl-typing-dot" />
              <span className="pl-typing-dot" />
            </div>
          </div>
        </div>

        {/* input bar */}
        <div className="pl-chat-input">
          <input
            className="pl-input-field"
            type="text"
            placeholder="Message…"
            disabled
            readOnly
          />
          <button className="pl-send-btn" disabled aria-label="Send">
            <SendIcon />
          </button>
        </div>

      </div>
    </div>
  );
}