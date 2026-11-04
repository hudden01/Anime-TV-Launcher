// Everything you might want to tweak lives here.
window.LAUNCHER_CONFIG = {
  // Swap this file for your own HD/4K Itachi wallpaper (jpg/png/svg). Keep it in this folder.
  wallpaper: "itachi-base.jpg",   // 1080p; the 4K original is in ../source-4k
  // Itachi + pole cut out of the wallpaper (fractions of the wallpaper), drawn above the mist and moving clouds.
  front: { src: "itachi-front.png", x: 0.25859, y: 0.15648, w: 0.50260, h: 0.84444 },
  cloudTexture: "clouds.jpg",   // tileable strip of this wallpaper's own sky, drifted slowly for moving clouds
  moon: { x: 0.465, y: 0.48, r: 0.15 },   // clouds pass only thinly in front of the moon
  mist: 0,                      // 0 = off, 1 = normal, 1.5 = thicker
  appCols: 7,                   // icons per row; two rows show at once, Down scrolls to more rows
  // package -> its icon in the launcher's style: a line glyph when the brand logo is a simple shape (Netflix "N",
  // Hotstar's star, the Apple logo...), or "~TEXT" = the brand's own wordmark set in the theme's lettering (ZEE5, LIV...)
  iconOverrides: {
    "com.google.android.youtube.tv": "play",
    "com.google.android.youtube.tvkids": "~Kids",
    "com.google.android.youtube.tvunplugged": "~YTTV",
    "com.netflix.ninja": "netflix",
    "com.netflix.mediaclient": "netflix",
    "com.amazon.amazonvideo.livingroom": "prime",
    "com.amazon.avod.thirdpartyclient": "prime",
    "com.disney.disneyplus": "~D+",
    "com.apple.atve.androidtv.appletv": "apple",
    "com.wbd.stream": "~max",
    "com.hbo.hbonow": "~max",
    "com.hbo.android.app": "~max",
    "com.hulu.livingroomplus": "~hulu",
    "com.cbs.ott": "~P+",
    "com.peacocktv.peacockandroid": "~P",
    "tv.pluto.android": "~pluto",
    "com.tubitv": "~tubi",
    "com.crunchyroll.crunchyroid": "crunchy",
    "tv.twitch.android.app": "twitch",
    "tv.twitch.android.viewer": "twitch",
    "com.mubi": "~MUBI",
    "com.discovery.discoveryplus.androidtv": "~d+",
    "com.lionsgateplay.videoapp": "~LGP",
    "com.plexapp.android": "plex",
    "org.xbmc.kodi": "kodi",
    "org.videolan.vlc": "cone",
    "org.jellyfin.androidtv": "~JF",
    "tv.emby.embyatv": "~emby",
    "com.stremio.one": "~S",
    "com.teamsmart.videomanager.tv": "play",
    "com.liskovsoft.smarttubetv.beta": "play",
    "com.liskovsoft.smarttubetv": "play",
    "com.mxtech.videoplayer.television": "~MX",
    "com.mxtech.videoplayer.ad": "~MX",
    "tv.mxplayer.android": "~MX",
    "com.google.android.videos": "film",
    "com.google.android.apps.mediashell": "cast",
    "in.startv.hotstar": "star",
    "com.hotstar.android.tv": "star",
    "in.startv.hotstaronly": "star",
    "com.jio.media.ondemand": "~Jio",
    "com.jio.jioplay.tv": "~JioTV",
    "com.jio.media.stb.ondemand": "~Jio",
    "com.sonyliv": "~LIV",
    "com.graymatrix.did": "~ZEE5",
    "com.zee5.android.tv": "~ZEE5",
    "com.tv.v18.viola": "~voot",
    "com.voot.android.tv": "~voot",
    "com.erosnow": "~eros",
    "com.balaji.alt": "~ALT",
    "com.sun.nxt": "~SUN",
    "com.sunnxt.tv": "~SUN",
    "ahaflix.tv": "~aha",
    "com.arena.aha": "~aha",
    "com.hoichoi.androidtv": "~hoi",
    "com.hoichoi.app": "~hoi",
    "com.shemaroome": "~Me",
    "com.chaupal.app": "~CH",
    "com.manoramaonline.manoramamax": "~MAX",
    "com.airtel.tv": "~Xstream",
    "tv.accedo.airtel.wynk": "~Xstream",
    "com.ryzmedia.tatasky": "~Tata",
    "com.tatasky.binge": "~binge",
    "com.dishtv.watcho": "~watcho",
    "com.epicon.android.tv": "~EPIC",
    "com.hungama.movies.tv": "~hungama",
    "com.lionsgate.lionsgateplay": "~LGP",
    "com.discovery.discoveryplus": "~d+",
    "com.ullu.app": "~ULLU",
    "com.nbt.tv": "tv",
    "com.yupptv.ott": "~yupp",
    "com.distro.tv": "~distro",
    "com.spotify.tv.android": "music",
    "com.spotify.music": "music",
    "com.google.android.youtube.tvmusic": "~YT♪",
    "com.google.android.apps.youtube.music": "~YT♪",
    "com.amazon.music.tv": "~amazon♪",
    "com.apple.android.music": "apple",
    "com.gaana": "~gaana",
    "com.gaana.tv": "~gaana",
    "com.jio.media.jiobeats": "~saavn",
    "com.saavn.android": "~saavn",
    "com.bsbportal.music": "~wynk",
    "deezer.android.tv": "~deezer",
    "deezer.android.app": "~deezer",
    "com.aspiro.tidal": "~TIDAL",
    "com.soundcloud.android": "cloud",
    "tunein.player": "radio",
    "com.tunein.player": "radio",
    "radio.garden": "radio",
    "com.audible.application": "book",
    "com.pocketfm.novel": "podcast",
    "com.google.android.apps.podcasts": "podcast",
    "com.hungama.myplay.activity": "~hungama",
    "com.shazam.android": "music",
    "com.fancode.video": "~FC",
    "com.dazn": "~DAZN",
    "com.espn.score_center": "~ESPN",
    "com.fifa.plus": "~FIFA+",
    "com.nba.app": "~NBA",
    "com.ufc.app": "~UFC",
    "com.google.android.play.games": "game",
    "com.nvidia.geforcenow": "game",
    "com.valvesoftware.steamlink": "game",
    "com.microsoft.xcloud": "game",
    "com.netflix.NGP": "game",
    "com.android.vending": "store",
    "com.android.tv.settings": "gear",
    "com.mediatek.wwtv.tvcenter": "tv",
    "com.homwee.chtvmanager": "shield",
    "com.google.android.katniss": "mic",
    "com.android.chrome": "browser",
    "org.mozilla.tv.firefox": "browser",
    "com.cloudmosa.puffinTV": "browser",
    "com.opera.browser": "browser",
    "com.tvbro": "browser",
    "com.google.android.apps.photos": "photo",
    "com.alphainventor.filemanager": "folder",
    "com.alphainventor.filemanager.tv": "folder",
    "com.estrongs.android.pop": "folder",
    "com.xiaomi.mitv.filemanager": "folder",
    "com.ghisler.android.TotalCommander": "folder",
    "com.waxrain.airplaydmr": "cast",
    "com.ionitech.airscreen": "cast",
    "com.google.android.apps.fitness": "fitness",
    "com.cultfit.tv": "fitness"
  },
  // any app without an entry above: guessed from its name (keyword -> icon), so new installs still match the theme
  iconGuess: [["music", "music"], ["radio", "radio"], ["tv", "tv"], ["movie", "film"], ["video", "film"], ["play", "play"],
    ["photo", "photo"], ["game", "game"], ["browser", "browser"], ["web", "browser"], ["file", "folder"], ["setting", "gear"]],
  crowSize: 0.09,               // crow height as a fraction of screen height
  inputsPkg: "com.mediatek.wwtv.tvcenter",   // TV input switcher (HDMI etc.), shown as the Inputs button
  demoWifiName: "Vivek_5G",     // only for the laptop preview; the TV shows the real network name
  startBlackMs: 1200,           // pure black screen
  loaderMs: 3600,               // Sharingan spinning
  rain: true,                   // R key toggles it live
  rainDensity: 1,               // 0.5 = lighter (use on a slow TV), 1.5 = heavier
  // Demo apps for the laptop preview. On the TV the real installed apps are used instead.
  // svg = one of the built-in line icons; mark = short text logo.
  demoApps: [
    { label: "YouTube",     pkg: "com.google.android.youtube.tv",      svg: "play" },
    { label: "Netflix",     pkg: "com.netflix.ninja",                  mark: "N" },
    { label: "Prime Video", pkg: "com.amazon.amazonvideo.livingroom",  mark: "prime" },
    { label: "JioHotstar",  pkg: "in.startv.hotstar",                  svg: "star" },
    { label: "Spotify",     pkg: "com.spotify.tv.android",             svg: "music" },
    { label: "Files",       pkg: "com.google.android.documentsui",     svg: "folder" },
    { label: "Play Store",  pkg: "com.android.vending",                svg: "store" },
    { label: "SonyLIV",     pkg: "com.sonyliv",                        mark: "LIV" },
    { label: "ZEE5",        pkg: "com.graymatrix.did",                 mark: "Z5" },
    { label: "Chrome",      pkg: "com.android.chrome",                 svg: "globe" },
    { label: "VLC",         pkg: "org.videolan.vlc",                   svg: "cone" },
    { label: "Settings",    pkg: "com.android.tv.settings",            svg: "gear" }
  ]
};

