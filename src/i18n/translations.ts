import type { InstitutionType, Region } from '../types/campus';

export type Language = 'en' | 'th';

export const LANGUAGE_STORAGE_KEY = 'thailand-prayer-app-language';

type PrayerGuideSection = {
  title: string;
  items: string[];
};

type Scripture = {
  reference: string;
  text: string;
};

export type TranslationSchema = {
  nav: {
    map: string;
    pray: string;
    about: string;
  };
  toolbar: {
    region: string;
    province: string;
    search: string;
    searchPlaceholder: string;
    allRegions: string;
    allProvinces: string;
    filtersAria: string;
  };
  stats: {
    prayedFor: string;
    totalCampuses: string;
    campusesMatchingSearch: string;
    campusesInProvince: string;
    campusesInRegion: string;
    goalDetailNational: string;
    goalDetailInProvince: string;
    goalDetailInRegion: string;
    goalDetailSearch: string;
    ariaLabel: string;
  };
  panel: {
    province: string;
    region: string;
    type: string;
    students: string;
    founded: string;
    visitWebsite: string;
    notYetPrayedFor: string;
    prayedFor: string;
    logPrayerWalk: string;
    markAsPrayed: string;
    prayedForButton: string;
    prayerWalkLogged: string;
    closeAria: string;
  };
  explore: {
    campusesLeftToPrayerWalk: string;
    togetherTagline: string;
    totalCampuses: string;
    prayedFor: string;
    notPrayed: string;
    prayed: string;
    campusKeyTitle: string;
    campusKeyNotPrayed: string;
    campusKeyPrayed: string;
    panelAria: string;
    campusListAria: string;
    progressAria: string;
    closeAria: string;
    allCampuses: string;
    backAria: string;
    website: string;
    campusInfo: string;
    prayerPromptPrayed: string;
    prayerHeading: string;
    joinOthersPraying: string;
    studentsCount: string;
    prayerPrompts: {
      defaultPrompt: string;
      rajabhatPrompt: string;
      rajamangalaPrompt: string;
      internationalPrompt: string;
    };
  };
  types: Record<InstitutionType | 'autonomous', string>;
  regions: Record<Region, string>;
  search: {
    noResults: string;
    resultsAria: string;
  };
  prayerGuide: {
    title: string;
    subtitle: string;
    beforeYouGo: PrayerGuideSection;
    whenYouArrive: PrayerGuideSection;
    prayerPoints: PrayerGuideSection;
    afterYourWalk: PrayerGuideSection;
    keyScriptures: {
      title: string;
      items: Scripture[];
    };
    logPrayerWalk: string;
  };
  about: {
    title: string;
    subtitle: string;
    missionTitle: string;
    missionText: string;
    howItWorksTitle: string;
    howItWorksText: string;
  };
  common: {
    of: string;
  };
  landing: {
    headline: string;
    subheadline: string; // supports {count}
    statTotal: string;
    statPrayed: string;
    statRemaining: string;
    statsAria: string;
    searchPlaceholder: string;
    searchResultsAria: string;
    searchProvincesLabel: string;
    searchCampusesLabel: string;
    searchProvinceType: string;
    searchNoResults: string;
    exploreMap: string;
    prayerGuide: string;
    ctaNote: string;
    visionAria: string;
    visionFindTitle: string;
    visionFindText: string;
    visionLogTitle: string;
    visionLogText: string;
    visionTrackTitle: string;
    visionTrackText: string;
    footer: string;
  };
};

