// All fonts load through @remotion/google-fonts, which registers a delayRender()
// internally so the renderer waits for them — no font flash, no manual delayRender.
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadPlayfair } from "@remotion/google-fonts/PlayfairDisplay";
import { loadFont as loadBebas } from "@remotion/google-fonts/BebasNeue";
import { loadFont as loadFraunces } from "@remotion/google-fonts/Fraunces";
import { loadFont as loadTiroTelugu } from "@remotion/google-fonts/TiroTelugu";
import { loadFont as loadNTR } from "@remotion/google-fonts/NTR";
import { loadFont as loadMandali } from "@remotion/google-fonts/Mandali";
import { loadFont as loadRamabhadra } from "@remotion/google-fonts/Ramabhadra";
import { loadFont as loadBaloo2 } from "@remotion/google-fonts/Baloo2";
import { loadFont as loadCormorantGaramond } from "@remotion/google-fonts/CormorantGaramond";
import { loadFont as loadItaliana } from "@remotion/google-fonts/Italiana";
import { loadFont as loadDMSans } from "@remotion/google-fonts/DMSans";
import { loadFont as loadMontserrat } from "@remotion/google-fonts/Montserrat";
import { loadFont as loadOswald } from "@remotion/google-fonts/Oswald";
import { loadFont as loadCaveat } from "@remotion/google-fonts/Caveat";
import { loadFont as loadDancingScript } from "@remotion/google-fonts/DancingScript";

export const inter = loadInter().fontFamily;
export const playfair = loadPlayfair().fontFamily;
export const bebas = loadBebas().fontFamily;
export const fraunces = loadFraunces().fontFamily;
export const tiroTelugu = loadTiroTelugu().fontFamily;
export const ntr = loadNTR().fontFamily;
export const mandali = loadMandali().fontFamily;
export const ramabhadra = loadRamabhadra().fontFamily;
export const baloo2 = loadBaloo2().fontFamily;
export const cormorantGaramond = loadCormorantGaramond().fontFamily;
export const italiana = loadItaliana().fontFamily;
export const dmSans = loadDMSans().fontFamily;
export const montserrat = loadMontserrat().fontFamily;
export const oswald = loadOswald().fontFamily;
export const caveat = loadCaveat().fontFamily;
export const dancingScript = loadDancingScript().fontFamily;
