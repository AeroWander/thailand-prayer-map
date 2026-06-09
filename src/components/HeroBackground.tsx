/** Full-bleed topographic contour texture for the landing hero — inline SVG only. */
export function HeroBackground() {
  return (
    <svg
      className="landing-hero__topo"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1440 800"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="landing-topo-hfade" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="white" stopOpacity="0.35" />
          <stop offset="40%" stopColor="white" stopOpacity="0.55" />
          <stop offset="72%" stopColor="white" stopOpacity="0.85" />
          <stop offset="100%" stopColor="white" stopOpacity="1" />
        </linearGradient>
        <mask id="landing-topo-mask">
          <rect x="0" y="0" width="1440" height="800" fill="url(#landing-topo-hfade)" />
        </mask>
      </defs>

      <g
        mask="url(#landing-topo-mask)"
        fill="none"
        stroke="#1B5EA6"
        strokeWidth="1.25"
        strokeOpacity="0.08"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M -140 56 C 120 44, 280 68, 440 52 S 760 40, 1040 62 S 1320 46, 1580 58" />
        <path d="M -140 96 C 160 82, 340 104, 500 88 C 660 76, 820 108, 980 92 S 1220 78, 1460 100 S 1560 86, 1580 94" />
        <path d="M -140 136 C 200 122, 400 146, 560 128 S 860 112, 1120 138 S 1360 120, 1580 140" />
        <path d="M -140 176 C 180 160, 420 184, 580 166 C 740 150, 900 188, 1060 170 S 1300 154, 1500 178 S 1560 164, 1580 172" />
        <path d="M -140 216 C 220 200, 460 224, 620 206 S 920 190, 1180 216 S 1400 198, 1580 218" />
        <path d="M -140 256 C 200 238, 500 262, 660 244 C 820 228, 980 266, 1140 248 S 1380 232, 1540 256 S 1580 242, 1580 250" />
        <path d="M -140 296 C 240 278, 540 302, 700 284 S 1000 268, 1260 294 S 1460 276, 1580 298" />
        <path d="M -140 336 C 220 318, 560 342, 720 324 C 880 308, 1040 346, 1200 328 S 1420 312, 1560 336 S 1580 322, 1580 330" />
        <path d="M -140 376 C 260 358, 580 382, 740 364 S 1040 348, 1300 374 S 1480 356, 1580 378" />
        <path d="M -140 416 C 240 398, 620 422, 780 404 C 940 388, 1100 426, 1260 408 S 1440 392, 1560 416 S 1580 402, 1580 410" />
        <path d="M -140 456 C 280 438, 640 462, 800 444 S 1100 428, 1360 454 S 1520 436, 1580 458" />
        <path d="M -140 496 C 260 478, 660 502, 820 484 C 980 468, 1140 506, 1300 488 S 1460 472, 1560 496 S 1580 482, 1580 490" />
        <path d="M -140 536 C 300 518, 680 542, 840 524 S 1140 508, 1400 534 S 1540 516, 1580 538" />
        <path d="M -140 576 C 280 558, 700 582, 860 564 C 1020 548, 1180 586, 1340 568 S 1500 552, 1580 576 S 1580 562, 1580 570" />
        <path d="M -140 616 C 320 598, 720 622, 880 604 S 1180 588, 1440 614 S 1560 596, 1580 618" />
        <path d="M -140 656 C 300 638, 740 662, 900 644 C 1060 628, 1220 666, 1380 648 S 1520 632, 1580 656 S 1580 642, 1580 650" />
        <path d="M -140 696 C 340 678, 760 702, 920 684 S 1220 668, 1480 694 S 1560 676, 1580 698" />
        <path d="M -140 736 C 320 718, 780 742, 940 724 C 1100 708, 1260 746, 1420 728 S 1540 712, 1580 736" />
        {/* Denser accents on the right */}
        <path d="M 720 188 C 820 176, 900 202, 980 186 S 1080 170, 1160 194" strokeOpacity="0.1" />
        <path d="M 880 328 C 960 316, 1030 338, 1100 324 S 1180 310, 1240 332" strokeOpacity="0.1" />
        <path d="M 1000 468 C 1080 456, 1150 478, 1220 464 S 1300 450, 1360 472" strokeOpacity="0.1" />
        <path d="M 1080 588 C 1160 576, 1230 598, 1300 584 S 1380 570, 1440 592" strokeOpacity="0.1" />
        <path d="M 640 248 C 700 238, 748 258, 796 246 S 844 234, 892 252" strokeOpacity="0.09" />
        <path d="M 1120 408 C 1180 398, 1230 416, 1280 404 S 1330 392, 1380 410" strokeOpacity="0.09" />
      </g>
    </svg>
  );
}