export const translations: Record<Language, TranslationSchema> = {
  en: {
    nav: {
      map: 'Map',
      pray: 'Pray',
      about: 'About',
    },
    toolbar: {
      region: 'Region',
      province: 'Province',
      search: 'Search',
      searchPlaceholder: 'Search universities...',
      allRegions: 'All Regions',
      allProvinces: 'All Provinces',
      filtersAria: 'Filters and statistics',
    },
    stats: {
      prayedFor: 'Prayed for',
      totalCampuses: 'Total campuses',
      campusesMatchingSearch: 'Campuses matching search',
      campusesInProvince: 'Campuses in {province}',
      campusesInRegion: 'Campuses in {region} region',
      goalDetailNational: '{prayedFor} of {total} campuses prayed for nationally',
      goalDetailInProvince: '{prayedFor} of {total} campuses prayed for in {province}',
      goalDetailInRegion: '{prayedFor} of {total} campuses prayed for in {region} region',
      goalDetailSearch: '{prayedFor} of {total} campuses prayed for matching search',
      ariaLabel: 'Campus prayer statistics',
    },
    panel: {
      province: 'Province',
      region: 'Region',
      type: 'Type',
      students: 'Students',
      founded: 'Founded',
      visitWebsite: 'Visit website',
      notYetPrayedFor: 'Not yet prayed for',
      prayedFor: 'Prayed for',
      logPrayerWalk: 'Log Prayer Walk',
      markAsPrayed: 'Mark as prayed',
      prayedForButton: 'Prayed for',
      prayerWalkLogged: '✓ Prayer Walk Logged',
      closeAria: 'Close campus details',
    },
    explore: {
      campusesLeftToPrayerWalk: 'Campuses left to prayer walk',
      togetherTagline: 'Together we can make a difference',
      totalCampuses: 'Total campuses',
      prayedFor: 'Prayed for',
      notPrayed: 'Not prayed',
      prayed: 'Prayed',
      campusKeyTitle: 'Campus key',
      campusKeyNotPrayed: 'Not yet prayed for',
      campusKeyPrayed: 'Prayed for',
      panelAria: 'Campus explorer',
      campusListAria: 'Campus list',
      progressAria: 'Prayer walk progress',
      closeAria: 'Close campus explorer',
      allCampuses: 'All campuses',
      backAria: 'Back to campus list',
      website: 'Website',
      campusInfo: 'Campus info',
      prayerPromptPrayed:
        'This campus has been covered in prayer. Thank you for praying here.',
      prayerHeading: 'Prayer',
      joinOthersPraying: 'Join others in praying for this campus',
      studentsCount: '{count} students',
      prayerPrompts: {
        defaultPrompt:
          'Pray for the {students} students at {name} — ask God to raise up laborers and open hearts to the gospel.',
        rajabhatPrompt:
          'Pray for the {students} students at {name}, a Rajabhat university — ask God to raise up laborers and open hearts to the gospel.',
        rajamangalaPrompt:
          'Pray for the {students} students at {name}, a Rajamangala university of technology — ask God to raise up laborers and open hearts to the gospel.',
        internationalPrompt:
          'Pray for the {students} students at {name}, an international university — ask God to raise up laborers and open hearts to the gospel.',
      },
    },
    types: {
      public: 'Public',
      private: 'Private',
      rajabhat: 'Rajabhat',
      rajamangala: 'Rajamangala',
      autonomous: 'Autonomous',
      international: 'International',
    },
    regions: {
      Northern: 'Northern',
      Northeastern: 'Northeastern',
      Central: 'Central',
      Eastern: 'Eastern',
      Southern: 'Southern',
      Bangkok: 'Bangkok',
    },
    search: {
      noResults: 'No universities found',
      resultsAria: 'University search results',
    },
    prayerGuide: {
      title: 'Prayer Walking Guide',
      subtitle: "How to pray for Thailand's university campuses",
      beforeYouGo: {
        title: 'Before You Go',
        items: [
          'Pray for open hearts on campus',
          "Come with a servant's heart",
          'Go in pairs or small groups',
          'Carry these scriptures with you: Matthew 9:37-38, Joshua 1:3, 1 Timothy 2:1-4',
        ],
      },
      whenYouArrive: {
        title: 'When You Arrive',
        items: [
          'Pray over the entrance and gates of the campus',
          'Pray for the faculty and administration',
          'Pray as you walk through common areas and student gathering spaces',
          'Pray for student dormitories',
          'Pray for any campus temples or shrines — that God would make himself known',
        ],
      },
      prayerPoints: {
        title: 'Prayer Points for Thai Students',
        items: [
          'Freedom from family pressure and academic stress',
          'A personal encounter with the living God',
          'Thai believers on campus to be bold in their faith',
          'That campus ministries would grow and thrive',
          'For God to send laborers into the harvest on every campus',
        ],
      },
      afterYourWalk: {
        title: 'After Your Walk',
        items: [
          'Debrief with your group about what God put on your heart',
          'Write down any impressions or prayers',
          'Log your walk in the app',
          'Commit to praying regularly for this campus',
        ],
      },
      keyScriptures: {
        title: 'Key Scriptures',
        items: [
          {
            reference: 'Matthew 9:37-38',
            text: '"The harvest is plentiful but the workers are few"',
          },
          {
            reference: 'Joshua 1:3',
            text: '"Every place your foot treads I will give you"',
          },
          {
            reference: '1 Timothy 2:1-4',
            text: '"I urge that prayers be made for all people"',
          },
        ],
      },
      logPrayerWalk: 'Log a Prayer Walk',
    },
    about: {
      title: 'About',
      subtitle: 'Mobilizing prayer for every university campus in Thailand.',
      missionTitle: 'Our mission',
      missionText:
        'Thailand Campus Crusade for Christ exists to see every university campus in Thailand reached with the gospel. This prayer map helps believers across the nation pray intentionally for campuses — tracking prayer walks and building momentum toward our goal of covering all 170 campuses in prayer.',
      howItWorksTitle: 'How it works',
      howItWorksText:
        'Explore the map to find campuses near you or across the country. Visit a campus, pray on site, and log your prayer walk. Each logged walk updates the map and contributes to our national prayer goal.',
    },
    common: {
      of: 'of',
    },
    landing: {
      headline: 'Pray for Every Campus in Thailand',
      subheadline:
        'Thailand has {count} university campuses. Together, the body of Christ can cover every one in prayer.',
      statTotal: 'University Campuses',
      statPrayed: 'Campuses Prayed For',
      statRemaining: 'Still Need Prayer',
      statsAria: 'National campus prayer statistics',
      searchPlaceholder: 'Search a campus or city in Thailand...',
      searchResultsAria: 'Campus and location search results',
      searchProvincesLabel: 'PROVINCES',
      searchCampusesLabel: 'CAMPUSES',
      searchProvinceType: 'Province',
      searchNoResults: 'No results found — try a province or university name',
      exploreMap: 'Explore the Map',
      prayerGuide: 'Prayer Walking Guide',
      ctaNote: 'Join believers across Thailand praying for every campus',
      visionAria: 'How it works',
      visionFindTitle: 'Find a Campus',
      visionFindText:
        "Search for any of Thailand's 171 university campuses and learn how to pray for students there.",
      visionLogTitle: 'Log Your Walk',
      visionLogText:
        "Record your prayer walks and join a growing movement of believers covering Thailand's campuses.",
      visionTrackTitle: 'Track Progress',
      visionTrackText:
        'Watch Thailand light up as campuses get covered in prayer one walk at a time.',
      footer: 'Thailand Campus Crusade for Christ',
    },
  },
  th: {
    nav: {
      map: 'แผนที่',
      pray: 'อธิษฐาน',
      about: 'เกี่ยวกับ',
    },
    toolbar: {
      region: 'ภาค',
      province: 'จังหวัด',
      search: 'ค้นหา',
      searchPlaceholder: 'ค้นหามหาวิทยาลัย...',
      allRegions: 'ทุกภาค',
      allProvinces: 'ทุกจังหวัด',
      filtersAria: 'ตัวกรองและสถิติ',
    },
    stats: {
      prayedFor: 'อธิษฐานแล้ว',
      totalCampuses: 'มหาวิทยาลัยทั้งหมด',
      campusesMatchingSearch: 'มหาวิทยาลัยที่ตรงกับการค้นหา',
      campusesInProvince: 'มหาวิทยาลัยใน{province}',
      campusesInRegion: 'มหาวิทยาลัยใน{region}',
      goalDetailNational: 'อธิษฐานแล้ว {prayedFor} จาก {total} มหาวิทยาลัยทั่วประเทศ',
      goalDetailInProvince: 'อธิษฐานแล้ว {prayedFor} จาก {total} มหาวิทยาลัยใน{province}',
      goalDetailInRegion: 'อธิษฐานแล้ว {prayedFor} จาก {total} มหาวิทยาลัยใน{region}',
      goalDetailSearch: 'อธิษฐานแล้ว {prayedFor} จาก {total} มหาวิทยาลัยที่ตรงกับการค้นหา',
      ariaLabel: 'สถิติการอธิษฐานมหาวิทยาลัย',
    },
    panel: {
      province: 'จังหวัด',
      region: 'ภาค',
      type: 'ประเภท',
      students: 'นักศึกษา',
      founded: 'ก่อตั้ง',
      visitWebsite: 'เยี่ยมชมเว็บไซต์',
      notYetPrayedFor: 'ยังไม่ได้อธิษฐาน',
      prayedFor: 'อธิษฐานแล้ว',
      logPrayerWalk: 'บันทึกการเดินอธิษฐาน',
      markAsPrayed: 'ทำเครื่องหมายว่าอธิษฐานแล้ว',
      prayedForButton: 'อธิษฐานแล้ว',
      prayerWalkLogged: '✓ บันทึกการเดินอธิษฐานแล้ว',
      closeAria: 'ปิดรายละเอียดมหาวิทยาลัย',
    },
    explore: {
      campusesLeftToPrayerWalk: 'มหาวิทยาลัยที่ยังต้องเดินอธิษฐาน',
      togetherTagline: 'เราร่วมกันสร้างความเปลี่ยนแปลงได้',
      totalCampuses: 'มหาวิทยาลัยทั้งหมด',
      prayedFor: 'อธิษฐานแล้ว',
      notPrayed: 'ยังไม่ได้อธิษฐาน',
      prayed: 'อธิษฐานแล้ว',
      campusKeyTitle: 'สัญลักษณ์มหาวิทยาลัย',
      campusKeyNotPrayed: 'ยังไม่ได้อธิษฐาน',
      campusKeyPrayed: 'อธิษฐานแล้ว',
      panelAria: 'สำรวจมหาวิทยาลัย',
      campusListAria: 'รายการมหาวิทยาลัย',
      progressAria: 'ความคืบหน้าการเดินอธิษฐาน',
      closeAria: 'ปิดการสำรวจมหาวิทยาลัย',
      allCampuses: 'มหาวิทยาลัยทั้งหมด',
      backAria: 'กลับไปรายการมหาวิทยาลัย',
      website: 'เว็บไซต์',
      campusInfo: 'ข้อมูลมหาวิทยาลัย',
      prayerPromptPrayed:
        'มหาวิทยาลัยนี้ได้รับการอธิษฐานแล้ว ขอบคุณที่อธิษฐานที่นี่',
      prayerHeading: 'อธิษฐาน',
      joinOthersPraying: 'ร่วมอธิษฐานกับผู้อื่นเพื่อมหาวิทยาลัยนี้',
      studentsCount: 'นักศึกษา {count} คน',
      prayerPrompts: {
        defaultPrompt:
          'อธิษฐานเพื่อนักศึกษา {students} คนที่ {name} — ขอให้พระเจ้าทรงส่งผู้เก็บเกี่ยวและเปิดหัวใจให้รับข่าวประเทศศาสนา',
        rajabhatPrompt:
          'อธิษฐานเพื่อนักศึกษา {students} คนที่ {name} มหาวิทยาลัยราชภัฏ — ขอให้พระเจ้าทรงส่งผู้เก็บเกี่ยวและเปิดหัวใจให้รับข่าวประเทศศาสนา',
        rajamangalaPrompt:
          'อธิษฐานเพื่อนักศึกษา {students} คนที่ {name} มหาวิทยาลัยเทคโนโลยีราชมงคล — ขอให้พระเจ้าทรงส่งผู้เก็บเกี่ยวและเปิดหัวใจให้รับข่าวประเทศศาสนา',
        internationalPrompt:
          'อธิษฐานเพื่อนักศึกษา {students} คนที่ {name} มหาวิทยาลัยนานาชาติ — ขอให้พระเจ้าทรงส่งผู้เก็บเกี่ยวและเปิดหัวใจให้รับข่าวประเทศศาสนา',
      },
    },
    types: {
      public: 'รัฐบาล',
      private: 'เอกชน',
      rajabhat: 'ราชภัฏ',
      rajamangala: 'ราชมงคล',
      autonomous: 'อิสระ',
      international: 'นานาชาติ',
    },
    regions: {
      Northern: 'ภาคเหนือ',
      Northeastern: 'ภาคตะวันออกเฉียงเหนือ',
      Central: 'ภาคกลาง',
      Eastern: 'ภาคตะวันออก',
      Southern: 'ภาคใต้',
      Bangkok: 'กรุงเทพมหานคร',
    },
    search: {
      noResults: 'ไม่พบมหาวิทยาลัย',
      resultsAria: 'ผลการค้นหามหาวิทยาลัย',
    },
    prayerGuide: {
      title: 'คู่มือการเดินอธิษฐาน',
      subtitle: 'วิธีอธิษฐานเพื่อมหาวิทยาลัยในประเทศไทย',
      beforeYouGo: {
        title: 'ก่อนออกเดินทาง',
        items: [
          'อธิษฐานเพื่อให้หัวใจนักศึกษาเปิดกว้าง',
          'ไปด้วยใจของผู้รับใช้',
          'ไปเป็นคู่หรือกลุ่มเล็ก',
          'เตรียมพระคัมภีร์เหล่านี้ไปด้วย: มัทธิว 9:37-38, โยชูวา 1:3, 1 ทิโมธี 2:1-4',
        ],
      },
      whenYouArrive: {
        title: 'เมื่อถึงที่หมาย',
        items: [
          'อธิษฐานที่ประตูทางเข้าและทางเข้าออกของมหาวิทยาลัย',
          'อธิษฐานเพื่อคณาจารย์และฝ่ายบริหาร',
          'อธิษฐานขณะเดินผ่านพื้นที่สาธารณะและจุดรวมตัวของนักศึกษา',
          'อธิษฐานเพื่อหอพักนักศึกษา',
          'อธิษฐานสำหรับศาลเจ้าหรือสถานที่บูชาในมหาวิทยาลัย — ขอให้พระเจ้าทรงสำแดงตน',
        ],
      },
      prayerPoints: {
        title: 'หัวข้ออธิษฐานเพื่อนักศึกษาไทย',
        items: [
          'อิสระจากแรงกดดันจากครอบครัวและความเครียดทางการเรียน',
          'การพบพระเจ้าที่มีชีวิตอย่างส่วนตัว',
          'ให้คริสเตียนไทยในมหาวิทยาลัยกล้าหาญในความเชื่อ',
          'ให้กระทรวงการในมหาวิทยาลัยเติบโตและรุ่งเรือง',
          'ขอให้พระเจ้าทรงส่งผู้เก็บเกี่ยวเข้าสู่การเก็บเกี่ยวในทุกมหาวิทยาลัย',
        ],
      },
      afterYourWalk: {
        title: 'หลังการเดินอธิษฐาน',
        items: [
          'ทบทวนกับกลุ่มว่าพระเจ้าวางอะไรบนหัวใจของคุณ',
          'จดความประทับใจหรือคำอธิษฐาน',
          'บันทึกการเดินของคุณในแอป',
          'มุ่งมั่นอธิษฐานเพื่อมหาวิทยาลัยนี้อย่างสม่ำเสมอ',
        ],
      },
      keyScriptures: {
        title: 'พระคัมภีร์สำคัญ',
        items: [
          {
            reference: 'มัทธิว 9:37-38',
            text: '"การเก็บเกี่ยวก็มาก แต่คนเก็บเกี่ยวน้อย"',
          },
          {
            reference: 'โยชูวา 1:3',
            text: '"ทุกที่ที่ฝ่าเท้าของเจ้าเหยียบ เราจะประทานให้แก่เจ้า"',
          },
          {
            reference: '1 ทิโมธี 2:1-4',
            text: '"ข้าขอเตือนให้มีการอธิษฐาน วิงวอน แผ่ความวิงวอน เพื่อมนุษย์ทุกคน"',
          },
        ],
      },
      logPrayerWalk: 'บันทึกการเดินอธิษฐาน',
    },
    about: {
      title: 'เกี่ยวกับ',
      subtitle: 'จัดระเบียบการอธิษฐานเพื่อมหาวิทยาลัยทุกแห่งในประเทศไทย',
      missionTitle: 'พันธกิจของเรา',
      missionText:
        'ครูเสดแคมป์สเพื่อคริสตจักรประเทศไทยมีเป้าหมายเพื่อให้มหาวิทยาลัยทุกแห่งในประเทศไทยได้ยินข่าวประเทศศาสนา แผนที่อธิษฐานนี้ช่วยให้คริสเตียนทั่วประเทศอธิษฐานอย่างมีเป้าหมายเพื่อมหาวิทยาลัย — ติดตามการเดินอธิษฐานและสร้างแรงผลักดันสู่เป้าหมายครอบคลุมมหาวิทยาลัยทั้ง 170 แห่งในการอธิษฐาน',
      howItWorksTitle: 'วิธีการใช้งาน',
      howItWorksText:
        'สำรวจแผนที่เพื่อค้นหามหาวิทยาลัยใกล้คุณหรือทั่วประเทศ เยี่ยมชมมหาวิทยาลัย อธิษฐานในสถานที่ และบันทึกการเดินอธิษฐานของคุณ การเดินอธิษฐานแต่ละครั้งจะอัปเดตแผนที่และมีส่วนร่วมต่อเป้าหมายการอธิษฐานระดับชาติ',
    },
    common: {
      of: 'จาก',
    },
    landing: {
      headline: 'อธิษฐานเพื่อทุกมหาวิทยาลัยในประเทศไทย',
      subheadline:
        'ประเทศไทยมีมหาวิทยาลัย {count} แห่ง คริสตจักรสามารถร่วมกันอธิษฐานครอบคลุมทุกแห่งได้',
      statTotal: 'มหาวิทยาลัยทั้งหมด',
      statPrayed: 'อธิษฐานแล้ว',
      statRemaining: 'ยังต้องการการอธิษฐาน',
      statsAria: 'สถิติการอธิษฐานมหาวิทยาลัยทั่วประเทศ',
      searchPlaceholder: 'ค้นหามหาวิทยาลัยหรือเมืองในประเทศไทย...',
      searchResultsAria: 'ผลการค้นหามหาวิทยาลัยและสถานที่',
      searchProvincesLabel: 'จังหวัด',
      searchCampusesLabel: 'มหาวิทยาลัย',
      searchProvinceType: 'จังหวัด',
      searchNoResults: 'ไม่พบผลลัพธ์ — ลองค้นหาชื่อจังหวัดหรือมหาวิทยาลัย',
      exploreMap: 'สำรวจแผนที่',
      prayerGuide: 'คู่มือการเดินอธิษฐาน',
      ctaNote: 'ร่วมอธิษฐานกับผู้เชื่อทั่วประเทศไทยเพื่อทุกมหาวิทยาลัย',
      visionAria: 'วิธีการใช้งาน',
      visionFindTitle: 'ค้นหามหาวิทยาลัย',
      visionFindText:
        'ค้นหามหาวิทยาลัย 171 แห่งในประเทศไทยและเรียนรู้วิธีอธิษฐานเพื่อนักศึกษา',
      visionLogTitle: 'บันทึกการเดินของคุณ',
      visionLogText:
        'บันทึกการเดินอธิษฐานและเข้าร่วมขบวนการของผู้เชื่อที่ครอบคลุมมหาวิทยาลัยทั่วไทย',
      visionTrackTitle: 'ติดตามความคืบหน้า',
      visionTrackText:
        'ดูประเทศไทยสว่างขึ้นทีละมหาวิทยาลัยเมื่อมีการอธิษฐานครอบคลุมทีละแห่ง',
      footer: 'Thailand Campus Crusade for Christ',
    },
  },
};

export function interpolate(
  template: string,
  values: Record<string, string | number>,
): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key] ?? ''));
}