// Themes: each one overrides the settings above. The Themes tile switches between them (remembered on the TV).
// effects = which animated layers the theme uses (and offers in Customize).
// eyes = blink spots in wallpaper fractions: [x, y, width, height] of each eye; lid = eyelid colour.
window.LAUNCHER_THEMES = {
  itachi: {
    name: "Itachi",
    // Vivek's clip (source-4k/itachi-video-original.mp4): Veo mark removed, Real-ESRGAN x2 to 2560x1440, played forwards
    // then backwards so it loops without a jump. It lines up exactly with itachi.jpg, so rain, clouds and crow still fit.
    video: "themes/itachi/bg.mp4",
    wallpaper: "themes/itachi/wall.jpg",       // the clip's first frame
    front: null,                               // he is in the video now; the drifting clouds are cut out round him instead
    cloudMask: { src: "themes/itachi/cloudmask.png", x: 0.25859, y: 0.15648, w: 0.50260, h: 0.84444 },
    effects: ["crow", "atmo", "flash"]   // the rain is baked into the clip (source-4k/make_rain.py), so it costs nothing
  },
  sasuke: {
    name: "Sasuke · Chidori",
    // Vivek's Chidori clip (source-4k/sasuke-video-original.mp4): Gemini mark removed, Real-ESRGAN x2 to 2560x1440,
    // colour graded with light surges (sasuke-video-grade.txt), lifted 200 px and faded into black at the bottom so the
    // icon rows sit where they do in the other themes, slowed 40% with interpolated frames, loop cross-faded.
    video: "themes/sasuke/bg.mp4",
    wallpaper: "themes/sasuke/wall.jpg",       // the clip's first frame
    front: null, cloudTexture: null,
    effects: ["chidori"],
    // the clip has its own Chidori and debris, so only the beam to the selected icon is drawn (from the ball in his hand)
    chidori: { x: 0.4900, y: 0.5370, r: 0.036, arm: [0.4740, 0.3981], beamOnly: true },
    accent: "#3d7dff", accentGlow: "rgba(70,130,255,.7)"
  }

,
  naruto: {
    name: "Naruto",
    // Vivek's animated scene (source-4k/naruto-video-original.mp4): upscaled to 1080p, Gemini mark patched from the still
    // (naruto-video-patch.png), last second cross-faded into the first so it loops without a jump. wall.jpg = its first frame.
    video: "themes/naruto/bg.mp4",
    wallpaper: "themes/naruto/wall.jpg",
    front: null, cloudTexture: null,
    effects: ["clone"],   // leaves, grass and breeze are in the video now
    // shadow clones: Vivek's green-screen clips keyed to transparent WebM (source-4k/naruto-clips/make_clone_clips.py);
    // <name>-idle.webm loops while he stands, <name>-act.webm is his move (act: false = standing only).
    // foot = [middle of his figure across the clip, where his feet/seat are down it]; frame = clip size in px if not 500x360.
    // scale: the base-Naruto clips frame him ~1.6x bigger than the Kurama/Baryon ones, so they are drawn smaller to match.
    clone: { dir: "themes/naruto/clones/", size: 0.109, speed: 1.5, forms: [
      { name: "baryon", foot: [0.521, 0.953], act: true },             // Rasenshuriken
      { name: "kurama", foot: [0.519, 0.969], act: true },            // Tailed Beast Bomb
      { name: "baryon-tails", foot: [0.521, 0.964], act: true },      // tails burst out, roar
      { name: "kurama-impatient", foot: [0.536, 0.958], act: true },    // taps his foot, crosses his arms
      { name: "kurama-flare", foot: [0.515, 0.981], act: true },      // chakra tails flare out and settle
      { name: "baryon-aura", foot: [0.504, 0.969], act: false },       // stands with all nine tails out
      { name: "base-sit", foot: [0.515, 0.953], act: true, scale: 0.6 },          // sits cross-legged, fidgets
      { name: "base-lean", foot: [0.476, 0.939], act: false, frame: [520, 360], scale: 0.62 },   // sits leaning back
      { name: "base-lie", foot: [0.522, 0.975], act: false, frame: [640, 280], scale: 0.6 },     // lies on his back on the icon
      { name: "base-relax", foot: [0.521, 0.919], act: true, scale: 0.62 }         // sits back on his hands, grins
    ] },
    accent: "#ff8a1f", accentGlow: "rgba(255,140,30,.7)", bright: true
  }
};
